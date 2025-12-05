<script>

    import Search from "./search.svelte";
    import Navbar from "./Navbar.svelte";
    import Logo from "./Logo.svelte";
</script>

<header>
    <Logo></Logo>
    <Navbar></Navbar>
</header>

<style>
    header{
        width: 100vw;
        height: 8vh;
        padding: 0px 20px;
        background-color: #ffffff9f;
        border-bottom: 1px solid rgba(51, 51, 51, 0.397);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

</style>