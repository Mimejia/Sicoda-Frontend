// src/store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    isAuthenticated: false,
    token: null,
    userEmail: null,
    nitR: null,
    userRoles: [],
    sessionTimer: null
  },
  mutations: {
    setAuth(state, { isAuthenticated, token, userEmail, nitR, userRoles }) {
      state.isAuthenticated = isAuthenticated;
      state.token = token;
      state.userEmail = userEmail;
      state.nitR = nitR;
      state.userRoles = userRoles;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.userEmail = null;
      state.nitR = null;
      state.userRoles = [];
      clearInterval(state.sessionTimer);
      state.sessionTimer = null;
    },
    startSessionTimer(state) {
      state.sessionTimer = setInterval(() => {
        store.dispatch('logout');
      }, 60 * 60 * 1000);
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
      localStorage.setItem('tokenBoleta', payload.token);
      localStorage.setItem('userEmailBoleta', payload.userEmail);
      localStorage.setItem('nitR', payload.nitR);
      localStorage.setItem('userRolesBoleta', JSON.stringify(payload.userRoles));
      commit('setAuth', { isAuthenticated: true, token: payload.token, userEmail: payload.userEmail, nitR: payload.nitR, userRoles: payload.userRoles });
      commit('startSessionTimer');
    },
    logout({ commit }) {
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
        commit('setAuth', { isAuthenticated: true, token, userEmail, nitR, userRoles });
      }
    }
  },
});

export default store;
