<template>
  <div class="card shadow-sm">
    <div class="card-header d-flex align-items-center justify-content-between">
      <h5 class="mb-0">Historial del documento #{{ idDocumento }}</h5>
      <div v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
    </div>

    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover table-striped align-middle mb-0">
          <thead class="table-light sticky-top">
            <tr>
              <th style="width: 40px;">#</th>
              <th>Nombre</th>
              <th>Comentario</th>
              <th style="width: 160px;">Estado</th>
              <th style="width: 170px;">Usuario</th>
              <th style="width: 170px;">Fecha</th>
              <th style="width: 130px;" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && versiones.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Sin versiones registradas.</td>
            </tr>

            <tr v-for="(v, idx) in versiones" :key="v.idDetalle"
                :class="{ 'table-secondary': Number(v.estadoId) === 10 }">
              <td class="text-muted small">{{ idx + 1 }}</td>
              <td class="fw-semibold">{{ v.nombreDocumento }}</td>
              <td class="small">
                <span v-if="v.comentario && v.comentario.length <= 120">{{ v.comentario }}</span>
                <span v-else-if="v.comentario" :title="v.comentario">{{ v.comentario.slice(0, 120) + '…' }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span :class="['badge', badgeForEstado(v.estadoId)]">{{ v.estado }}</span>
              </td>
              <td><span class="badge text-bg-secondary">{{ v.usuarioIngresa }}</span></td>
              <td><span class="text-muted small">{{ fmtFecha(v.fechaIngresa) }}</span></td>
              <td class="text-end">
                <button class="btn btn-primary btn-sm"
                        :disabled="downloadingId === v.idDetalle"
                        @click.prevent="descargar(v)"
                        title="Descargar">
                  <span v-if="downloadingId === v.idDetalle" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fa-solid fa-download"></i>
                </button>
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
import Swal from 'sweetalert2'
import Global from '@/Global'

export default {
  name: 'HistorialDocumento',
  props: {
    idDocumento: { type: [String, Number], required: true }
  },
  data() {
    return {
      loading: false,
      downloadingId: null,
      versiones: []
    }
  },
  mounted() {
    this.cargar()
  },
  methods: {
    async cargar() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          `${Global.url}procuradorDenuncias/documentos/${this.idDocumento}/historial2`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.versiones = (data?.data || []).map(x => ({
          idDetalle: x.idDetalle,
          idDocumento: x.idDocumento,
          nombreDocumento: x.nombreDocumento,
          comentario: x.comentario,
          usuarioIngresa: x.usuarioIngresa,
          fechaIngresa: x.fechaIngresa,
          estadoId: x.estadoId,
          estado: x.estado
        }))
      } catch (e) {
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
        } else {
          Swal.fire('Error', 'No se pudo cargar el historial.', 'error')
        }
      } finally {
        this.loading = false
      }
    },

    async descargar(v) {
      this.downloadingId = v.idDetalle
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.get(
          `${Global.url}procuradorDenuncias/documentos/detalle/${v.idDetalle}/descargar`,
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
        )

        let fileName = v.nombreDocumento || 'documento.docx'
        const cd = resp.headers['content-disposition']
        if (cd) {
          const match = /filename="?([^"]+)"?/.exec(cd)
          if (match && match[1]) fileName = match[1]
        }

        const blob = new Blob([resp.data], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        if (e.response?.status === 404) {
          Swal.fire('No encontrado', 'Archivo no disponible en el servidor.', 'warning')
        } else if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
        } else {
          Swal.fire('Error', 'No se pudo descargar la versión.', 'error')
        }
      } finally {
        this.downloadingId = null
      }
    },

    fmtFecha(value) {
      if (!value) return ''
      const dt = new Date(value)
      if (isNaN(dt)) return value
      const pad = n => String(n).padStart(2, '0')
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    },

    badgeForEstado(estadoId) {
      switch (Number(estadoId)) {
        case 1: return 'text-bg-primary'
        case 4: return 'text-bg-warning'
        case 5: return 'text-bg-info'
        case 6: return 'text-bg-success'
        case 7: return 'text-bg-info'
        case 8: return 'text-bg-secondary'
        case 9: return 'text-bg-dark'
        case 10: return 'text-bg-secondary'
        default: return 'text-bg-light'
      }
    }
  }
}
</script>

<style scoped>
.table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
