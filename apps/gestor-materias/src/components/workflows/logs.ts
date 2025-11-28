import { supabase } from '../../lib/supabase';

type LogCode = '' | 'CREATE' | 'UPDATE' | 'DELETE';

interface LogData {
  modulo: string;
  log: string;
  Code: LogCode;
  fecha: string;
}

export async function addLog(
  message: string,
  code: LogCode = '',
  modulo: string
): Promise<void> {
  const logData: LogData = {
    modulo,
    log: message,
    Code: code,
    fecha: new Date().toISOString()
  };

  const { error } = await supabase
    .from<LogData>('logs')
    .insert([logData]);

  if (error) {
    console.error('Error adding log:', error);
    throw error;
  }
}

export async function logSubjectAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  subjectName: string
): Promise<void> {
  const messages = {
    CREATE: `Se ha creado una nueva materia ${subjectName}`,
    UPDATE: `Se ha actualizado una materia ${subjectName}`,
    DELETE: `Se ha eliminado una materia ${subjectName}`
  };

  await addLog(
    messages[action],
    action,
    'Modulo de gestor de materias'
  );
}