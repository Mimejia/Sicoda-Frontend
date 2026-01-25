<template>
  <div>
    <div class="card p-4">
    <div class="d-flex justify-content-between align-items-end mb-3">
      <div>
        <h2 class="mb-1">Mesa de Denuncias</h2>
        <div class="text-muted small">Ordenadas por fecha de ingreso (desc)</div>
      </div>
      <div class="d-flex flex-wrap gap-2 align-items-end">
        <input v-model="q" type="search" class="form-control form-control-sm"
          placeholder="Buscar (No, Motivo, Usuario, Depto/Muni)" style="min-width:220px" />
        <select v-model="estado" class="form-select form-select-sm" style="max-width:170px">
          <option value="">Estado</option>
          <option v-for="e in opciones.estados" :key="e" :value="e">{{ e }}</option>
        </select>
        <select v-model.number="periodoDenuncia" class="form-select form-select-sm" style="max-width:140px">
          <option :value="null">Periodo</option>
          <option v-for="p in opciones.periodos" :key="p" :value="parseInt(p)">{{ p }}</option>
        </select>
        <select v-model="usuarioAsignado" class="form-select form-select-sm" style="max-width:180px">
          <option value="">Usuario asignado</option>
          <option v-for="u in opciones.usuarios" :key="u" :value="u">{{ u }}</option>
        </select>
        <select v-model="ingresadaDelegacion" class="form-select form-select-sm" style="max-width:190px">
          <option value="">Delegación</option>
          <option v-for="d in opciones.delegaciones" :key="d" :value="d">{{ d }}</option>
        </select>
        <select v-model="tipoIngreso" class="form-select form-select-sm" style="max-width:140px">
          <option value="">Tipo ingreso</option>
          <option v-for="t in opciones.tiposIngreso" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="depDenunciado" class="form-select form-select-sm" style="max-width:160px">
          <option value="">Departamento</option>
          <option v-for="d in opciones.departamentos" :key="d" :value="d">{{ d }}</option>
        </select>
        <select v-model="munDenunciado" class="form-select form-select-sm" style="max-width:160px">
          <option value="">Municipio</option>
          <option v-for="m in opciones.municipios" :key="m" :value="m">{{ m }}</option>
        </select>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" @click="buscar"><i class="fas fa-search"></i></button>
          <button class="btn btn-sm btn-outline-secondary" @click="limpiar"><i class="fas fa-eraser"></i></button>
          <button class="btn btn-sm btn-outline-primary" @click="abrirAvanzado"><i class="fas fa-sliders-h me-1"></i>
            Avanzado</button>
          <button class="btn btn-sm btn-success" @click="exportar">
            <i class="fas fa-file-excel me-1"></i> Exportar
          </button>
        </div>
      </div>
    </div>

    <div class="table-responsive border rounded table-wrap">
      <table class="table table-sm table-hover table-striped align-middle mb-0">
        <thead class="table-dark">
          <tr>
            <th>Periodo</th>
            <th>No Denuncia</th>
            <th>Estado</th>
            <th>Usuario</th>
            <th>Departamento</th>
            <th>Municipio</th>
            <th>Motivo</th>
            <th>Ingreso</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.idSicoda"
            :class="{ 'table-active': selectedRow && selectedRow.idSicoda === row.idSicoda }"
            @click="selectRow(row)"
          >
            <td>{{ row.periodoDenuncia || '—' }}</td>
            <td><strong>{{ row.noDenuncia }}</strong></td>
            <td>
              <span
                class="badge"
                :class="{
                  'bg-primary': !row.estado || ['Ingresado','En trámite'].includes(row.estado),
                  'bg-success': row.estado === 'Finalizado',
                  'bg-danger': row.estado === 'Anulado'
                }"
              >{{ row.estado || '—' }}</span>
              <button
                v-if="row.estado === 'Denegada'"
                class="btn-icon btn-icon-danger ms-1"
                title="Ver detalle de denegación"
                @click.stop="abrirDenegacion(row)"
              >
                <i class="fas fa-ban"></i>
              </button>
              <button
                v-if="row.estado === 'Anulado'"
                class="btn-icon btn-icon-danger ms-1"
                title="Ver detalle de anulación"
                @click.stop="abrirAnulacion(row)"
              >
                <i class="fas fa-info-circle"></i>
              </button>
            </td>
            <td>{{ row.usuarioAsignado || '—' }}</td>
            <td>{{ row.departamentoDenunciado || '—' }}</td>
            <td>{{ row.municipioDenunciado || '—' }}</td>
            <td class="text-truncate" style="max-width:240px">{{ row.motivoDenuncia || '—' }}</td>
            <td>{{ row.tipoIngreso || '—' }}</td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="9" class="text-center text-muted py-3">Sin resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted small">Total: {{ total }}</div>
      <div class="d-flex gap-2 align-items-center">
        <button class="btn btn-sm btn-outline-secondary" :disabled="page === 1" @click="page--; cargar()">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="small">Página {{ page }}</span>
        <button class="btn btn-sm btn-outline-secondary" :disabled="page * pageSize >= total" @click="page++; cargar()">
          <i class="fas fa-chevron-right"></i>
        </button>
        <select v-model.number="pageSize" class="form-select form-select-sm" style="max-width:90px"
          @change="cambiarPageSize">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Action bar below table -->
    <div class="action-bar mt-2" v-if="selectedRow">
      <div class="d-flex justify-content-between align-items-center p-2 border rounded bg-light">
        <div class="small text-muted">
          Seleccionado: <strong>{{ selectedRow.noDenuncia }}</strong> · Estado: <strong>{{ selectedRow.estado }}</strong>
        </div>
        <div class="d-flex gap-2">
          <button
            v-if="selectedRow.estado === 'Denegada'"
            class="btn btn-danger btn-sm"
            @click="abrirDenegacion(selectedRow)"
          >
            <i class="fas fa-ban me-1"></i> Ver detalle de denegación
          </button>
          <button
            v-if="selectedRow.estado === 'Anulado'"
            class="btn btn-outline-danger btn-sm"
            @click="abrirAnulacion(selectedRow)"
          >
            <i class="fas fa-info-circle me-1"></i> Ver detalle de anulación
          </button>
          <button class="btn btn-light btn-sm" @click="clearSelection">
            Limpiar selección
          </button>
        </div>
      </div>
    </div>
    </div>
    <div v-if="showAnulacion" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.35)">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i
              :class="[
                (modalTitulo || '').toLowerCase().includes('denegación') ? 'fas fa-ban' : 'fas fa-info-circle',
                'text-danger','me-2'
              ]"
            ></i>
            {{ modalTitulo || 'Detalle' }}
          </h5>
          <button type="button" class="btn-close" @click="showAnulacion=false"></button>
        </div>
        <div class="modal-body">
          <div v-if="anulacionLoading" class="text-center py-3 text-muted">
            <i class="fas fa-spinner fa-spin"></i> Cargando…
          </div>
          <template v-else>
            <div class="mb-2">
              <strong>Tipo:</strong>
              <span class="ms-1">{{ anulacionDetalle.tipo || 'Sin datos' }}</span>
            </div>
            <div class="mb-2">
              <strong>Motivo:</strong>
              <textarea class="form-control mt-1" rows="3" readonly :value="anulacionDetalle.motivo || 'Sin datos'"></textarea>
            </div>
            <div v-if="anulacionError" class="alert alert-danger mt-3">
              {{ anulacionError }}
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-sm" @click="showAnulacion=false">Cerrar</button>
        </div>
      </div>
    </div>
    </div>
    </div>
  </template>

