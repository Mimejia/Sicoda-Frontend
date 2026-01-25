<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Notificaciones</h5>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-danger">No vistas: {{ unreadCount }}</span>
        <span class="badge bg-secondary">Vistas: {{ readCount }}</span>
        <span class="badge bg-light text-muted">Total: {{ total }}</span>
      </div>
    </div>

    <div class="card-body">
      <!-- Filtros -->
      <div class="row g-2 mb-3">
        <div class="col-md-5">
          <input v-model.trim="search" type="text" class="form-control" placeholder="Buscar por título o mensaje" @keyup.enter="reload()" />
        </div>
        <div class="col-md-5">
          <select v-model="direccionSel" class="form-select" @change="reload()">
            <option :value="''">Todas las direcciones</option>
            <option v-for="d in direcciones" :key="d.value" :value="d.value">{{ d.text }}</option>
          </select>
        </div>
        <div class="col-md-2 d-flex justify-content-end">
          <select v-model.number="pageSize" class="form-select w-auto" @change="goPage(1)">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

      <!-- Acciones en lote -->
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-light" :disabled="!items.some(i => i.idEstatus === 1)" @click="marcarTodas()">Marcar todas como vistas</button>
        <button class="btn btn-light-secondary" @click="reload()" :disabled="loading">
          <i class="fas fa-sync-alt me-1"></i> Refrescar
        </button>
      </div>

      <!-- Tabla -->
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th style="width: 90px;">Estado</th>
              <th>Título</th>
              <th>Mensaje</th>
              <th>Dirección</th>
              <th class="text-nowrap">No. Denuncia</th>
              <th class="text-nowrap">No. Documento</th>
              <th>Fecha</th>
              <th style="width: 230px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center text-muted py-4">Cargando…</td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Sin notificaciones</td>
            </tr>
            <tr
              v-else
              v-for="n in itemsSorted"
              :key="n.idNotificacion"
              :class="n.idEstatus === 1 ? 'row-unread' : 'row-read'"
            >
              <td>
                <span v-if="n.idEstatus === 1" class="badge bg-danger">Nuevo</span>
                <span v-else class="badge bg-secondary">Visto</span>
              </td>
              <td class="fw-semibold">{{ n.titulo || '—' }}</td>
              <td class="text-muted">{{ n.mensaje || '—' }}</td>
              <td>{{ n.nombreDireccion || '—' }}</td>
              <td>{{ n.noDenuncia || '—' }}</td>
              <td>{{ n.noDocumento || '—' }}</td>
              <td class="text-nowrap">{{ fmtFecha(n.fechaIngresa) }}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-light-primary" @click="verDetalle(n)">Ver</button>
                  <button class="btn btn-light" :disabled="n.idEstatus !== 1" @click="marcarUna(n)">Marcar visto</button>
                  <button class="btn btn-light" :disabled="!n.archivoDisponible && !n.archivoBase64" @click="verArchivo(n)">Archivo</button>
                  <button class="btn btn-warning" :disabled="!tieneIdSicoda(n)" @click="irAExpediente(n)" title="Ver expediente">
                    Expediente
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted small">
          Página {{ page }} / {{ maxPage }}
        </div>
        <div class="btn-group">
          <button class="btn btn-light" :disabled="page<=1" @click="goPage(page-1)">Anterior</button>
          <button class="btn btn-light" :disabled="page>=maxPage" @click="goPage(page+1)">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import Global from '@/Global'

