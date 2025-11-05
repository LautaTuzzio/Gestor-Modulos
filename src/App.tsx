import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppViewer } from './components/AppViewer';
import { UploadModal } from './components/UploadModal';

export interface AppInfo {
  name: string;
  isVite: boolean;
  devServerPort?: number;
  isRunning: boolean;
}

function App() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const handleUploadComplete = () => {
    loadApps();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        apps={apps}
        selectedApp={selectedApp}
        onSelectApp={setSelectedApp}
        onAddModule={() => setIsUploadModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <AppViewer selectedApp={selectedApp} />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}

export default App;
