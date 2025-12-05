<script>
    export let name;
    export let icon;
    export let link;
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a class="card" href={link}>
    <p class="card-title">{name}</p>
    <i class={icon}></i>
</a>

<style>
    :root {
        --card-bg-color: #ffffff;
        --card-shadow-color: rgba(0, 0, 0, 0.05);
        --text-color-primary: #333333;
        --text-color-secondary: #666666;
        --percentage-positive-color: #2e86de;
        --border-radius: 12px;
        --padding-card: 24px;
    }

    .card {
        background-color: var(--card-bg-color);
        box-shadow: 0 4px 10px var(--card-shadow-color);
        border-radius: var(--border-radius);
        border: 1px solid rgba(44, 44, 44, 0.11);
        padding: var(--padding-card);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        width: 250px;
        max-width: 100%;
        min-height: 140px;
        height: auto;
        transition: all 0.3s ease;
    }
    .card:hover {
        transform: scale(1.05);
        background-color: #2e86de23;
        box-shadow: 0 8px 16px var(--card-shadow-color);
    }

    .card-title {
        font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 1.2em;
        color: var(--text-color-secondary);
        margin: 0;
        font-weight: bolder;
    }

    i {
        font-size: 1.4em;
        color: var(--percentage-positive-color);
    }
</style>