export default {
  name: 'NotificacionesDireccionesMesa',
  data() {
    return {
      loading: false,
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: '',
      direccionSel: '',
      direcciones: []
    }
  },
  computed: {
    currentUser() {
      return (
        this.$store?.state?.userName ||
        localStorage.getItem('nombreUsuario') ||
        this.$store?.state?.userEmail ||
        localStorage.getItem('userEmail') ||
        localStorage.getItem('usuario') ||
        ''
      )
    },
    maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)) },
    unreadCount() { return this.items.filter(x => x.idEstatus === 1).length },
    readCount() { return this.items.filter(x => x.idEstatus !== 1).length },
    itemsSorted() {
      // Unread primero (idEstatus asc), luego por fechaIngresa desc
      return [...this.items].sort((a, b) => {
        const s = (a.idEstatus || 2) - (b.idEstatus || 2)
        if (s !== 0) return s
        const da = new Date(a.fechaIngresa || 0).getTime()
        const db = new Date(b.fechaIngresa || 0).getTime()
        return db - da
      })
    }
  },
  methods: {
    token() { return localStorage.getItem('token') || '' },
    userParams(extra = {}) { return { usuario: this.currentUser, ...extra } },
    fmtFecha(v) {
      if (!v) return '—'
      const d = new Date(v)
      if (Number.isNaN(d.getTime())) return String(v)
      const pad = n => String(n).padStart(2, '0')
      return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    async cargarDirecciones() {
      try {
        const { data } = await axios.get(`${Global.url}NotificacionesDirecciones/direcciones`, {
          params: this.userParams(),
           headers: { Authorization: `Bearer ${this.token()}` }
        })
        if (Array.isArray(data)) {
          this.direcciones = data.map(x => ({ value: x.codigo || x.id || x.nombre || x, text: x.nombre || x.text || String(x) }))
        }
      } catch {
        // se completará tras primer load con deriveDirecciones()
      }
    },
    deriveDirecciones() {
      if (this.direcciones.length) return
      const set = new Map()
      this.items.forEach(n => {
        const key = n.nombreDireccion || ''
        if (key && !set.has(key)) set.set(key, key)
      })
      this.direcciones = Array.from(set.values()).map(v => ({ value: v, text: v }))
    },
    async reload() { await this.goPage(1) },
    async goPage(p) {
      this.page = Math.min(this.maxPage, Math.max(1, p || 1))
      await this.cargar()
    },
    async cargar() {
      if (!this.currentUser) return
      this.loading = true
      try {
        // Forzar traer todas (no filtrar por no vistas)
        const params = this.userParams({
          page: this.page,
          pageSize: this.pageSize,
          onlyUnread: false
        })
        if (this.search) params.search = this.search
        if (this.direccionSel) params.nombreDireccion = this.direccionSel
        const { data } = await axios.get(`${Global.url}NotificacionesDirecciones`, {
           params, headers: { Authorization: `Bearer ${this.token()}` }
        })

        let rows = Array.isArray(data?.data) ? data.data : []
        this.total = Number(data?.total || rows.length)

        // Filtro client-side por dirección si el backend aún no lo soporta
        if (this.direccionSel) {
          rows = rows.filter(r => (r.nombreDireccion || '') === this.direccionSel)
        }

        // Filtro client-side por búsqueda si el backend no lo aplicó
        if (this.search) {
          const q = this.search.toLowerCase()
          rows = rows.filter(r =>
            String(r.titulo || '').toLowerCase().includes(q) ||
            String(r.mensaje || '').toLowerCase().includes(q)
          )
        }
        console.log(rows);
        this.items = rows
        this.deriveDirecciones()
      } catch (e) {
        const msg = e?.response?.data || 'No se pudieron cargar las notificaciones.'
        Swal.fire('Error', msg, 'error')
      } finally { this.loading = false }
    },
    async marcarUna(n) {
      if (n.idEstatus !== 1) return
      try {
        await axios.post(`${Global.url}NotificacionesDirecciones/${n.idNotificacion}/visto`, null, {
          params: this.userParams(),
           headers: { Authorization: `Bearer ${this.token()}` }
        })
        n.idEstatus = 2
      } catch (e) {
        console.error('No se pudo marcar como vista', e)
      }
    },
    async marcarTodas() {
      const ids = this.items.filter(x => x.idEstatus === 1).map(x => x.idNotificacion)
      if (!ids.length) return
      try {
        await axios.post(`${Global.url}NotificacionesDirecciones/visto-multiples`, ids, {
          params: this.userParams(),
           headers: { Authorization: `Bearer ${this.token()}` }
        })
        this.items.forEach(x => { x.idEstatus = 2 })
      } catch (e) {
        console.error('No se pudieron marcar todas', e)
      }
    },
    getIdSicoda(n) {
      const raw = n?.idSicoda ?? n?.idsicoda ?? n?.IdSicoda
      const v = Number(raw)
      return Number.isFinite(v) && v > 0 ? v : null
    },
    tieneIdSicoda(n) { return this.getIdSicoda(n) !== null },
    irAExpediente(n) {
      const id = this.getIdSicoda(n)
      if (!id) return Swal.fire('Información', 'Esta notificación no tiene IdSicoda.', 'info')
      this.$router.push({ path: `/expedienteP/${id}` }).catch(() => {})
    },
    async verDetalle(n) {
      const html = `
        <div class="swl">
          <div class="swl-row"><strong>Dirección:</strong> ${this.safe(n.nombreDireccion)}</div>
          <div class="swl-row"><strong>Estado:</strong> ${this.safe(n.estado)}</div>
          <div class="swl-row"><strong>Tipo de archivo:</strong> ${this.safe(n.tipoArchivo)}</div>
          <div class="swl-row"><strong>No. Denuncia:</strong> ${this.safe(n.noDenuncia)}</div>
          <div class="swl-row"><strong>No. Documento:</strong> ${this.safe(n.noDocumento)}</div>
          <hr />
          <div class="swl-row"><strong>Título:</strong> ${this.safe(n.titulo)}</div>
          <div class="swl-row"><strong>Mensaje:</strong><br/> ${this.safe(n.mensaje)}</div>
        </div>
      `
      const res = await Swal.fire({
        title: 'Detalle de notificación',
        html, width: 720,
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        showDenyButton: true,
        denyButtonText: 'Ver expediente',
        confirmButtonText: 'Ver archivo',
        reverseButtons: true
      })
      if (res.isDenied) return this.irAExpediente(n)
      if (res.isConfirmed) return this.verArchivo(n)
    },
    async verArchivo(n) {
      try {
        if (n.archivoBase64) {
          const url = `data:application/pdf;base64,${n.archivoBase64}`
          return window.open(url, '_blank', 'noopener')
        }
        const resp = await axios.get(`${Global.url}NotificacionesDirecciones/${n.idNotificacion}/archivo`, {
          params: this.userParams(),
           headers: { Authorization: `Bearer ${this.token()}` },
           responseType: 'blob'
        })
        const blob = resp.data
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      } catch {
        Swal.fire('Error', 'No se pudo abrir el archivo.', 'error')
      }
    },
    safe(v) {
      if (v == null) return ''
      return String(v).replace(/[<>&]/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[s]))
    }
  },
  async mounted() {
    await Promise.all([this.cargarDirecciones(), this.reload()])
  }
}
</script>

<style scoped>
.row-unread { background: #fff8f8; }
.row-read { background: #f7f9fc; }
.row-unread .fw-semibold { color: #b42318; }
.table tbody tr + tr { border-top: 1px solid #eef2f7; }
</style>

<NotificacionesDireccionesBell :onlyUnread="true" :pageSize="10" />