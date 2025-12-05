
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { addLog } from '$lib/funtions/addlog';
export const load: PageServerLoad = async ({ params }) => {
	const { data: cursos, error: fetchError } = await supabase
		.from('curso')
		.select('*')
		.order('id', { ascending: true });

	if (fetchError) {
		console.error('Error al obtener cursos:', fetchError.message);
		throw error(500, 'Error al obtener los cursos.');
	}


	if (cursos) {
		return { cursos };
	}
	error(404, 'Not found');
};

export const actions: Actions = {
	default: async ({ request }) => {
		console.log("Procesando formulario de registro de alumno...");

		const data = await request.formData();

		const alumno = {
			nombres: data.get('nombres')?.toString().trim(),
			apellidos: data.get('apellidos')?.toString().trim(),
			domicilio: data.get('domicilio')?.toString().trim(),
			dni: parseInt(data.get('dni') as string),
			email: data.get('email')?.toString().trim(),
			telefono: data.get('telefono')?.toString().trim() || null,
			fechaNacimiento: data.get('fechaNacimiento')?.toString(),
			curso: data.get('curso')?.toString() // ahora es el ID del curso
		};


		
		if (!alumno.nombres || !alumno.apellidos || !alumno.dni || !alumno.email || !alumno.curso) {
			return fail(400, { error: 'Todos los campos obligatorios deben estar completos.' });
		}

		console.log("Registrando alumno en la base de datos...");

		const { error } = await supabase.from('alumno').insert([
			{
				nombre: alumno.nombres,
				apellido: alumno.apellidos,
				dni: alumno.dni,
				email: alumno.email,
				domicilio: alumno.domicilio,
				id_curso: alumno.curso,
				telefono_padre: alumno.telefono ? Number(alumno.telefono) : null,
				nacimiento: alumno.fechaNacimiento
			}
		]);

		if (error) {
			console.error("Error al registrar alumno:", error.message);
			return fail(500, { error: 'Error al registrar el alumno en la base de datos.' });
		}
		addLog(`Se ha registrado un nuevo alumno: ${alumno.nombres} ${alumno.apellidos}`, 'CREATE', 'Modulo de gestión de Alumnos');
		console.log("Alumno registrado correctamente.");
		throw redirect(303, '/alumnos/lista');
	}
};


