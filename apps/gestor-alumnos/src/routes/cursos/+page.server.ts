import { fail } from '@sveltejs/kit';
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
    const { data: materias, error: fetchErrormaterias } = await supabase
        .from('materias')
        .select('*')
        .order('nombre', { ascending: true });
    if (fetchErrormaterias) {
        console.error('Error al obtener las materias:', fetchErrormaterias.message);
        throw error(500, 'Error al obtener los cursos.');
    }

    if (cursos && materias) {
        return { cursos, materias };
    }
    error(404, 'Not found');
};

export const actions = {
    agregarCurso: async ({ request }: { request: Request }) => {
        const data = await request.formData();
        const curso = data.get('nombre')?.toString().trim();
        const turno = data.get('turno')?.toString().trim();

        if (!curso || !turno) {
            return fail(400, { error: 'Todos los campos son obligatorios.' });
        }

        const { error } = await supabase.from('curso').insert([{ curso, turno }]);

        if (error) {
            console.error('Error al agregar curso:', error.message);
            return fail(500, { error: 'Error al guardar el curso en la base de datos.' });
        }   
        addLog(`Se ha agregado un nuevo curso: ${curso} - ${turno}`, 'CREATE', 'Modulo de gestión de Alumnos');
        // console.log('Curso agregado correctamente:', curso);
        return { success: true };
    }
    ,
    agregarMateria: async ({ request }: { request: Request }) => {
        const data = await request.formData();
        const nombre = data.get('nombre')?.toString().trim();
        const profesor = data.get('profesor')?.toString().trim();
        const curso_id = data.get('curso_id') as string; // La ID del curso seleccionado

        if (!nombre || !curso_id) {
            return fail(400, { error: 'El nombre de la materia y el curso son obligatorios.' });
        }

        const nuevaMateria = {
            nombre,
            curso_id,
            profesor
        };

        const { error: insertError } = await supabase.from('materias').insert([nuevaMateria]);

        if (insertError) {
            console.error('Error al agregar materia:', insertError.message);
            return fail(500, { error: 'Error al guardar la materia.' });
        }
        addLog(`Se ha agregado una nueva materia: ${nombre} para el curso ID: ${curso_id}`, 'CREATE', 'Modulo de gestión de Alumnos');
        return { success: true };
    },

    editarMateria: async ({ request }: { request: Request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;
        const nombre = data.get('nombre')?.toString().trim();
        const profesor = data.get('profesor')?.toString().trim();

        if (!id || !nombre) {
            return fail(400, { error: 'ID y Nombre son obligatorios para editar.' });
        }

        const materiaActualizada = {
            nombre,
            profesor,
        };

        const { error: updateError } = await supabase
            .from('materias')
            .update(materiaActualizada)
            .eq('id', id);

        if (updateError) {
            console.error('Error al editar materia:', updateError.message);
            return fail(500, { error: 'Error al actualizar la materia.' });
        }
        addLog(`Se ha actualizado la materia ID: ${id}`, 'UPDATE', 'Modulo de gestión de Alumnos');
        return { success: true };
    },


    eliminarMateria: async ({ request }: { request: Request }) => {
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) {
            return fail(400, { error: 'ID de materia no proporcionado.' });
        }

        const { error: deleteError } = await supabase.from('materias').delete().eq('id', id);

        if (deleteError) {
            console.error('Error al eliminar materia:', deleteError.message);
            return fail(500, { error: 'Error al eliminar la materia.' });
        }
        addLog(`Se ha eliminado la materia ID: ${id}`, 'DELETE', 'Modulo de gestión de Alumnos');
        return { success: true };
    }
};