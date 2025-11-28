<script lang="ts">
    import { page } from "$app/stores";
    import CardNavegacion from "./CardNavegacion.svelte";
    const navItems = [
        {
            name: "Lista de Alumnos",
            icon: "fas fa-user-friends",
            link: "/alumnos/lista",
        },
        {
            name: "Agregar Alumno",
            icon: "fas fa-plus",
            link: "/alumnos/agregar",
        },
        {
            name: "Cursos y Materias",
            icon: "fas fa-book-open",
            link: "/cursos",
        },
    ];

    const colors = {
        paletaPastel: [
            {
                nombre: "Azul Bebé (Pale Blue)",
                codigoHex: "#E6EAFE",
            },
            {
                nombre: "Lavanda (Lavender)",
                codigoHex: "#E6E6FA",
            },
            {
                nombre: "Menta (Mint Cream)",
                codigoHex: "#F5FFFA",
            },
            {
                nombre: "Rosa Claro (Light Pink)",
                codigoHex: "#FFDDE2",
            },
            {
                nombre: "Melocotón (Peach Puff)",
                codigoHex: "#FFEDD5",
            },
            {
                nombre: "Verde Pálido (Pale Green)",
                codigoHex: "#E0FFEE",
            },
        ],
        sugerenciasEstilo: {
            backgrounds: {
                default: "#F5F5F5",
                alternativo: "#F0FFF0",
            },
            border: {
                suave: "#DCDCDC",
                estandar: "#C0C0C0",
            },
            text: {
                principal: "#333333",
                secundario: "#6B7280",
            },
            ejemploCombinacion: {
                backgroundColor: "#E6EAFE",
                borderColor: "#DCDCDC",
                textColor: "#333333",
            },
        },
    };
</script>

<div class="card-nav-container">
    <h2 class="nav-title">Panel de Acceso Rápido</h2>

    <div class="card-grid">
        {#each navItems as item}
            <CardNavegacion {...item}></CardNavegacion>
        {/each}
    </div>
</div>

<style>
    :root {
        --card-bg: #ffffff;
        --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        --card-hover-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        --card-radius: 12px;
        --card-padding: 20px;
        --text-color: #333333;
        --text-color-secondary: #666666;
        --active-bg: #2e86de;
        --active-text: #ffffff;
        --icon-color-default: #2e86de;
        --font-family-sans: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .card-nav-container {
        padding: 30px;
        background-color: #f5f7f9;
        border-radius: var(--card-radius);
        font-family: var(--font-family-sans);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .nav-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 25px;
        text-align: center;
    }

    .card-grid {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        height: auto;
        gap: 20px;
    }
</style>
