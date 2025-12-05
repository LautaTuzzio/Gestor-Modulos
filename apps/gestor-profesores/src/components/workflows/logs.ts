import { supabase } from '../../lib/supabase';

export async function addLog(
  message: string,
  code: '' | 'CREATE' | 'UPDATE' | 'DELETE' = '',
  modulo: string
) {
  const logData = {
    modulo,
    log: message,
    Code: code,
    fecha: new Date().toISOString()
  };

  const { error } = await supabase
    .from('logs')
    .insert(logData);

  if (error) {
    console.error('Error adding log:', error);
    throw error;
  }
}