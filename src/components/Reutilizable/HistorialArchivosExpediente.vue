<template>
  <div class="hist-layout-container">
    <div class="hist-layout">
      <!-- Panel de árbol / lista -->
      <div class="hist-tree">
        <div class="hist-header d-flex align-items-center justify-content-between">
          <div class="fw-bold">Historial de Archivos</div>

          <div class="btn-group btn-group-sm" role="group" aria-label="Agrupar por">
            <button class="btn btn-outline-secondary" :class="{ active: histGroupMode === 'tipo' }"
              @click="histGroupMode = 'tipo'">
              <i class="fas fa-folder me-1"></i> Tipo
            </button>
            <button class="btn btn-outline-secondary" :class="{ active: histGroupMode === 'fecha' }"
              @click="histGroupMode = 'fecha'">
              <i class="fas fa-calendar-day me-1"></i> Fecha
            </button>
          </div>

          <button class="btn btn-sm btn-light hist-reload" @click="cargarHistorialArchivos" :disabled="histLoading">
            <i class="fas fa-rotate-right me-1"></i> Recargar
          </button>
        </div>

        <div v-if="histLoading" class="hist-overlay" aria-busy="true" aria-live="polite">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <div v-else-if="histError" class="alert alert-warning py-2 px-3 small mt-2 m-2">
          {{ histError }}
        </div>

        <div v-else class="tree-content-scroll">
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
                  <li v-for="d in g.items" :key="(d.idDireccion ?? d.idDocumento) + '-' + (d.nombre || '')"
                    class="hist-item">
                    <div class="hist-item__meta">
                      <i class="fas fa-file-pdf text-danger me-2" v-if="d.mime.includes('pdf')"></i>
                      <i class="fas fa-file-word text-primary me-2" v-else-if="d.mime.includes('word')"></i>
                      <i class="fas fa-file text-muted me-2" v-else></i>
                      <div class="hist-item__text">
                        <div class="fw-semibold text-truncate" :title="d.nombre">
                          {{ d.nombre || 'Documento' }}
                          <span v-if="g.title === 'Direcciones' && d.detalle" class="text-muted fw-normal"> · {{
                            d.detalle }}</span>
                        </div>
                        <div class="text-muted small">
                          {{ formatFecha(d.fecha) }} · {{ d.usuario || '—' }}
                        </div>
                      </div>
                    </div>
                    <div class="hist-item__actions">
                      <button class="btn btn-sm btn-outline-primary" @click="onVerDocumento(d)">
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
      <div class="hist-viewer">
        <div class="viewer-header fw-bold text-truncate" :title="viewerName || 'Vista previa'">
          <i class="fas fa-eye me-2"></i>{{ viewerName || 'Vista previa' }}
        </div>
        <div v-if="viewerLoading" class="text-center text-muted py-5 mt-5">
            <div class="spinner-border text-secondary mb-2" role="status"></div>
            <div>Cargando documento...</div>
        </div>
        <div v-else-if="viewerError" class="alert alert-danger m-3">
          {{ viewerError }}
        </div>
        <div v-else class="viewer-body h-100">
          <template v-if="viewerUrl">
            <iframe class="viewer-iframe" :src="viewerUrl" title="Visor"></iframe>
          </template>
          <div v-else class="text-muted small p-5 text-center mt-5">
            <h5 class="text-muted"><i class="fas fa-file-invoice fa-3x mb-3"></i></h5>
            Seleccione un documento en el panel izquierdo para visualizarlo aquí.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Global from '@/Global'
import axios from 'axios'

