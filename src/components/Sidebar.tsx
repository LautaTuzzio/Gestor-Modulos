import { ChevronLeft, ChevronRight, FileText, Plus, Trash2, Zap } from 'lucide-react';
import { AppInfo } from '../App';

interface SidebarProps {
  apps: AppInfo[];
  selectedApp: AppInfo | null;
  onSelectApp: (app: AppInfo) => void;
  onAddModule: () => void;
  onShowDocs: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDocsActive: boolean;
  displayNameMap: Record<string, string>;
  onDeleteApp: (appName: string) => void;
}

export function Sidebar({
  apps,
  selectedApp,
  onSelectApp,
  onAddModule,
  onShowDocs,
  isDocsActive,
  isCollapsed,
  onToggleCollapse,
  displayNameMap,
  onDeleteApp
}: SidebarProps) {
  return (
    <div
      className={`bg-slate-800 text-white transition-all duration-300 flex flex-col border-r-2 border-dashed-white ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold">Módulos</h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {apps.map((app) => {
          const displayName = displayNameMap[app.name] || app.name;
          return (
            <button
              key={app.name}
              onClick={() => onSelectApp(app)}
              className={`w-full p-3 mb-2 rounded-lg text-left transition-colors group ${
                selectedApp?.name === app.name
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'hover:bg-slate-700'
              }`}
              title={isCollapsed ? app.name : undefined}
            >
              {isCollapsed ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium">
                    {app.name.substring(0, 2).toUpperCase()}
                  </span>
                  {app.isVite && app.isRunning && (
                    <Zap className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium truncate flex-1">{displayName}</span>
                  <div className="flex items-center gap-1">
                    {app.isVite && app.isRunning && (
                      <Zap className="w-4 h-4 text-yellow-400" />
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
<<<<<<< HEAD
                        onDeleteApp(app.name);
=======
                        if (window.confirm(`¿Estás seguro de que deseas eliminar el módulo "${displayName}"? Esta acción no se puede deshacer.`)) {
                          onDeleteApp(app.name);
                        }
>>>>>>> 37a0a15cddf46148672468e871c774ff0686d59f
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30 transition-all"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-700 flex flex-col gap-3">
        <button
          onClick={onShowDocs}
          className={`w-full p-3 rounded-lg transition-all border-white flex items-center justify-center gap-2 border ${
            isDocsActive
              ? 'bg-white text-slate-900 border-slate-300 shadow'
              : 'bg-slate-800 text-white border-transparent hover:bg-slate-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Documentación</span>}
        </button>
        <button
          onClick={onAddModule}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Agregar Módulo</span>}
        </button>
      </div>
    </div>
  );
}
