<template>
  <div class="exp-dir card shadow-sm p-4"> <!-- envolvente con clase raíz para aislar estilos -->
    <div class="alert alert-dark" v-if="noDenunciaNormalizado">
      <strong>Expediente No. {{ noDenunciaNormalizado }}</strong>
    </div>

    <div class="contenedor-dos-columnas">
      <!-- Izquierda -->
      <div class="exp-dir__col columna izquierda">
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabLeft === 'informacion' }" @click="tabLeft = 'informacion'">
              Información
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabLeft === 'pdf' }" @click="tabLeft = 'pdf'">
              Documento Físico
            </button>
          </li>
        </ul>
        <div class="tab-content p-3 border rounded bg-light">
          <div v-if="tabLeft === 'informacion'">
            <ComponenteIzquierdo :id="idSicoda" :soloLectura="true" />
          </div>
          <div v-else>
            <h6 class="mb-2">Documento Físico</h6>
            <div class="pdf-container">
              <iframe v-if="documentoUrl" :src="documentoUrl" class="pdf-iframe"></iframe>
              <p v-else class="text-center mt-4">Cargando PDF…</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Derecha -->
      <div class="exp-dir__col columna derecha">
        <div class="exp-dir__acciones border rounded-3 bg-white">
          <div class="acciones-header px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
            <h6 class="mb-0 d-flex align-items-center gap-2">
              <i class="fas fa-shapes text-primary"></i>
              Acciones
            </h6>
            <div>
              <span v-if="aceptadoServidor" class="badge bg-success">Aceptado</span>
              <span v-else-if="denegadoServidor" class="badge bg-danger">Denegado</span>
              <span v-else-if="estadoRegistro === 'PREREGISTRO'" class="badge bg-info">Preregistro</span>
              <span v-else class="badge bg-secondary">Pendiente</span>
            </div>
          </div>

          <div class="p-3">
            <div class="small text-muted mb-3" v-if="!modo && accionesHabilitadas">
              Seleccione una acción para continuar.
            </div>
            <div class="d-flex gap-2 mb-3" v-if="accionesHabilitadas">
              <button class="btn w-50"
                      :class="modo === 'aprobar' ? 'btn-success' : 'btn-outline-success'"
                      @click="seleccionarModo('aprobar')">
                <i class="fas fa-check me-1"></i> Aprobar
              </button>
              <button class="btn w-50"
                      :class="modo === 'denegar' ? 'btn-danger' : 'btn-outline-danger'"
                      @click="seleccionarModo('denegar')">
                <i class="fas fa-ban me-1"></i> Denegar
              </button>
            </div>

            <!-- MODO APROBAR -->
            <div v-if="modo === 'aprobar'" class="panel-modo panel-aprobar">
              <h6 class="fw-semibold mb-3 d-flex align-items-center gap-2 gradient-title">
                <i class="fas fa-file-pdf text-danger"></i> Subir Informe
              </h6>

              <!-- Toggle Firma -->
              <div class="toggle-firma mb-3">
                <button type="button"
                        class="toggle-btn"
                        :class="{ active: subirConFirma }"
                        @click="subirConFirma = true">
                  <i class="fas fa-signature me-1"></i> Con firma
                </button>
                <button type="button"
                        class="toggle-btn"
                        :class="{ active: !subirConFirma }"
                        @click="subirConFirma = false">
                  <i class="fas fa-ban me-1"></i> Sin firma
                </button>
              </div>

              <!-- Caja archivo -->
              <div class="file-card" :class="{ 'file-card--error': archivoAceptarError }">
                <div class="file-card__header">
                  <span class="file-card__title"><i class="fas fa-upload me-1"></i> PDF (máx 10MB)</span>
                  <button class="btn btn-sm btn-outline-secondary"
                          :disabled="!archivoAceptar"
                          @click="limpiarArchivoAceptar">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="file-card__body">
                  <input ref="fileAceptar"
                         type="file"
                         accept="application/pdf"
                         class="form-control"
                         @change="onFileAceptar" />
                  <div v-if="archivoAceptar" class="file-preview">
                    <i class="fas fa-file text-muted"></i>
                    <span class="fp-name">{{ archivoAceptar.name }}</span>
                    <span class="fp-size">{{ formatSize(archivoAceptar.size) }}</span>
                  </div>
                  <div v-else class="placeholder small text-muted">
                    Seleccione un archivo PDF…
                  </div>
                  <div v-if="archivoAceptarError" class="error-text small mt-1">
                    {{ archivoAceptarError }}
                  </div>
                </div>
              </div>

              <button class="btn btn-success w-100 mt-3 btn-action"
                      :disabled="subiendo || !archivoAceptar"
                      @click="subirInformeAceptar">
                <span v-if="subiendo"><i class="fas fa-spinner fa-spin me-2"></i> Subiendo…</span>
                <span v-else><i class="fas fa-cloud-upload-alt me-2"></i> Subir Informe</span>
              </button>
            </div>

            <!-- MODO DENEGAR -->
            <div v-if="modo === 'denegar'" class="panel-modo panel-denegar">
              <h6 class="fw-semibold mb-3 d-flex align-items-center gap-2 gradient-title-denegar">
                <i class="fas fa-ban text-danger"></i> Denegar Expediente
              </h6>

              <div class="row g-2 mb-3">
                <div class="col-12">
                  <label class="form-label">Tipo de denegación</label>
                  <select class="form-select"
                          :disabled="tiposLoading"
                          v-model="tipoDenegacionSel">
                    <option value="">Seleccione...</option>
                    <option v-for="o in listaTiposDenegacion"
                            :key="o.id"
                            :value="o.id">
                      {{ o.nombre }}
                    </option>
                  </select>
                  <div class="small text-muted mt-1" v-if="tiposLoading">
                    <i class="fas fa-spinner fa-spin"></i> Cargando tipos…
                  </div>
                  <div class="invalid-msg" v-if="erroresDenegar.tipo">{{ erroresDenegar.tipo }}</div>
                </div>
                <div class="col-12">
                  <label class="form-label d-flex justify-content-between">
                    <span>Motivo</span>
                    <small class="text-muted">{{ motivoDenegacion.length }}/500</small>
                  </label>
                  <textarea class="form-control"
                            :class="{ 'is-invalid': !!erroresDenegar.motivo }"
                            rows="4"
                            maxlength="500"
                            v-model="motivoDenegacion"
                            placeholder="Explique el motivo…"></textarea>
                  <div class="invalid-msg" v-if="erroresDenegar.motivo">{{ erroresDenegar.motivo }}</div>
                </div>
              </div>

              <!-- Toggle firma denegación -->
              <div class="toggle-firma mb-3">
                <button type="button"
                        class="toggle-btn"
                        :class="{ active: denegarConFirma }"
                        @click="denegarConFirma = true">
                  <i class="fas fa-signature me-1"></i> Informe con firma
                </button>
                <button type="button"
                        class="toggle-btn"
                        :class="{ active: !denegarConFirma }"
                        @click="denegarConFirma = false">
                  <i class="fas fa-ban me-1"></i> Informe sin firma
                </button>
              </div>

              <!-- Archivo obligatorio -->
              <div class="file-card" :class="{ 'file-card--error': archivoDenegarError }">
                <div class="file-card__header">
                  <span class="file-card__title"><i class="fas fa-file-pdf me-1"></i> Informe PDF obligatorio</span>
                  <button class="btn btn-sm btn-outline-secondary"
                          :disabled="!archivoDenegar"
                          @click="limpiarArchivoDenegar">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="file-card__body">
                  <input ref="fileDenegar"
                         type="file"
                         accept="application/pdf"
                         class="form-control"
                         @change="onFileDenegar" />
                  <div v-if="archivoDenegar" class="file-preview">
                    <i class="fas fa-file text-muted"></i>
                    <span class="fp-name">{{ archivoDenegar.name }}</span>
                    <span class="fp-size">{{ formatSize(archivoDenegar.size) }}</span>
                  </div>
                  <div v-else class="placeholder small text-muted">
                    Adjunte el informe en PDF…
                  </div>
                  <div v-if="archivoDenegarError" class="error-text small mt-1">
                    {{ archivoDenegarError }}
                  </div>
                  <div class="invalid-msg" v-if="erroresDenegar.archivo">{{ erroresDenegar.archivo }}</div>
                </div>
              </div>

              <button class="btn btn-danger w-100 mt-3 btn-action"
                      :disabled="denegando || !puedeDenegar"
                      @click="denegarExpedienteUnificado">
                <span v-if="denegando"><i class="fas fa-spinner fa-spin me-2"></i> Procesando…</span>
                <span v-else><i class="fas fa-ban me-2"></i> Denegar</span>
              </button>
            </div>

            <div v-if="aceptadoLocal" class="alert alert-success mt-3 mb-0 p-2 small">
              Informe subido. Acción finalizada.
            </div>
            <div v-if="denegadoLocal" class="alert alert-danger mt-3 mb-0 p-2 small">
              Expediente denegado. Acción finalizada.
            </div>
          </div>
        </div>
      </div>
    </div>

    <router-link to="/MesadireccionesDir" class="btn btn-secondary mt-4">
      <i class="fas fa-arrow-left me-1"></i> Regresar
    </router-link>
  </div>
