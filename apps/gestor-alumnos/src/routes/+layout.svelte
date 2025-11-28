<script>
	import Header from "$lib/Header/Header.svelte";
	import '$lib/../app.css';  // Ruta desde lib hacia arriba
</script>

<div>
	<Header />
</div>

<slot />