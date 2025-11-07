import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { SubjectModal } from './components/SubjectModal';
import type { Subject } from './types/subject';

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubjects(data || []);
      setFilteredSubjects(data || []);
    } catch (err) {
      setError('Error al cargar las materias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubject = async (data: { name: string; code: string }) => {
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({ name: data.name, code: data.code })
          .eq('id', editingSubject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([{ name: data.name, code: data.code }]);

        if (error) throw error;
      }

      await fetchSubjects();
      setIsModalOpen(false);
      setEditingSubject(null);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        setError('Ya existe una materia con ese código');
      } else {
        setError('Error al guardar la materia');
      }
      console.error(err);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSubjects();
    } catch (err) {
      setError('Error al eliminar la materia');
      console.error(err);
    }
  };

  const handleNewSubject = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Materias</h1>
                <p className="text-sm text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Materias</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Gestión de materias académicas
                </p>
              </div>
              <button
                onClick={handleNewSubject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Materia
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">Cargando materias...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron materias' : 'No hay materias registradas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{subject.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{subject.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(subject.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        subject={editingSubject}
      />
    </div>
  );
}

export default App;
