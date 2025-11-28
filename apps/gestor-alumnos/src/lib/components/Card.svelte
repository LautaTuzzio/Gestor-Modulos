<script>

    export let wide = false;
</script>

<div class="card" class:wide>
    <slot />
</div>

<style>
    .card {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 24px;
        transition: transform 0.2s;
       
    }

    
    .wide {
        max-width: 800px; 
        margin: 30px auto; 
    }
</style>
