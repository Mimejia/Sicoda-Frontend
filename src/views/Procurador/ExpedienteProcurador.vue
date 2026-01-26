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
            <div class="hist-layout">
              <div class="hist-tree">
                <div class="hist-header d-flex align-items-center justify-content-between">
                  <div class="fw-bold">Historial de Archivos</div>

                  <div class="btn-group btn-group-sm" role="group" aria-label="Agrupar por">
                    <button class="btn btn-outline-secondary" :class="{active: histGroupMode==='tipo'}"
                            @click="histGroupMode='tipo'">
                      <i class="fas fa-folder me-1"></i> Tipo
                    </button>
                    <button class="btn btn-outline-secondary" :class="{active: histGroupMode==='fecha'}"
                            @click="histGroupMode='fecha'">
                      <i class="fas fa-calendar-day me-1"></i> Fecha
                    </button>
                  </div>

                  <button class="btn btn-sm btn-light hist-reload"
                          @click="cargarHistorialArchivos"
                          :disabled="histLoading">
                    <i class="fas fa-rotate-right me-1"></i> Recargar
                  </button>
                </div>

                <div v-if="histLoading" class="hist-overlay" aria-busy="true" aria-live="polite">
                  <i class="fas fa-spinner fa-spin"></i>
                </div>

                <div v-else-if="histError" class="alert alert-warning py-2 px-3 small mt-2">
                  {{ histError }}
                </div>

                <div v-else>
                  <div v-if="!flatDocs.length" class="text-muted small py-3 text-center">
                    Sin archivos para esta denuncia.
                  </div>

                  <div v-else>
                    <div v-for="g in groupedDocs" :key="g.key" class="hist-group">
                      <button class="hist-group__btn d-flex align-items-center w-100" @click="toggleGrupo(g.key)">
                        <i class="fas me-2" :class="expandedTipoId === g.key ? 'fa-folder-open' : 'fa-folder'"></i>
                        <span class="hist-group__title flex-grow-1">{{ g.title }}</span>
                        <span class="hist-count">{{ g.items.length }}</span>
                      </button>

                      <transition name="fade">
                        <ul v-if="expandedTipoId === g.key" class="hist-list">
                          <li v-for="d in g.items" :key="(d.idDireccion ?? d.idDocumento) + '-' + (d.nombre || '')" class="hist-item">
                            <div class="hist-item__meta">
                              <i class="fas fa-file text-muted me-2"></i>
                              <div class="hist-item__text">
                                <div class="fw-semibold text-truncate">
                                  {{ d.nombre || 'Documento' }}
                                  <span v-if="g.title === 'Direcciones' && d.detalle" class="text-muted fw-normal"> · {{ d.detalle }}</span>
                                </div>
                                <div class="text-muted small">
                                  {{ formatFecha(d.fecha) }} · {{ d.usuario || '—' }}
                                </div>
                              </div>
                            </div>
                            <div class="hist-item__actions">
                              <button class="btn btn-sm btn-outline-primary"
                                      @click="onVerDocumento(d)">
                                <i class="fas fa-eye me-1"></i> Ver
                              </button>
                            </div>
                          </li>
                        </ul>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Visor -->
              <div class="hist-viewer mt-3">
                <div class="viewer-header fw-bold">
                  <i class="fas fa-eye me-2"></i>{{ viewerName || 'Vista previa' }}
                </div>
                <div v-if="viewerLoading" class="text-center text-muted py-5">
                  <i class="fas fa-spinner fa-spin me-2"></i> Cargando documento…
                </div>
                <div v-else-if="viewerError" class="alert alert-danger mt-3">
                  {{ viewerError }}
                </div>
                <div v-else class="viewer-body">
                  <template v-if="viewerUrl">
                    <iframe class="viewer-iframe" :src="viewerUrl" title="Visor"></iframe>
                  </template>
                  <div v-else class="text-muted small p-3">
                    Seleccione un documento en el panel izquierdo para visualizarlo aquí.
                  </div>
                </div>
              </div>
            </div>
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
import Swal from 'sweetalert2'
import Global from '@/Global'
import axios from 'axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'ExpedienteAsesor',
  components: { ComponenteIzquierdo, vSelect, TablaDocumentosExpediente, PdfVisualizer },
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
      // Historial archivos
      histLoading: false,
      histTipos: [],
      histError: '',
      expandedTipoId: null,
      histGroupMode: 'fecha', // default ahora a 'fecha'
      // Visor
      viewerLoading: false,
      viewerUrl: '',
      viewerName: '',
      viewerError: ''
    }
  },
  computed: {
    // Flatten: documentos con metadatos comunes para agrupar fácilmente
    flatDocs() {
      const arr = []
      for (const g of this.histTipos) {
        const tipoId = Number(g.idTipo)
        const tipoNombre = g.nombreTipo
        for (const d of (g.documentos || [])) {
          const fecha = d.fecha ? new Date(d.fecha) : null
          arr.push({
            grupo: tipoNombre === 'Direcciones' ? 'Direcciones' : 'Tipo',
            tipoId,
            tipoNombre,
            idDocumento: d.idDocumento,
            idDireccion: d.idDireccion,        // solo presente en “Direcciones”
            nombre: d.nombre,
            detalle: d.detalle,                // DireccionFisica opcional
            fecha,
            usuario: d.usuario,
            hasBase64: !!d.hasBase64,
            mime: d.mime || ''
          })
        }
      }
      return arr
    },
    groupedDocs() {
      const mode = this.histGroupMode
      const docs = [...this.flatDocs]
      const groups = []

      if (mode === 'tipo') {
        // Carpeta “Direcciones” como grupo independiente si existe
        const dirs = docs.filter(d => d.grupo === 'Direcciones')
        if (dirs.length) {
          dirs.sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0))
          groups.push({ key: 'direcciones', title: 'Direcciones', items: dirs })
        }
        // Grupos por tipo (TM firmados)
        const byTipo = new Map()
        for (const d of docs.filter(d => d.grupo !== 'Direcciones')) {
          const key = `tipo-${d.tipoId}`
          if (!byTipo.has(key)) byTipo.set(key, { key, title: d.tipoNombre || 'Documento', items: [] })
          byTipo.get(key).items.push(d)
        }
        for (const g of byTipo.values()) {
          g.items.sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0))
          groups.push(g)
        }
        groups.sort((a, b) => a.title.localeCompare(b.title))
      } else if (mode === 'fecha') {
        // Agrupar por día para todos, más recientes primero
        const fmt = (dt) => {
          if (!dt) return 'Sin fecha'
          const y = dt.getFullYear()
          const m = String(dt.getMonth() + 1).padStart(2, '0')
          const d = String(dt.getDate()).padStart(2, '0')
          return `${y}-${m}-${d}`
        }
        const byDay = new Map()
        for (const d of docs) {
          const day = fmt(d.fecha)
          const key = `fecha-${day}`
          if (!byDay.has(key)) byDay.set(key, { key, title: day === 'Sin fecha' ? 'Sin fecha' : day, items: [] })
          byDay.get(key).items.push(d)
        }
        const sortable = []
        for (const g of byDay.values()) {
          g.items.sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0))
          const t = g.title === 'Sin fecha' ? 0 : new Date(g.title).getTime()
          sortable.push({ t, g })
        }
        sortable.sort((a, b) => b.t - a.t)
        for (const s of sortable) groups.push(s.g)
      }

      return groups
    },
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
    // this.checkBloqueoTipo()
  },
  methods: {
    cerrarModal() {
      if (this.loading) return
      this.mostrarModal = false
      this.tipoDocumentoId = null
    },
    // Handlers para evitar warnings y actualizar flags locales
    onDocsChange(docs) {
      this.docsListado = Array.isArray(docs) ? docs : []
    },
    onHasTipo2o3(flag) {
      this.hasBloqueoTipo = !!flag
      if (flag && this.mostrarModal) this.cerrarModal()
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

    // Stubs requeridos por interfaz (no hacen nada)
    onEditar() { /* no-op */ },
    onAnular() { /* no-op */ },
    onEnviar() { /* no-op */ },

    onHistorial(doc) { this.$router.push({ name: 'historial-documento', params: { idDocumento: doc?.idDocumento } }) },

    async handleGenerar() {
      if (this.hasBloqueoTipo) {
        await Swal.fire('No permitido', 'Ya existe un documento de tipo 2 o 3. No se pueden generar más documentos.', 'info')
        return
      }
      if (!this.tipoDocumentoId) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const usuario = this.$store.state.userEmail
        const resp = await axios.post(
          `${Global.url}procuradorDenuncias/generarDocumento`,
          { idSicoda: this.id, idTipoDocumento: this.tipoDocumentoId, usuario },
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
        )

        // 1) Extraer nombre de archivo del header Content-Disposition
        let fileName = 'documento.docx'
        const cd = resp.headers['content-disposition']
        if (cd) {
          const match = /filename="?([^"]+)"?/.exec(cd)
          if (match && match[1]) fileName = match[1]
        }

        // 2) Crear URL y descargar (MIME fijo)
        const blob = new Blob([resp.data], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || `documento-${this.id}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // 3) Cerrar modal y notificar
        this.mostrarModal = false
        this.tipoDocumentoId = null
        Swal.fire('Listo', 'El documento se descargó correctamente.', 'success')
        this.$refs.tablaDocs && this.$refs.tablaDocs.cargar()
        // this.checkBloqueoTipo() // @deprecated
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
    },
    abrirHistorialArchivos() {
      this.tabSeleccionada2 = 'historialArchivos'
      if (!this.histTipos.length && !this.histLoading) this.cargarHistorialArchivos()
      // reset expansión al entrar
      this.expandedTipoId = null
    },
    toggleGrupo(key) {
      this.expandedTipoId = this.expandedTipoId === key ? null : key
      if (this.expandedTipoId !== key) this.cerrarViewer()
    },
    onVerDocumento(doc) {
      // Selección: abrir según grupo y presencia de idDireccion
      this.verDocumento(doc)
    },
    async cargarHistorialArchivos() {
      if (this.histLoading) return
      this.histLoading = true
      this.histError = ''
      this.histTipos = []
      try {
        const token = localStorage.getItem('token')
        const noDen = (this.noDenuncia || this.noDenunciaLabel || '').toString().trim()
        if (!noDen) throw new Error('No se encontró el número de denuncia para consultar el historial.')
        const { data } = await axios.get(`${Global.url}procuradorDenuncias/historial-archivos`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { noDenuncia: noDen }
        })
        const grupos = Array.isArray(data?.tipos) ? data.tipos : Array.isArray(data) ? data : []
        this.histTipos = grupos.map((g, idx) => ({
          idTipo: Number(g.idTipo ?? g.id ?? idx),
          nombreTipo: String(g.nombreTipo ?? g.tipo ?? 'Documento').trim(),
          total: Number(g.total ?? (Array.isArray(g.documentos) ? g.documentos.length : 0)),
          documentos: (Array.isArray(g.documentos) ? g.documentos : []).map(d => ({
            idDocumento: Number(d.idDocumento ?? d.id ?? d.ID_DOCUMENTO ?? 0),
            nombre: String(d.nombre ?? d.nombreDocumento ?? d.NOMBRE_DOCUMENTO ?? '').trim(),
            fecha: d.fecha ?? d.FECHA_INGRESA ?? d.fechaIngresa ?? null,
            usuario: d.usuario ?? d.USUARIO_INGRESA ?? d.usuarioIngresa ?? '',
            hasBase64: !!(d.hasBase64 ?? d.HAS_BASE64 ?? false),
            mime: d.mime || d.MIME || '',
            tipoId: Number(g.idTipo ?? g.id ?? idx) // referencia al tipo
          }))
        }))
      } catch (e) {
        this.histError = e?.response?.data?.mensaje || e.message || 'No fue posible cargar el historial.'
      } finally {
        this.histLoading = false
      }
    },
    formatFecha(val) {
      if (!val) return ''
      try { return new Date(val).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' }) }
      catch { return String(val) }
    },
    cerrarViewer() {
      try {
        if (this.viewerUrl) URL.revokeObjectURL(this.viewerUrl)
      } catch (err) {
        // no-op: ya revocado o URL inválida
      }
      this.viewerUrl = ''
      this.viewerName = ''
      this.viewerError = ''
    },
    async verDocumento(doc) {
      this.viewerLoading = true
      this.viewerError = ''
      this.viewerName = doc?.nombre || 'Documento'
      this.cerrarViewer()

      const headers = {}
      const token = localStorage.getItem('token'); if (token) headers.Authorization = `Bearer ${token}`

      const openBy = async (base64Url, streamUrl) => {
        // 1) intento base64
        try {
          const { data } = await axios.get(base64Url, { headers, timeout: 8000 })
          const b64 = data?.base64 || ''
          const mime = data?.mime || 'application/pdf'
          if (!b64) throw new Error('sin base64')
          this.viewerUrl = `data:${mime};base64,${b64}`
          return
        } catch (e) {
          // 2) fallback stream
          try {
            const resp = await axios.get(streamUrl, { headers, responseType: 'blob' })
            const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/pdf' })
            this.viewerUrl = URL.createObjectURL(blob)
          } catch (e2) {
            this.viewerError = e2?.response?.data?.mensaje || 'No se pudo visualizar el documento.'
          }
        }
      }

      try {
        if (doc.idDireccion) {
          // Direcciones: usar endpoints de direcciones exclusivamente
          await openBy(
            `${Global.url}procuradorDenuncias/direcciones/${doc.idDireccion}/base64`,
            `${Global.url}procuradorDenuncias/direcciones/${doc.idDireccion}/stream`
          )
        } else if (doc.idDocumento) {
          // TM firmados: usar endpoints de TM
          await openBy(
            `${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/base64`,
            `${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/stream`
          )
        } else {
          this.viewerError = 'Elemento sin identificador válido.'
        }
      } finally {
        this.viewerLoading = false
      }
    },
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
  /* Mitiga scroll-blocking en móviles */
  touch-action: pan-y;
  overscroll-behavior: contain;
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

/* Historial de archivos: ocupar ancho con menos “cromo” */
.hist-layout { display: block; }
.hist-tree, .hist-viewer {
  position: relative;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(16,24,40,.05);
  overflow: hidden;
}
.hist-header, .viewer-header {
  background: #f6f7fb;
  padding: .6rem .9rem;
  border-bottom: 1px solid #e9edf3;
}
.hist-reload { border-color: #e5e7eb; }
.hist-group { border-top: 1px dashed #eef2f7; }
.hist-group:first-of-type { border-top: none; }
/* Mejora visual ligera del historial */
.hist-group__btn { padding: .7rem .9rem; border-radius: 8px; }
.hist-group__btn:hover { background: #f8fafc; }
.hist-item { padding: .55rem .6rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.hist-item:hover { background: #f6faff; }
.hist-count { background: #eef2f7; color: #334155; border-radius: 999px; min-width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; }
.viewer-iframe { width: 100%; height: 72vh; border: none; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Botón activo en “Agrupar por” */
.btn-group .btn.active {
  background-color: #146C43;
  color: #fff;
  border-color: #146C43;
}
</style>
