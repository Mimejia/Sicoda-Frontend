import { createApp } from 'vue';
import App from './App.vue';
import router from './router/routes';
import store from './store';
import axios from 'axios';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
// import CKEditor from '@ckeditor/ckeditor5-vue';


import Vuelidate from '@vuelidate/core';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import '@/assets/styles/marn-theme.css';

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all';
import Global from '@/Global';
import Multiselect from 'vue-multiselect';

// Componentes globales
import IconCheck from '@/components/Iconos/IconCheck.vue';
import IconX from '@/components/Iconos/IconX.vue';
import BotonAnonimo from '@/components/Botones/BotonAnonimo.vue';
import SelectConIcono from '@/components/Botones/SelectConIcono.vue';
import SelectSexo from '@/components/Botones/SelectSexo.vue';
import SelectDepartamento from '@/components/Botones/SelectDepartamento.vue';
import SelectMunicipio from '@/components/Botones/SelectMunicipio.vue';
import SelectIdioma from '@/components/Botones/SelectIdioma.vue';
import SelectEtnia from '@/components/Botones/SelectEtnia.vue';
import SelectTipoDenuncia from '@/components/Botones/SelectTipoDenuncia.vue';
import SelectClasificacion from './components/Botones/SelectClasificacion.vue';

const app = createApp(App);

// Registrar plugins
app.use(router);
app.use(store);
app.use(Vuelidate);
app.use(VueSweetalert2);
app.component('v-select', vSelect);
app.component('MultiSelectCustom', Multiselect);
app.config.globalProperties.$Global = Global;

// app.use(CKEditor);
// app.component('CkEditorComponent', CKEditor.component); // ✅ cumple convención

// Registrar componentes globales
app.component('IconCheck', IconCheck);
app.component('IconX', IconX);
app.component('BotonAnonimo', BotonAnonimo);
app.component('SelectConIcono', SelectConIcono);
app.component('SelectSexo', SelectSexo);
app.component('SelectDepartamento', SelectDepartamento);
app.component('SelectMunicipio', SelectMunicipio);
app.component('SelectIdioma', SelectIdioma);
app.component('SelectEtnia', SelectEtnia);
app.component('SelectTipoDenuncia', SelectTipoDenuncia);
app.component('SelectClasificacion', SelectClasificacion);

// Configurar Axios (opcional)
axios.interceptors.request.use(
  config => {
    const token = store.state.token;
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Middleware de rutas
router.beforeEach((to, _, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.isAuthenticated) {
      next({ path: '/login' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (store.state.isAuthenticated) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue global error:', err, info);
};

app.config.globalProperties.$Global = Global;

// Inicializar autenticación
store.dispatch('initializeUser');

// Montar la app
app.mount('#app');


