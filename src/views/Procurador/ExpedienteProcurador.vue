<template>
  <div class="card shadow-sm p-4">
    <div class="alert alert-dark" v-if="noDenuncia">
      <strong>Expediente No. {{ noDenuncia }}</strong>
    </div>

    <div class="contenedor-dos-columnas">
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
          <li class="nav-item" role="presentation">
            <button class="nav-link" :class="{ active: tabSeleccionada2 === 'historialArchivos' }"
              @click="abrirHistorialArchivos">
              Historial de Archivos
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
                placeholder="Describa el tipo de la denuncia" :readonly="soloLectura || tipoCalificacion !== 0">
              </textarea>
            </div>
          </div>

          <div v-else-if="tabSeleccionada2 === 'provInicialPdf'">
            <h4>Documento Físico</h4>
            <div class="pdf-container">
              <PdfVisualizer :base64="documentoFisico" />
            </div>
          </div>

          <!-- Historial de Archivos -->
          <div v-else-if="tabSeleccionada2 === 'historialArchivos'">
             <HistorialArchivosExpediente :noDenuncia="noDenuncia || noDenunciaLabel" />
          </div>
          <!-- /Historial de Archivos -->
        </div>
      </div>

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
            <button v-if="!hasBloqueoTipo" class="btn btn-primary mb-3" @click="mostrarModal = true">
              <i class="fas fa-file-alt me-2"></i> Generación de Documentos
            </button>

            <TablaDocumentosExpediente ref="tablaDocs" :id="id" :actor="1" :noDenuncia="noDenuncia || noDenunciaLabel"
              @docs-change="onDocsChange" @has-tipo2o3="onHasTipo2o3" />

            <!-- Modal -->
            <div class="modal fade" :class="{ show: mostrarModal }" tabindex="-1" role="dialog" aria-modal="true"
              :style="mostrarModal ? 'display: block;' : 'display: none;'">
              <div class="modal-dialog modal-dialog-centered" style="max-width: 850px; height: 80vh;">
                <div class="modal-content rounded">
                  <!-- Cabecera -->
                  <div class="modal-header pb-0 border-0 justify-content-end">
                    <button type="button" class="btn btn-sm btn-icon btn-active-color-primary" @click="cerrarModal">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <!-- Cuerpo -->
                  <div class="modal-body scroll-y px-10 px-lg-15 pt-0 pb-15">
                    <h3 class="fw-bold mb-10 text-gray-900">Generación de Documentos</h3>
                    <div class="fv-row mb-8" v-if="!hasBloqueoTipo">
                      <label class="form-label">Tipo de Documento</label>
                      <v-select class="form-control" v-model="tipoDocumentoId" :options="listaTiposDocumento"
                        label="label" :filterable="true" placeholder="Seleccione o escriba un valor"
                        :reduce="o => o.value" />
                    </div>
                    <div v-else class="alert alert-info">
                      Ya existe un documento de tipo 2 o 3. No se pueden generar más documentos.
                    </div>
                  </div>
                  <!-- Pie -->
                  <div class="modal-footer flex-center">
                    <button type="button" class="btn btn-light me-3" @click="cerrarModal">
                      Cerrar
                    </button>
                    <button type="button" class="btn btn-primary" @click="handleGenerar"
                      :disabled="!tipoDocumentoId || loading || hasBloqueoTipo">
                      <span v-if="loading">Procesando…</span>
                      <span v-else>Generar</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="modal-backdrop fade show"></div>
            </div>
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
import PdfVisualizer from '@/components/Reutilizable/PdfVisualizer.vue'
import HistorialArchivosExpediente from '@/components/Reutilizable/HistorialArchivosExpediente.vue'
import Swal from 'sweetalert2'
import Global from '@/Global'
import axios from 'axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'ExpedienteProcurador',
  components: { ComponenteIzquierdo, vSelect, TablaDocumentosExpediente, PdfVisualizer, HistorialArchivosExpediente },
  props: { id: { type: [String, Number], required: true } },
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
      documentoFisico: '',
      listaTiposDocumento: [],
      tipoDocumentoId: null,
      mostrarModal: false,
      loading: false,
      docsListado: [],
      hasBloqueoTipo: false,
      expediente: null,
    }
  },
  computed: {


    noDenunciaLabel() {
      const e = this.expediente || {}
      return (
        e.noDenuncia || e.nodenuncia || e.NoDenuncia || e.no_denuncia ||
        e.numeroDenuncia || e.numero_denuncia || e.noExpediente || e.NoExpediente || ''
      )
    }
  },
  watch: {
    // Cierra el modal si el backend indica bloqueo
    hasBloqueoTipo(val) {
      if (val && this.mostrarModal) this.cerrarModal()
    }
  },
  async mounted() {
    await this.mostrarClasificarDenuncia()
    await this.cargarTiposDocumento()
  },
  methods: {
    onHasTipo2o3(val) {
      this.hasBloqueoTipo = val
    },
    onDocsChange(docs) {
      this.docsListado = docs
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
    cerrarModal() {
      this.mostrarModal = false
      this.tipoDocumentoId = null
    },
    abrirHistorialArchivos() {
      this.tabSeleccionada2 = 'historialArchivos'
    },
    async handleGenerar() {
      if (!this.tipoDocumentoId) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const usuario = this.$store.state.userEmail
        await axios.post(`${Global.url}procuradorDenuncias/generarDocumento`, {
           idSicoda: this.id,
           idTipoDocumento: this.tipoDocumentoId,
           usuario: usuario
        }, { headers: { Authorization: `Bearer ${token}` } })

        // 3) Cerrar modal y notificar
        this.mostrarModal = false
        this.tipoDocumentoId = null
        Swal.fire('Listo', 'El documento se descargó correctamente.', 'success')
        this.$refs.tablaDocs && this.$refs.tablaDocs.cargar()
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
          return
        }
        Swal.fire('Error', 'No se pudo generar el documento.', 'error')
      } finally {
        this.loading = false
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
          this.documentoFisico = response.data.documentoFisico
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
