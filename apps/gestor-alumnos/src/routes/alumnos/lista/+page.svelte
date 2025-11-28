<script lang="ts">
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { invalidate, goto } from "$app/navigation";

	interface Alumno {
		id: string;
		nombre: string;
		apellido: string | null;
		dni: number;
		curso: { curso: string; turno: string } | null;
	}

	let data = $page.data 
	$: alumnos = data.alumnos;

	const cursos = data.cursos;
	let alumnoEditando: any = null;
	let mostrarFormulario = false;
	let busqueda = "";
	let paginaActual = 1;
	const alumnosPorPagina = 5;

	let errorMensaje: string | null = null;
	let mostrarConfirmacionId: string | null = null;
	function editarAlumno(id: any) {
		alumnoEditando = alumnos.find((a: any) => a.id === id);
		mostrarFormulario = true;
	}

	async function actualizarAlumno() {
		try {
			const response = await fetch(`/api/alumnos/${alumnoEditando.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(alumnoEditando),
			});
			if (!response.ok) throw new Error("Error al actualizar alumno");

			mostrarFormulario = false;
			alumnoEditando = null;

			alert("Alumno actualizado correctamente");
		} catch (err: any) {
			errorMensaje = err.message;
		}
	}

	function cancelarEdicion() {
		mostrarFormulario = false;
		alumnoEditando = null;
	}

	async function eliminarAlumno(id: string) {
		mostrarConfirmacionId = null;

		const formData = new FormData();
		formData.append("id", id);

		const res = await fetch("?/eliminar", {
			method: "POST",
			body: formData,
		});

		const result =
			res.status !== 204
				? await res.json().catch(() => ({
						status: res.status,
						type: "error",
						message: "Respuesta inválida del servidor.",
					}))
				: { status: 200, type: "success" };

		console.log("Respuesta de eliminación:", result);

		if (res.ok || result.type === "success") {
			alumnos = alumnos.filter((a: any) => a.id !== id);

			await invalidate("alumnos");

			errorMensaje = null;
		} else {
			const msg =
				result.message ||
				"Ocurrió un error desconocido al eliminar el alumno.";
			console.error("Error al eliminar:", msg);
			errorMensaje = msg;
		}
	}

	$: alumnosFiltrados = alumnos.filter(
		(a: any) =>
			a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
			a.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
			a.dni.toString().includes(busqueda),
	);

	$: totalPaginas = Math.ceil(alumnosFiltrados.length / alumnosPorPagina);
	$: alumnosPaginados = alumnosFiltrados.slice(
		(paginaActual - 1) * alumnosPorPagina,
		paginaActual * alumnosPorPagina,
	);

	function cambiarPagina(nuevaPagina: number) {
		if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
			paginaActual = nuevaPagina;
		}
	}
</script>

{#if mostrarFormulario && alumnoEditando}
	<div class="cont_form">
		<h3>Editar Alumno</h3>
		<form method="POST" use:enhance action="?/editar">
			<div class="cont_input">
				<label for="dni">DNI</label>
				<input
					type="number"
					name="dni"
					bind:value={alumnoEditando.dni}
					required
				/>
			</div>
			<input type="hidden" name="id" value={alumnoEditando.id} />
			<div class="cont_input">
				<label for="nombre">curso</label>
				<select name="id_curso" id="">
					{#each cursos as curso}
						{#if curso.id == alumnoEditando.curso?.id}
							<option value={curso.id} selected
								>{curso.curso}</option
							>
						{:else}
							<option value={curso.id}>{curso.curso}</option>
						{/if}
					{/each}
				</select>
			</div>
			<div class="cont_input">
				<label for="nombre">Nombre</label>
				<input
					type="text"
					name="nombre"
					bind:value={alumnoEditando.nombre}
					required
				/>
			</div>
			<div class="cont_input">
				<label for="apellido">Apellido</label>
				<input
					type="text"
					name="apellido"
					bind:value={alumnoEditando.apellido}
					required
				/>
			</div>
			<div class="cont_input">
				<label for="domicilio">Domicilio</label>
				<input
					type="text"
					name="domicilio"
					bind:value={alumnoEditando.domicilio}
				/>
			</div>
			<div class="cont_input">
				<label for="telefono">Teléfono del padre</label>
				<input
					type="text"
					name="telefono"
					bind:value={alumnoEditando.telefono_padre}
				/>
			</div>
			<div class="cont_input">
				<label for="email">Email</label>
				<input
					type="email"
					name="email"
					bind:value={alumnoEditando.email}
				/>
			</div>
			<div class="cont_input">
				<label for="fecha_nac">Fecha de nacimiento</label>
				<input
					type="date"
					name="fecha_nac"
					bind:value={alumnoEditando.nacimiento}
				/>
			</div>

			<div class="botones-form">
				<button
					type="button"
					class="btn-cancelar"
					on:click={cancelarEdicion}
				>
					Cancelar
				</button>
				<button type="submit" class="btn-guardar">Guardar</button>
			</div>
		</form>
	</div>
{/if}
{#if mostrarFormulario == false && alumnoEditando == null}
	<div class="contenedor-lista">
		<h2>Lista de Alumnos</h2>

		{#if errorMensaje}
			<div class="mensaje-error">
				{errorMensaje}
				<button
					on:click={() => (errorMensaje = null)}
					class="cerrar-error">✖</button
				>
			</div>
		{/if}

		<div class="buscador">
			<input
				type="text"
				placeholder="Buscar por nombre, apellido o DNI..."
				bind:value={busqueda}
			/>
		</div>

		<table class="tabla-alumnos">
			<thead>
				<tr>
					<th>ID</th>
					<th>Nombre</th>
					<th>Apellido</th>
					<th>DNI</th>
					<th>Curso</th>
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#if alumnosPaginados.length > 0}
					{#each alumnosPaginados as alumno (alumno.id)}
						<tr>
							<td>{alumno.id}</td>
							<td>{alumno.nombre}</td>
							<td>{alumno.apellido}</td>
							<td>{alumno.dni}</td>
							<td>{alumno.id_curso.curso}</td>
							<td class="acciones">
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<!-- svelte-ignore a11y_missing_attribute -->
								<a
									class="eliminar"
									href="./historial/{alumno.id}"
								>
									Historial academico
								</a>
								<button
									class="editar"
									on:click={() => editarAlumno(alumno.id)}
								>
									Editar
								</button>
								<button
									class="eliminar"
									on:click={() =>
										(mostrarConfirmacionId = alumno.id)}
								>
									Eliminar
								</button>

								{#if mostrarConfirmacionId === alumno.id}
									<div class="confirmacion-popup">
										<p>
											¿Seguro que quieres eliminar a {alumno.nombre}?
										</p>
										<button
											class="confirmar-si"
											on:click={() =>
												eliminarAlumno(alumno.id)}
										>
											Sí
										</button>
										<button
											class="confirmar-no"
											on:click={() =>
												(mostrarConfirmacionId = null)}
										>
											No
										</button>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="6" class="no-encontrado"
							>No se encontraron alumnos.</td
						>
					</tr>
				{/if}
			</tbody>
		</table>

		<div class="paginacion">
			<button
				on:click={() => cambiarPagina(paginaActual - 1)}
				disabled={paginaActual === 1}
			>
				Anterior
			</button>
			<span>Página {paginaActual} de {totalPaginas}</span>
			<button
				on:click={() => cambiarPagina(paginaActual + 1)}
				disabled={paginaActual === totalPaginas}
			>
				Siguiente
			</button>
		</div>
	</div>
{/if}

<style>


	.cont_form {
		background: #fff;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		width: 95%;
		max-width: 600px;
		margin: 30px auto;
	}
	.cont_form .cont_input {
		margin-bottom: 15px;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: auto;
		gap: 10px;
	}
	.cont_form .cont_input label {
		font-weight: 600;
		color: #2c3e50;
	}
	.cont_form .cont_input input,
	select {
		padding: 10px 15px;
		border: 1px solid #bdc3c7;
		border-radius: 8px;
		font-size: 1rem;
		transition:
			border-color 0.3s,
			box-shadow 0.3s;
	}
	.cont_form .cont_input input:focus {
		border-color: #3498db;
		box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
		outline: none;
	}
	.cont_form .botones-form {
		display: flex;
		justify-content: flex-end;
		gap: 15px;
		margin-top: 20px;
	}
	.cont_form .botones-form .btn-cancelar,
	.cont_form .botones-form .btn-guardar {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.2s ease-in-out;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.cont_form .botones-form .btn-cancelar {
		background-color: #e74c3c;
		color: white;
	}
	.cont_form .botones-form .btn-cancelar:hover {
		background-color: #c0392b;
		transform: translateY(-1px);
	}
	.cont_form .botones-form .btn-guardar {
		background-color: #2ecc71;
		color: white;
	}
	.cont_form .botones-form .btn-guardar:hover {
		background-color: #27ae60;
		transform: translateY(-1px);
	}

	* {
		font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
		box-sizing: border-box;
	}

	body {
		background-color: #f4f7f6;
		margin: 0;
		padding: 0;
	}

	.contenedor-lista {
		background: #fff;
		padding: 30px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		width: 95%;
		max-width: 1200px;
		margin: 30px auto;
	}

	h2,
	h3 {
		color: #2c3e50;
		margin-bottom: 20px;
		border-bottom: 2px solid #ecf0f1;
		padding-bottom: 10px;
		font-weight: 600;
	}

	.buscador {
		margin-bottom: 20px;
	}

	.buscador input {
		width: 100%;
		padding: 12px 15px;
		border: 1px solid #bdc3c7;
		border-radius: 8px;
		font-size: 1rem;
		transition:
			border-color 0.3s,
			box-shadow 0.3s;
	}

	.buscador input:focus {
		border-color: #3498db;
		box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
		outline: none;
	}

	.tabla-alumnos {
		width: 100%;
		height: auto;
		border-collapse: separate;
		border-spacing: 0;
		margin-bottom: 15px;
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	.tabla-alumnos th,
	.tabla-alumnos td {
		padding: 12px 15px;
		text-align: left;
		border: none;
		position: relative; 
	}

	.tabla-alumnos th {
		background-color: #f0f4f7;
		color: #34495e;
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.9rem;
	}

	.tabla-alumnos tr {
		border-bottom: 1px solid #eee;
	}

	.tabla-alumnos tr:last-child {
		border-bottom: none;
	}

	.tabla-alumnos tr:nth-child(even) {
		background-color: #fcfcfc;
	}

	.tabla-alumnos tbody tr:hover {
		background-color: #e8f6f8;
		transition: background-color 0.2s;
	}

	.acciones {
		white-space: nowrap;
	}

	.acciones button,
	a {
		text-decoration: none;
		margin-right: 8px;
		padding: 8px 15px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.2s ease-in-out;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.acciones a{
		color: black;
		background-color: transparent;
		border: 1px solid gray;
	}
	.acciones a:hover{
		
		background-color: rgba(42, 147, 218, 0.151);
		
	}
	.editar {
		background-color: #3498db;
		color: white;
	}

	.editar:hover {
		background-color: #2980b9;
		transform: translateY(-1px);
	}

	.eliminar {
		background-color: #e74c3c;
		color: white;
	}

	.eliminar:hover {
		background-color: #c0392b;
		transform: translateY(-1px);
	}

	.no-encontrado {
		text-align: center;
		color: #95a5a6;
		padding: 20px;
		font-style: italic;
	}

	.paginacion {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;
		padding: 10px 0;
		border-top: 1px solid #eee;
	}

	.paginacion button {
		padding: 10px 18px;
		border: none;
		background-color: #2ecc71;
		color: white;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.paginacion button:hover:not(:disabled) {
		background-color: #27ae60;
	}

	.paginacion button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
		box-shadow: none;
	}

	.paginacion span {
		color: #34495e;
		font-weight: 600;
	}

	.mensaje-error {
		background-color: #f9dcdc;
		color: #c0392b;
		padding: 15px 20px;
		border: 1px solid #e74c3c;
		border-radius: 8px;
		margin-bottom: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 500;
	}

	.cerrar-error {
		background: none;
		border: none;
		color: #c0392b;
		font-size: 1.2rem;
		cursor: pointer;
		line-height: 1;
		transition: transform 0.2s;
	}

	.cerrar-error:hover {
		transform: rotate(90deg);
	}


	.confirmacion-popup {
			
		position: absolute;
		z-index: 10; 	

		
		top: 50%;
		left: 30%;
		transform: translate(
			-50%,
			-50%
		); 

	
		background: #fff;
		border: 2px solid #e74c3c; 
		border-radius: 10px;
		padding: 20px; 
		box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2); 

		min-width: 280px;
		text-align: center;

	
		max-width: 90vw;
	}

	.confirmacion-popup p {
		margin-bottom: 15px;
		color: #34495e;
		font-weight: 500;
	}

	.confirmacion-popup button {
		margin: 0 5px; 
		
	}
	.confirmar-si {
		background-color: #e74c3c;
		color: white;
		border: 1px solid #e74c3c;
	}

	.confirmar-no {
		background-color: #bdc3c7;
		color: #333;
		border: 1px solid #bdc3c7;
	}

	.confirmar-si:hover {
		background-color: #c0392b;
	}

	.confirmar-no:hover {
		background-color: #95a5a6;
	}
</style>
