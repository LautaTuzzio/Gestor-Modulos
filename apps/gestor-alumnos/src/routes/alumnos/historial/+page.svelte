<script lang="ts">
	let alumnos = [
		{ id: 1, nombre: "Juan Pérez", materia: "Matemática", profesor: "Prof. García", nota1: 8, nota2: 9, estado: "Aprobado", año: "2025-03-01" },
		{ id: 2, nombre: "Ana López", materia: "Lengua", profesor: "Prof. López", nota1: 6, nota2: 7, estado: "Aprobado", año: "2025-03-01" },
		{ id: 3, nombre: "Carlos Ruiz", materia: "Historia", profesor: "Prof. Méndez", nota1: 4, nota2: 5, estado: "Desaprobado", año: "2025-03-01" },
		{ id: 4, nombre: "Lucía Gómez", materia: "Inglés", profesor: "Prof. Ortega", nota1: 9, nota2: 10, estado: "Aprobado", año: "2025-03-01" }
	];

	let search = "";
	let currentPage = 1;
	const itemsPerPage = 3;

	// Filtrado
	$: filteredAlumnos = alumnos.filter(
		(a) =>
			a.nombre.toLowerCase().includes(search.toLowerCase()) ||
			a.materia.toLowerCase().includes(search.toLowerCase())
	);

	// Paginación
	$: totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);
	$: paginatedAlumnos = filteredAlumnos.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function changePage(page: number) {
		if (page >= 1 && page <= totalPages) currentPage = page;
	}

	function editar(id: number) {
		alert(`Editar alumno con ID ${id}`);
	}

	function eliminar(id: number) {
		if (confirm("¿Seguro que deseas eliminar este registro?")) {
			alumnos = alumnos.filter((a) => a.id !== id);
		}
	}
</script>

<div class="contenedor">
	<h2>Lista de Alumnos</h2>

	<div class="acciones">
		<input
			type="text"
			placeholder="Buscar alumno o materia..."
			bind:value={search}
			class="buscador"
		/>
		<button class="btn-agregar">+ Agregar Alumno</button>
	</div>

	<table class="tabla">
		<thead>
			<tr>
				<th>ID</th>
				<th>Alumno</th>
				<th>Materia</th>
				<th>Profesor</th>
				<th>1° Cuatr.</th>
				<th>2° Cuatr.</th>
				<th>Estado</th>
				<th>Año</th>
				<th>Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each paginatedAlumnos as alumno}
				<tr>
					<td>{alumno.id}</td>
					<td>{alumno.nombre}</td>
					<td>{alumno.materia}</td>
					<td>{alumno.profesor}</td>
					<td>{alumno.nota1}</td>
					<td>{alumno.nota2}</td>
					<td class={alumno.estado === "Aprobado" ? "estado-aprobado" : "estado-desaprobado"}>
						{alumno.estado}
					</td>
					<td>{alumno.año}</td>
					<td>
						<button class="btn editar" on:click={() => editar(alumno.id)}>Editar</button>
						<button class="btn eliminar" on:click={() => eliminar(alumno.id)}>Eliminar</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="paginacion">
		<button on:click={() => changePage(currentPage - 1)} disabled={currentPage === 1}>«</button>
		{#each Array(totalPages) as _, i}
			<button
				class:selected={currentPage === i + 1}
				on:click={() => changePage(i + 1)}
			>
				{i + 1}
			</button>
		{/each}
		<button on:click={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>»</button>
	</div>
</div>

<style>
.contenedor {
	background: #fff;
	padding: 2rem;
	border-radius: 10px;
	box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
	max-width: 1000px;
	margin: 2rem auto;
}

h2 {
	font-size: 1.5rem;
	color: #333;
	margin-bottom: 1rem;
	border-bottom: 2px solid #eaeaea;
	padding-bottom: 0.5rem;
}

.acciones {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.buscador {
	padding: 8px 12px;
	width: 60%;
	border: 1px solid #ccc;
	border-radius: 6px;
	font-size: 0.95rem;
	transition: all 0.3s ease;
}
.buscador:focus {
	outline: none;
	border-color: #007bff;
	box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.btn-agregar {
	background: #28a745;
	color: #fff;
	border: none;
	padding: 8px 14px;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.3s ease;
	font-weight: 500;
}
.btn-agregar:hover {
	background: #218838;
	transform: translateY(-1px);
}

.tabla {
	width: 100%;
	border-collapse: collapse;
	border-radius: 8px;
	overflow: hidden;
}
.tabla th {
	background-color: #f5f7fa;
	color: #333;
	padding: 12px;
	text-align: left;
	font-weight: 600;
	font-size: 0.95rem;
	border-bottom: 2px solid #e0e0e0;
}
.tabla td {
	padding: 10px;
	border-bottom: 1px solid #eee;
	font-size: 0.9rem;
	color: #444;
}
.tabla tr:hover {
	background-color: #f9fbff;
}

.btn {
	border: none;
	padding: 6px 12px;
	margin: 0 4px;
	border-radius: 5px;
	cursor: pointer;
	font-size: 0.85rem;
	transition: 0.3s;
}
.editar {
	background: #007bff;
	color: #fff;
}
.editar:hover {
	background: #0069d9;
}
.eliminar {
	background: #dc3545;
	color: #fff;
}
.eliminar:hover {
	background: #c82333;
}

.estado-aprobado {
	color: #28a745;
	font-weight: 600;
}
.estado-desaprobado {
	color: #dc3545;
	font-weight: 600;
}

.paginacion {
	display: flex;
	justify-content: center;
	margin-top: 1.5rem;
	gap: 6px;
}
.paginacion button {
	border: 1px solid #ddd;
	background: #fff;
	padding: 6px 12px;
	border-radius: 5px;
	cursor: pointer;
	transition: all 0.3s ease;
}
.paginacion button:hover:not(:disabled) {
	background: #007bff;
	color: white;
	border-color: #007bff;
}
.paginacion button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
.paginacion button.selected {
	background: #007bff;
	color: #fff;
	border-color: #007bff;
}
</style>
