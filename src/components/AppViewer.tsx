import { useState, useEffect } from 'react';
import { AppInfo } from '../App';

interface AppViewerProps {
  selectedApp: AppInfo | null;
}

export function AppViewer({ selectedApp }: AppViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedApp) {
      setIframeUrl(null);
      return;
    }

    const startDevServerAndLoad = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (selectedApp.isVite) {
          // Si ya está corriendo, usar el puerto existente
          if (selectedApp.isRunning && selectedApp.devServerPort) {
            setIframeUrl(`http://localhost:${selectedApp.devServerPort}`);
          } else {
            // Iniciar el dev server
            const response = await fetch(
              `http://localhost:3001/api/apps/${selectedApp.name}/start`,
              { method: 'POST' }
            );
            
            if (!response.ok) {
              throw new Error('Failed to start dev server');
            }
            
            const data = await response.json();
            setIframeUrl(`http://localhost:${data.port}`);
          }
        } else {
          // App HTML estática
          setIframeUrl(`http://localhost:3001/apps/${selectedApp.name}/index.html`);
        }
      } catch (err) {
        console.error('Error loading app:', err);
        setError('Error al cargar la aplicación');
      } finally {
        setIsLoading(false);
      }
    };

    startDevServerAndLoad();
  }, [selectedApp]);

  if (!selectedApp) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            Bienvenido al Cargador de Módulos
          </h2>
          <p className="text-slate-600 text-lg">
            Selecciona un módulo del menú lateral o agrega uno nuevo
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-lg">
            {selectedApp.isVite ? 'Iniciando dev server...' : 'Cargando aplicación...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mb-4 text-red-500 text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={iframeUrl || ''}
      className="flex-1 w-full h-full border-none"
      title={selectedApp.name}
    />
  );
}
