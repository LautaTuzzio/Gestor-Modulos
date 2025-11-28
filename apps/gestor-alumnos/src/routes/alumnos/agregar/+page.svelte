<script>
    import Card from "$lib/components/Card.svelte";
    import { page } from "$app/stores";

    let alumno = {
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        fechaNacimiento: "",
        curso: "",
        domicilio: "",
    };
    let data = $page.data;
    const cursos =  data.cursos 
    
</script>

<div class="page-container">
    <div class="header">
        <h1>Agregar Nuevo Alumno</h1>
        <p>Ingrese los datos básicos del estudiante.</p>
    </div>

    <Card wide={true}>
        <form method="POST">
            <div class="form-row">
                <div class="input-group">
                    <input
                        type="text"
                        id="nombres"
                        name="nombres"
                        bind:value={alumno.nombres}
                        required
                    />
                    <label for="nombres">Nombre(s)</label>
                </div>

                <div class="input-group">
                    <input
                        type="text"
                        id="apellidos"
                        name="apellidos"
                        bind:value={alumno.apellidos}
                        required
                    />
                    <label for="apellidos">Apellido(s)</label>
                </div>
            </div>

            <div class="form-row">
                <div class="input-group">
                    <input
                        type="number"
                        id="dni"
                        name="dni"
                        bind:value={alumno.dni}
                        required
                    />
                    <label for="dni">DNI / Identificación</label>
                </div>

                <div class="input-group">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        bind:value={alumno.email}
                        required
                    />
                    <label for="email">Correo Electrónico</label>
                </div>
            </div>

            <div class="form-row">
                <div class="input-group">
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        bind:value={alumno.telefono}
                    />
                    <label for="telefono">Teléfono del padre/madre</label>
                </div>

                <div class="input-group date-picker-group">
                    <input
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        type="date"
                        bind:value={alumno.fechaNacimiento}
                        required
                    />
                    <label for="fechaNacimiento">Fecha de Nacimiento</label>
                </div>
            </div>

            <div class="form-row single-input">
                <div class="input-group">
                    <select
                        id="curso"
                        name="curso"
                        bind:value={alumno.curso}
                        required
                    >
                        <option value="" disabled selected
                            >Seleccionar curso</option
                        >
                        {#each cursos as curso}
                            <option value={curso.id}>{curso.curso}</option>
                        {/each}
                    </select>
                </div>

                <div class="input-group date-picker-group">
                    <input
                        id="domicilio"
                        name="domicilio"
                        type="text"
                        bind:value={alumno.domicilio}
                        required
                    />
                    <label for="fechaNacimiento">Domicilio del alumno </label>
                </div>
            </div>

            <div class="action-buttons-row">
                <button
                    type="button"
                    class="btn-secondary"
                    on:click={() => window.history.back()}
                >
                    Cancelar
                </button>
                <button type="submit" class="btn-primary">
                    Guardar Alumno
                </button>
            </div>
        </form>
    </Card>
</div>

<style>
    .page-container {
        max-width: 900px;
        margin: 40px auto;
        padding: 0 20px;
    }
    * {
        font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .header {
        text-align: center;
        margin-top: 50px;
        margin-bottom: 30px;
    }

    h1 {
        font-size: 2.2em;
        font-weight: 400; 
        margin: 0;
        color: #333;
    }

    p {
        color: #777;
        font-size: 1.05em;
    }

  
    .form-row {
        display: flex;
        gap: 25px; 
        margin-bottom: 20px;
    }


    .input-group {
        flex: 1;
        position: relative;
        padding-top: 20px; 
    }

    .input-group input,
    .input-group select {
        width: 100%;
        padding: 12px 10px;
        background-color: #f7f9fc; 
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 16px;
        color: #333;
        transition:
            border-color 0.2s,
            background-color 0.2s;
        box-sizing: border-box; 
    }

    .input-group input:focus,
    .input-group select:focus {
        outline: none;
        border-color: #007bff; 
        background-color: #ffffff;
        box-shadow: 0 0 0 1px #007bff;
    }

    
    .input-group label {
        position: absolute;
        top: 28px; 
        left: 10px;
        color: #999;
        font-size: 16px;
        pointer-events: none; 
        transition:
            top 0.2s,
            font-size 0.2s,
            color 0.2s;
    }

    /* Efecto de Flotar (cuando el input está lleno o enfocado) */
    .input-group input:focus + label,
    .input-group input:not(:placeholder-shown) + label,
    .input-group select:focus + label,
    .input-group select:not([value=""]) + label {
        top: 0px;
        font-size: 12px;
        color: #007bff;
        font-weight: 600;
        background-color: #f7f9fc;
        padding: 0 4px;
        left: 6px;
        z-index: 10;
    }

    .input-group select {
       
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }
    .date-picker-group {
        position: relative;
    }
    .icon-suffix {
        position: absolute;
        right: 15px;
        top: 30px;
        color: #999;
        width: 20px;
        height: 20px;
        pointer-events: none;
    }
   
    input[type="date"]::-webkit-calendar-picker-indicator {
        opacity: 0;
        cursor: pointer;
    }

    .action-buttons-row {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
        margin-top: 40px;
    }

    .btn-primary,
    .btn-secondary {
        padding: 12px 25px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition:
            background-color 0.2s,
            transform 0.1s;
    }

    .btn-primary {
        
        background-color: #007bff;
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background-color: #0056b3;
    }

    .btn-primary:active {
        transform: scale(0.98);
    }

    .btn-secondary {
        background: none;
        color: #777;
        border: 1px solid #ccc;
    }

    .btn-secondary:hover {
        background-color: #f0f0f0;
    }
</style>
