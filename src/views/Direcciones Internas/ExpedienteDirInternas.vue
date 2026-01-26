<template>
  <div class="card shadow-sm p-4">
    <div class="alert alert-dark" v-if="noDenuncia">
      <strong>Expediente No. {{ noDenuncia }}</strong>
    </div>

    <div class="contenedor-dos-columnas">
      <!-- Columna izquierda -->
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
            <button class="nav-link" :class="{ active: tabSeleccionada2 === 'firmado' }"
              @click="tabSeleccionada2 = 'firmado'">
              Documento Firmado
            </button>
          </li>
        </ul>

        <div class="tab-content p-3 border rounded bg-light">
          <div v-if="tabSeleccionada2 === 'informacion'">
            <ComponenteIzquierdo :id="id" :soloLectura="true" />
          </div>

          <div v-else-if="tabSeleccionada2 === 'provInicialPdf'">
            <h4>Documento Físico</h4>
            <div class="pdf-container">
              <PdfVisualizer :base64="documentoFisico" />
            </div>
          </div>

          <div v-else-if="tabSeleccionada2 === 'firmado'">
            <h4>Documento Firmado</h4>
            <div v-if="!idDireccion" class="alert alert-light border">
              No hay id de dirección. Regrese a la bandeja y elija un registro.
            </div>
            <div v-else class="pdf-container">
              <template v-if="firmadoLoading">
                <p class="text-center mt-4">Cargando documento firmado…</p>
              </template>
              <template v-else>
                <iframe v-if="firmadoUrl" :src="firmadoUrl" class="pdf-iframe" title="Documento Firmado"></iframe>
                <div v-else class="alert alert-info">{{ firmadoError || 'Sin documento firmado disponible.' }}</div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- /Columna izquierda -->

      <!-- Columna derecha -->
      <div class="columna derecha">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-3">Cargar documento</h5>

            <div
              :class="['dropzone-metronic', dragActive ? 'dz-dragover' : '']"
              @dragover.prevent="dragActive = true"
              @dragleave.prevent="dragActive = false"
              @drop.prevent="onDrop"
              @click="$refs.fileInput?.click()"
            >
              <div class="dz-message needsclick text-center">
                <i class="fas fa-file-upload fs-2hx text-primary d-block mb-2"></i>
                <span class="fw-semibold">Arrastra y suelta el archivo aquí</span>
                <div class="text-muted">o haz clic para seleccionar</div>
                <div class="small text-muted mt-2">Tipos: PDF (máx. 20 MB)</div>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              class="d-none"
              :accept="acceptTypes"
              @change="onFileChange"
            />

            <div v-if="selectedFile" class="alert alert-light border d-flex align-items-center mt-3">
              <i class="fas fa-file me-2 text-primary"></i>
              <div class="flex-grow-1">
                <div class="fw-semibold">{{ selectedFile.name }}</div>
                <small class="text-muted">{{ prettySize(selectedFile.size) }}</small>
              </div>
              <button class="btn btn-sm btn-icon btn-light-danger" @click="clearSelected" :disabled="uploading">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div v-if="uploading" class="progress mt-3" style="height: 8px;">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-light-primary" :disabled="!canUpload" @click="uploadDocumento(false)">
                <i class="fas fa-cloud-upload-alt me-2"></i> Subir sin firma electrónica
              </button>
              <button class="btn btn-primary" :disabled="!canUpload" @click="uploadDocumento(true)">
                <i class="fas fa-shield-alt me-2"></i> Subir con firma electrónica
              </button>
            </div>

            <div v-if="uploadMsg" :class="['alert mt-3', uploadError ? 'alert-danger' : 'alert-success']">
              {{ uploadMsg }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <router-link to="/mesaDirecciones" class="btn btn-secondary mt-4">
      <i class="fas fa-arrow-left me-2"></i> Regresar a la Bandeja
    </router-link>
  </div>
</template>

<script>
import ComponenteIzquierdo from '@/components/Reutilizable/ComponenteIzquierdo.vue'
import PdfVisualizer from '@/components/Reutilizable/PdfVisualizer.vue'
import Swal from 'sweetalert2'
import Global from '@/Global'
import axios from 'axios'

export default {
  name: 'ExpedienteDirInternas',
  components: { ComponenteIzquierdo, PdfVisualizer },
  props: {
    id: { type: [String, Number], required: true }, // idSicoda
    idDireccion: { type: [String, Number], default: null } // id de dirección
  },
  data() {
    return {
      tabSeleccionada2: 'informacion',
      noDenuncia: null,
      documentoUrl: '',
      documentoFisico: '',
      // Documento firmado
      firmadoUrl: '',
      firmadoError: '',
      firmadoLoading: false,
      // Upload derecha
      selectedFile: null,
      dragActive: false,
      uploading: false,
      uploadProgress: 0,
      uploadMsg: '',
      uploadError: false
    }
  },
  computed: {
    currentUser() {
      return (
        this.$store?.state?.userEmail ||
        localStorage.getItem('userEmail') ||
        localStorage.getItem('usuario') ||
        ''
      )
    },
    acceptTypes() {
      return '.pdf'
    },
    canUpload() {
      return !!this.selectedFile && !!this.idDireccion && !this.uploading
    }
  },
  async mounted() {
    const nd = this.$route?.query?.nd
    if (nd) this.noDenuncia = nd
    await this.cargarDatosExpediente()
    if (this.idDireccion) this.cargarDocumentoFirmado().catch(() => {})
  },
  watch: {
    idDireccion() {
      this.cargarDocumentoFirmado().catch(() => {})
    },
    tabSeleccionada2(val) {
      if (val === 'firmado' && this.idDireccion && !this.firmadoUrl && !this.firmadoLoading) {
        this.cargarDocumentoFirmado().catch(() => {})
      }
    }
  },
  methods: {
    async cargarDatosExpediente() {
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.post(
          `${Global.url}procuradorDenuncias/validacion/${this.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (resp.data?.documentoFisico) {
          this.documentoFisico = resp.data.documentoFisico
        } else {
          this.documentoFisico = ''
        }
        if (resp.data?.denu) this.noDenuncia = resp.data.denu
      } catch (error) {
        const resp = error.response || {}
        const msg = resp.data || 'Ocurrió un error.'
        const title = resp.status === 400 ? 'Acceso Denegado' : resp.status === 404 ? 'No encontrado' : 'Error'
        const icon = resp.status === 400 ? 'warning' : 'error'
        await Swal.fire(title, msg, icon)
        if (resp.status === 400 || resp.status === 404) {
          this.$router.push('/mesaDirecciones')
        }
      }
    },
    buildPdfSrc(data) {
      const b64 = data?.documentoBase64 || data?.pdfBase64 || data?.base64 || data?.DocumentoBase64
      const url = data?.documentoUrl || data?.url || data?.ruta || data?.RutaDocumento
      if (b64 && typeof b64 === 'string') return `data:application/pdf;base64,${b64}`
      if (url && typeof url === 'string') {
        if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
        return `${Global.url.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
      }
      return ''
    },
    async cargarDocumentoFirmado() {
      this.firmadoError = ''
      this.firmadoUrl = ''
      if (!this.idDireccion) return
      this.firmadoLoading = true
      try {
        const token = localStorage.getItem('token')
        const url = `${Global.url}DenunciasDirecciones/direcciones-internas/${this.idDireccion}/documento-firmado`
        const { data } = await axios.get(url, {
          params: { usuario: this.currentUser }, // mientras el backend lo requiere
          headers: { Authorization: `Bearer ${token}` }
        })
        this.firmadoUrl = this.buildPdfSrc(data)
        if (!this.firmadoUrl) this.firmadoError = 'El servicio no devolvió un PDF válido.'
      } catch (e) {
        this.firmadoError = e?.response?.data || 'No se pudo obtener el documento firmado.'
      } finally {
        this.firmadoLoading = false
      }
    },
    onFileChange(e) {
      const f = e.target.files && e.target.files[0]
      this.setSelectedFile(f)
    },
    onDrop(ev) {
      this.dragActive = false
      const f = ev.dataTransfer?.files && ev.dataTransfer.files[0]
      this.setSelectedFile(f)
    },
    isPdfFile(f) {
      if (!f) return false
      const byMime = f.type === 'application/pdf'
      const byName = /\.pdf$/i.test(f.name || '')
      return byMime || byName
    },
    setSelectedFile(f) {
      this.uploadMsg = ''
      this.uploadError = false
      if (!f) {
        this.selectedFile = null
        return
      }
      const okType = this.isPdfFile(f)
      const okSize = f.size <= 20 * 1024 * 1024
      if (!okType) {
        Swal.fire('Archivo no permitido', 'Solo PDF (.pdf).', 'warning')
        return
      }
      if (!okSize) {
        Swal.fire('Archivo muy grande', 'Máximo 20 MB.', 'warning')
        return
      }
      this.selectedFile = f
    },
    clearSelected() {
      this.selectedFile = null
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
    },
    prettySize(bytes) {
      if (bytes == null) return ''
      const mb = bytes / (1024 * 1024)
      if (mb >= 1) return mb.toFixed(2) + ' MB'
      const kb = bytes / 1024
      return Math.round(kb) + ' KB'
    },
    async uploadDocumento(conFirma) {
      if (!this.canUpload) return
      if (!this.isPdfFile(this.selectedFile)) {
        return Swal.fire('Archivo no permitido', 'Solo PDF (.pdf).', 'warning')
      }
      if (this.selectedFile.size > 20 * 1024 * 1024) {
        return Swal.fire('Archivo muy grande', 'Máximo 20 MB.', 'warning')
      }

      let pin = ''
      if (conFirma) {
        const { value, isDismissed } = await Swal.fire({
          title: 'PIN de firma electrónica',
          input: 'password',
          inputLabel: 'Ingrese su PIN',
          inputAttributes: { maxlength: 12, autocapitalize: 'off', autocorrect: 'off' },
          showCancelButton: true,
          confirmButtonText: 'Firmar y subir',
          cancelButtonText: 'Cancelar'
        })
        if (isDismissed) return
        pin = value || ''
        if (!pin) return
      }

      try {
        const token = localStorage.getItem('token')
        const fd = new FormData()
        fd.append('archivo', this.selectedFile)
        fd.append('idSicoda', String(this.id))
        fd.append('idDireccion', String(this.idDireccion))
        fd.append('usuario', this.currentUser)
        if (conFirma) fd.append('pin', pin)

        const base = `${Global.url}DenunciasDirecciones/direcciones-internas/${this.idDireccion}`
        const url = conFirma ? `${base}/documentos/firmar` : `${base}/documentos`

        this.uploading = true
        this.uploadProgress = 0
        const { data } = await axios.post(url, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          params: { usuario: this.currentUser },
          onUploadProgress: (e) => {
            if (e.total) this.uploadProgress = Math.round((e.loaded / e.total) * 100)
          }
        })

        this.uploadMsg = data?.mensaje || (conFirma ? 'Documento firmado y cargado.' : 'Documento cargado.')
        this.uploadError = false
        this.clearSelected()

        await Swal.fire({
          icon: 'success',
          title: conFirma ? 'Documento firmado y cargado' : 'Documento cargado',
          timer: 1600,
          showConfirmButton: false
        })
        this.$router.push('/mesaDirecciones')
      } catch (err) {
        this.uploadMsg = err?.response?.data || 'No se pudo cargar el documento.'
        this.uploadError = true
      } finally {
        this.uploading = false
      }
    }
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

/* Dropzone estilo Metronic */
.dropzone-metronic {
  border: 2px dashed #e4e6ef;
  border-radius: 0.75rem;
  background: #f9fafb;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.dropzone-metronic:hover,
.dropzone-metronic.dz-dragover {
  border-color: #009ef7;
  background: #eef6ff;
}
</style>
