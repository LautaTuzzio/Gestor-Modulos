<script>
    import Search from "./search.svelte";
    import Navbar from "./Navbar.svelte";
</script>

<div class="contSearch">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input type="text" />
</div>

<style>
    .contSearch {
        width: 300px;
        height: 50%;
        padding: 0px;
        margin: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    i {
        position: relative;
        left: 10%;
        width: auto;
        height: 100%;
        font-size: 1em;
        color: black;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    input {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        border: 1px solid rgba(65, 65, 65, 0.356);
        padding-left: 16%;
    }
</style>
