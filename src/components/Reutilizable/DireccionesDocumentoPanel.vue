<template>
  <Teleport to="body">
    <div v-if="modelValue" class="ddp-overlay" @click="closePanel"></div>
    <aside v-if="modelValue" class="ddp-panel" role="dialog" aria-modal="true">
      <header class="ddp-header">
        <h5 class="mb-0 text-truncate" :title="`Direcciones del expediente ${noDenuncia || ''}`">
          Direcciones del expediente {{ noDenuncia || '—' }}
        </h5>
        <button class="btn btn-light btn-sm ddp-close" @click="closePanel" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </header>

      <section class="ddp-toolbar">
        <div class="input-group input-group-sm">
          <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
          <input
            class="form-control"
            v-model.trim="q"
            type="search"
            placeholder="Buscar por dirección, tipo o usuario..."
          />
        </div>
      </section>

      <section class="ddp-body">
        <div v-if="loading" class="p-3 text-muted small">Cargando direcciones…</div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-striped align-middle mb-0">
            <thead class="table-light ddp-thead">
              <tr>
                <th style="min-width:240px;">Dirección</th>
                <th style="min-width:160px;">Tipo</th>
                <th style="min-width:130px;">Estado</th>
                <th style="min-width:80px;">Días</th>
                <th style="min-width:160px;">Fecha entrega</th>
                <th style="min-width:160px;">Usuario ingresa</th>
                <th style="min-width:170px;">Fecha ingresa</th>
                <th style="min-width:170px;">Usuario actualiza</th>
                <th style="min-width:180px;">Fecha actualiza</th>
                <th class="text-end" style="width:140px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="itemsFiltered.length === 0">
                <td colspan="10" class="text-center text-muted py-4">Sin direcciones.</td>
              </tr>
              <tr v-for="r in itemsFiltered" :key="r.idDirecciones">
                <td class="small">
                  {{ r.direccion || r.direccionFisica || r.unidadDescripcion || '—' }}
                </td>
                <td class="small">{{ r.tipoDireccionDescripcion || '—' }}</td>
                <td>
                  <span class="badge" :class="badgeEstado(r.idEstatus)">{{ r.estadoDescripcion || '—' }}</span>
                </td>
                <td>{{ r.dias ?? '—' }}</td>
                <td>{{ fmtFecha(r.fechaEntrega) || '—' }}</td>
                <td class="small">{{ r.usuarioIngresa || '—' }}</td>
                <td class="small">{{ fmtFecha(r.fechaIngresa) || '—' }}</td>
                <td class="small">{{ r.usuarioActualiza || '—' }}</td>
                <td class="small">{{ fmtFecha(r.fechaActualiza) || '—' }}</td>
                <td class="text-end">
                  <button
                    v-if="Number(r.idEstatus) === 4"
                    class="btn btn-primary btn-sm"
                    :disabled="viewingId === r.idDirecciones"
                    @click.prevent="verDocumento(r)"
                  >
                    <span v-if="viewingId === r.idDirecciones" class="spinner-border spinner-border-sm me-1"></span>
                    Ver documento
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="p-3 text-muted small" v-if="items.length > 0">
            Total: {{ items.length }} dirección(es)
          </div>
        </div>
      </section>
    </aside>
  </Teleport>
</template>

<script>
import axios from 'axios'
import Global from '@/Global'
import Swal from 'sweetalert2'

