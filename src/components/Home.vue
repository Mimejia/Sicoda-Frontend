<template>
     <SidebarE></SidebarE>
</template>

<script>
import SidebarE from './SidebarE.vue';
export default {
    name: 'HomeE',
    components:{
        SidebarE
    },
    beforeRouteEnter(to, from, next) {
    // Si no hay una ruta hija activa, redirige a la ruta por defecto
    if (!to.matched.length) {
      next({ path: '/' });
    } else {
      next();
    }
  }
}
</script>

<style>
body{
  background-color: #f0f0f0;
}
</style>
