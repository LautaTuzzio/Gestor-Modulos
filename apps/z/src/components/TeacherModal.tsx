import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertCircle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Teacher = Database['public']['Tables']['teachers']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];

interface TeacherModalProps {
  teacher: (Teacher & { subjects?: Subject[] }) | null;
  subjects: Subject[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TeacherModal({ teacher, subjects, onClose, onSuccess }: TeacherModalProps) {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';
  const isEditing = !!teacher;
  const isOwnProfile = teacher?.user_id === user?.id;

  const [formData, setFormData] = useState({
    first_name: teacher?.first_name || '',
    last_name: teacher?.last_name || '',
    dni: teacher?.dni || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    employment_status: teacher?.employment_status || 'provisional',
    password: '',
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacher?.subjects) {
      setSelectedSubjects(teacher.subjects.map(s => s.id));
    }
  }, [teacher]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await updateTeacher();
      } else {
        await createTeacher();
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const createTeacher = async () => {
    if (!isAdmin) {
      throw new Error('No tiene permisos para crear docentes');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Error al crear usuario');

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'teacher',
      });

    if (roleError) throw roleError;

    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .insert({
        user_id: authData.user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone || null,
        employment_status: formData.employment_status as 'titular' | 'provisional' | 'suplente',
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (teacherError) throw teacherError;

    if (selectedSubjects.length > 0) {
      const assignments = selectedSubjects.map(subjectId => ({
        teacher_id: teacherData.id,
        subject_id: subjectId,
        assigned_by: user?.id || null,
      }));

      const { error: assignError } = await supabase
        .from('teacher_subjects')
        .insert(assignments);

      if (assignError) throw assignError;
    }
  };

  const updateTeacher = async () => {
    if (!teacher) return;

    if (!isAdmin && !isOwnProfile) {
      throw new Error('No tiene permisos para editar este docente');
    }

    const updateData: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null,
      updated_at: new Date().toISOString(),
    };

    if (isAdmin) {
      updateData.dni = formData.dni;
      updateData.employment_status = formData.employment_status;
    }

    const { error: updateError } = await supabase
      .from('teachers')
      .update(updateData)
      .eq('id', teacher.id);

    if (updateError) throw updateError;

    if (isAdmin) {
      const { error: deleteError } = await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', teacher.id);

      if (deleteError) throw deleteError;

      if (selectedSubjects.length > 0) {
        const assignments = selectedSubjects.map(subjectId => ({
          teacher_id: teacher.id,
          subject_id: subjectId,
          assigned_by: user?.id || null,
        }));

        const { error: assignError } = await supabase
          .from('teacher_subjects')
          .insert(assignments);

        if (assignError) throw assignError;
      }
    }
  };

  const canEditField = (field: string) => {
    if (isAdmin) return true;
    if (!isOwnProfile) return false;
    return ['first_name', 'last_name', 'email', 'phone'].includes(field);
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Docente' : 'Nuevo Docente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                disabled={!canEditField('first_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                disabled={!canEditField('last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI
              </label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
                disabled={!canEditField('dni')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!canEditField('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!canEditField('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Laboral
              </label>
              <select
                value={formData.employment_status}
                onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                required
                disabled={!canEditField('employment_status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
              >
                <option value="titular">Titular</option>
                <option value="provisional">Provisional</option>
                <option value="suplente">Suplente</option>
              </select>
            </div>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!isEditing}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Materias Asignadas
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {subject.name} ({subject.code})
                    </span>
                  </label>
                ))}
                {subjects.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No hay materias disponibles
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
