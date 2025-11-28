<script>
    // @ts-nocheck
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { fade, blur } from 'svelte/transition';

    export let data;

    export let form;

    let isSubirModalOpen = false;
    let isEditModalOpen = false;
    let currentEditData = null; 

    let isDeleteModalOpen = false;
    let deleteTargetId = null; 

    let userId;

    $: userId = $page.data.userId || 'ID_DE_USUARIO_NO_DISPONIBLE'; 

    $: errors = form?.errors || {};
    $: action = form?.action || null;

    $: successMessage = '';
    $: if (form?.success) {
        if (action === 'subir') successMessage = 'Calificación subida con éxito.';
        if (action === 'editar') successMessage = 'Calificación actualizada con éxito.';
        if (action === 'eliminar') successMessage = 'Calificación eliminada con éxito.';
      isSubirModalOpen = false;
        isEditModalOpen = false;
        isDeleteModalOpen = false;
        
    
        setTimeout(() => (successMessage = ''), 3000);
    }

    /**

     * @param {Object} calificacion -
     */
    function openEditModal(calificacion) {
        currentEditData = {
           
            id: calificacion.id,
            id_alumno: calificacion.id_alumno, 
            id_materia: calificacion.id_materia,
            profesor: calificacion.profesor,
     
            año_de_cursada: calificacion.año_de_cursada.split('T')[0], 
            estado_materia: calificacion.estado_materia || 'pendiente',
            nota_primer_cuatri: calificacion.nota_primer_cuatri,
            nota_segundo_cuatri: calificacion.nota_segundo_cuatri
        };
        isEditModalOpen = true;
    }

    /**
     
     * @param {string} id 
     */
    function openDeleteModal(id) {
        deleteTargetId = id;
        isDeleteModalOpen = true;
    }

   
    const estadoOpciones = ['Aprobada', 'Intensificación', 'Recursar'];
</script>

<svelte:head>
    <!-- <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :global(body) {
            font-family: 'Inter', sans-serif;
            background-color: #f4f6f8;
        }
        .scroll-container {
            max-height: calc(100vh - 200px); 
        }
    </style> -->
</svelte:head>

