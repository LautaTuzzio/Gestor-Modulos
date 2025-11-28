import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppViewer } from './components/AppViewer';
import { UploadModal } from './components/UploadModal';
import { Modal } from './components/Modal';

export interface AppInfo {
  name: string;
  isVite: boolean;
  devServerPort?: number;
  isRunning: boolean;
}

const documentationHtml = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Documentación: agregar módulo</title>
    <style>
      body {
        font-family: 'Inter', system-ui, sans-serif;
        background: #ffffff;
        color: #111827;
        margin: 0;
        padding: 2.5rem 3rem;
        line-height: 1.6;
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 1.25rem;
        margin: 1.5rem 0 0.75rem;
      }
      p {
        margin: 0.25rem 0 0.75rem;
      }
      ul {
        margin: 0.5rem 0 0;
        padding-left: 1.25rem;
      }
      code {
        background: #f3f4f6;
        padding: 0.15rem 0.4rem;
        border-radius: 0.25rem;
        font-family: 'JetBrains Mono', Consolas, monospace;
      }
      strong {
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <h1>Introducción a Gestor de Módulos</h1>
    <p>
      Esta aplicación centraliza en un solo panel la carga, visualización y ejecución de módulos frontend.
      El proceso busca mantener cada módulo aislado mientras permite controlar su arranque desde el mismo dashboard.
      Usa el menú izquierdo para navegar entre módulos existentes, lanzar dev servers y confirmar su estado.
    </p>

    <h2>Archivos HTML</h2>
    <p>
      Cada módulo se publica como un sitio estático. El botón <strong>Agregar Módulo</strong> espera que subas un ZIP con
      al menos un <code>index.html</code>. Esa página se expone luego dentro del iframe principal cuando seleccionas el módulo en el menú.
      <code>index.html</code> debe enlazar sus recursos de manera relativa (CSS y JS) para que el servidor los sirva directamente.
    </p>
    <p>
      Cuando un módulo no usa Vite o no requiere servidor de desarrollo, simplemente se despliega el contenido de <code>index.html</code>
      y sus activos asociados desde <code>/apps/&lt;nombre&gt;/</code>. Asegúrate de mantener la estructura de carpetas constante.
    </p>

    <h2>Archivos Node</h2>
    <p>
      Para módulos que usan Vite, se activa un servidor Node temporal. Incluye un <code>package.json</code> con scripts como
      <code>"start": "vite"</code> y una carpeta <code>src</code> con tu entrada principal. El backend de la app hará POST a
      <code>/api/apps/&lt;nombre&gt;/start</code> y esperará a que el dev server responda con un puerto, luego carga el iframe mediante <code>localhost:&lt;puerto&gt;</code>.
    </p>
    <p>
      No olvides listar dependencias necesarias y mantener <code>devServerPort</code> actualizado si el módulo usa configuraciones customizadas.
    </p>
  </body>
</html>
`;

function App() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocsActive, setIsDocsActive] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayNameMap, setDisplayNameMap] = useState<Record<string, string>>({});
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [pendingModuleName, setPendingModuleName] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const loadApps = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/apps');
      const data = await response.json();
      setApps(data);
      
      // Si la app seleccionada todavía existe, actualizar su información
      if (selectedApp) {
        const updatedApp = data.find((app: AppInfo) => app.name === selectedApp.name);
        if (updatedApp) {
          setSelectedApp(updatedApp);
        }
      }
    } catch (error) {
      console.error('Error loading apps:', error);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleUploadSuccess = (moduleName: string) => {
    setPendingModuleName(moduleName);
    setRenameInput(moduleName);
    setRenameModalOpen(true);
  };

  const handleShowDocs = () => {
    setIsDocsActive(true);
  };

  const handleSelectApp = (app: AppInfo) => {
    setSelectedApp(app);
    setIsDocsActive(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        apps={apps}
        selectedApp={selectedApp}
        onSelectApp={handleSelectApp}
        onAddModule={() => {
          setIsUploadModalOpen(true);
          setIsDocsActive(false);
        }}
        onShowDocs={handleShowDocs}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isDocsActive={isDocsActive}
        displayNameMap={displayNameMap}
      />
      <AppViewer
        selectedApp={selectedApp}
        showDocs={isDocsActive}
        docsHtml={documentationHtml}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadSuccess}
      />
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Editar nombre del módulo"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Ingresa el nombre que quieres mostrar en el panel lateral para <strong>{pendingModuleName}</strong>.
          </p>
          <input
            type="text"
            value={renameInput}
            onChange={(event) => setRenameInput(event.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRenameModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (pendingModuleName) {
                  setDisplayNameMap((prev) => ({
                    ...prev,
                    [pendingModuleName]: renameInput.trim() || pendingModuleName
                  }));
                  setRenameModalOpen(false);
                  setPendingModuleName(null);
                  setRenameInput('');
                  loadApps();
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Guardar nombre
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
