<script lang="ts">
    import { enhance } from "$app/forms";
    import type { Curso } from "$lib/types/types";
    import { page } from "$app/stores";

    type Materia = any;

    let cursoSeleccionado: Curso | null = null;
    let materiaEditando: Materia | null = null;

    let filtroCurso = "";
    let filtroMateria = "";

    let mostrarFormCurso = false;
    let mostrarFormMateria = false;

    let nuevoCurso = { curso: "", turno: "" };
    let formMateriaData = { id: "", nombre: "", profesor: "" };

    $: cursos = Array.isArray($page.data.cursos) ? $page.data.cursos : [];
    $: materias = Array.isArray($page.data.materias) ? $page.data.materias : [];

    $: {
        if (cursoSeleccionado) {
            const cursoActualizado = cursos.find(
                (c) => c.id === cursoSeleccionado?.id,
            );

            if (cursoActualizado) {
                cursoSeleccionado = cursoActualizado;
            } else {
                cursoSeleccionado = null;
            }
        }
    }

    $: cursosFiltrados = cursos.filter((c: Curso) =>
        (c.curso || "").toLowerCase().includes(filtroCurso.toLowerCase()),
    );

    $: materiasFiltradas = materias.filter((m: Materia) => {
        if (!cursoSeleccionado) return false;

        const coincideCurso = m.curso_id === cursoSeleccionado.id;

        const coincideFiltro = (m.nombre || "")
            .toLowerCase()
            .includes(filtroMateria.toLowerCase());

        return coincideCurso && coincideFiltro;
    });

    function seleccionarCurso(curso: Curso) {
        cursoSeleccionado = curso;

        filtroMateria = "";
        resetFormularioMateria();
    }

    function iniciarEdicionMateria(materia: Materia) {
        materiaEditando = materia;
        formMateriaData = {
            id: materia.id,
            nombre: materia.nombre,

            profesor: materia.profesor || "",
        };
        mostrarFormMateria = true;
    }

    function resetFormularioMateria() {
        materiaEditando = null;
        formMateriaData = { id: "", nombre: "", profesor: "" };
        mostrarFormMateria = false;
    }

    function resetFormularioCurso() {
        nuevoCurso = { curso: "", turno: "" };
        mostrarFormCurso = false;
    }

    function toggleMateriaForm() {
        if (mostrarFormMateria && materiaEditando) {
            resetFormularioMateria();
        } else if (mostrarFormMateria && !materiaEditando) {
            resetFormularioMateria();
        } else {
            resetFormularioMateria();
            mostrarFormMateria = true;
        }
    }
</script>