<div class="p-4 md:p-8 max-w-7xl mx-auto">
    <header class="mb-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Calificaciones</h1>
        <button
            on:click={() => (isSubirModalOpen = true)}
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
            + Subir Calificación
        </button>
    </header>


    <div class="mb-4 text-sm text-gray-600 p-3 bg-gray-100 rounded-lg shadow-sm">
        Visualizando calificaciones para el ID de alumno: <span class="font-mono font-semibold text-gray-800 break-all">{userId}</span>
    </div>

  
    {#if successMessage}
        <div 
            in:fade="{{ duration: 200 }}" 
            out:fade="{{ duration: 200 }}"
            class="mb-6 p-4 text-sm font-medium text-green-800 rounded-lg bg-green-50 shadow-md"
        >
            {successMessage}
        </div>
    {/if}

 
    {#if form && form.error && action !== 'subir' && action !== 'editar' && action !== 'eliminar'}
        <div 
            in:fade="{{ duration: 200 }}" 
            out:fade="{{ duration: 200 }}"
            class="mb-6 p-4 text-sm font-medium text-red-800 rounded-lg bg-red-50 shadow-md"
        >
            Error en la acción {action}: {form.error}
        </div>
    {/if}


    <div class="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <div class="scroll-container overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">1er Cuatri</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2do Cuatri</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#if data.error}
                        <tr>
                            <td colspan="8" class="px-4 py-3 whitespace-nowrap text-center text-sm text-red-500 font-medium">
                                Error al cargar datos: {data.error}
                            </td>
                        </tr>
                    {:else if data.calificaciones && data.calificaciones.length > 0}
                        {#each data.calificaciones as calificacion (calificacion.id)}
                            <tr class="hover:bg-gray-50 transition duration-100">
                                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {calificacion.alumno?.nombre} {calificacion.alumno?.apellido}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {calificacion.materias?.nombre || 'N/A'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {calificacion.profesor || 'Sin asignar'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-center font-bold"
                                    class:text-green-600={calificacion.nota_primer_cuatri >= 7}
                                    class:text-red-600={calificacion.nota_primer_cuatri < 7 && calificacion.nota_primer_cuatri !== null}
                                >
                                    {calificacion.nota_primer_cuatri ?? '-'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-center font-bold"
                                    class:text-green-600={calificacion.nota_segundo_cuatri >= 7}
                                    class:text-red-600={calificacion.nota_segundo_cuatri < 7 && calificacion.nota_segundo_cuatri !== null}
                                >
                                    {calificacion.nota_segundo_cuatri ?? '-'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        {calificacion.estado_materia === 'aprobada' ? 'bg-green-100 text-green-800' : ''}
                                        {calificacion.estado_materia === 'reprobada' ? 'bg-red-100 text-red-800' : ''}
                                        {calificacion.estado_materia === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}"
                                    >
                                        {calificacion.estado_materia || 'Pendiente'}
                                    </span>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {calificacion.año_de_cursada ? calificacion.año_de_cursada.split('-')[0] : 'N/A'}
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                    <button 
                                        on:click={() => openEditModal(calificacion)}
                                        class="text-indigo-600 hover:text-indigo-900 mx-2"
                                        title="Editar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button 
                                        on:click={() => openDeleteModal(calificacion.id)}
                                        class="text-red-600 hover:text-red-900 mx-2"
                                        title="Eliminar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    {:else}
                        <tr>
                            <td colspan="8" class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                                No hay calificaciones registradas para este alumno.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>


{#if isSubirModalOpen}
    <div 
        class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
        transition:fade
    >
        <div 
            class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
            transition:blur
            role="dialog"
            aria-modal="true"
        >
            <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Subir Nueva Calificación</h2>
            
            {#if form && form.error && action === 'subir'}
                <div class="mb-4 p-3 text-sm text-red-800 rounded-lg bg-red-50">Error: {form.error}</div>
            {/if}

            <form method="POST" action="?/subir" use:enhance>
      
                <input type="hidden" name="id_alumno" value={userId} />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div class="md:col-span-2">
                        <label for="id_materia_subir" class="block text-sm font-medium text-gray-700">ID Materia (UUID)</label>
                        <input
                            id="id_materia_subir"
                            name="id_materia"
                            type="text"
                            required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.id_materia ? 'border-red-500' : ''}"
                            placeholder="e.g., e5f6g7h8-..."
                        />
                        {#if errors.id_materia}<p class="mt-1 text-xs text-red-500">{errors.id_materia}</p>{/if}
                    </div>

               
                    <div>
                        <label for="profesor_subir" class="block text-sm font-medium text-gray-700">Profesor</label>
                        <input
                            id="profesor_subir"
                            name="profesor"
                            type="text"
                            required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.profesor ? 'border-red-500' : ''}"
                            placeholder="Nombre del Profesor"
                        />
                        {#if errors.profesor}<p class="mt-1 text-xs text-red-500">{errors.profesor}</p>{/if}
                    </div>

                    <div>
                        <label for="anio_cursada_subir" class="block text-sm font-medium text-gray-700">Año de Cursada (YYYY-MM-DD)</label>
                        <input
                            id="anio_cursada_subir"
                            name="año_de_cursada"
                            type="date"
                            required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.año_de_cursada ? 'border-red-500' : ''}"
                        />
                        {#if errors.año_de_cursada}<p class="mt-1 text-xs text-red-500">{errors.año_de_cursada}</p>{/if}
                    </div>

                    <div>
                        <label for="nota_1_subir" class="block text-sm font-medium text-gray-700">Nota 1er Cuatri (0-10)</label>
                        <input
                            id="nota_1_subir"
                            name="nota_primer_cuatri"
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.nota_primer_cuatri ? 'border-red-500' : ''}"
                        />
                        {#if errors.nota_primer_cuatri}<p class="mt-1 text-xs text-red-500">{errors.nota_primer_cuatri}</p>{/if}
                    </div>

                    
                    <div>
                        <label for="nota_2_subir" class="block text-sm font-medium text-gray-700">Nota 2do Cuatri (0-10)</label>
                        <input
                            id="nota_2_subir"
                            name="nota_segundo_cuatri"
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.nota_segundo_cuatri ? 'border-red-500' : ''}"
                        />
                        {#if errors.nota_segundo_cuatri}<p class="mt-1 text-xs text-red-500">{errors.nota_segundo_cuatri}</p>{/if}
                    </div>
                </div>
                
         
                <div class="mt-4">
                    <label for="estado_materia_subir" class="block text-sm font-medium text-gray-700">Estado de Materia</label>
                    <select
                        id="estado_materia_subir"
                        name="estado_materia"
                        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.estado_materia ? 'border-red-500' : ''}"
                    >
                        {#each estadoOpciones as estado}
                            <option value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</option>
                        {/each}
                    </select>
                    {#if errors.estado_materia}<p class="mt-1 text-xs text-red-500">{errors.estado_materia}</p>{/if}
                </div>


                <div class="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        on:click={() => (isSubirModalOpen = false)}
                        class="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-150"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-md"
                    >
                        Guardar Calificación
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}


{#if isEditModalOpen && currentEditData}
    <div 
        class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
        transition:fade
    >
        <div 
            class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
            transition:blur
            role="dialog"
            aria-modal="true"
        >
            <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Editar Calificación</h2>
            
            {#if form && form.error && action === 'editar'}
                <div class="mb-4 p-3 text-sm text-red-800 rounded-lg bg-red-50">Error: {form.error}</div>
            {/if}

            <form method="POST" action="?/editar" use:enhance>
           
                <input type="hidden" name="id" value={currentEditData.id} />
                <input type="hidden" name="id_alumno" value={currentEditData.id_alumno} />
                <input type="hidden" name="id_materia" value={currentEditData.id_materia} />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                    <div>
                        <label for="profesor_edit" class="block text-sm font-medium text-gray-700">Profesor</label>
                        <input
                            id="profesor_edit"
                            name="profesor"
                            type="text"
                            bind:value={currentEditData.profesor}
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.profesor ? 'border-red-500' : ''}"
                        />
                        {#if errors.profesor}<p class="mt-1 text-xs text-red-500">{errors.profesor}</p>{/if}
                    </div>

               
                    <div>
                        <label for="anio_cursada_edit" class="block text-sm font-medium text-gray-700">Año de Cursada (YYYY-MM-DD)</label>
                        <input
                            id="anio_cursada_edit"
                            name="año_de_cursada"
                            type="date"
                            bind:value={currentEditData.año_de_cursada}
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.año_de_cursada ? 'border-red-500' : ''}"
                        />
                        {#if errors.año_de_cursada}<p class="mt-1 text-xs text-red-500">{errors.año_de_cursada}</p>{/if}
                    </div>

           
                    <div>
                        <label for="nota_1_edit" class="block text-sm font-medium text-gray-700">Nota 1er Cuatri (0-10)</label>
                        <input
                            id="nota_1_edit"
                            name="nota_primer_cuatri"
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            bind:value={currentEditData.nota_primer_cuatri}
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.nota_primer_cuatri ? 'border-red-500' : ''}"
                        />
                        {#if errors.nota_primer_cuatri}<p class="mt-1 text-xs text-red-500">{errors.nota_primer_cuatri}</p>{/if}
                    </div>

                    <div>
                        <label for="nota_2_edit" class="block text-sm font-medium text-gray-700">Nota 2do Cuatri (0-10)</label>
                        <input
                            id="nota_2_edit"
                            name="nota_segundo_cuatri"
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            bind:value={currentEditData.nota_segundo_cuatri}
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.nota_segundo_cuatri ? 'border-red-500' : ''}"
                        />
                        {#if errors.nota_segundo_cuatri}<p class="mt-1 text-xs text-red-500">{errors.nota_segundo_cuatri}</p>{/if}
                    </div>
                </div>
             
                <div class="mt-4">
                    <label for="estado_materia_edit" class="block text-sm font-medium text-gray-700">Estado de Materia</label>
                    <select
                        id="estado_materia_edit"
                        name="estado_materia"
                        bind:value={currentEditData.estado_materia}
                        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border {errors.estado_materia ? 'border-red-500' : ''}"
                    >
                        {#each estadoOpciones as estado}
                            <option value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</option>
                        {/each}
                    </select>
                    {#if errors.estado_materia}<p class="mt-1 text-xs text-red-500">{errors.estado_materia}</p>{/if}
                </div>


                <div class="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        on:click={() => (isEditModalOpen = false)}
                        class="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-150"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-md"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}


{#if isDeleteModalOpen && deleteTargetId}
    <div 
        class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
        transition:fade
    >
        <div 
            class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            transition:blur
            role="dialog"
            aria-modal="true"
        >
            <h2 class="text-xl font-bold mb-4 text-gray-800">Confirmar Eliminación</h2>
            
            {#if form && form.error && action === 'eliminar'}
                <div class="mb-4 p-3 text-sm text-red-800 rounded-lg bg-red-50">Error de Eliminación: {form.error}</div>
            {/if}

            <p class="mb-6 text-gray-600">¿Estás seguro de que quieres eliminar esta calificación? Esta acción es irreversible.</p>

 
            <form method="POST" action="?/eliminar" use:enhance>
                <input type="hidden" name="id" value={deleteTargetId} />
                <div class="flex justify-end space-x-3">
                    <button
                        type="button"
                        on:click={() => (isDeleteModalOpen = false)}
                        class="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-150"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-md"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>

    @import "tailwindcss";
</style>