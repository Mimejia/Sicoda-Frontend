<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {

  }
}
</script>

<style>
/* Centrar íconos de todos los SweetAlert2 */
.swal2-popup .swal2-icon {
  margin: 0 auto !important;
}

.swal2-popup .swal2-title {
  text-align: center;
}

.swal2-popup .swal2-html-container {
  text-align: center;
}

</style>
