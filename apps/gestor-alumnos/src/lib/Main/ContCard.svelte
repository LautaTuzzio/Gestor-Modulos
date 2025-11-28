<script>
    import Card from "./Card.svelte";
    //export let Datacard;
    let Datacard = [
        {
            text: "Total Alumnos",
            icon: "fa-regular fa-bell",
            number: 1247,
            porcentaje: -15,
        },
        {
            text: "Total Alumnos",
            icon: "fa-regular fa-users",
            number: 1247,
            porcentaje: 15,
        },
        {
            text: "Total Alumnos",
            icon: "fa-regular fa-users",
            number: 1247,
            porcentaje: 15,
        },
        {
            text: "Total Alumnos",
            icon: "fa-regular fa-users",
            number: 1247,
            porcentaje: 15,
        },
        {
            text: "Total Alumnos",
            icon: "fa-regular fa-users",
            number: 1247,
            porcentaje: 15,
        },
        {
            text: "Total Alumnos",
            icon: "fa-regular fa-users",
            number: 1247,
            porcentaje: 15,
        },
    ];
</script>

<div class="contCard">
    {#each Datacard as card}
        <Card {...card} />
    {/each}
</div>

<style>
    .contCard {
        margin-top: 40px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: center;
        gap: 30px;
    }
</style>
