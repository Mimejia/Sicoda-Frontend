// store/index.js

import Vue from 'vue';
import Vuex from 'vuex';
/// import router from './router/routes'; // Importa el enrutador desde el archivo de rutas

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        isAuthenticated: false,
        token: null,
        userEmail: null,
        nitR: null,
        userRoles: [], // Agrega una propiedad para almacenar los roles del usuario
        sessionTimer: null // Agrega una propiedad para almacenar el temporizador de sesión
    },
    mutations: {
        setAuth(state, { isAuthenticated, token, userEmail, nitR, userRoles  }) {
            state.isAuthenticated = isAuthenticated;
            state.token = token;
            state.userEmail = userEmail;
            state.nitR = nitR;
            state.userRoles = userRoles; // Almacena los roles del usuario
        },
        logout(state) {
            state.isAuthenticated = false;
            state.token = null;
            state.userEmail = null;
            state.nitR = null;
            state.userRoles = []; // Limpia los roles del usuario al cerrar sesión

            // Limpiar el temporizador de sesión al cerrar sesión
            clearInterval(state.sessionTimer);
            state.sessionTimer = null;
            // Redirigir al usuario a la página de inicio de sesión
            // router.push('/login');
        },
        startSessionTimer(state) {
            // Establecer un temporizador para cerrar sesión después de 30 minutos de inactividad
            state.sessionTimer = setInterval(() => {
                // Llamar a la acción de cerrar sesión cuando expire el tiempo de sesión
                store.dispatch('logout');
            }, 60 * 60 * 1000); // 30 minutos en milisegundos
        }
    },
    actions: {
        checkAuth({ commit }) {
            const token = localStorage.getItem('tokenBoleta');
            if (token) {
                const userEmail = localStorage.getItem('userEmailBoleta');
                const nitR = localStorage.getItem('nitR');
                const userRoles = JSON.parse(localStorage.getItem('userRolesBoleta'));
                commit('setAuth', { isAuthenticated: true, token, userEmail, nitR, userRoles });
                commit('startSessionTimer');
            } else {
                commit('logout');
            }
        },
        login({ commit }, payload) {
            // Aquí se realizaría el inicio de sesión y la obtención del token
            // Luego, se almacena el token en el almacenamiento local
            localStorage.setItem('tokenBoleta', payload.token);
            localStorage.setItem('userEmailBoleta', payload.userEmail);
            localStorage.setItem('nitR', payload.nitR);
            localStorage.setItem('userRolesBoleta', JSON.stringify(payload.userRoles));
            commit('setAuth', { isAuthenticated: true, token: payload.token, userEmail: payload.userEmail, nitR: payload.nitR, userRoles: payload.userRoles  });
            // Iniciar el temporizador de sesión después del inicio de sesión
            commit('startSessionTimer');
        },
        logout({ commit }) {
            // Eliminar el token del almacenamiento local al cerrar sesión
            localStorage.removeItem('tokenBoleta');
            localStorage.removeItem('userEmailBoleta');
            localStorage.removeItem('userRolesBoleta');
            localStorage.removeItem('nitR');
            commit('logout');
        },
        initializeUser({ commit }) {
            const token = localStorage.getItem('tokenBoleta');
            const userEmail = localStorage.getItem('userEmailBoleta');
            const nitR = localStorage.getItem('nitR');
            const userRoles = JSON.parse(localStorage.getItem('userRolesBoleta'));
            

            if (token && userEmail && userRoles) {
                commit('setAuth', { isAuthenticated: true, token, userEmail,  nitR, userRoles });
            }
        }
    },
});
export default store;
