<script>
    export let text;
    export let icon;
    export let number;
    export let porcentaje;
</script>

<div class="card">
    <div class="cont_text">
        <p class="card-title">{text}</p>
        <i class={icon}></i>
    </div>
    <div class="cont_datos">
        <h3 class="number">{number}</h3>
        <span class="percentage-info">
            <span class="porcentaje">{porcentaje}%</span> desde el mes pasado
        </span>
    </div>
</div>

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
        justify-content: space-between;
        width: 250px;
        max-width: 100%;
        min-height: 140px;
        height: auto;
    }

    .cont_text {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .card-title {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 1rem;
        color: var(--text-color-secondary);
        margin: 0;
        font-weight: 500;
    }

    .cont_text i {
        font-size: 1.4em;
        color: var(--percentage-positive-color);
    }

    .cont_datos {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
    }

    .number {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-weight: 700;
        font-size: 2.2em;
        color: var(--text-color-primary);
        margin: 0 0 5px 0;
        line-height: 1;
    }

    .percentage-info {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 0.9em;
        color: var(--text-color-secondary);
    }

    .porcentaje {
        color: var(--percentage-positive-color);
        font-weight: 600;
    }
</style>