<template>
    <div class="container-fluid ">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 text-center">
          <div class="card border-danger shadow-lg">
            <div class="card-body ">
              <img src="../assets/img/Astronaut-Repair.webp" alt="Astronauta perdido" class="img-fluid mb-4" style="max-width: 300px;">
              <h1 class="display-4">Error 404</h1>
              <p class="lead">¡Oops! La página que estás buscando no se encontró.</p>
              <p>Es posible que la dirección haya sido escrita incorrectamente o que la página haya sido eliminada.</p>
              <router-link to="/" class="btn btn-primary">Ir a la página de inicio</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ErrorComponent'
  }
  </script>
  
  <style scoped>  
  .container-fluid {
    background-image: url(../assets/img/Fondo_Espacio.jpg);
    background-size: cover;
    background-repeat: no-repeat;
  }
  </style>
  