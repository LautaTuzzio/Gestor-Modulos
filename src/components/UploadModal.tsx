import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (moduleName: string) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'installing' | 'building' | 'complete' | 'error';

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [moduleName, setModuleName] = useState('');
  const [nameError, setNameError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sanitizeModuleName = (value: string) => {
    return value
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .toLowerCase();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      setStatus('idle');
      setMessage('');
      const baseName = file.name.replace(/\.zip$/i, '');
      const sanitized = sanitizeModuleName(baseName);
      setModuleName(sanitized || baseName);
      setNameError('');
    } else {
      setMessage('Por favor selecciona un archivo .zip');
      setStatus('error');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const sanitizedName = sanitizeModuleName(moduleName);
    if (!sanitizedName) {
      setNameError('Ingresa un nombre válido (letras, números, guiones o guiones bajos).');
      return;
    }

    const formData = new FormData();
    formData.append('moduleName', sanitizedName);
    formData.append('module', selectedFile);

    try {
      setStatus('uploading');
      setMessage('Subiendo archivo...');

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);

              if (data.status === 'installing') {
                setStatus('installing');
                setMessage(data.message);
              } else if (data.status === 'building') {
                setStatus('building');
                setMessage(data.message);
              } else if (data.status === 'complete') {
                setStatus('complete');
                setMessage(data.message);
                setTimeout(() => {
                  onUploadComplete(data.app?.name || sanitizedName);
                  handleClose();
                }, 2000);
              } else if (data.status === 'error') {
                setStatus('error');
                setMessage(data.error || 'Error al procesar el archivo');
              }
            } catch (e) {
              console.error('Error parsing response:', e);
            }
          }
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error al subir el archivo');
      console.error('Upload error:', error);
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setMessage('');
    setSelectedFile(null);
    setModuleName('');
    setNameError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'installing':
      case 'building':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Upload className="w-8 h-8 text-slate-400" />;
    }
  };

  const canClose = status === 'idle' || status === 'error' || status === 'complete';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Módulo"
      showCloseButton={canClose}
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
          {getStatusIcon()}
          <p className="mt-4 text-sm text-slate-600 text-center">
            {status === 'idle' && 'Selecciona un archivo .zip para cargar'}
            {status === 'uploading' && 'Subiendo archivo...'}
            {status === 'installing' && 'Instalando dependencias...'}
            {status === 'building' && 'Compilando aplicación...'}
            {status === 'complete' && '¡Módulo cargado exitosamente!'}
            {status === 'error' && message}
          </p>
          {selectedFile && status === 'idle' && (
            <p className="mt-2 text-sm font-medium text-slate-700">
              {selectedFile.name}
            </p>
          )}
        </div>

        {status === 'idle' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                file:cursor-pointer cursor-pointer"
            />
            {selectedFile && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="module-name-input">
                  Nombre del módulo
                </label>
                <input
                  id="module-name-input"
                  type="text"
                  value={moduleName}
                  onChange={(event) => {
                    setModuleName(event.target.value);
                    setNameError('');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej. panel-reportes"
                />
                <p className="text-xs text-slate-500">
                  Se usará para crear la carpeta en <code>/apps</code>. Solo letras, números, guiones y guiones bajos.
                </p>
                {nameError && <p className="text-xs text-red-600">{nameError}</p>}
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              Subir Módulo
            </button>
          </div>
        )}

        {(status === 'uploading' || status === 'installing' || status === 'building') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">{message}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
