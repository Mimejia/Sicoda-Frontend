<template>
    <div id="login">
        <section class="vh-100 vw-100" style="background: rgb(174,170,250);
background: linear-gradient(90deg, rgba(174,170,250,1) 0%, rgba(161,211,238,1) 52%, rgba(0,212,255,1) 100%);">
            <div class="container py-5 h-100">
                <div class="row d-flex justify-content-center align-items-center h-100">
                    <div class="col col-xl-10">
                        <div class="card" style="border-radius: 1rem;">
                            <div class="row g-0">
                                <div class="col-md-6 col-lg-5 d-none d-md-block">
                                    <img src="../assets/img/Logo_boleta.webp" alt="login form" class="img-fluid"
                                        style="border-radius: 1rem 0 0 1rem; width: 100%; height: 100%; " />
                                </div>
                                <div class="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div class="card-body p-4 p-lg-5 text-black">

                                        <form id="formLogin" v-on:submit.prevent="Login()">

                                            <div class="d-flex align-items-center mb-3 pb-1">
                                                <img style="width:60%"
                                                    src="../assets/img/marnLogo.jpg">
                                            </div>
                                            <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
                                            <div class="d-flex align-items-center mb-3 pb-1">
                                                <span class="h1 fw-bold mb-0">Iniciar Sesión</span>
                                            </div>

                                            <h5 class="fw-normal mb-3 pb-3" style="letter-spacing: 1px;">Inicia sesión
                                                con tu Cuenta</h5>

                                            <div class="form-outline mb-4">
                                                <input type="text" id="form2Example17"
                                                    class="form-control form-control-lg"
                                                    v-model="login.correoElectronico" required />
                                                <label class="form-label" for="form2Example17">Usuario</label>
                                            </div>

                                            <div class="form-outline mb-4">
                                                <input type="password" id="form2Example27"
                                                    class="form-control form-control-lg" required
                                                    v-model="login.passCorreo" />
                                                <label class="form-label" for="form2Example27">Contraseña</label>
                                            </div>

                                            <div class="pt-1 mb-4">
                                                <input type="submit" class="btn btn-dark btn-lg btn-block"
                                                    value="Ingresar">
                                            </div>

                                             <!-- <div class="pt-1 mb-4">
                                                <router-link to="/reIndividual" class="btn text-uppercase font-size-lg btn-secondary py-2 px-6">
                                                    Reporte Individual
                                                    <i class="fa-solid fa-file-pdf"></i>
                                                </router-link>
                                            </div> -->

                                            <a href="#!" class="small text-muted">Terminos de Uso de </a>
                                            <a href="#!" class="small text-muted">Politica de Privacidad.</a>
                                        </form>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
// Importaciones
import Global from '../Global';
import axios from 'axios';
import login from '@/models/login';

export default {
    name: 'LoginE',
    data() {
        return {
            url: Global.url,
            mistake: null,
            submitted: false,
            login: new login('', ''),
            submitted2: false,
            errorMessage: '',
            captura: ''
        }
    },
    mounted() {
    },
    methods: {
        Login() {

            // Hacer la solicitud HTTP al backend
            axios.post(this.url + 'Usuario/login', this.login)
                .then(response => {
                    // Llama a la acción Vuex para iniciar sesión
                    const token = response.data.token;
                    const roles = response.data.roles;
                    const email = response.data.name;
                    const nitE = response.data.nit;

                    console.log(nitE);
                    // Llama a la acción Vuex para iniciar sesión
                    this.$store.dispatch('login', {token, userEmail: email, nitR: nitE, userRoles: roles})
                        .then(() => {
                            // Aquí puedes guardar el token en Vuex o en el almacenamiento local
                            // console.log('Token de autenticación:', token + ' \n' + email);
                            // Redirige al usuario a la página principal
                            this.$router.push('/');
                        })
                        .catch(error => {
                            // Maneja errores de inicio de sesión
                            this.errorMessage = 'Error al iniciar sesión' + error;
                            // console.error('Error de inicio de sesión:', error);
                        });

                })
                .catch(error => {
                    // Manejar errores de autenticación
                    this.errorMessage = 'Nombre de usuario o contraseña incorrectos';
                    this.captura = error;
                });
        }
    },

}
</script>

<style></style>