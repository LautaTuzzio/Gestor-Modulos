import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { addLog } from './workflows/logs';
import TeacherModal from './TeacherModal';
import type { Database } from '../lib/database.types';

type Teacher = Database['public']['Tables']['teachers']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];

interface TeacherWithSubjects extends Teacher {
  subjects?: Subject[];
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<TeacherWithSubjects[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithSubjects | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)  // Only fetch active teachers
        .order('last_name', { ascending: true });

      if (teachersError) throw teachersError;

      if (teachersData) {
        const teachersWithSubjects = await Promise.all(
          teachersData.map(async (teacher) => {
            const { data: assignments } = await supabase
              .from('teacher_subjects')
              .select('subject_id')
              .eq('teacher_id', teacher.id);

            if (assignments && assignments.length > 0) {
              const { data: subjects } = await supabase
                .from('subjects')
                .select('*')
                .in('id', assignments.map(a => a.subject_id));

              return { ...teacher, subjects: subjects || [] };
            }

            return { ...teacher, subjects: [] };
          })
        );

        setTeachers(teachersWithSubjects);
      }
    } catch (error: any) {
      showMessage('error', 'Error al cargar docentes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      showMessage('error', 'Error al cargar materias: ' + error.message);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('¿Está seguro de que desea dar de baja este docente?')) {
      return;
    }

    try {
      // First, get the teacher's data before deleting
      const { data: teacherData, error: fetchError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (fetchError) throw fetchError;

      // Deactivate the teacher
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', teacherId);

      if (error) throw error;

      // Add log entry for teacher deactivation
      try {
        await addLog(
          `Se ha eliminado el profesor ${teacherData.first_name} ${teacherData.last_name}`,
          'DELETE',
          'Módulo de gestor de profesores'
        );
      } catch (logError) {
        console.error('Error al registrar el log:', logError);
        // Continue even if logging fails
      }

      showMessage('success', 'Docente dado de baja correctamente');
      fetchTeachers();
    } catch (error: any) {
      showMessage('error', 'Error al dar de baja: ' + error.message);
    }
  };

  const handleEdit = (teacher: TeacherWithSubjects) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
    fetchTeachers();
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.dni.includes(searchTerm) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      titular: 'bg-green-100 text-green-800 border-green-200',
      provisional: 'bg-blue-100 text-blue-800 border-blue-200',
      suplente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Docentes</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de personal docente y asignación de materias
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nuevo Docente
            </button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !teacher.is_active ? 'opacity-50 bg-gray-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {teacher.last_name}, {teacher.first_name}
                      </div>
                      {!teacher.is_active && (
                        <span className="text-xs text-red-600 font-medium">Inactivo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{teacher.dni}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{teacher.email}</div>
                    {teacher.phone && (
                      <div className="text-sm text-gray-500">{teacher.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border capitalize ${getStatusBadge(
                        teacher.employment_status
                      )}`}
                    >
                      {teacher.employment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {teacher.is_active && (
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Dar de baja"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron docentes</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TeacherModal
          teacher={selectedTeacher}
          subjects={subjects}
          onClose={handleModalClose}
          onSuccess={() => {
            showMessage('success', selectedTeacher ? 'Docente actualizado correctamente' : 'Docente creado correctamente');
            handleModalClose();
          }}
        />
      )}
    </div>
  );
}
