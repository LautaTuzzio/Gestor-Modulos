import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Guardar referencia al process global
const nodeProcess = process;

// Gestión de dev servers
const devServers = new Map(); // { appName: { process, port } }
let nextPort = 5173; // Puerto inicial para Vite

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const RESERVED_MODULE_NAMES = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9'
]);

function sanitizeModuleName(value) {
  if (!value) return '';
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  if (!sanitized || RESERVED_MODULE_NAMES.has(sanitized) || sanitized.length > 64) {
    return '';
  }

  return sanitized;
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use('/apps', express.static(join(__dirname, 'apps')));

// Función para detectar si una app es Vite
async function isViteApp(appPath) {
  try {
    const packageJsonPath = join(appPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageJson.devDependencies?.vite || packageJson.dependencies?.vite;
  } catch {
    return false;
  }
}

// Función para iniciar un dev server de Vite
function startViteDevServer(appName, appPath, port) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('npm', ['run', 'dev', '--', '--port', port, '--host'], {
      cwd: appPath,
      shell: true,
      env: { ...nodeProcess.env, FORCE_COLOR: '0' }
    });

    let isReady = false;

    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${appName}] ${output}`);
      
      if (!isReady && (output.includes('Local:') || output.includes('ready in'))) {
        isReady = true;
        devServers.set(appName, { process: childProcess, port });
        resolve(port);
      }
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`[${appName}] ${data.toString()}`);
    });

    childProcess.on('error', (error) => {
      console.error(`Error starting dev server for ${appName}:`, error);
      if (!isReady) reject(error);
    });

    childProcess.on('exit', (code) => {
      console.log(`Dev server for ${appName} exited with code ${code}`);
      devServers.delete(appName);
    });

    // Timeout si no está listo en 30 segundos
    setTimeout(() => {
      if (!isReady) {
        reject(new Error('Timeout starting dev server'));
      }
    }, 30000);
  });
}

// Función para detener un dev server
function stopDevServer(appName) {
  const server = devServers.get(appName);
  if (server) {
    server.process.kill();
    devServers.delete(appName);
  }
}

app.get('/api/apps', async (req, res) => {
  try {
    const appsDir = join(__dirname, 'apps');
    const entries = await fs.readdir(appsDir, { withFileTypes: true });
    const apps = await Promise.all(
      entries
        .filter(entry => entry.isDirectory())
        .map(async entry => {
          const appPath = join(appsDir, entry.name);
          const isVite = await isViteApp(appPath);
          const serverInfo = devServers.get(entry.name);
          
          return {
            name: entry.name,
            isVite,
            devServerPort: serverInfo?.port,
            isRunning: !!serverInfo
          };
        })
    );
    res.json(apps);
  } catch (error) {
    res.json([]);
  }
});

// Endpoint para iniciar dev server
app.post('/api/apps/:name/start', async (req, res) => {
  try {
    const { name } = req.params;
    const appPath = join(__dirname, 'apps', name);
    
    if (devServers.has(name)) {
      const server = devServers.get(name);
      return res.json({ port: server.port, message: 'Dev server already running' });
    }
    
    const isVite = await isViteApp(appPath);
    if (!isVite) {
      return res.status(400).json({ error: 'Not a Vite app' });
    }
    
    const port = nextPort++;
    await startViteDevServer(name, appPath, port);
    
    res.json({ port, message: 'Dev server started' });
  } catch (error) {
    console.error('Error starting dev server:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para detener dev server
app.post('/api/apps/:name/stop', async (req, res) => {
  try {
    const { name } = req.params;
    stopDevServer(name);
    res.json({ message: 'Dev server stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.single('module'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const zipPath = req.file.path;
    const removeUploadedZip = async () => {
      try {
        await fs.unlink(zipPath);
      } catch (cleanupError) {
        console.error('Error deleting uploaded zip:', cleanupError);
      }
    };

    const providedName = sanitizeModuleName(req.body?.moduleName);
    const fallbackName = sanitizeModuleName(req.file.originalname.replace(/\.zip$/i, ''));
    const moduleName = providedName || fallbackName;

    if (!moduleName) {
      await removeUploadedZip();
      return res.status(400).json({
        status: 'error',
        error: 'Nombre de módulo inválido. Usa letras, números, guiones y guiones bajos.'
      });
    }

    const targetDir = join(__dirname, 'apps', moduleName);
    const targetExists = await fs.access(targetDir)
      .then(() => true)
      .catch(() => false);

    if (targetExists) {
      await removeUploadedZip();
      return res.status(409).json({
        status: 'error',
        error: 'Ya existe un módulo con ese nombre. Elige un nombre diferente.'
      });
    }

    await fs.mkdir(targetDir, { recursive: true });

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetDir, true);

    await removeUploadedZip();

    res.setHeader('Content-Type', 'application/json');

    const hasPackageJson = await fs.access(join(targetDir, 'package.json'))
      .then(() => true)
      .catch(() => false);

    let appType = 'html';
    let mainFile = 'index.html';

    if (hasPackageJson) {
      appType = 'node';

      res.write(JSON.stringify({
        status: 'installing',
        message: 'Instalando dependencias de Node.js...'
      }) + '\n');

      try {
        await execAsync('npm install', { cwd: targetDir });

        const packageJson = JSON.parse(
          await fs.readFile(join(targetDir, 'package.json'), 'utf-8')
        );

        if (packageJson.scripts?.build) {
          res.write(JSON.stringify({
            status: 'building',
            message: 'Compilando aplicación...'
          }) + '\n');
          await execAsync('npm run build', { cwd: targetDir });
        }

        if (packageJson.scripts?.start) {
          mainFile = 'index.html';
        }
      } catch (error) {
        console.error('Error installing dependencies:', error);
      }
    }

    const distDir = join(targetDir, 'dist');
    const hasDistDir = await fs.access(distDir)
      .then(() => true)
      .catch(() => false);

    if (hasDistDir) {
      mainFile = 'dist/index.html';
    }

    res.write(JSON.stringify({
      status: 'complete',
      message: 'Módulo cargado exitosamente',
      app: {
        name: moduleName,
        type: appType,
        mainFile
      }
    }) + '\n');
    res.end();

  } catch (error) {
    console.error('Error processing upload:', error);
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error deleting uploaded zip after failure:', cleanupError);
      }
    }

    if (res.headersSent) {
      res.write(
        JSON.stringify({ status: 'error', error: 'Error procesando el archivo' }) + '\n'
      );
      res.end();
    } else {
      res.status(500).json({
        status: 'error',
        error: 'Error procesando el archivo'
      });
    }
  }
});

// Endpoint para eliminar una aplicación
app.delete('/api/apps/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const appPath = join(__dirname, 'apps', name);
    
    // First, try to stop the dev server
    if (devServers.has(name)) {
      const server = devServers.get(name);
      server.process.kill('SIGKILL'); // Force kill the process
      devServers.delete(name);
      // Give the process a moment to fully terminate
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Try to delete the directory with force and retry on EBUSY
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        await fs.rm(appPath, { 
          recursive: true, 
          force: true, 
          maxRetries: 3, 
          retryDelay: 1000 
        });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries === 0) break;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
    
    if (lastError) {
      console.error('Failed to delete directory after retries:', lastError);
      throw lastError;
    }
    
    res.json({ success: true, message: 'Aplicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting app:', error);
    res.status(500).json({ 
      error: `Error al eliminar la aplicación: ${error.message}`,
      code: error.code
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Limpiar dev servers al cerrar
nodeProcess.on('SIGINT', () => {
  console.log('\nShutting down dev servers...');
  for (const [name, server] of devServers.entries()) {
    console.log(`Stopping ${name}...`);
    server.process.kill();
  }
  nodeProcess.exit();
});
