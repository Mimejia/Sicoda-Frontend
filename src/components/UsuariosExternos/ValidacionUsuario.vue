<template>
    <div class="bg-light py-10">
        <div class="container">
            <div class="card card-custom">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 class="card-title text-white">ESTADO DE MI DENUNCIA</h3>
                    <!-- <img src="/sicoda/img/marn.png" alt="Logo" style="height: 60px;"> -->
                </div>

                <div class="card-body">
                    <!-- Número de Denuncia -->
                    <div class="form-group row">
                        <div class="col-8">
                            <label class="font-weight-bold">NÚMERO DE DENUNCIA</label>
                            <input v-model="noDenuncia" type="text" class="form-control"
                                placeholder="Ingrese un Número de Denuncia" />
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button class="btn btn-primary w-100" @click="consultarDenuncia">
                                Consultar Denuncia
                            </button>
                        </div>
                    </div>

                    <!-- Mensaje especial para estado 4 -->
                    <div v-if="estadoActual === 4" class="form-group mt-4">
                        <div class="alert alert-warning d-flex align-items-center">

                            <div style="text-align: center;">
                                <i class="fa fa-info-circle me-2"></i>
                                <strong>Nota:</strong> Su denuncia requiere información adicional.
                                Por favor, proporcione más detalles con el objetivo de ampliar el expediente y mejorar
                                el proceso de atención.
                            </div>
                        </div>
                        <div class="form-group row">
                            <div class="col-12">
                                <label for="direccion">Motivo de la ampliación.</label>
                                <textarea class="form-control" id="direccion" v-model="anotaciones" rows="2"
                                    placeholder="Ingrese su dirección" :readonly="soloLectura"></textarea>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-warning" @click="irAExpediente(idSicoda)">
                            realizar ampliación
                        </button>
                    </div>

                    <!-- Primera fila: Traslado (solo si estado !== 3) -->
                    <div v-if="estadoActual !== 3" class="form-group row">
                        <div class="col-md-9"></div>
                        <div class="col-md-2 text-center">
                            <div :class="['step-circle', getClase(6)]">
                                <i class="fa fa-briefcase"></i>
                            </div>
                            <div class="font-weight-bold mt-2">Se crea expediente</div>
                            <div class="small">Inicia proceso administrativo en contra del responsable de la actividad
                                denunciada.</div>
                        </div>
                    </div>


                    <!-- Segunda fila: pasos dinámicos -->
                    <div class="form-group row">
                        <div class="col-1"></div>

                        <!-- Si el estado es 3, mostrar solo 3 pasos -->
                        <template v-if="estadoActual === 3">
                            <div class="col-2 text-center">
                                <div :class="['step-circle', getClase(1)]">
                                    <i class="fa fa-envelope"></i>
                                </div>
                                <div class="font-weight-bold mt-2">Denuncia ingresada</div>
                                <div class="small">Se asigna número de registro.</div>
                            </div>

                            <div class="col-2 text-center">
                                <div :class="['step-circle', getClase(2)]">
                                    <i class="fa fa-search"></i>
                                </div>
                                <div class="font-weight-bold mt-2">Fase de Análisis</div>
                                <div class="small">Evaluación de la información preliminar.</div>
                            </div>

                            <div class="col-2 text-center">
                                <div class="step-circle bg-danger">
                                    <i class="fa fa-times-circle"></i>
                                </div>
                                <div class="font-weight-bold mt-2">Denegación</div>
                                <div class="small">{{ descripcionDenegacion }}</div>
                            </div>
                        </template>

                        <!-- Si no, mostrar los pasos normales -->
                        <template v-else>
                            <div v-for="(paso, index) in pasosPrincipales" :key="index" class="col-2 text-center">
                                <div :class="['step-circle', getClase(index + 1)]">
                                    <i :class="paso.icono"></i>
                                </div>
                                <div class="font-weight-bold mt-2">{{ paso.nombre }}</div>
                                <div class="small">{{ paso.descripcion }}</div>
                            </div>
                        </template>
                    </div>

                    <!-- Tercera fila: Archivo (solo si estado !== 3) -->
                    <div v-if="estadoActual !== 3" class="form-group row">
                        <div class="col-md-9"></div>
                        <div class="col-md-2 text-center">
                            <div :class="['step-circle', getClase(7)]">
                                <i class="fa fa-archive"></i>
                            </div>
                            <div class="font-weight-bold mt-2">Archivo</div>
                            <div class="small"></div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';

export default {
    name: 'EstadoDenuncia',
    data() {
        return {
            noDenuncia: '',
            estadoActual: 0,
            descripcionDenegacion: '', // Descripción dinámica de denegación
            idSicoda: 0,
            anotaciones: '',
            soloLectura: true,
            pasosPrincipales: [
                { nombre: 'Denuncia ingresada', icono: 'fa fa-envelope', descripcion: 'Se asigna número de registro.' },
                { nombre: 'Fase de Análisis', icono: 'fa fa-search', descripcion: '' },
                { nombre: 'Recabando información', icono: 'fa fa-search-plus', descripcion: '' },
                { nombre: 'Verificación', icono: 'fa fa-check-circle', descripcion: 'Análisis para decidir si se archivará o creará expediente' }
            ]
        };
    },
    methods: {
        async consultarDenuncia() {
            if (!this.noDenuncia.trim()) {
                this.$swal('Error', 'Debe ingresar un número de denuncia.', 'error');
                return;
            }
            try {
                const response = await axios.get(`${Global.url}denuncias/estado/${this.noDenuncia}`);
                this.estadoActual = parseInt(response.data.estado);
                if (this.estadoActual === 3) {
                    console.log(response.data);
                    this.descripcionDenegacion = response.data.motivoDengacion || 'La denuncia fue denegada por motivos administrativos.';
                } else {
                    this.descripcionDenegacion = '';
                    this.idSicoda = response.data.idsicoda;
                    this.anotaciones = response.data.anotacionesD;
                    console.log(response.data);
                }
            } catch (error) {
                this.estadoActual = 0;
                this.descripcionDenegacion = '';
                this.$swal('Error', error.response?.data?.mensaje || 'No se encontró la denuncia.', 'error');
            }
        },
        getClase(paso) {
            if ([1, 2, 5, 4].includes(this.estadoActual)) {
                if (paso < 2) return 'bg-primary';
                if (paso === 2) return 'bg-success';
                return 'bg-secondary';
            }
            if (this.estadoActual === paso) return 'bg-success';
            if (this.estadoActual > paso) return 'bg-primary';
            return 'bg-secondary';
        },
        irAExpediente(noDenuncia) {
            this.$router.push({ name: 'SubsanarRequisitos', params: { id: noDenuncia } });
        }
    }


};
</script>

<style scoped>
.step-circle {
    width: 70px;
    height: 70px;
    background: #e4e6ef;
    color: #7e8299;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin: 0 auto;
    /* CENTRAR el círculo */
}

.text-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    /* Esto asegura que texto y círculo estén alineados */
}

.font-weight-bold {
    margin-top: 10px;
    /* Espacio consistente entre icono y texto */
}

.small {
    margin-top: 5px;
    /* Espacio pequeño para subtítulo */
}

.bg-primary {
    background-color: #0BB783 !important;
    color: #fff !important;
}

.bg-success {
    background-color: #1BC5BD !important;
    color: #fff !important;
}

.bg-secondary {
    background-color: #e4e6ef !important;
    color: #7e8299 !important;
}

.bg-danger {
    background-color: #F64E60 !important;
    color: #fff !important;
}
</style>