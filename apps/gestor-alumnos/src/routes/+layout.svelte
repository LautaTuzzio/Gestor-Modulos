<script>
	import Header from "$lib/Header/Header.svelte";
</script>

<div>
	<Header />
</div>

<slot />

<style>
	* {
		margin: 0px;
		box-sizing: border-box;
		padding: 0px;
	}
</style>