<div class="contenedor">
    <aside class="panel-cursos">
        <h2>Cursos</h2>
        <input
            type="text"
            placeholder="Buscar curso..."
            bind:value={filtroCurso}
            class="input-buscar"
        />

        <button
            class="btn btn-azul"
            on:click={() => (mostrarFormCurso = !mostrarFormCurso)}
        >
            {mostrarFormCurso ? "Cancelar" : "Agregar Curso"}
        </button>

        {#if mostrarFormCurso}
            <div class="formulario fade-in">
                <form
                    method="POST"
                    use:enhance
                    on:submit={resetFormularioCurso}
                >
                    <div>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre del curso"
                            bind:value={nuevoCurso.curso}
                            required
                        />
                        <select
                            name="turno"
                            id=""
                            bind:value={nuevoCurso.turno}
                            required
                        >
                            <option value="" disabled selected
                                >Seleccione turno</option
                            >
                            <option value="Mañana">Mañana</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Vespertino">Vespertino</option>
                        </select>
                        <button
                            class="btn btn-verde"
                            type="submit"
                            formaction="?/agregarCurso"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <ul class="lista-cursos">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            {#each cursosFiltrados as curso}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <li
                    class:selected={curso.id === cursoSeleccionado?.id}
                    on:click={() => seleccionarCurso(curso)}
                >
                    <div>
                        <strong>{curso.curso}</strong>
                        <p>{curso.turno}</p>
                    </div>
                </li>
            {/each}
        </ul>
    </aside>

    <main class="panel-materias">
        <header class="encabezado">
            <h2>Materias de {cursoSeleccionado?.curso || "ningún curso"}</h2>
            <div class="acciones-header">
                <input
                    type="text"
                    placeholder="Buscar materia..."
                    bind:value={filtroMateria}
                    class="input-buscar"
                    disabled={!cursoSeleccionado}
                />

                <button
                    class="btn btn-azul"
                    on:click={toggleMateriaForm}
                    disabled={!cursoSeleccionado}
                >
                    {#if mostrarFormMateria}
                        Cancelar
                    {:else}
                        Agregar Materia
                    {/if}
                </button>
            </div>
        </header>

        {#if mostrarFormMateria}
            <div class="formulario fade-in">
                <form
                    method="POST"
                    use:enhance
                    on:submit={resetFormularioMateria}
                >
                    <input type="hidden" name="id" value={formMateriaData.id} />

                    <input
                        type="hidden"
                        name="curso_id"
                        value={cursoSeleccionado?.id || ""}
                    />

                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre de la materia"
                        bind:value={formMateriaData.nombre}
                        required
                    />
                    <input
                        type="text"
                        name="profesor"
                        placeholder="Profesor"
                        bind:value={formMateriaData.profesor}
                    />
                    <button
                        class="btn btn-verde"
                        type="submit"
                        formaction={materiaEditando
                            ? "?/editarMateria"
                            : "?/agregarMateria"}
                    >
                        {materiaEditando
                            ? "Guardar Cambios"
                            : "Guardar Materia"}
                    </button>
                </form>
            </div>
        {/if}

        <table class="tabla">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Materia</th>
                    <th>Profesor</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each materiasFiltradas as materia, i}
                    <tr>
                        <td>{i + 1}</td>
                        <td>{materia.nombre}</td>
                        <td>{materia.profesor || "-"}</td>
                        <td class="acciones">
                            <button
                                class="btn btn-amarillo"
                                on:click={() => iniciarEdicionMateria(materia)}
                            >
                                Editar
                            </button>

                            <form method="POST" use:enhance>
                                <input
                                    type="hidden"
                                    name="id"
                                    value={materia.id}
                                />
                                <button
                                    class="btn btn-rojo"
                                    type="submit"
                                    formaction="?/eliminarMateria"
                                    on:click={(e) => {
                                        if (
                                            !confirm(
                                                `¿Estás seguro de eliminar la materia ${materia.nombre}?`,
                                            )
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Eliminar
                                </button>
                            </form>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4" class="sin-datos">
                            {#if cursoSeleccionado}
                                No hay materias registradas para <b
                                    >{cursoSeleccionado.curso}</b
                                >.
                            {:else}
                                Seleccione un curso para ver sus materias.
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </main>
</div>

<style>
    :root {
        --color-primario: #3498db;
        --color-secundario: #2ecc71;
        --color-fondo: #f4f7f6;
        --color-texto: #333;
        --color-borde: #ecf0f1;
        --color-resaltado: #94ddff31;
    }

    .contenedor {
        display: flex;
        height: 100vh;
        font-family: "Inter", sans-serif;
        color: var(--color-texto);
        background-color: var(--color-fondo);
        overflow: hidden;
    }

    .input-buscar,
    input[type="text"],
    select {
        width: 100%;
        padding: 10px 12px;
        margin-bottom: 10px;
        border: 1px solid var(--color-borde);
        border-radius: 8px;
        box-sizing: border-box;
        transition:
            border-color 0.3s,
            box-shadow 0.3s;
    }

    input:focus,
    select:focus {
        border-color: var(--color-primario);
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .btn {
        padding: 10px 15px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition:
            background-color 0.2s,
            transform 0.1s,
            box-shadow 0.2s;
        margin-right: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn:last-child {
        margin-right: 0;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }

    .btn-azul {
        background-color: var(--color-primario);
        color: white;
    }
    .btn-azul:hover {
        background-color: #2980b9;
    }

    .btn-verde {
        background-color: var(--color-secundario);
        color: white;
    }
    .btn-verde:hover {
        background-color: #27ae60;
    }

    .btn-rojo {
        background-color: #e74c3c;
        color: white;
    }
    .btn-rojo:hover {
        background-color: #c0392b;
    }

    .btn-amarillo {
        background-color: #f1c40f;
        color: var(--color-texto);
    }
    .btn-amarillo:hover {
        background-color: #f39c12;
    }

    .btn:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .panel-cursos {
        width: 300px;
        padding: 20px;
        background-color: white;
        border-right: 1px solid var(--color-borde);
        overflow-y: auto;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
    }

    .panel-cursos h2 {
        margin-top: 0;
        border-bottom: 2px solid var(--color-primario);
        padding-bottom: 10px;
        margin-bottom: 15px;
        font-size: 1.5em;
    }

    .panel-materias {
        flex-grow: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }

    .encabezado {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--color-borde);
    }

    .encabezado h2 {
        margin: 0;
        font-size: 1.8em;
    }

    .acciones-header {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .acciones-header .input-buscar {
        margin-bottom: 0;
        width: 250px;
    }

    .lista-cursos {
        list-style: none;
        padding: 0;
        margin-top: 15px;
        flex-grow: 1;
    }

    .lista-cursos li {
        padding: 15px 10px;
        margin-bottom: 8px;
        background-color: var(--color-fondo);
        border-radius: 8px;
        cursor: pointer;
        transition:
            background-color 0.2s,
            box-shadow 0.2s;
        border-left: 5px solid transparent;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .lista-cursos li:hover {
        background-color: #eaf1f5;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .lista-cursos li.selected {
        background-color: var(--color-resaltado);
        border-left: 5px solid var(--color-primario);
        font-weight: 600;
    }

    .lista-cursos li p {
        margin: 0;
        font-size: 0.9em;
        color: #7f8c8d;
    }

    .tabla {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .tabla th,
    .tabla td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid var(--color-borde);
    }

    .tabla th {
        background-color: var(--color-primario);
        color: white;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.9em;
    }

    .tabla tbody tr:hover {
        background-color: #f7f9fa;
    }

    .sin-datos {
        text-align: center;
        padding: 40px !important;
        color: #7f8c8d;
        font-style: italic;
    }

    .acciones {
        display: flex;
        gap: 8px;
        align-items: center;
        white-space: nowrap;
    }

    .acciones form {
        display: inline-block;
        margin: 0;
    }

    .formulario {
        margin-top: 10px;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #e0e0e0;
    }

    .formulario form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
    }
    .formulario form div {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    }
    .formulario input,
    .formulario select {
        flex-grow: 1;
        margin-bottom: 0;
        min-width: 150px;
    }

    .formulario button {
        flex-shrink: 0;
    }

    /* ANIMACIONES */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }

    /* MEDIA QUERIES (Responsividad) */
    @media (max-width: 768px) {
        .contenedor {
            flex-direction: column;
            height: auto;
        }

        .panel-cursos {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--color-borde);
        }

        .encabezado {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }

        .acciones-header {
            width: 100%;
            flex-direction: column;
            gap: 10px;
        }

        .acciones-header .input-buscar,
        .acciones-header button {
            width: 100%;
        }

        .formulario form {
            flex-direction: column;
        }

        .formulario input,
        .formulario select,
        .formulario button {
            width: 100%;
            min-width: unset;
        }

        .acciones {
            flex-direction: column;
            align-items: stretch;
            gap: 5px;
        }

        .acciones button,
        .acciones form button {
            width: 100%;
        }
    }
</style>
