<template>
  <div class="container-fluid">
    <!-- Filtros -->
    <div class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="buscar">
          <div class="row g-2">
            <div class="col-12 col-md-4">
              <label class="form-label">Buscar (No. denuncia, dirección, estado o usuario)</label>
              <input type="text" class="form-control" v-model.trim="filtros.q" placeholder="Ej. D-F-0074-2025" />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label">Estatus</label>
              <input type="number" class="form-control" v-model.number="filtros.estatus" placeholder="ID estatus" min="1" />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label">Unidad Administrativa</label>
              <input type="number" class="form-control" v-model.number="filtros.ua" placeholder="Código UA" min="1" />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label">Desde</label>
              <input type="date" class="form-control" v-model="filtros.desde" />
            </div>
            <div class="col-6 col-md-2">
              <label class="form-label">Hasta</label>
              <input type="date" class="form-control" v-model="filtros.hasta" />
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <i class="fa fa-search me-1"></i> Buscar
            </button>
            <button type="button" class="btn btn-light" :disabled="loading" @click="limpiar">
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div class="card-header"><strong>Direcciones internas</strong></div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 64px;"></th> <!-- Semáforo -->
                <th style="min-width: 160px;">No. Denuncia</th>
                <th style="min-width: 220px;">Dirección</th>
                <th style="min-width: 150px;">Estado</th>
                <th style="min-width: 150px;">Fecha entrega</th>
                <th style="min-width: 80px;" class="text-center">Días</th>
                <th style="min-width: 160px;">Usuario</th>
                <th style="min-width: 120px;" class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-4 text-muted">Cargando…</td>
              </tr>
              <tr v-else-if="rows.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">Sin resultados.</td>
              </tr>
              <tr v-for="r in rows" :key="r.idDirecciones">
                <td class="text-center">
                  <div class="ring" :style="ringStyle(r)" :title="semaforoTitulo(r)">
                    <small class="ring-label">{{ ringLabel(r) }}</small>
                  </div>
                </td>
                <td>{{ r.noDenuncia }}</td>
                <td>{{ r.direccion }}</td>
                <td>{{ r.estado }}</td>
                <td>{{ fmtFecha(r.fechaEntrega) }}</td>
                <td class="text-center">{{ r.dias }}</td>
                <td>{{ r.usuario }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary" @click="verExpediente(r)" title="Ver expediente">
                    <i class="fa fa-folder-open"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginación -->
      <div class="card-footer d-flex align-items-center justify-content-between">
        <div class="text-muted small">
          Mostrando {{ Math.min((page-1)*pageSize + 1, total) }}–{{ Math.min(page*pageSize, total) }} de {{ total }}
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-secondary" :disabled="page === 1 || loading" @click="goTo(1)">«</button>
          <button class="btn btn-outline-secondary" :disabled="page === 1 || loading" @click="goTo(page-1)">‹</button>
          <button class="btn btn-outline-secondary disabled">{{ page }}</button>
          <button class="btn btn-outline-secondary" :disabled="page >= maxPage || loading" @click="goTo(page+1)">›</button>
          <button class="btn btn-outline-secondary" :disabled="page >= maxPage || loading" @click="goTo(maxPage)">»</button>
        </div>
        <div>
          <select class="form-select form-select-sm" style="width: auto;" v-model.number="pageSize" :disabled="loading" @change="buscar">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
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
  name: 'MesaDireccionesInternas',
  data() {
    return {
      loading: false,
      rows: [],
      total: 0,
      page: 1,
      pageSize: 10,
      filtros: { q: '', estatus: null, ua: null, desde: '', hasta: '' }
    }
  },
  computed: {
    maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)) },
    currentUser() {
      return this.$store?.state?.userEmail
        || localStorage.getItem('userEmail')
        || localStorage.getItem('usuario')
        || ''
    },
    queryParams() {
      return {
        page: this.page,
        pageSize: this.pageSize,
        q: this.filtros.q || undefined,
        estatus: this.filtros.estatus ?? undefined,
        ua: this.filtros.ua ?? undefined,
        desde: this.filtros.desde || undefined,
        hasta: this.filtros.hasta || undefined,
        usuario: this.currentUser
      }
    }
  },
  methods: {
    ensureUser() {
      if (!this.currentUser) throw new Error('Usuario no disponible. Inicie sesión nuevamente.')
    },
    fmtFecha(v) {
      if (!v) return '—'
      const d = new Date(v)
      if (Number.isNaN(d.getTime())) return String(v)
      const pad = n => String(n).padStart(2, '0')
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    },
    mapRow(v) {
      return {
        idDirecciones: v.idDirecciones ?? v.ID_DIRECCIONES,
        idSicoda: v.idSicoda ?? v.ID_SICODA,
        codigoUnidadAdministrativa: v.codigoUnidadAdministrativa ?? v.CODIGO_UNIDAD_ADMINISTRATIVA,
        idEstatus: v.idEstatus ?? v.ID_ESTATUS,
        noDenuncia: v.noDenuncia ?? v.NO_DENUNCIA,
        direccion: v.direccion ?? v.DIRECCION,
        estado: v.estado ?? v.ESTADO,
        fechaEntrega: v.fechaEntrega ?? v.FECHA_ENTREGA,
        dias: Number(v.dias ?? v.DIAS ?? 0),
        usuario: v.usuario ?? v.USUARIO
      }
    },
    // Semáforo
    // Cálculo de estado y días restantes
    semaforoInfo(row) {
      const dias = Number(row.dias || 0)
      const due = row.fechaEntrega ? new Date(row.fechaEntrega) : null
      if (!due || dias <= 0) return { color: 'gray-dark', remaining: null, remainingRaw: null, dias }

      const today = new Date()
      due.setHours(0,0,0,0)
      today.setHours(0,0,0,0)

      // días restantes (negativo si venció)
      const remainingRaw = Math.ceil((due - today) / 86400000)
      const remaining = Math.max(0, Math.min(dias, remainingRaw))

      let color
      if (remainingRaw <= 0) color = 'red'
      else {
        const ratio = remaining / dias
        color = ratio > 2/3 ? 'green' : ratio > 1/3 ? 'yellow' : 'red'
      }
      return { color, remaining, remainingRaw, dias }
    },
    // Texto del tooltip
    semaforoTitulo(row) {
      const { color, remainingRaw } = this.semaforoInfo(row)
      if (color === 'gray-dark') return 'Sin plazo (días = 0) o sin fecha'
      if (remainingRaw > 1) return `Restan ${remainingRaw} días`
      if (remainingRaw === 1) return 'Resta 1 día'
      if (remainingRaw === 0) return 'Vence hoy'
      return `Vencido hace ${Math.abs(remainingRaw)} día(s)`
    },
    // Estilo del anillo con progreso visible (mín. 6%)
    ringStyle(row) {
      const { color, remaining, remainingRaw, dias } = this.semaforoInfo(row)
      const colors = {
        'gray-dark': '#495057',
        green: '#22c55e',
        yellow: '#f59e0b',
        red: '#ef4444'
      }
      const track = '#e9ecef'

      let pct = 0
      if (color === 'gray-dark') pct = 0
      else if (remainingRaw <= 0) pct = 100
      else {
        pct = Math.round((remaining / Math.max(1, dias)) * 100)
        pct = Math.max(6, Math.min(100, pct)) // mínimo visible
      }

      const col = colors[color] || colors['gray-dark']
      return {
        backgroundImage: `conic-gradient(${col} ${pct}%, ${track} ${pct}% 100%)`,
        boxShadow: color === 'red' ? '0 0 0 2px rgba(239,68,68,.2)' : 'inset 0 0 0 1px rgba(0,0,0,.06)'
      }
    },
    ringLabel(row) {
      const { color, remainingRaw } = this.semaforoInfo(row)
      if (color === 'gray-dark') return '—'
      return String(Math.max(0, remainingRaw ?? 0))
    },

    async cargarMesa() {
      this.loading = true
      try {
        this.ensureUser()
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          `${Global.url}DenunciasDirecciones/direcciones-internas/mesa`,
          { params: this.queryParams, headers: { Authorization: `Bearer ${token}` } }
        )
        const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
        this.total = Number(data?.total ?? items.length)
        this.rows = items.map(this.mapRow)
      } catch (e) {
        const msg = e.response?.data || e.message || 'No se pudo cargar la mesa de direcciones.'
        await Swal.fire('Error', msg, 'error')
        this.rows = []; this.total = 0
      } finally {
        this.loading = false
      }
    },
    async buscar() {
      this.page = 1
      await this.cargarMesa()
    },
    async limpiar() {
      this.filtros = { q: '', estatus: null, ua: null, desde: '', hasta: '' }
      this.page = 1
      await this.cargarMesa()
    },
    async goTo(p) {
      if (p < 1 || p > this.maxPage || p === this.page) return
      this.page = p
      await this.cargarMesa()
    },
    verExpediente(r) {
      if (!r?.idSicoda) return
      const idDir = r?.idDirecciones || r?.idDireccion
      if (idDir) {
        this.$router.push({ path: `/expedienteD/${r.idSicoda}/${idDir}`, query: { nd: r.noDenuncia } })
      } else {
        this.$router.push({ path: `/expedienteD/${r.idSicoda}`, query: { nd: r.noDenuncia } })
      }
    }
  },
  mounted() { this.cargarMesa() }
}
</script>

<style scoped>
.card { overflow: hidden; }
.table td, .table th { vertical-align: middle; }

/* Semáforo anillo grande */
.ring {
  --size: 52px;
  position: relative;
  display: inline-grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  transition: background-image .25s ease, box-shadow .25s ease;
}
.ring::after {
  content: '';
  position: absolute;
  inset: 6px;               /* grosor del aro */
  background: #fff;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.06);
}
.ring-label {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

/* Colores de punto de respaldo (no usados en anillo, por si los reutilizas) */
.semaforo { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,.1); }
.dot-gray { background: #adb5bd; }
.dot-green { background: #22c55e; }
.dot-yellow { background: #f59e0b; }
.dot-red { background: #ef4444; }
</style>