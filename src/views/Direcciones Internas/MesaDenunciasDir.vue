<template>
  <div class="card shadow-sm p-4">
    <h1 style="text-align: center;">Direcciones Internas</h1>
    <br>

    <div class="row mb-3">
      <div class="col-md-3">
        <select v-model="campoFiltro" class="form-select">
          <option value="">-- Seleccione un campo --</option>
          <option value="nodenuncia">N° Denuncia</option>
          <option value="denunciado">Denunciado</option>
          <option value="departamento">Departamento</option>
          <option value="municipio">Municipio</option>
          <option value="motivo">Motivo</option>
          <option value="direccion">Dirección</option>
          <option value="periodo">Periodo</option>
          <option value="tipoDenuncia">Tipo de Denuncia</option>
          <option value="anio">Año</option>
          <option value="mes">Mes</option>
        </select>
      </div>

      <div class="col-md-4">
        <v-select
          v-if="campoFiltro"
          v-model="filtro"
          :options="opcionesFiltro"
          label="Filtro"
          placeholder="Seleccione o escriba un valor"
          :filterable="true"
          :reduce="val => val"
          class="form-control"
        />
      </div>

      <div class="col-md-2">
        <button @click="filtrar" class="btn btn-filtrar w-100">Filtrar</button>
      </div>

      <div class="col-md-2">
        <button @click="limpiarFiltros" class="btn btn-limpiar w-100">Limpiar</button>
      </div>
    </div>

    <div class="d-flex justify-content-end mb-3">
      <div class="custom-dropdown">
        <button class="custom-dropdown-button" @click.prevent="openBaseRegistro">Nuevo Registro ▶</button>
        <ul class="custom-dropdown-menu">
          <li v-for="opt in opcionesTp" :key="opt.tp">
            <a class="dropdown-item" :href="registroHref(opt.tp)" target="_blank" rel="noopener">
              {{ opt.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered">
        <thead class="thead-dark" style="text-align: center;">
          <tr>
            <th>No de Denuncia</th>
            <th>Estado</th>
            <th>Denunciante</th>
            <th>Denunciado</th>
            <th>Dirección</th>
            <th>Municipio</th>
            <th>Departamento</th>
            <th>Motivo</th>
            <th>Tipo de Denuncia</th>
            <th>Denuncia Similar</th>
          </tr>
        </thead>
        <tbody style="text-align: center;">
          <tr v-for="denuncia in denuncias" :key="denuncia.idSicoda">
            <td><strong>{{ denuncia.noDenuncia }}</strong></td>

            <td style="white-space: pre-line; max-width: 180px;">
              <div class="d-flex flex-column align-items-center">
                <div class="text-center mb-2">{{ denuncia.estado }}</div>
                <br>
                <button class="btn btn-sm btn-outline-primary" @click="irAHistorial(denuncia.idSicoda)" title="Ver historial de estados">
                  <i class="fas fa-history"></i>
                </button>
                <!-- Abrir expediente SOLO si está en Pre Registro (idEstatus/idEstado === 11) -->
                <button
                  v-if="esPreRegistro(denuncia)"
                  class="btn btn-sm btn-outline-success mt-2"
                  @click="irAExpediente(denuncia.idSicoda)"
                  title="Abrir expediente">
                  <i class="fas fa-folder-open"></i>
                </button>
                <!-- NUEVO: Ver detalle de denegación -->
                <button
                  v-if="esDenegada(denuncia)"
                  class="btn btn-sm btn-outline-danger mt-2"
                  @click="abrirModalDenegacion(denuncia)"
                  title="Ver motivo de denegación">
                  <i class="fas fa-ban"></i>
                </button>
              </div>
            </td>

            <td>{{ denuncia.denunciante }}</td>
            <td>{{ denuncia.denunciado }}</td>
            <td class="col-direccion">{{ denuncia.direccionActividad }}</td>
            <td class="col-municipio">{{ denuncia.municipioDenunciado }}</td>
            <td class="col-departamento">{{ denuncia.departamentoDenunciado }}</td>
            <td class="col-motivo">{{ denuncia.motivoDenuncia }}</td>

            <td class="text-center align-middle">
              <div class="tipo-denuncia-wrapper">{{ denuncia.descripcionDenuncia }}</div>
            </td>

            <td style="white-space: pre-line; max-width: 180px;">
              <div class="d-flex flex-column align-items-center">
                <div class="text-center mb-2">{{ formatDenuncias(denuncia.denunciaSimilar) }}</div>
                <button v-if="denuncia.denunciaSimilar !== null" class="btn btn-icon btn-sm btn-success" @click="verDetalle(denuncia)">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- NUEVO: Modal Detalle de Denegación -->
    <div v-if="modalDenegacionVisible" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-card">
          <div class="modal-header">
            <h5 class="m-0"><i class="fas fa-ban text-danger me-2"></i>Detalle de denegación</h5>
            <button class="btn-close" aria-label="Cerrar" @click="cerrarModalDenegacion"></button>
          </div>
          <div class="modal-body">
            <div v-if="modalDenegacionLoading" class="text-center py-4 text-muted">
              <i class="fas fa-spinner fa-spin"></i> Cargando…
            </div>
            <template v-else>
              <div class="mb-2">
                <strong>Tipo:</strong>
                <span class="ms-1">{{ denegacionDetalle.tipo || 'Sin datos' }}</span>
              </div>
              <div>
                <strong>Motivo:</strong>
                <pre class="modal-pre">{{ denegacionDetalle.motivo || 'Sin datos' }}</pre>
              </div>
              <div v-if="modalDenegacionError" class="alert alert-danger mt-3">
                {{ modalDenegacionError }}
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cerrarModalDenegacion">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <button class="btn btn-secondary" :disabled="pagina === 1" @click="pagina--; cargarDenuncias()">Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }}</span>
      <button class="btn btn-secondary" :disabled="pagina === totalPaginas" @click="pagina++; cargarDenuncias()">Siguiente</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Global from '@/Global'
import Swal from 'sweetalert2'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'MesaDenunciasDir',
  components: { 'v-select': vSelect },
  data() {
    return {
      denuncias: [],
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      pageSize: 10,
      filtro: '',
      campoFiltro: '',
      opcionesFiltro: [],
      opcionesTp: [
        { tp: '1', label: 'Registro Usuarios Externos' },
        { tp: '3', label: 'Registro Inspección' }
      ],
      // Si quieres abrir fuera del SPA, coloca aquí la URL base externa. Ej:
      // registroBase: 'https://mi-dominio/registro-denuncia'
      registroBase: '',
      modalDenegacionVisible: false,
      modalDenegacionLoading: false,
      modalDenegacionError: '',
      denegacionDetalle: { tipo: '', motivo: '' }
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
  watch: {
    campoFiltro(newCampo) {
      if (!newCampo) {
        this.opcionesFiltro = []
        return
      }
      const token = localStorage.getItem('token')
      axios.get(`${Global.url}DenunciasInter/valoresFiltro`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { campo: newCampo, usuario: this.currentUser }
      })
      .then(res => {
        this.opcionesFiltro = Array.isArray(res.data) ? res.data : []
      })
      .catch(err => {
        console.error('Error al cargar opciones de filtro:', err)
      })
    }
  },
  mounted() {
    this.cargarDenuncias()
  },
  methods: {
    verDetalle(denuncia) {
      if (denuncia.denunciaSimilar && denuncia.denunciaSimilar.trim() !== '') {
        this.$router.push({ path: `/similitudes/${denuncia.idSicoda}` })
      } else {
        Swal.fire({
          title: `Detalle de ${denuncia.noDenuncia}`,
          text: `Motivo: ${denuncia.motivoDenuncia}`,
          icon: 'info'
        })
      }
    },
    irAHistorial(idSicoda) {
      this.$router.push({ name: 'HistorialEstados', params: { idSicoda } })
    },
    irAExpediente(idSicoda) {
      this.$router.push({ name: 'ExpedienteDir', params: { idSicoda } })
    },
    async cargarDenuncias() {
      try {
        const token = localStorage.getItem('token')
        const params = {
          page: this.pagina,
          pageSize: this.pageSize,
          usuario: this.currentUser
        }

        if (this.filtro && this.campoFiltro) {
          if (['anio', 'mes', 'tipoDenuncia'].includes(this.campoFiltro)) {
            params[this.campoFiltro] = parseInt(this.filtro)
          } else {
            params.campo = this.campoFiltro
            params.filtro = this.filtro
          }
        }

        const response = await axios.get(`${Global.url}DenunciasInter/listar`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        })

        this.denuncias = Array.isArray(response.data?.data) ? response.data.data : []
        this.total = Number(response.data?.total || 0)
        this.totalPaginas = Math.max(1, Math.ceil(this.total / this.pageSize))

        if (this.denuncias.length === 0 && this.filtro && this.campoFiltro) {
          Swal.fire('Sin resultados', 'No se encontraron denuncias para ese filtro.', 'info')
        }
      } catch (error) {
        console.error('Error al cargar denuncias:', error)
        Swal.fire('Error', 'No se pudieron cargar las denuncias.', 'error')
      }
    },
    filtrar() {
      if (!this.campoFiltro || !String(this.filtro).trim()) {
        Swal.fire('Falta información', 'Debe seleccionar un campo y un valor para filtrar.', 'warning')
        return
      }
      this.pagina = 1
      this.cargarDenuncias()
    },
    limpiarFiltros() {
      this.filtro = ''
      this.campoFiltro = ''
      this.pagina = 1
      this.opcionesFiltro = []
      this.cargarDenuncias()
    },
    formatDenuncias(denuncias) {
      if (!denuncias) return ''
      return String(denuncias).split(',').map(d => d.trim()).join('\n')
    },
    registroHref(tp) {
      // Si se configuró una URL externa, usarla
      if (this.registroBase && /^https?:\/\//i.test(this.registroBase)) {
        const u = new URL(this.registroBase)
        if (tp != null) u.searchParams.set('tpd', String(tp))
        return u.toString()
      }
      // Default: ruta interna del SPA con query tpd
      const resolved = this.$router.resolve({ name: 'RegistroDenuncia', query: tp != null ? { tpd: tp } : {} })
      return resolved.href
    },
    openBaseRegistro() {
      const url = this.registroHref(null)
      window.open(url, '_blank', 'noopener')
    },
    esPreRegistro(denuncia) {
      // Regla principal: estado numérico 11 = Pre Registro
      const idNum = Number(denuncia?.idEstado ?? denuncia?.idEstatus ?? denuncia?.IdEstatusDenu)
      if (!Number.isNaN(idNum)) return idNum === 11
      // Fallback por texto del estado si no viene el ID
      const txt = String(denuncia?.estado || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ').trim()
      return txt === 'pre registro' || txt === 'pre_registro' || txt === 'pre-registro'
    },
    // NUEVO: detectar si está denegada (por id o texto)
    esDenegada(denuncia) {
      const idNum = Number(denuncia?.idEstado ?? denuncia?.idEstatus ?? denuncia?.IdEstatusDenu)
      if (!Number.isNaN(idNum)) return [12, 13, 99].includes(idNum) // ajusta los IDs de “Denegada”
      const txt = String(denuncia?.estado || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ').trim()
      return txt.includes('denegad') || txt.includes('rechazad')
    },
    // NUEVO: abrir modal y pedir detalle al backend
    async abrirModalDenegacion(denuncia) {
      this.modalDenegacionVisible = true
      this.modalDenegacionLoading = true
      this.modalDenegacionError = ''
      this.denegacionDetalle = { tipo: '', motivo: '' }
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        // Propuesta de endpoint/params:
        // GET DenunciasInter/denegacion/detalle?idSicoda={id}&usuario={usuario}
        const { data } = await axios.get(`${Global.url}DenunciasInter/denegacion/detalle`, {
          headers,
          params: { idSicoda: denuncia.idSicoda, usuario: this.currentUser }
        })
        const raw = data?.data || data || {}
        const tipo = raw.tipo ?? raw.tipoDenegacion ?? raw.DESCRIPCION ?? raw.TIPO ?? ''
        const motivo = raw.motivo ?? raw.motivoDenegacion ?? raw.DETALLE ?? raw.DESCRIPCION_MOTIVO ?? ''
        this.denegacionDetalle = { tipo: String(tipo).trim(), motivo: String(motivo).trim() }
      } catch (e) {
        console.error('Detalle denegación:', e)
        this.modalDenegacionError = e?.response?.data?.mensaje || 'No se pudo obtener el detalle de la denegación.'
      } finally {
        this.modalDenegacionLoading = false
      }
    },
    cerrarModalDenegacion() {
      this.modalDenegacionVisible = false
    }
  }
}
</script>

<style scoped>
.btn-filtrar { background-color: #287ec4; color: white; border: none; transition: background-color 0.3s ease; }
.btn-filtrar:hover { background-color: #154e7e; }
.btn-limpiar { background-color: #e0e0e0; color: #333; border: none; transition: background-color 0.3s ease; }
.btn-limpiar:hover { background-color: #bdbdbd; }
.col-motivo { font-size: 0.95rem; max-width: 400px; min-width: 350px; white-space: pre-wrap; word-wrap: break-word; }
.col-direccion { font-size: 0.95rem; max-width: 200px; min-width: 150px; white-space: pre-wrap; word-wrap: break-word; }
.custom-dropdown { position: relative; display: inline-block; }
.custom-dropdown-button { background-color: #0BB783; color: white; padding: 0.5rem 1rem; border: none; cursor: pointer; font-size: 1rem; border-radius: 0.375rem; }
.custom-dropdown-menu { display: none; position: absolute; right: 0; margin-top: 0.25rem; background: white; border: 1px solid #ddd; border-radius: 0.25rem; min-width: 10rem; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1); z-index: 1000; list-style: none; padding: 0.25rem 0; }
.custom-dropdown-menu li + li { margin-top: 0.25rem; }
.custom-dropdown-menu a { display: block; padding: 0.5rem 1rem; color: #333; text-decoration: none; }
.custom-dropdown-menu a:hover { background: #f5f5f5; }
.custom-dropdown:hover .custom-dropdown-menu { display: block; }

/* Modal simple */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-wrapper { width: 100%; max-width: 640px; }
.modal-card { background: #fff; border-radius: .75rem; overflow: hidden; box-shadow: 0 20px 55px rgba(0,0,0,.25); }
.modal-header, .modal-footer { padding: .9rem 1rem; background: #f8fafc; border-bottom: 1px solid #edf2f7; }
.modal-footer { border-top: 1px solid #edf2f7; border-bottom: 0; }
.modal-body { padding: 1rem; }
.btn-close { border: 0; background: transparent; font-size: 1.2rem; line-height: 1; opacity: .6; }
.btn-close:hover { opacity: .9; }
.modal-pre { white-space: pre-wrap; background: #f8fafc; padding: .75rem; border-radius: .5rem; border: 1px solid #e5e7eb; margin-top: .25rem; }
</style>