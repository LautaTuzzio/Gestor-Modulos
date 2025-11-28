// @ts-nocheck
import { redirect, fail, type NumericRange } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';

// Importar el cliente base de Supabase
import { createClient } from '@supabase/supabase-js';
import { addLog } from '$lib/funtions/addlog';

let VITE_SUPABASE_URL = 'https://iuczwhplovsujjwlbzko.supabase.co'
let VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Y3p3aHBsb3ZzdWpqd2xiemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzcwODgsImV4cCI6MjA3NjkxMzA4OH0.T5L1NzxqQ0D8iVGxRLMpTQvrQweYuwNe4gZE-MvA1Nw'


const CalificacionSchema = z.object({
	id_materia: z.string().uuid("ID de Materia inválido. Debe ser un UUID."),
	profesor: z.string().min(3, "El profesor debe tener al menos 3 caracteres."),
	// Valida formato de fecha 'YYYY-MM-DD'
	año_de_cursada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)."),
	estado_materia: z.enum(['Aprobada', 'Intensificación', 'Recursar'], { invalid_type_error: "Estado inválido." }),
	nota_primer_cuatri: z.preprocess(

		(val) => (val === "" || val === null) ? null : Number(val),
		z.number().min(0).max(10).nullable().optional().default(null)
	),
	nota_segundo_cuatri: z.preprocess(

		(val) => (val === "" || val === null) ? null : Number(val),
		z.number().min(0).max(10).nullable().optional().default(null)
	),
});

const SubirSchema = CalificacionSchema.extend({
	id_alumno: z.string().uuid("ID de Alumno inválido."),
});

const EditarSchema = SubirSchema.extend({
	id: z.string().uuid("ID de Calificación inválido."),
});


const initializeSupabase = () => {
	if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
		throw new Error('Variables de entorno de Supabase no cargadas.');
	}
	return createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
};



export const load: PageServerLoad = async ({ params }) => {

	const userId = params.id;

	if (!userId) {
		return { status: 400 as NumericRange<400, 599>, error: 'ID de alumno no especificado en la URL.' };
	}

	try {
		const supabase = initializeSupabase();

		const { data, error } = await supabase
			.from('historial_alumno')
			.select(`
                id,
                id_alumno,
                id_materia,
                profesor,
                año_de_cursada,
                nota_primer_cuatri,
                nota_segundo_cuatri,
                estado_materia,
                alumno (nombre, apellido),
                materias (nombre)
            `)
			.eq('id_alumno', userId)
			.order('año_de_cursada', { ascending: false });

		if (error) {
			console.error("Error en la consulta de Supabase:", error.message);
			return {
				status: 500 as NumericRange<400, 599>,
				error: `Error al cargar datos: ${error.message}`
			};
		}

		return {
			calificaciones: data,
			userId: userId
		};

	} catch (e) {

		return {
			status: 500 as NumericRange<400, 599>,
			error: e.message
		};
	}
};



export const actions: Actions = {

	subir: async ({ request }) => {
		try {
			const supabase = initializeSupabase();
			const formData = Object.fromEntries(await request.formData());


			const parsed = SubirSchema.safeParse(formData);
			if (!parsed.success) {
				const errors = parsed.error.flatten().fieldErrors;
				return fail(400, { errors, data: formData, action: 'subir' });
			}

			const data = parsed.data;

			const { error } = await supabase
				.from('historial_alumno')
				.insert(data);

			if (error) {
				return fail(500, { error: error.message, action: 'subir' });
			}
			addLog(`Se ha agregado una nueva calificación para el alumno ID: ${data.id_alumno}`, 'CREATE', 'Modulo de gestión de Alumnos');
			return { success: true, action: 'subir' };
		} catch (e) {
			return fail(500, { error: e.message, action: 'subir' });
		}
	},


	editar: async ({ request }) => {
		try {
			const supabase = initializeSupabase();
			const formData = Object.fromEntries(await request.formData());


			const parsed = EditarSchema.safeParse(formData);
			if (!parsed.success) {
				const errors = parsed.error.flatten().fieldErrors;
				return fail(400, { errors, data: formData, action: 'editar' });
			}

			const data = parsed.data;

			const { error } = await supabase
				.from('historial_alumno')
				.update(data)
				.eq('id', data.id);

			if (error) {
				return fail(500, { error: error.message, action: 'editar' });
			}
			addLog(`Se ha editado la calificación ID: ${data.id} del alumno ID: ${data.id_alumno}`, 'UPDATE', 'Modulo de gestión de Alumnos');
			return { success: true, action: 'editar' };
		} catch (e) {
			return fail(500, { error: e.message, action: 'editar' });
		}
	},


	eliminar: async ({ request }) => {
		try {
			const supabase = initializeSupabase();

			const formData = await request.formData();
			const calificacionId = formData.get('id');

			if (!calificacionId || typeof calificacionId !== 'string') {
				return fail(400, { error: 'ID de calificación requerido.', action: 'eliminar' });
			}


			const { error: deleteError } = await supabase
				.from('historial_alumno')
				.delete()
				.eq('id', calificacionId);

			if (deleteError) {
				return fail(500, { error: deleteError.message, action: 'eliminar' });
			}
			addLog(`Se ha eliminado la calificación ID: ${calificacionId}`, 'DELETE', 'Modulo de gestión de Alumnos');
			return { success: true, action: 'eliminar' };
		} catch (e) {
			return fail(500, { error: e.message, action: 'eliminar' });
		}
	},
};



