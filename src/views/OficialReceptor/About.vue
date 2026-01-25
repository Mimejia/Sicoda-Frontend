<template>
    <div class="card card-custom" id="kt_page_sticky_card" style="user-select: none">
        <div class="card-header" style="background-color: #0097e6">
            <h1 class="text-white titulo">Sistema de Denuncias Ambientales</h1>
            <img class="logo-marn" src="../../assets/img/marn.webp" alt="Logo" />
        </div>

        <div class="card-body justify-content-center">
        </div>
    </div>
</template>

<script>

export default {
    name: 'AboutE',
    components: {
    },
}
</script>

<style>
.pagination a {
    float: left;
    padding: 8px 16px;
    text-decoration: none;
    border: 1px solid #ddd;
    background-color: white;
}

.pagination a.active {
    background-color: green;
}

.pagination a:hover:not(.active) {
    background-color: #92c5fc;
}

.pagination a:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}

.pagination a:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
}

.myActiveBtn {
    background-color: green;
}

img.logo-marn {
    width: 400px;
    height: 100px;
    align-items: center;
    padding: 4px;
}

@media (max-width: 768px) {
    img.logo-marn {
        width: 250px;
        height: 65px;
    }

    .titulo {
        font-size: 25px;
    }
}

@media (max-width: 425px) {
    img.logo-marn {
        width: 150px;
        height: 50px;
    }

    .titulo {
        font-size: 20px;
    }
}

.card-custom .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>