</template>

<script>
import ComponenteIzquierdo from '@/components/Reutilizable/ComponenteIzquierdo.vue'
import Global from '@/Global'
import axios from 'axios'

export default {
  name: 'ExpedienteDirecciones',
  components: { ComponenteIzquierdo },
  data() {
    return {
      idSicoda: Number(this.$route.params.idSicoda),
      tabLeft: 'informacion',
      expedienteRaw: null,
      documentoUrl: '',
      // Modo
      modo: '',
      // Aprobar
      archivoAceptar: null,
      archivoAceptarError: '',
      subirConFirma: false,
      subiendo: false,
      // Denegar
      tipoDenegacionSel: '',     // se convierte a Number al enviar
      motivoDenegacion: '',
      archivoDenegar: null,
      archivoDenegarError: '',
      denegarConFirma: false,
      denegando: false,
      // Estados
      estadoRegistro: 'PENDIENTE',
      aceptadoServidor: false,
      denegadoServidor: false,
      aceptadoLocal: false,
      denegadoLocal: false,
      listaTiposDenegacion: [],
      tiposLoading: false,
      erroresDenegar: { tipo: '', motivo: '', archivo: '' }
    }
  },
  computed: {
    noDenunciaNormalizado() {
      const e = this.expedienteRaw || {}
      return e.noDenuncia || e.NoDenuncia || e.nodenuncia || e.no_denuncia || e.noExpediente || e.NoExpediente || ''
    },
    accionesHabilitadas() {
      return this.estadoRegistro === 'PREREGISTRO' &&
             !this.aceptadoServidor &&
             !this.denegadoServidor &&
             !this.aceptadoLocal &&
             !this.denegadoLocal
    },
    puedeDenegar() {
      return Boolean(this.tipoDenegacionSel) &&
             this.motivoDenegacion.trim().length > 0 &&
             this.motivoDenegacion.trim().length <= 500 &&
             this.archivoDenegar &&
             !this.archivoDenegarError
    }
  },
  mounted() {
    this.cargarExpediente()
    this.cargarEstado()
    this.cargarTiposDenegacion()
  },
  methods: {
    seleccionarModo(m) {
      if (!this.accionesHabilitadas) return
      this.modo = m
    },
    async cargarExpediente() {
      try {
        const token = localStorage.getItem('token')
        const usuario = this.$store.state.userEmail
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data } = await axios.post(
          `${Global.url}DenunciasInter/expediente/cargar/${this.idSicoda}`,
          { usuarioIngreso: usuario },
          { headers }
        )
        this.expedienteRaw = data || {}
        const tipoDenu = Number(data?.tipoDenu ?? 0)
        if (tipoDenu !== 4 && data?.documentoFisico) {
          this.documentoUrl = 'data:application/pdf;base64,' + data.documentoFisico
        }
      } catch {
        this.$swal('Error', 'No se pudo cargar el expediente.', 'error')
      }
    },
    async cargarEstado() {
      try {
        const token = localStorage.getItem('token')
        const usuario = this.$store.state.userEmail
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data } = await axios.get(`${Global.url}DenunciasInter/expediente/estado/${this.idSicoda}`, {
          params: { usuario }, headers
        })
        this.estadoRegistro = String(data?.estadoRegistro || 'PENDIENTE').toUpperCase()
        this.aceptadoServidor = Boolean(data?.aceptado)
        this.denegadoServidor = Boolean(data?.denegado)
      } catch (e) {
        // Silenciar error de estado (no bloque vacío para eslint)
        console.warn('cargarEstado fallo', e?.message)
      }
    },
    async cargarTiposDenegacion() {
      this.tiposLoading = true
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data } = await axios.get(`${Global.url}DenunciasInter/tipos-denegacion`, { headers })
        const arr = Array.isArray(data) ? data
          : (Array.isArray(data?.data) ? data.data
          : (Array.isArray(data?.result) ? data.result : []))
        this.listaTiposDenegacion = arr.map(o => {
          const id = Number(
            o.ID_TIPO_DENEGACION ?? o.id ?? o.ID ?? o.idTipo ?? o.idTipoDenegacion
          )
          const nombre = String(
            o.DESCRIPCION ?? o.descripcion ?? o.nombre
          ).trim()
          return (!id || !nombre) ? null : { id, nombre }
        }).filter(Boolean)

        // Si no hay nada, notificar
        if (!this.listaTiposDenegacion.length) {
          console.warn('cargarTiposDenegacion: lista vacía. Revise claves de respuesta.')
        }
      } catch (e) {
        console.warn('cargarTiposDenegacion fallo', e?.message)
        this.listaTiposDenegacion = []
      } finally {
        this.tiposLoading = false
      }
    },
    // Archivos
    onFileAceptar(e) {
      this.archivoAceptarError = ''
      const f = e.target.files?.[0]
      this.archivoAceptar = f || null
      if (!f) return
      if (f.type !== 'application/pdf') { this.archivoAceptarError = 'Solo PDF'; this.archivoAceptar = null }
      else if (f.size > 10 * 1024 * 1024) { this.archivoAceptarError = 'Máx 10 MB'; this.archivoAceptar = null }
    },
    limpiarArchivoAceptar() {
      this.archivoAceptar = null
      this.archivoAceptarError = ''
      if (this.$refs.fileAceptar) this.$refs.fileAceptar.value = ''
    },
    onFileDenegar(e) {
      this.archivoDenegarError = ''
      this.erroresDenegar.archivo = ''
      const f = e.target.files?.[0]
      this.archivoDenegar = f || null
      if (!f) { this.erroresDenegar.archivo = 'Adjunte el informe en PDF.'; return }
      if (f.type !== 'application/pdf') {
        this.archivoDenegarError = 'Solo PDF'
        this.erroresDenegar.archivo = 'El archivo debe ser PDF.'
        this.archivoDenegar = null
      } else if (f.size > 10 * 1024 * 1024) {
        this.archivoDenegarError = 'Máx 10 MB'
        this.erroresDenegar.archivo = 'El tamaño máximo es 10 MB.'
        this.archivoDenegar = null
      }
    },
    limpiarArchivoDenegar() {
      this.archivoDenegar = null
      this.archivoDenegarError = ''
      if (this.$refs.fileDenegar) this.$refs.fileDenegar.value = ''
    },
    formatSize(b) { return (b / (1024 * 1024)).toFixed(2) + ' MB' },
    async pedirPinFirma() {
      const r = await this.$swal({
        title: 'PIN de firma',
        input: 'password',
        inputPlaceholder: 'PIN',
        inputAttributes: { maxlength: 25 },
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        inputValidator: v => {
          const s = (v || '').trim()
          if (!s) return 'PIN requerido'
          if (s.length > 25) return 'Máx 25 caracteres'
          return undefined
        }
      })
      if (r.isDismissed) return { canceled: true, pin: '' }
      return { canceled: false, pin: r.value }
    },
    getUsuario() {
      const s = this.$store?.state || {}
      return s.userEmail ||
        localStorage.getItem('userEmail') ||
        localStorage.getItem('usuario') || ''
    },
    async subirInformeAceptar() {
      if (!this.archivoAceptar) { this.archivoAceptarError = 'Seleccione PDF.'; return }
      this.subiendo = true
      try {
        const fd = new FormData()
        fd.append('idSicoda', String(this.idSicoda))
        fd.append('usuario', this.getUsuario())
        fd.append('Documento', this.archivoAceptar)
        fd.append('ConFirma', this.subirConFirma ? 'true' : 'false')
        if (this.subirConFirma) {
          const pin = await this.pedirPinFirma()
          if (pin.canceled) { this.subiendo = false; return }
          fd.append('PinFirma', pin.pin)
        }
        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'multipart/form-data' }
        if (token) headers.Authorization = `Bearer ${token}`
        const base = `${Global.url}DenunciasInter/subirInforme`
        const endpoint = this.subirConFirma ? `${base}/firmar` : base
        await axios.post(endpoint, fd, { headers })
        await this.$swal('Éxito', 'Informe enviado.', 'success')
        this.aceptadoLocal = true
        this.modo = ''
      } catch (e) {
        this.$swal('Error', e.response?.data?.mensaje || 'Falló el envío.', 'error')
      } finally {
        this.subiendo = false
      }
    },
    async denegarExpedienteUnificado() {
      // validaciones reactivas
      this.erroresDenegar.tipo = ''
      this.erroresDenegar.motivo = ''
      this.erroresDenegar.archivo = ''

      if (!this.tipoDenegacionSel) this.erroresDenegar.tipo = 'Seleccione el tipo.'
      const motivo = (this.motivoDenegacion || '').trim()
      if (!motivo) this.erroresDenegar.motivo = 'Motivo requerido.'
      else if (motivo.length > 500) this.erroresDenegar.motivo = 'Máx 500 caracteres.'
      if (!this.archivoDenegar) this.erroresDenegar.archivo = 'Adjunte el informe en PDF.'
      if (this.archivoDenegarError) this.erroresDenegar.archivo = this.archivoDenegarError

      if (this.erroresDenegar.tipo || this.erroresDenegar.motivo || this.erroresDenegar.archivo) return

      this.denegando = true
      try {
        const fd = new FormData()
        fd.append('idSicoda', String(this.idSicoda))
        fd.append('usuario', this.getUsuario())
        fd.append('idTipoDenegacion', String(Number(this.tipoDenegacionSel)))
        fd.append('motivo', motivo)
        fd.append('Documento', this.archivoDenegar)
        fd.append('ConFirma', this.denegarConFirma ? 'true' : 'false')

        if (this.denegarConFirma) {
          const pin = await this.pedirPinFirma()
          if (pin.canceled) { this.denegando = false; return }
          fd.append('PinFirma', pin.pin)
        }

        const token = localStorage.getItem('token')
        const headers = { 'Content-Type': 'multipart/form-data' }
        if (token) headers.Authorization = `Bearer ${token}`

        const base = `${Global.url}DenunciasInter/denegar`
        const endpoint = this.denegarConFirma ? `${base}/firmar` : `${base}/con-informe`
        await axios.post(endpoint, fd, { headers })

        await this.$swal('Proceso', 'Expediente denegado.', 'success')
        this.denegadoLocal = true
        this.modo = ''
      } catch (e) {
        this.$swal('Error', e.response?.data?.mensaje || 'Falló denegación.', 'error')
      } finally {
        this.denegando = false
      }
    }
  }
}
</script>

