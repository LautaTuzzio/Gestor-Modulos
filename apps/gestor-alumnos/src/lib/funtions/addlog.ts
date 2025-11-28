import { fail} from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';





export async function addLog(message: string, code: '' |'CREATE' | 'UPDATE' | 'DELETE' = '', modulo:string) {
    let fechaHora = new Date().toISOString();
    const { error } = await supabase.from('logs').insert([
            {
            modulo: modulo,
            log: message,
            Code: code,
            fecha: fechaHora
            }
        ]);

        if (error) {
            console.error("Error al registrar el logs del alumno:", error.message);
            return fail(500, { error: 'Error al registrar el logs del alumno en la base de datos.' });
        }

};