<script>
import axios from 'axios'
import Global from '@/Global'
import { getTablaDenuncias, exportDenuncias, getMesaOpciones } from '@/services/dashboardService'

export default {
  name: 'MesaDenuncias',
  data() {
    return {
      q: '',
      estado: '',
      depDenunciado: '',
      munDenunciado: '',
      usuarioAsignado: '',
      ingresadaDelegacion: '',
      tipoIngreso: '',
      periodoDenuncia: null,
      // Avanzados
      showAdvanced: false,
      unidadPertenece: '',
      sexoDenunciante: '',
      sexoDenunciado: '',
      etniaDenunciante: '',
      etniaDenunciado: '',
      edadMin: null,
      edadMax: null,
      idAnonima: null,
      idPersona: null,
      page: 1,
      pageSize: 20,
      total: 0,
      rows: [],
      estados: ['Ingresado', 'En trámite', 'Finalizado', 'Anulado'],
      exporting: false,
      opciones: { estados: [], periodos: [], usuarios: [], delegaciones: [], tiposIngreso: [], departamentos: [], municipios: [] },
      // Modal anulación (estilo similar a Direcciones Internas)
      showAnulacion: false,
      anulacionLoading: false,
      anulacionError: '',
      anulacionDetalle: { tipo: '', motivo: '' },
      modalTitulo: '',
      selectedRow: null,
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
    }
  },
  mounted() {
    this.cargar()
    this.cargarOpciones()
  },
  methods: {
    async cargarOpciones() {
      try {
        const data = await getMesaOpciones({ q: this.q || undefined })
        this.opciones = data || this.opciones
      } catch (e) { console.error('Error opciones mesa:', e) }
    },
    async cargar() {
      const params = {
        page: this.page,
        pageSize: this.pageSize,
        q: this.q || undefined,
        estado: this.estado || undefined,
        usuarioAsignado: this.usuarioAsignado || undefined,
        ingresadaDelegacion: this.ingresadaDelegacion || undefined,
        tipoIngreso: this.tipoIngreso || undefined,
        depDenunciado: this.depDenunciado || undefined,
        munDenunciado: this.munDenunciado || undefined,
        unidadPertenece: this.unidadPertenece || undefined,
        sexoDenunciante: this.sexoDenunciante || undefined,
        sexoDenunciado: this.sexoDenunciado || undefined,
        etniaDenunciante: this.etniaDenunciante || undefined,
        etniaDenunciado: this.etniaDenunciado || undefined,
        edadMin: this.edadMin || undefined,
        edadMax: this.edadMax || undefined,
        idAnonima: this.idAnonima || undefined,
        idPersona: this.idPersona || undefined,
        // Backend: agregar soporte para periodoDenuncia si se desea filtrar por año
        periodoDenuncia: this.periodoDenuncia || undefined,
      }
      try {
        const { total, data } = await getTablaDenuncias(params)
        this.total = total || 0
        this.rows = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('Error tabla denuncias:', e)
      }
    },
    buscar() { this.page = 1; this.cargar(); this.cargarOpciones() },
    limpiar() {
      this.q = ''; this.estado = ''; this.depDenunciado = ''; this.munDenunciado = ''
      this.usuarioAsignado = ''; this.ingresadaDelegacion = ''; this.tipoIngreso = ''
      this.periodoDenuncia = null
      this.unidadPertenece = ''; this.sexoDenunciante = ''; this.sexoDenunciado = ''
      this.etniaDenunciante = ''; this.etniaDenunciado = ''
      this.edadMin = null; this.edadMax = null; this.idAnonima = null; this.idPersona = null
      this.page = 1
      this.cargar(); this.cargarOpciones()
    },
    abrirAvanzado() { this.showAdvanced = true },
    selectRow(row) {
      this.selectedRow = this.selectedRow && this.selectedRow.idSicoda === row.idSicoda ? null : row
    },
    clearSelection() { this.selectedRow = null },
    async abrirAnulacion(row) {
      this.modalTitulo = 'Detalle de anulación'
      this.showAnulacion = true
      this.anulacionLoading = true
      this.anulacionError = ''
      this.anulacionDetalle = { tipo: '', motivo: '' }
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data } = await axios.get(`${Global.url}DenunciasInter/denegacion/detalle`, {
          headers,
          params: { idSicoda: row.idSicoda, usuario: this.currentUser }
        })
        const raw = data?.data || data || {}
        const tipo = raw.tipo ?? raw.tipoDenegacion ?? raw.DESCRIPCION ?? raw.TIPO ?? ''
        const motivo = raw.motivo ?? raw.motivoDenegacion ?? raw.DETALLE ?? raw.DESCRIPCION_MOTIVO ?? ''
        this.anulacionDetalle = { tipo: String(tipo).trim(), motivo: String(motivo).trim() }
      } catch (e) {
        console.error('Detalle anulación:', e)
        this.anulacionError = e?.response?.data?.mensaje || 'No se pudo obtener el detalle de la anulación.'
      } finally {
        this.anulacionLoading = false
      }
    },
    async abrirDenegacion(row) {
      this.modalTitulo = 'Detalle de denegación'
      this.showAnulacion = true
      this.anulacionLoading = true
      this.anulacionError = ''
      this.anulacionDetalle = { tipo: '', motivo: '' }
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data } = await axios.get(`${Global.url}DenunciasInter/denegacion/detalle`, {
          headers,
          params: { idSicoda: row.idSicoda, usuario: this.currentUser }
        })
        const raw = data?.data || data || {}
        const tipo = raw.tipo ?? raw.tipoDenegacion ?? raw.DESCRIPCION ?? raw.TIPO ?? ''
        const motivo = raw.motivo ?? raw.motivoDenegacion ?? raw.DETALLE ?? raw.DESCRIPCION_MOTIVO ?? ''
        this.anulacionDetalle = { tipo: String(tipo).trim(), motivo: String(motivo).trim() }
      } catch (e) {
        console.error('Detalle denegación:', e)
        this.anulacionError = e?.response?.data?.mensaje || 'No se pudo obtener el detalle de la denegación.'
      } finally {
        this.anulacionLoading = false
      }
    },
    cambiarPageSize() { this.page = 1; this.cargar() },
    formatFecha(val) {
      if (!val) return '—'
      try { return new Date(val).toLocaleString('es-GT', { dateStyle: 'short' }) }
      catch { return val }
    },
    async exportar() {
      if (this.exporting) return
      this.exporting = true
      try {
        const params = {
          q: this.q || undefined,
          estado: this.estado || undefined,
          usuarioAsignado: this.usuarioAsignado || undefined,
          ingresadaDelegacion: this.ingresadaDelegacion || undefined,
          tipoIngreso: this.tipoIngreso || undefined,
          depDenunciado: this.depDenunciado || undefined,
          munDenunciado: this.munDenunciado || undefined,
          unidadPertenece: this.unidadPertenece || undefined,
          sexoDenunciante: this.sexoDenunciante || undefined,
          sexoDenunciado: this.sexoDenunciado || undefined,
          etniaDenunciante: this.etniaDenunciante || undefined,
          etniaDenunciado: this.etniaDenunciado || undefined,
          edadMin: this.edadMin || undefined,
          edadMax: this.edadMax || undefined,
          idAnonima: this.idAnonima || undefined,
          idPersona: this.idPersona || undefined,
          periodoDenuncia: this.periodoDenuncia || undefined,
        }
        const res = await exportDenuncias(params)
        const blob = res.data
        // extrae nombre si viene en Content-Disposition
        const cd = res.headers['content-disposition'] || ''
        const match = cd.match(/filename="?([^"]+)"?/)
        const fileName = match ? match[1] : `MesaDenuncias_${new Date().toISOString().slice(0, 10)}.xlsx`

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        console.error('Error exportando:', e)
      } finally {
        this.exporting = false
      }
    },
    toCsv(rows) {
      const headers = [
        'idSicoda', 'noDenuncia', 'periodoDenuncia', 'estado', 'usuarioAsignado',
        'motivoDenuncia', 'departamentoDenunciado', 'municipioDenunciado', 'tipoIngreso',
        'idTipoDenuncia'
      ]
      const escape = v => {
        const s = v == null ? '' : String(v)
        const t = s.replace(/"/g, '""')
        return `"${t}"`
      }
      const lines = []
      lines.push(headers.join(','))
      for (const r of rows) {
        lines.push(headers.map(h => escape(r[h])).join(','))
      }
      return lines.join('\r\n')
    },
  },
}
</script>

<style scoped>
.card { border: 0; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.table { font-size: .875rem; }
.table thead th {
  text-transform: uppercase;
  letter-spacing: .2px;
}
.table-wrap thead th { position: sticky; top: 0; z-index: 1; }
.table-wrap { max-height: calc(100vh - 360px); overflow: auto; }
.table tbody tr:hover { background: #f5f7fb; }
.table thead { background: #1f2937; }
.table thead th { background: transparent; color: #fff; }
.table td, .table th { padding: .55rem .75rem; }
.modal-pre {
  white-space: pre-wrap;
  background: #f8f9fa;
  padding: .5rem;
  border-radius: .25rem;
}
/* Iconic circular buttons for status actions */
.btn-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
  border: 1px solid currentColor;
  background: #fff;
  padding: 0;
}
.btn-icon-danger { color: #dc3545; border-color: #dc3545; }
.btn-icon-danger:hover { background: #dc3545; color: #fff; }
.action-bar .btn { min-width: 180px; }
</style>