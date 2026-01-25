<template>
    <div class="card shadow-sm p-4">
        <div class="alert alert-dark" v-if="noDenuncia">
            <strong>Expediente No. {{ noDenuncia }}</strong>
        </div>

        <div class="contenedor-dos-columnas">
            <!-- Columna izquierda -->
            <div class="columna izquierda">
                <ul class="nav nav-tabs mb-3" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" :class="{ active: tabSeleccionada2 === 'informacion' }"
                            @click="tabSeleccionada2 = 'informacion'">
                            Información de la Denuncia
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" :class="{ active: tabSeleccionada2 === 'provInicialPdf' }"
                            @click="tabSeleccionada2 = 'provInicialPdf'">
                            Documento Físico
                        </button>
                    </li>
                </ul>

                <div class="tab-content p-3 border rounded bg-light">
                    <div v-if="tabSeleccionada2 === 'informacion'">
                        <ComponenteIzquierdo :id="id" :soloLectura="true" />

                        <SelectClasificacion v-model="tipoDenunciaId" :disabled="tipoCalificacion !== 0" />

                        <div class="form-group mt-4" v-if="tipoDenunciaId.includes(15)">
                            <label for="otrosDetalle">Por favor, describa el tipo de denuncia</label>
                            <textarea id="otrosDetalle" class="form-control" v-model="otros" rows="2"
                                placeholder="Describa el tipo de la denuncia"
                                :readonly="soloLectura || tipoCalificacion !== 0">
              </textarea>
                        </div>
                    </div>

                    <div v-else-if="tabSeleccionada2 === 'provInicialPdf'">
                        <h4>Documento Físico</h4>
                        <div class="pdf-container">
                            <iframe v-if="documentoUrl" :src="documentoUrl" class="pdf-iframe" title="Informe PDF">
                            </iframe>
                            <p v-else class="text-center mt-4">Cargando PDF…</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /Columna izquierda -->

            <!-- Columna derecha -->
            <div class="columna derecha">
                <ul class="nav nav-tabs mb-3" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" :class="{ active: tabSeleccionada === 'provInicial' }"
                            @click="tabSeleccionada = 'provInicial'">
                            Documentos
                        </button>
                    </li>
                </ul>

                <div class="tab-content p-3 border rounded bg-light">
                    <div v-if="tabSeleccionada === 'provInicial'">

                        <TablaDocumentosExpediente ref="tablaDocs" :id="id" :actor="2" :navigateOnHistory="false"
                            @historial="onHistorial" />


                    </div>
                </div>
            </div>
            <!-- /Columna derecha -->
        </div>

        <router-link to="/mesaProcurador" class="btn btn-secondary mt-4">
            <i class="fas fa-arrow-left me-2"></i> Regresar a la Bandeja
        </router-link>
    </div>
</template>

<script>
import ComponenteIzquierdo from '@/components/Reutilizable/ComponenteIzquierdo.vue'
import TablaDocumentosExpediente from '@/components/Reutilizable/TablaDocumentosExpediente.vue'
import Swal from 'sweetalert2'
import Global from '@/Global'
import axios from 'axios'

export default {
    name: 'ExpedienteAsesor',
    components: { ComponenteIzquierdo, TablaDocumentosExpediente },
    props: { id: { type: String, required: true } },
    data() {
        return {
            tabSeleccionada: 'provInicial',
            tabSeleccionada2: 'informacion',
            tipoDenunciaId: [],
            tipoCalificacion: 0,
            noDenuncia: null,
            otros: '',
            soloLectura: false,
            documentoUrl: '',
            listaTiposDocumento: [],
            tipoDocumentoId: null,

            loading: false
        }
    },
    async mounted() {
        await this.mostrarClasificarDenuncia()
        await this.cargarTiposDocumento()
    },
    methods: {
        onHistorial(doc) {
            this.$router.push({ name: 'historial-documento', params: { idDocumento: doc.idDocumento } })
        },

        async cargarTiposDocumento() {
            try {
                const token = localStorage.getItem('token')
                const { data } = await axios.get(
                    `${Global.url}procuradorDenuncias/tiposDocumento`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                this.listaTiposDocumento = data.map(t => ({
                    value: Number(t.id),
                    label: t.nombre
                }))
            } catch (e) {
                console.error('Error cargando tipos de documento', e)
            }
        },

        async mostrarClasificarDenuncia() {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.post(
                    `${Global.url}procuradorDenuncias/validacion/${this.id}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                )

                if (response.data.documentoFisico) {
                    this.documentoUrl = 'data:application/pdf;base64,' + response.data.documentoFisico
                }

                if (Array.isArray(response.data.tipoCalificacion) && response.data.tipoCalificacion.length) {
                    this.tipoCalificacion = 1
                    // cast a números para que includes(15) funcione sólido
                    this.tipoDenunciaId = response.data.tipoCalificacion.map(n => Number(n))
                    this.noDenuncia = response.data.denu
                } else {
                    this.tipoCalificacion = 0
                    this.tipoDenunciaId = []
                }

                this.otros = response.data.otros ?? ''
            } catch (error) {
                const resp = error.response || {}
                const msg = resp.data || 'Ocurrió un error.'
                const title =
                    resp.status === 400 ? 'Acceso Denegado'
                        : resp.status === 404 ? 'No encontrado'
                            : 'Error'
                const icon = resp.status === 400 ? 'warning' : 'error'

                Swal.fire(title, msg, icon).then(() => {
                    if (resp.status === 400 || resp.status === 404) {
                        this.$router.push('/')
                    }
                })
            }
        }
    }
}
</script>

<style scoped>
.card {
    background-color: #fff;
    border-radius: 8px;
}

/* Contenedor de dos columnas */
.contenedor-dos-columnas {
    display: flex;
    gap: 1rem;
    height: 700px;
}

.columna.izquierda,
.columna.derecha {
    width: 50%;
    max-height: 800px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 0.5rem;
}

/* PDF */
.pdf-container {
    flex: 1;
    height: 700px;
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
}

/* Modal overrides */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: 0;
    overflow: hidden;
    z-index: 1050;
}

.modal .modal-dialog {
    position: relative;
    z-index: 1051;
    /* > 1040 (backdrop) */
}

.modal-backdrop {
    z-index: 1040 !important;
    pointer-events: none;
    /* deja pasar clicks al diálogo */
}

.modal.show {
    background: transparent !important;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    opacity: 0.5;
    z-index: 1040;
}
</style>
