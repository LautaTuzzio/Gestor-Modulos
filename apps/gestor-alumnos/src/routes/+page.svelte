<script lang="ts">
    let { data } = $props();
    //Importacion de componentes
    import Textprincipal from "$lib/Main/TextPrincipal.svelte";
    import ContCard from "$lib/Main/ContCard.svelte";
    import ContNavegacion from "$lib/Main/Navegacion/ContNavegacion.svelte";
</script>


<main>
    <Textprincipal></Textprincipal>
 
    <ContNavegacion></ContNavegacion>
</main>

<style>
    main {
        min-height: 100%;
        height: auto;
        overflow-x: hidden;
        width: 100vw;
        padding: 5%;
    }
</style>
