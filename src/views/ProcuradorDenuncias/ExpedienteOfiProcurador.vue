<!-- src/views/ProcuradorDenuncias/ExpedienteOfiProcurador.vue -->
<template>
  <div class="card shadow-sm p-4">
    <div class="alert alert-dark" v-if="denuncia">
      <strong>NO-DENUNCIA: {{ denuncia.noDenuncia }}</strong>
      <!-- Estado oculto -->
    </div>

    <div class="contenedor-dos-columnas">
      <!-- Izquierda: info / pdf / informe -->
      <div class="columna izquierda">
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabSeleccionada === 'resumen' }"
                    @click="tabSeleccionada = 'resumen'">
              Información de la Denuncia
            </button>
          </li>
          <li v-if="tipoDenu !== 4">
            <button class="nav-link" :class="{ active: tabSeleccionada === 'fisico' }"
                    @click="tabSeleccionada = 'fisico'">
              Documento Físico
            </button>
          </li>
          <li v-if="informeUrl">
            <button class="nav-link" :class="{ active: tabSeleccionada === 'informe' }"
                    @click="tabSeleccionada = 'informe'">
              Informe
            </button>
          </li>
          <li v-if="denuncia">
            <button class="nav-link" :class="{ active: tabSeleccionada === 'historial' }"
                    @click="tabSeleccionada = 'historial'">
              Historial Archivos
            </button>
          </li>
        </ul>

        <div class="tab-content p-3 border rounded bg-light">
          <div v-if="tabSeleccionada === 'resumen'">
            <ComponenteIzquierdo :id="id" :soloLectura="true" />
          </div>

          <div v-if="tabSeleccionada === 'fisico'">
            <div class="pdf-container">
              <PdfVisualizer :base64="documentoFisico" />
            </div>
          </div>

            <div v-if="tabSeleccionada === 'informe'">
              <div class="pdf-container">
                <iframe v-if="informeUrl" :src="informeUrl" class="pdf-iframe"></iframe>
                <p v-else class="text-center mt-4">Sin informe disponible.</p>
              </div>
              <div class="mt-2 text-end">
                <a v-if="informeUrl" :href="informeUrl" target="_blank" rel="noopener"
                   class="btn btn-outline-primary btn-sm">
                  <i class="fas fa-up-right-from-square me-1"></i> Abrir
                </a>
              </div>
            </div>

            <div v-if="tabSeleccionada === 'historial'">
                 <HistorialArchivosExpediente :noDenuncia="denuncia?.noDenuncia" />
            </div>
        </div>
      </div>

      <!-- Derecha: Documentos / Anexión -->
      <div class="columna derecha">
        <!-- Documentos solo lectura si estado 8 -->
        <div v-if="idEstatus === 8" class="mb-4">
          <h5 class="mb-3">Documentos del Expediente</h5>
          <TablaDocumentosExpediente
            ref="tablaDocs"
            :id="id"
            :actor="4"
            :noDenuncia="denuncia?.noDenuncia"
            @docs-change="onDocsChange"
          />
          <p class="small text-muted mt-2">
            Vista solo lectura. Puede descargar, ver historial y documento firmado.
          </p>
        </div>

        <!-- Panel Anexión si estado 11 -->
        <div v-if="idEstatus === 11" class="panel-anexion border rounded bg-white shadow-sm">
          <div class="panel-header px-3 py-2 border-bottom d-flex align-items-center gap-2">
            <i class="fas fa-link text-primary"></i>
            <strong>Anexión de Expediente</strong>
          </div>
          <div class="p-3">
            <!-- Selector de modo -->
            <div class="btn-group mb-3" role="group">
              <button type="button" class="btn"
                      :class="modo === 'anexar' ? 'btn-success' : 'btn-outline-success'"
                      @click="setModo('anexar')">
                <i class="fas fa-check me-1"></i> Anexar
              </button>
              <button type="button" class="btn"
                      :class="modo === 'denegar' ? 'btn-danger' : 'btn-outline-danger'"
                      @click="setModo('denegar')">
                <i class="fas fa-ban me-1"></i> Denegar Anexión
              </button>
            </div>

            <!-- Anexar: selector destino -->
            <div v-if="modo === 'anexar'">
              <!-- Tipo de destino -->
              <label class="form-label fw-semibold mb-1 d-block">Denuncia destino</label>
              <div class="btn-group mb-2" role="group" aria-label="Tipo de destino">
                <button type="button"
                        class="btn"
                        :class="destinoRegistrada ? 'btn-primary' : 'btn-outline-primary'"
                        @click="destinoRegistrada = true">
                  <i class="fas fa-database me-1"></i> Registrada
                </button>
                <button type="button"
                        class="btn"
                        :class="!destinoRegistrada ? 'btn-primary' : 'btn-outline-primary'"
                        @click="destinoRegistrada = false">
                  <i class="fas fa-pen-to-square me-1"></i> No registrada
                </button>
              </div>

              <!-- Registrada: listado existente -->
              <template v-if="destinoRegistrada">
                <label class="form-label fw-semibold mb-1">Seleccione una denuncia (estado 8)</label>
                 <v-select
                   :options="opciones"
                   :reduce="o => o.id"
                   label="label"
                   v-model="idDestino"
                   :class="{'is-invalid': validar && !idDestino}"
                   placeholder="Escriba para buscar..."
                   @search="onSearch" />
                 <div v-if="validar && !idDestino" class="invalid-feedback d-block">
                   Selección obligatoria.
                 </div>
              </template>

              <!-- No registrada: campo manual -->
              <template v-else>
                <label class="form-label fw-semibold mb-1">Número de denuncia destino (manual)</label>
                <input type="text"
                       class="form-control"
                       :class="{'is-invalid': validar && !noManualValido}"
                       maxlength="400"
                       v-model="numeroDenunciaManual"
                       placeholder="Ej. D-E-0123-2025 (máximo 400 caracteres)" />
                <div class="form-text">Si no existe en el sistema, escriba el número tal como aparece en el documento.</div>
                <div v-if="validar && !noManualValido" class="invalid-feedback d-block">
                  Ingrese el número de denuncia (máximo 400 caracteres).
                </div>
              </template>
 
               <div class="text-end mt-3">
                 <button class="btn btn-success"
                        :disabled="enviando || !puedeConfirmarAnexar"
                         @click="anexarExpediente">
                   <i v-if="enviando && accion==='anexar'" class="fas fa-spinner fa-spin me-1"></i>
                   <i v-else class="fas fa-check me-1"></i> Confirmar Anexión
                 </button>
               </div>
             </div>

            <!-- Denegar: motivo -->
            <div v-if="modo === 'denegar'">
              <label class="form-label fw-semibold mb-1">Motivo de no anexión</label>
              <textarea
                v-model="motivoDenegar"
                :class="['form-control', {'is-invalid': validarDenegar && !motivoValido}]"
                rows="4"
                maxlength="1000"
                placeholder="Explique la razón (mín. 10, máx. 1000 caracteres)"></textarea>
              <div v-if="validarDenegar && !motivoValido" class="invalid-feedback d-block">
                El motivo es obligatorio (10–1000 caracteres).
              </div>
              <div class="text-end mt-3">
                <button class="btn btn-danger"
                        :disabled="enviando || !motivoValido"
                        @click="denegarAnexion">
                  <i v-if="enviando && accion==='denegar'" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-ban me-1"></i> Denegar y Regresar
                </button>
              </div>
            </div>

            <div v-if="!modo" class="text-muted small">
              Seleccione una acción para continuar.
            </div>

            <!-- NUEVO: Historial de Anexaciones (debajo de los botones) -->
            <hr class="my-4" />
            <h6 class="mb-2 d-flex align-items-center gap-2">
              <i class="fas fa-clock-rotate-left text-secondary"></i>
              Historial de anexaciones
              <span v-if="historialAnex.length" class="text-muted ms-1">({{ historialAnex.length }})</span>
            </h6>

            <div v-if="historialAnexLoading" class="text-muted small">
              <i class="fas fa-spinner fa-spin"></i> Cargando historial…
            </div>
            <div v-else>
              <div v-if="!historialAnex.length" class="small text-muted">
                Sin registros de anexación.
              </div>
              <ul v-else class="list-group">
                <li v-for="h in historialAnex" :key="h.id"
                    class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="me-3">
                    <div class="fw-semibold">{{ h.titulo }}</div>
                    <div class="text-muted small" v-if="h.detalle">{{ h.detalle }}</div>
                    <div class="text-muted small">Por: {{ h.usuario || '—' }}</div>
                  </div>
                  <small class="text-nowrap text-muted">{{ formatFecha(h.fecha) }}</small>
                </li>
              </ul>
              <div v-if="historialAnexError" class="alert alert-warning mt-2 py-2 px-3 small">
                {{ historialAnexError }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <router-link to="/procuracion" class="btn btn-secondary mt-3">
      <i class="fas fa-arrow-left me-2"></i> Regresar a la Bandeja
    </router-link>
  </div>
</template>

<script>
import axios from 'axios'
import Global from '@/Global'
import Swal from 'sweetalert2'
import ComponenteIzquierdo from '@/components/Reutilizable/ComponenteIzquierdo.vue'
import TablaDocumentosExpediente from '@/components/Reutilizable/TablaDocumentosExpediente.vue'
import PdfVisualizer from '@/components/Reutilizable/PdfVisualizer.vue'
import HistorialArchivosExpediente from '@/components/Reutilizable/HistorialArchivosExpediente.vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'ExpedienteOfiProcurador',
  components: { ComponenteIzquierdo, TablaDocumentosExpediente, vSelect, PdfVisualizer, HistorialArchivosExpediente },
  props: { id: { type: String, required: true } },
  data() {
    return {
      denuncia: null,
      tipoDenu: null,
      documentoUrl: '',
      documentoFisico: '',
      informeUrl: '',
      tabSeleccionada: 'resumen',
      idEstatus: null,
      // Anexión
      modo: '', // 'anexar' | 'denegar'
      opciones: [],
      idDestino: null,
      buscarTexto: '',
      enviando: false,
      validar: false,
      motivoDenegar: '',
      validarDenegar: false,
      accion: '',
      destinoRegistrada: true,
      numeroDenunciaManual: '',
      // Historial de anexaciones
      historialAnex: [],
      historialAnexLoading: false,
      historialAnexError: '',
      // Control de desmontaje
      isUnmounted: false
    }
  },
  computed: {
    motivoValido() {
      const m = (this.motivoDenegar || '').trim()
      return m.length >= 10 && m.length <= 1000
    },
    noManualValido() {
      const v = (this.numeroDenunciaManual || '').trim()
      return v.length > 0 && v.length <= 400
    },
    puedeConfirmarAnexar() {
      return this.destinoRegistrada ? !!this.idDestino : this.noManualValido
    }
  },
  watch: {
    destinoRegistrada(nv) {
      // limpiar y preparar según opción
      this.validar = false
      if (nv) {
        this.numeroDenunciaManual = ''
        if (!this.opciones.length) this.cargarOpciones()
      } else {
        this.idDestino = null
      }
    }
  },
  async mounted() {
    try {
      const token = localStorage.getItem('token')
      const usuario = this.$store.state.userEmail
      const { data } = await axios.post(
        `${Global.url}Procurador/expediente/${this.id}`,
        { usuarioIngreso: usuario },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      this.denuncia = data
      this.tipoDenu = Number(data.tipoDenu)

      if (data.documentoFisico) {
        this.documentoFisico = data.documentoFisico
      }
      
      this.idEstatus = Number(data.idEstatus)
      if (this.tipoDenu !== 4 && data.documentoFisico) {
        this.documentoUrl = 'data:application/pdf;base64,' + data.documentoFisico
      }
      if (data.pathInforme) {
        const origin = (() => { try { return new URL(Global.url, window.location.origin).origin } catch { return '' } })()
        const rel = ('' + data.pathInforme).startsWith('/') ? ('' + data.pathInforme) : '/' + data.pathInforme
        this.informeUrl = origin + rel
      }
    } catch (error) {
      const resp = error.response
      if (resp?.status === 400) {
        await Swal.fire('Acceso Denegado', resp.data, 'warning')
        this.$router.push('/')
      } else if (resp?.status === 404) {
        await Swal.fire('No Encontrado', resp.data, 'error')
        this.$router.push('/')
      } else {
        Swal.fire('Error', 'Error al cargar expediente.', 'error')
      }
    } finally {
      if (!this.isUnmounted && !this.navegando) this.cargarHistorialAnexaciones()
    }
  },
  beforeUnmount() {
    this.isUnmounted = true
  },
  methods: {
    onDocsChange() {},
    setModo(m) {
      this.modo = m
      if (m === 'anexar' && !this.opciones.length) this.cargarOpciones()
    },
    async cargarOpciones() {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const params = this.buscarTexto ? { q: this.buscarTexto } : {}
        const { data } = await axios.get(`${Global.url}Procurador/denuncias-anexables`, { headers, params })
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        if (this.isUnmounted || this.navegando) return
        this.opciones = arr.map(d => ({
          id: d.idSicoda ?? d.id ?? d.ID_SICODA,
          label: d.noDenuncia ?? d.NO_DENUNCIA
        })).filter(o => o.id && o.label)
      } catch {
        if (this.isUnmounted || this.navegando) return
        this.opciones = []
      }
    },
    onSearch(txt) {
      this.buscarTexto = txt
      this.cargarOpciones()
    },
    async anexarExpediente() {
      this.validar = true
      if (this.destinoRegistrada && !this.idDestino) return
      if (!this.destinoRegistrada && !this.noManualValido) return
       this.enviando = true
       this.accion = 'anexar'
       try {
         const token = localStorage.getItem('token')
         const headers = token ? { Authorization: `Bearer ${token}` } : {}
         // Envío según tipo de destino
         const body = this.destinoRegistrada
           ? {
               idOrigen: Number(this.id),
               registrada: true,
               idDestino: Number(this.idDestino),
               usuario: this.$store?.state?.userEmail || ''
             }
           : {
               idOrigen: Number(this.id),
               registrada: false,
               noDenunciaDestino: (this.numeroDenunciaManual || '').trim(),
               usuario: this.$store?.state?.userEmail || ''
             }
         await axios.post(`${Global.url}Procurador/anexar`, body, { headers })
         await Swal.fire('Éxito', 'Expediente anexado correctamente.', 'success')
         this.$router.push('/procuracion')
         return
       } catch (e) {
         if (!this.isUnmounted) Swal.fire('Error', e?.response?.data || 'No fue posible anexar.', 'error')
       } finally {
         if (!this.isUnmounted) { this.enviando = false; this.accion = '' }
       }
    },
    async denegarAnexion() {
      this.validarDenegar = true
      if (!this.motivoValido) return
      this.enviando = true
      this.accion = 'denegar'
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const body = {
          idOrigen: Number(this.id),
          usuario: this.$store?.state?.userEmail || '',
          motivo: (this.motivoDenegar || '').trim()
        }
        await axios.post(`${Global.url}Procurador/denegar-anexion`, body, { headers })
        await Swal.fire('Proceso', 'Anexión denegada.', 'success')
        this.$router.push('/procuracion')
        return
      } catch (e) {
         if (!this.isUnmounted) Swal.fire('Error', e?.response?.data || 'No fue posible denegar.', 'error')
      } finally {
        if (!this.isUnmounted) { this.enviando = false; this.accion = '' }
      }
    },
    async cargarHistorialAnexaciones() {
      this.historialAnexLoading = true
      this.historialAnexError = ''
      this.historialAnex = []
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        // Endpoint propuesto:
        // GET Procurador/anexaciones/historial?idSicoda={id}
        const { data } = await axios.get(`${Global.url}Procurador/anexaciones/historial`, {
          headers,
          params: { idSicoda: Number(this.id) }
        })
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        if (this.isUnmounted || this.navegando) return
        this.historialAnex = arr.map((x, idx) => {
          const id = x.id ?? x.ID ?? idx
          const fecha = x.fecha ?? x.FECHA ?? x.fechaIngresa ?? x.FECHA_INGRESA ?? null
          const usuario = x.usuario ?? x.USUARIO ?? x.usuarioIngresa ?? x.USUARIO_INGRESA ?? ''
          const tipo = (x.tipo ?? x.TIPO ?? x.accion ?? x.ACCION ?? '').toString().toUpperCase()
          const noDestino = x.noDenunciaDestino ?? x.NO_DENUNCIA_DESTINO ?? x.noDestino
          const noOrigen = x.noDenunciaOrigen ?? x.NO_DENUNCIA_ORIGEN ?? x.noOrigen
          const titulo =
            tipo === 'ANEXAR'
              ? `Anexado a ${noDestino || 'expediente destino'}`
              : tipo === 'DENEGAR'
                ? 'Denegación de anexión'
                : (x.titulo ?? x.TITULO ?? 'Movimiento de anexión')
          const detalle =
            x.detalle ?? x.DETALLE ??
            x.motivo ?? x.MOTIVO ??
            (tipo === 'ANEXAR' && noOrigen ? `Desde ${noOrigen}` : '')
          return { id, fecha, usuario, titulo, detalle }
        })
      } catch (e) {
        if (!this.navegando) this.historialAnexError = e?.response?.data?.mensaje || 'No fue posible cargar el historial.'
      } finally {
        if (!this.navegando) this.historialAnexLoading = false
      }
    },
    formatFecha(val) {
      if (!val) return ''
      try {
        const d = new Date(val)
        return d.toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
      } catch { return String(val) }
    }
  }
}
</script>

<style scoped>
.card { background:#fff; border-radius:8px; }
.overlay-bloqueo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}
.contenedor-dos-columnas { display:flex; height:700px; gap:1rem; }
.columna.izquierda, .columna.derecha {
  width:50%; max-height:800px; overflow-y:auto; border:1px solid #ddd; padding:.5rem;
}
.columna.izquierda { display:flex; flex-direction:column; }
.tab-content { flex:1; display:flex; flex-direction:column; padding:1rem; }
.pdf-container { height:700px; }
.pdf-iframe { width:100%; height:100%; border:none; }
.panel-anexion .panel-header { background:#f8f9fb; }
.v-select.is-invalid .vs__dropdown-toggle { border-color:#dc3545; }
.v-select.is-invalid .vs__dropdown-toggle:focus { box-shadow:0 0 0 .2rem rgba(220,53,69,.15); }
</style>
