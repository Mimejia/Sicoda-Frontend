<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex align-items-center justify-content-between">
      <h5 class="mb-0">
        Direcciones del documento #{{ idDocumento }} — Denuncia #{{ denunciaLabel }}
      </h5>
      <div v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
    </div>

    <!-- Buscador -->
    <div class="px-3 py-2 border-bottom">
      <div class="input-group input-group-sm">
        <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
        <input
          class="form-control"
          v-model.trim="q"
          type="search"
          placeholder="Buscar por dirección, tipo, estado o usuario..."
        />
      </div>
    </div>

    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light sticky-top">
            <tr>
              <th style="min-width:220px;">Dirección</th>
              <th style="min-width:160px;">Tipo de dirección</th>
              <th style="min-width:130px;">Estado</th>
              <th style="width:90px;">Días</th>
              <th style="min-width:160px;">Fecha entrega</th>
              <th style="min-width:160px;">Usuario ingresa</th>
              <th style="min-width:170px;">Fecha ingresa</th>
              <th style="min-width:170px;">Usuario actualiza</th>
              <th style="min-width:180px;">Fecha actualiza</th>
              <th class="text-end" style="min-width:320px;">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!loading && itemsFiltered.length === 0">
              <td colspan="10" class="text-center text-muted py-4">Sin direcciones.</td>
            </tr>

            <tr v-for="r in itemsFiltered" :key="r.idDirecciones" :class="rowClass(r)">
              <td class="small">{{ r.direccion || r.direccionFisica || r.unidadDescripcion || '—' }}</td>
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
                <!-- Físicas: botón + tabla SIEMPRE visible -->
                <template v-if="isFisica(r)">
                  <div class="d-flex flex-wrap gap-2 justify-content-end mb-2">
                    <button
                      class="btn btn-success btn-sm"
                      :disabled="uploadBusy[r.idDirecciones]"
                      @click.prevent="agregarDocFisico(r.idDirecciones)"
                      title="Agregar documento"
                    >
                      <span v-if="uploadBusy[r.idDirecciones]" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="fa-solid fa-plus me-1"></i>
                      Agregar documento
                    </button>
                  </div>

                  <div class="df-panel text-start">
                    <div v-if="isLoadingFisicos(r.idDirecciones)" class="text-muted small p-3">
                      Cargando documentos…
                    </div>
                    <div v-else class="p-2">
                      <div class="df-table-wrap">
                        <table class="table table-sm df-table mb-0">
                          <thead>
                            <tr>
                              <th class="small text-uppercase text-muted">Nombre</th>
                              <th class="small text-uppercase text-muted" style="width:120px;">Estatus</th>
                              <th class="small text-uppercase text-muted text-end" style="width:240px;">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-if="!(docsFisicos[r.idDirecciones]?.items?.length)">
                              <td colspan="3" class="text-center text-muted py-3">Sin documentos físicos.</td>
                            </tr>
                            <tr v-for="df in docsFisicos[r.idDirecciones]?.items" :key="df.idDocumentoFisico">
                              <td class="small text-break py-2">{{ df.nombreDocumento || '—' }}</td>
                              <td class="py-2">
                                <span :class="['badge', 'ms-0', badgeFisico(df.idEstatus)]">{{ estFisicoDesc(df.idEstatus) }}</span>
                              </td>
                              <td class="text-end py-2">
                                <div class="btn-group btn-group-sm gap-1">
                                  <button
                                    class="btn btn-outline-primary"
                                    :disabled="viewingFisicoId === df.idDocumentoFisico"
                                    @click.prevent="verDocFisico(df)"
                                    title="Ver documento"
                                  >
                                    <span v-if="viewingFisicoId === df.idDocumentoFisico" class="spinner-border spinner-border-sm me-1"></span>
                                    Ver
                                  </button>
                                  <button
                                    class="btn btn-outline-danger"
                                    v-if="Number(df.idEstatus) !== 2"
                                    @click.prevent="cambiarEstatusFisico(df, 2)"
                                    title="Anular"
                                  >
                                    Anular
                                  </button>
                                  <button
                                    class="btn btn-outline-success"
                                    v-else
                                    @click.prevent="cambiarEstatusFisico(df, 1)"
                                    title="Restaurar"
                                  >
                                    Restaurar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- No físicas -->
                <template v-else>
                  <button
                    v-if="Number(r.idEstatus) === 4"
                    class="btn btn-primary btn-sm"
                    :disabled="viewingId === r.idDirecciones"
                    @click.prevent="verDocumento(r)"
                    title="Ver documento"
                  >
                    <span v-if="viewingId === r.idDirecciones" class="spinner-border spinner-border-sm me-1"></span>
                    Ver documento
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-3">
        <router-link class="btn btn-light" to="-1" @click.prevent="$router.back()">
          <i class="fas fa-arrow-left me-2"></i> Regresar
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Global from '@/Global'
import Swal from 'sweetalert2'

