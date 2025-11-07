import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Subject } from '../types/subject';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; code: string }) => void;
  subject?: Subject | null;
}

export function SubjectModal({ isOpen, onClose, onSave, subject }: SubjectModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code);
    } else {
      setName('');
      setCode('');
    }
    setError('');
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    onSave({ name: name.trim(), code: code.trim() });
    setName('');
    setCode('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {subject ? 'Editar Materia' : 'Nueva Materia'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Materia
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Matemáticas"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Código
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: MAT101"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {subject ? 'Guardar Cambios' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