<style scoped>
/* Mantén tus estilos, pero corrige estos para no romper el componente izquierdo */

/* Layout dos columnas: no imponemos fondo/overflow en las columnas */
.contenedor-dos-columnas {
  display: flex;
  gap: 1rem;
}

/* Elimina fondo y overflow aquí; deja que el componente izquierdo maneje su propio scroll */
.exp-dir__col {
  flex: 1;
  /* Quitar: background, overflow hidden que arruinaban la barra interna */
  /* background: #fff; */      /* eliminado */
  /* overflow: hidden; */      /* eliminado */
  border-radius: 0.5rem;
}

/* Panel de acciones: alto independiente y scroll interno solo en la derecha */
.exp-dir__col.derecha .exp-dir__acciones {
  min-height: 650px;
  display: flex;
  flex-direction: column;
}

/* IMPORTANTE: no fuerzas estilos dentro del componente izquierdo ni sus tabs */
.exp-dir__col.izquierda .tab-content {
  /* Altura controlada con scroll interno (como las imágenes 3 y 4) */
  max-height: 700px;           /* ajusta si necesitas */
  overflow: auto;              /* muestra barra dentro del panel */
}

/* PDF: usa dimensiones contenidas con scroll interno del contenedor, no iframe fijo */
.pdf-container {
  /* contenedor con altura fija y scroll como antes */
  height: 600px;               /* ajusta según tu diseño anterior */
  overflow: auto;
  background: #f1f4f8;         /* leve contraste similar a las capturas */
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Evita estilos globales que cambian spacing/tipografías del componente izquierdo */
.exp-dir .acciones-header { background: #f8f9fa; border-bottom: 1px solid #dee2e6; }

/* Toggle firma: solo estilos, sin cambiar la lógica ni el markup */
.toggle-firma { display: flex; gap: .75rem; }
.toggle-btn {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  display: grid;
  grid-template-columns: 24px 1fr;
  grid-template-rows: auto auto;
  column-gap: .6rem;
  row-gap: .15rem;
  align-items: center;
  text-align: left;
  transition: .15s ease-in-out;
  font-weight: 700;
}
.toggle-btn i { grid-row: 1 / span 2; font-size: 1.1rem; }
.toggle-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  box-shadow: 0 8px 14px -6px rgba(37,99,235,.35);
}
.toggle-btn:not(.active):hover { background: #eef2f7; }

/* Select “Tipo de denegación”: mejorar legibilidad sin alterar estructura */
.form-label { font-weight: 700; color: #0f172a; }
.form-select {
  border-radius: 12px;
  border-color: #d1d5db;
  padding: .6rem .9rem;
}
.form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 .2rem rgba(37,99,235,.15);
}

/* Mensajes de ayuda/validación (ya los tienes) */
.invalid-msg { color: #dc2626; font-size: .8rem; margin-top: .25rem; }
.is-invalid { border-color: #dc2626; }
</style>