export default {
  name: 'DireccionesDocumentoPanel',
  props: {
    modelValue: { type: Boolean, default: false }, // v-model para abrir/cerrar
    idDocumento: { type: [String, Number], required: true },
    noDenuncia: { type: String, default: '' }
  },
  data() {
    return { loading: false, items: [], viewingId: null, q: '' }
  },
  computed: {
    itemsFiltered() {
      const q = this.q.toLowerCase()
      if (!q) return this.items
      return this.items.filter(r => {
        const dir = (r.direccion || r.direccionFisica || r.unidadDescripcion || '').toLowerCase()
        const tipo = String(r.tipoDireccionDescripcion || '').toLowerCase()
        const u1 = String(r.usuarioIngresa || '').toLowerCase()
        const u2 = String(r.usuarioActualiza || '').toLowerCase()
        return dir.includes(q) || tipo.includes(q) || u1.includes(q) || u2.includes(q)
      })
    }
  },
  watch: {
    modelValue(val) {
      if (val) this.cargar()
    },
    idDocumento() {
      if (this.modelValue) this.cargar()
    }
  },
  methods: {
    closePanel() {
      this.$emit('update:modelValue', false)
    },
    async cargar() {
      if (!this.idDocumento) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          `${Global.url}procuradorDenuncias/documentos/${this.idDocumento}/direcciones/full`,
          { headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' } }
        )
        this.items = Array.isArray(data) ? data : (data?.data || [])
      } catch (e) {
        const status = e?.response?.status
        if (status === 401 || status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.closePanel()
          this.$router.push('/')
        } else if (status === 404) {
          this.items = []
          // sin alerta
        } else {
          console.warn('No se pudieron cargar las direcciones.', e)
          this.items = []
        }
      } finally {
        this.loading = false
      }
    },
    async verDocumento(row) {
      if (Number(row.idEstatus) !== 4) return
      this.viewingId = row.idDirecciones
      try {
        const token = localStorage.getItem('token')
        if (row.pathDocumento) {
          window.open(row.pathDocumento, '_blank', 'noopener')
        } else {
          const resp = await axios.get(
            `${Global.url}procuradorDenuncias/direcciones/${row.idDirecciones}/descargar`,
            { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
          )
          const blob = new Blob([resp.data], { type: resp.data?.type || 'application/pdf' })
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank', 'noopener')
          setTimeout(() => {
            try { URL.revokeObjectURL(url) } catch (err) { /* noop */ }
          }, 10000)
        }
      } catch (e) {
        const status = e?.response?.status
        if (status === 404) {
          Swal.fire('Archivo no disponible', 'Esta dirección no tiene documento para ver.', 'info')
        } else if (status === 401 || status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.closePanel()
          this.$router.push('/')
        } else {
          Swal.fire('Error', 'No se pudo abrir el documento.', 'error')
        }
      } finally {
        this.viewingId = null
      }
    },
    fmtFecha(v) {
      if (!v) return ''
      const d = new Date(v)
      if (isNaN(d)) return String(v)
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    badgeEstado(id) {
      switch (Number(id)) {
        case 1: return 'text-bg-primary'
        case 2: return 'text-bg-success'
        case 3: return 'text-bg-warning'
        case 4: return 'text-bg-secondary'
        default: return 'text-bg-light'
      }
    }
  }
}
</script>

<style scoped>
.ddp-overlay {
  position: fixed; inset: 0;
  background: rgba(33,37,41,.4);
  backdrop-filter: blur(1px);
  z-index: 1065;
}
.ddp-panel {
  position: fixed; top: 0; right: 0; height: 100%;
  width: 560px; max-width: 95vw;
  background: #fff; z-index: 1070;
  display: flex; flex-direction: column;
  box-shadow: 0 0 0 1px rgba(0,0,0,.05), -16px 0 32px rgba(0,0,0,.15);
  animation: slideIn .18s ease-out;
}
@keyframes slideIn { from { transform: translateX(12px); opacity:.0 } to { transform: translateX(0); opacity:1 } }
.ddp-header {
  position: sticky; top: 0; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  gap: .5rem; padding: .75rem .75rem .5rem .75rem;
  border-bottom: 1px solid #e9ecef; background: #fff;
}
.ddp-close { width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; }
.ddp-toolbar { padding: .5rem .75rem; border-bottom: 1px solid #f1f3f5; }
.ddp-body { padding: 0; overflow: auto; }
.ddp-thead th { position: sticky; top: 0; background: #f8f9fa; z-index: 1; }
</style>