export default {
  name: 'DireccionesDocumento',
  data() {
    return {
      loading: false,
      items: [],
      viewingId: null,
      q: '',
      denunciaFallback: '',
      // documentos físicos
      docsFisicos: {},     // { [idDir]: { loading, items: [] } }
      viewingFisicoId: null,
      uploadBusy: {}
    }
  },
  computed: {
    idDocumento() { return Number(this.$route.params.idDocumento || 0) },
    noDenuncia() {
      const q = this.$route.query || {}
      return (
        q.noDenuncia || q.nodenuncia || q.NoDenuncia ||
        q.no_denuncia || q.denuncia || q.nd || q.den || ''
      )
    },
    denunciaLabel() {
      if (this.noDenuncia) return String(this.noDenuncia)
      const q = this.$route.query || {}
      if (q.idSicoda) return String(q.idSicoda)
      return this.denunciaFallback || '—'
    },
    itemsFiltered() {
      const q = this.q.toLowerCase()
      if (!q) return this.items
      return this.items.filter(r => {
        const dir = (r.direccion || r.direccionFisica || r.unidadDescripcion || '').toLowerCase()
        const tipo = String(r.tipoDireccionDescripcion || '').toLowerCase()
        const est = String(r.estadoDescripcion || '').toLowerCase()
        const u1 = String(r.usuarioIngresa || '').toLowerCase()
        const u2 = String(r.usuarioActualiza || '').toLowerCase()
        return dir.includes(q) || tipo.includes(q) || est.includes(q) || u1.includes(q) || u2.includes(q)
      })
    }
  },
  mounted() { this.cargar() },
  methods: {
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
        const first = this.items[0] || {}
        this.denunciaFallback = String(
          first.noDenuncia || first.nodenuncia || first.NoDenuncia ||
          first.no_denuncia || first.denuncia || first.idSicoda || ''
        )
        // cargar documentos físicos de todas las filas físicas
        this.cargarFisicosMasivo()
      } catch (e) {
        const status = e?.response?.status
        if (status === 401 || status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
        } else if (status === 404) {
          this.items = []
          this.denunciaFallback = ''
        } else {
          Swal.fire('Error', 'No se pudieron cargar las direcciones.', 'error')
          this.items = []
        }
      } finally {
        this.loading = false
      }
    },
    cargarFisicosMasivo() {
      for (const r of this.items) {
        const id = r?.idDirecciones
        if (this.isFisica(r) && id && !this.docsFisicos[id]) {
          this.cargarFisicos(id)
        }
      }
    },
    isFisica(row) {
      const idTipo = Number(row?.idTipoDireccion ?? row?.IdTipoDireccion ?? 0)
      return idTipo === 2
    },
    isLoadingFisicos(idDir) {
      return !!this.docsFisicos[idDir]?.loading
    },
    async cargarFisicos(idDirecciones) {
      const token = localStorage.getItem('token')
      this.docsFisicos = { ...this.docsFisicos, [idDirecciones]: { loading: true, items: [] } }
      try {
        const { data } = await axios.get(
          `${Global.url}procuradorDenuncias/direcciones/${idDirecciones}/documentos-fisicos`,
          { headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' } }
        )
        const items = Array.isArray(data) ? data : (data?.data || [])
        this.docsFisicos = { ...this.docsFisicos, [idDirecciones]: { loading: false, items } }
      } catch (e) {
        this.docsFisicos = { ...this.docsFisicos, [idDirecciones]: { loading: false, items: [] } }
        console.warn('No se pudieron cargar documentos físicos', e)
      }
    },

    // Validado: nombre, PDF y 20MB máx.
    async agregarDocFisico(idDirecciones) {
      const { value: result } = await Swal.fire({
        title: 'Agregar documento físico',
        html: `
          <input id="df-name" class="swal2-input" placeholder="Nombre del documento" maxlength="2000" autocomplete="off" />
          <input id="df-file" type="file" class="swal2-file" accept="application/pdf,.pdf" />
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const nameEl = document.getElementById('df-name')
          const fileEl = document.getElementById('df-file')
          const nombre = (nameEl?.value || '').trim()
          const file = fileEl?.files?.[0] || null
          if (!nombre) return Swal.showValidationMessage('Ingresa un nombre')
          if (!file) return Swal.showValidationMessage('Selecciona un archivo')
          const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
          if (!isPdf) return Swal.showValidationMessage('Solo se permiten archivos PDF')
          const max = 20 * 1024 * 1024 // 20MB
          if (file.size > max) return Swal.showValidationMessage('El archivo debe pesar máximo 20MB')
          return { nombre, file }
        }
      })
      if (!result) return
      this.uploadBusy = { ...this.uploadBusy, [idDirecciones]: true }
      try {
        const token = localStorage.getItem('token')
        const form = new FormData()
        form.append('nombreDocumento', result.nombre)
        form.append('file', result.file)
        const { data } = await axios.post(
          `${Global.url}procuradorDenuncias/direcciones/${idDirecciones}/documentos-fisicos`,
          form,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        )
        const nuevo = data?.data || data
        const prev = this.docsFisicos[idDirecciones]?.items || []
        this.docsFisicos = {
          ...this.docsFisicos,
          [idDirecciones]: { loading: false, items: [nuevo, ...prev] }
        }
        Swal.fire('Listo', 'Documento agregado.', 'success')
      } catch (e) {
        Swal.fire('Error', 'No se pudo guardar el documento.', 'error')
      } finally {
        this.uploadBusy = { ...this.uploadBusy, [idDirecciones]: false }
      }
    },

    // Ver físico: intenta endpoint seguro; si no existe, usa pathDocumento descargando como blob
    async verDocFisico(df) {
      this.viewingFisicoId = df.idDocumentoFisico
      const token = localStorage.getItem('token')
      try {
        // 1) Endpoint seguro
        const urlApi = `${Global.url}procuradorDenuncias/direcciones/documentos-fisicos/${df.idDocumentoFisico}/descargar`
        const resp = await axios.get(urlApi, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        })
        const mime = resp.headers?.['content-type'] || 'application/pdf'
        const blob = new Blob([resp.data], { type: mime })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener')
        setTimeout(() => { if (url) URL.revokeObjectURL(url) }, 10000)
      } catch (e) {
        const status = e?.response?.status
        if (status === 401 || status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
        } else if (df.pathDocumento) {
          // 2) Descargar el archivo por su path público usando el origen del API
          const fileUrl = this.resolveApiFileUrl(df.pathDocumento)
          try {
            const resp = await axios.get(fileUrl, {
              headers: { Authorization: `Bearer ${token}` },
              responseType: 'blob'
            })
            const blob = new Blob([resp.data], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank', 'noopener')
            setTimeout(() => { if (url) URL.revokeObjectURL(url) }, 10000)
          } catch {
            Swal.fire('Archivo no disponible', 'No fue posible obtener el archivo.', 'info')
          }
        } else {
          Swal.fire('Archivo no disponible', 'Este documento no tiene archivo adjunto.', 'info')
        }
      } finally {
        this.viewingFisicoId = null
      }
    },

    // Convierte un path (relativo o absoluto) a una URL absoluta usando el origen del API.
    resolveApiFileUrl(path) {
      if (!path) return ''
      try {
        // Si es absoluta, regresa igual
        if (/^https?:\/\//i.test(path)) return path
        // Construye la URL con el ORIGEN del API (no el del front)
        const apiOrigin = new URL(Global.url, window.location.href).origin
        const clean = path.startsWith('/') ? path : `/${path}`
        return `${apiOrigin}${clean}`
      } catch {
        return path
      }
    },

    // ——— No físicas ———
    async verDocumento(row) {
      if (Number(row.idEstatus) !== 4) return
      this.viewingId = row.idDirecciones
      try {
        const token = localStorage.getItem('token')
        if (row.pathDocumento) {
          const fileUrl = this.resolveApiFileUrl(row.pathDocumento)
          const resp = await axios.get(fileUrl, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          })
          const blob = new Blob([resp.data], { type: resp.headers?.['content-type'] || 'application/pdf' })
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank', 'noopener')
          setTimeout(() => { if (url) URL.revokeObjectURL(url) }, 10000)
        } else {
          const resp = await axios.get(
            `${Global.url}procuradorDenuncias/direcciones/${row.idDirecciones}/descargar`,
            { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
          )
          const blob = new Blob([resp.data], { type: resp.data?.type || 'application/pdf' })
          const url = URL.createObjectURL(blob)
          window.open(url, '_blank', 'noopener')
          setTimeout(() => { if (url) URL.revokeObjectURL(url) }, 10000)
        }
      } catch (e) {
        const status = e?.response?.status
        if (status === 404) {
          Swal.fire('Archivo no disponible', 'Esta dirección no tiene documento para ver.', 'info')
        } else if (status === 401 || status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
        } else {
          Swal.fire('Error', 'No se pudo abrir el documento.', 'error')
        }
      } finally {
        this.viewingId = null
      }
    },

    // Cambia estatus de documento físico (1=Ingresado, 2=Anulado)
    async cambiarEstatusFisico(df, idEstatus) {
      const token = localStorage.getItem('token')
      const id = df.idDocumentoFisico
      try {
        await axios.patch(
          `${Global.url}procuradorDenuncias/direcciones/documentos-fisicos/${id}/estatus`,
          { idEstatus },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        // Actualiza en memoria
        const dirId = df.idDireccion || df.idDirecciones || df.id_dir || null
        const key = Object.keys(this.docsFisicos).find(k => (this.docsFisicos[k]?.items || []).some(it => it.idDocumentoFisico === id)) || dirId
        if (key) {
          const items = (this.docsFisicos[key]?.items || []).map(it =>
            it.idDocumentoFisico === id ? { ...it, idEstatus } : it
          )
          this.docsFisicos = { ...this.docsFisicos, [key]: { loading: false, items } }
        }
      } catch (e) {
        Swal.fire('Error', 'No se pudo cambiar el estatus.', 'error')
      }
    },

    // Utilidades
    fmtFecha(v) {
      if (!v) return ''
      const d = new Date(v)
      if (isNaN(d)) return String(v)
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    rowClass(r) {
      const id = Number(r?.idEstatus)
      if (id === 2) return 'table-danger'
      if (id === 3) return 'table-primary'
      if (id === 4) return 'table-success'
      return ''
    },
    badgeEstado(id) {
      switch (Number(id)) {
        case 2: return 'text-bg-danger'
        case 3: return 'text-bg-primary'
        case 4: return 'text-bg-success'
        default: return 'text-bg-light'
      }
    },
    badgeFisico(id) {
      const v = Number(id)
      if (v === 2) return 'text-bg-danger'
      if (v === 1) return 'text-bg-success'
      return 'text-bg-secondary'
    },
    estFisicoDesc(id) {
      const v = Number(id)
      if (v === 1) return 'Ingresado'
      if (v === 2) return 'Anulado'
      return '—'
    }
  }
}
</script>

<style scoped>
.table thead th { position: sticky; top: 0; z-index: 1; }

/* Panel inline para documentos físicos, con más aire */
.df-panel {
  border: 1px solid #e9ecef;
  border-radius: .5rem;
  background: #fff;
  padding: .25rem .25rem;
  margin-top: .25rem;
}

/* Tabla de documentos físicos */
.df-table-wrap {
  max-height: 260px;
  overflow: auto;
}

.df-table thead th {
  background: #f8f9fa;
  font-weight: 600;
  letter-spacing: .02em;
}

.df-table td, .df-table th {
  vertical-align: middle;
  padding: .6rem .8rem;
}

.df-table tbody tr + tr td {
  border-top: 1px dashed #e9ecef;
}

.btn-group.gap-1 > .btn { margin-right: .25rem; }
.btn-group.gap-1 > .btn:last-child { margin-right: 0; }
</style>