export default {
  name: 'HistorialArchivosExpediente',
  props: {
    noDenuncia: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      histLoading: false,
      histTipos: [],
      histError: '',
      expandedTipoId: null,
      histGroupMode: 'fecha',
      // Visor
      viewerLoading: false,
      viewerUrl: '',
      viewerName: '',
      viewerError: ''
    }
  },
  watch: {
    noDenuncia: {
      immediate: true,
      handler(val) {
        if (val) {
          this.cargarHistorialArchivos();
        }
      }
    }
  },
  computed: {
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
            idDireccion: d.idDireccion,
            nombre: d.nombre,
            detalle: d.detalle,
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
    }
  },
  beforeUnmount() {
    this.cerrarViewer();
  },
  methods: {
    async cargarHistorialArchivos() {
      if (this.histLoading) return
      this.histLoading = true
      this.histError = ''
      this.histTipos = []
      this.expandedTipoId = null // Colapsar al recargar
      
      try {
        const token = localStorage.getItem('token')
        const noDen = (this.noDenuncia || '').toString().trim()
        
        if (!noDen) {
            // No error, simplemente no carga nada si no hay numero de denuncia
            this.histLoading = false;
            return;
        }

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
            idDireccion: d.idDireccion ? Number(d.idDireccion) : null,
            nombre: String(d.nombre ?? d.nombreDocumento ?? d.NOMBRE_DOCUMENTO ?? '').trim(),
            fecha: d.fecha ?? d.FECHA_INGRESA ?? d.fechaIngresa ?? null,
            usuario: d.usuario ?? d.USUARIO_INGRESA ?? d.usuarioIngresa ?? '',
            hasBase64: !!(d.hasBase64 ?? d.HAS_BASE64 ?? false),
            mime: d.mime || d.MIME || '',
            detalle: d.detalle
          }))
        }))
        
        // Auto expandir si hay pocos
        if (this.groupedDocs.length === 1) {
            this.expandedTipoId = this.groupedDocs[0].key;
        }

      } catch (e) {
        this.histError = e?.response?.data?.mensaje || e.message || 'No fue posible cargar el historial.'
      } finally {
        this.histLoading = false
      }
    },
    toggleGrupo(key) {
      this.expandedTipoId = this.expandedTipoId === key ? null : key
    },
    onVerDocumento(doc) {
      this.verDocumento(doc)
    },
    cerrarViewer() {
      try {
        if (this.viewerUrl) URL.revokeObjectURL(this.viewerUrl)
      } catch (err) { /* ignore */ }
      this.viewerUrl = ''
      this.viewerName = ''
      this.viewerError = ''
    },
    formatFecha(val) {
      if (!val) return ''
      try { return new Date(val).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' }) }
      catch { return String(val) }
    },
    async verDocumento(doc) {
      this.viewerLoading = true
      this.viewerError = ''
      this.viewerName = doc?.nombre || 'Documento'
      this.cerrarViewer()

      const headers = {}
      const token = localStorage.getItem('token'); if (token) headers.Authorization = `Bearer ${token}`

      const openBy = async (base64Url, streamUrl) => {
        try {
          // Intento base64
          const { data } = await axios.get(base64Url, { headers, timeout: 8000 })
          const b64 = data?.base64 || ''
          const mime = data?.mime || 'application/pdf'
          if (!b64) throw new Error('sin base64')
          
          // Crear Blob
          const binaryString = window.atob(b64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mime });
          this.viewerUrl = URL.createObjectURL(blob);
          
          return
        } catch (e) {
          // Fallback stream
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
          await openBy(
            `${Global.url}procuradorDenuncias/direcciones/${doc.idDireccion}/base64`,
            `${Global.url}procuradorDenuncias/direcciones/${doc.idDireccion}/stream`
          )
        } else if (doc.idDocumento) {
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
    }
  }
}
</script>

<style scoped>
.hist-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 950px;
  width: 100%;
}

.hist-tree {
  width: 100%;
  height: 350px;
  display: flex;
  flex-direction: column;
}

.hist-viewer {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  min-height: 500px;
}

.hist-tree, .hist-viewer {
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden;
}

.hist-header, .viewer-header {
  background: #fcfcfc;
  padding: .75rem 1rem;
  border-bottom: 1px solid #eef2f7;
  height: 50px;
}

.tree-content-scroll {
  flex: 1;
  overflow-y: auto;
}

.hist-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.hist-group {
  border-bottom: 1px solid #f1f3f5;
}

.hist-group__btn {
  background: none;
  border: none;
  text-align: left;
  padding: .75rem 1rem;
  transition: background .2s;
  color: #333;
}
.hist-group__btn:hover { background: #f8f9fa; }

.hist-count {
  background: #e9ecef;
  color: #495057;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.hist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fdfdfd;
}

.hist-item {
  padding: .6rem 1rem .6rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-top: 1px solid #f8f9fa;
  transition: background .2s;
}

.hist-item:hover {
  background: #f1f8ff;
}

.hist-item__meta {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 0.5rem;
}

.hist-item__text {
  min-width: 0;
}

.viewer-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.btn-group .btn.active {
    background-color: #6C757D;
    color: white;
    border-color: #6C757D;
}

/* Transiciones */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
