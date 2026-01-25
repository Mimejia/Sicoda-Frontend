<template>
  <div>   <!-- raíz único: envuelve card + modal -->
    <div class="card">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h5 class="mb-0">Documentos del expediente</h5>
        <div v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th style="width: 40px;"></th>
                <th>Nombre</th>
                <th style="width: 180px;">Usuario</th>
                <th style="width: 170px;">Fecha</th>
                <th style="width: 180px;">Tipo</th>
                <th style="width: 170px;">Estado</th>
                <th style="width: 560px;" class="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="!loading && docs.length === 0">
                <td colspan="7" class="text-center text-muted py-4">Sin documentos para este expediente.</td>
              </tr>

              <tr v-for="doc in docs" :key="doc.idDocumento" :class="rowClass(doc)">
                <td class="text-center">
                  <i class="fa-solid fa-file-word fa-lg text-primary" title="Word"></i>
                </td>

                <td class="fw-semibold">{{ doc.nombreDocumento }}</td>

                <td>
                  <span class="badge text-bg-secondary">{{ doc.usuarioIngresa }}</span>
                </td>

                <td>
                  <span class="text-muted small">{{ fmtFecha(doc.fechaIngresa) }}</span>
                </td>

                <td>
                  <span class="text-muted">{{ doc.tipo || '—' }}</span>
                </td>

                <td>
                  <span :class="['badge', badgeForEstado(getEstadoId(doc))]">{{ estadoTexto(doc) }}</span>

                  <!-- Estado 4: correcciones -->
                  <div v-if="Number(getEstadoId(doc)) === 4 && doc.comentarioCorreccion" class="mt-1 small text-warning text-start">
                    <div><strong>Anotación:</strong> {{ doc.comentarioCorreccion }}</div>
                    <div v-if="doc.usuarioActualiza"><strong>Por:</strong> {{ doc.usuarioActualiza }}</div>
                    <div v-if="doc.fechaActualiza"><strong>Fecha:</strong> {{ fmtFecha(doc.fechaActualiza) }}</div>
                  </div>

                  <!-- Estado 10: anulado -->
                  <div v-if="Number(getEstadoId(doc)) === 10" class="mt-1 small text-danger text-start">
                    <div><strong>Motivo:</strong> {{ doc.motivoAnulacion || 'Sin motivo' }}</div>
                    <div><strong>Anulado por:</strong> {{ doc.usuarioActualiza || '—' }}</div>
                  </div>
                </td>

                <td class="text-end" :style="isRowBusy(doc.idDocumento) ? 'pointer-events:none; opacity:.6;' : ''">
                  <!-- Historial (siempre) -->
                  <button class="btn btn-light btn-sm me-1" v-if="allowedActions(doc).historial"
                    @click.prevent="verHistorial(doc)" title="Historial">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                  </button>

                  <!-- Editar -->
                  <button class="btn btn-warning btn-sm me-1" v-if="allowedActions(doc).editar"
                    :disabled="isRowBusy(doc.idDocumento) || editingId === doc.idDocumento"
                    @click.prevent="editar(doc)" title="Editar">
                    <span v-if="editingId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-pen-to-square"></i>
                  </button>

                  <!-- Anular -->
                  <button class="btn btn-danger btn-sm me-1" v-if="allowedActions(doc).anular"
                    :disabled="isRowBusy(doc.idDocumento)" @click.prevent="anular(doc)" title="Anular">
                    <i class="fa-solid fa-ban"></i>
                  </button>

                  <!-- Enviar -->
                  <button class="btn btn-success btn-sm me-1" v-if="allowedActions(doc).enviar"
                    :disabled="isRowBusy(doc.idDocumento) || sendingId === doc.idDocumento"
                    @click.prevent="enviar(doc)" title="Enviar">
                    <span v-if="sendingId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-paper-plane"></i>
                  </button>

                  <!-- NUEVO: Trasladar a finalizado (actor 1, estado 7, tipo 2 o 3) -->
                  <button class="btn btn-outline-secondary btn-sm me-1" v-if="allowedActions(doc).trasladar"
                    :disabled="isRowBusy(doc.idDocumento) || movingId === doc.idDocumento"
                    @click.prevent="trasladar(doc)" title="Trasladar a finalizado">
                    <span v-if="movingId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-flag-checkered"></i>
                  </button>

                  <!-- NUEVO: Ver direcciones del documento (actor 1, tipoDoc=8) -->
                  <button
                    class="btn btn-outline-info btn-sm me-1"
                    v-if="allowedActions(doc).verDirecciones"
                    :disabled="isRowBusy(doc.idDocumento)"
                    @click.prevent="verDirecciones(doc)"
                    title="Ver direcciones del documento"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>

                  <!-- Descargar (siempre) -->
                  <button class="btn btn-primary btn-sm" v-if="allowedActions(doc).descargar"
                    :disabled="isRowBusy(doc.idDocumento) || downloadingId === doc.idDocumento"
                    @click.prevent="descargar(doc)" title="Descargar">
                    <span v-if="downloadingId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-download"></i>
                  </button>

                  <!-- Retornar (actor 2 y actor 3 en estado 3) -->
                  <button class="btn btn-outline-danger btn-sm ms-1" v-if="allowedActions(doc).retornar"
                    :disabled="isRowBusy(doc.idDocumento) || returningId === doc.idDocumento"
                    @click.prevent="retornar(doc)" title="Retornar (con anotaciones)">
                    <span v-if="returningId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-rotate-left"></i>
                  </button>

                  <!-- Generar PDF (actor 3, estado 3 o 6) -->
                  <button class="btn btn-outline-primary btn-sm ms-1" v-if="allowedActions(doc).generarPdf"
                    :disabled="isRowBusy(doc.idDocumento) || pdfGenId === doc.idDocumento"
                    @click.prevent="generarPdf(doc)" title="Generar PDF de última versión">
                    <span v-if="pdfGenId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-file-pdf"></i>
                  </button>

                  <!-- Ver aprobado (actor 3, estado 6) -->
                  <button class="btn btn-outline-success btn-sm ms-1" v-if="allowedActions(doc).verAprobado"
                    :disabled="isRowBusy(doc.idDocumento) || viewPdfId === doc.idDocumento"
                    @click.prevent="verAprobado(doc)" title="Ver documento aprobado (PDF)">
                    <span v-if="viewPdfId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-eye"></i>
                  </button>

                  <!-- Firmar (actor 3, estado 6) -->
                  <button class="btn btn-outline-dark btn-sm ms-1" v-if="allowedActions(doc).firmar"
                    :disabled="isRowBusy(doc.idDocumento) || signingId === doc.idDocumento"
                    @click.prevent="firmar(doc)" title="Firmar electrónicamente">
                    <span v-if="signingId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-signature"></i>
                  </button>

                  <!-- Ver firmado -->
                  <button class="btn btn-dark btn-sm ms-1" v-if="allowedActions(doc).verFirmado"
                    :disabled="isRowBusy(doc.idDocumento) || viewSignedId === doc.idDocumento"
                    @click.prevent="verFirmado(doc)" title="Ver PDF firmado">
                    <span v-if="viewSignedId === doc.idDocumento" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="fa-solid fa-file-shield"></i>
                  </button>

                  <!-- NUEVO: Tipo Dirección (actor 1, estado 7, tipo distinto de 2/3) -->
                  <button class="btn btn-info btn-sm me-1" v-if="allowedActions(doc).direccion"
                    :disabled="isRowBusy(doc.idDocumento)"
                    @click.prevent="abrirModalDireccion(doc)" title="Tipo de Dirección">
                    <i class="fa-solid fa-location-dot"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-3 text-muted small" v-if="docs.length > 0">
          Total: {{ docs.length }} documento(s)
        </div>
      </div>
    </div>

    <!-- Modal Tipo Dirección (AMPLIADO + lista de direcciones) -->
    <div v-if="mostrarModalDireccion" class="modal fade show" tabindex="-1" role="dialog" style="display:block;">
      <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="z-index:1060;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Tipo de Dirección</h5>
            <button
              type="button"
              class="btn btn-sm btn-icon btn-light"
              @click="cerrarModalDireccion"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Formulario asignación (col izq) -->
              <div class="col-lg-6">
                <div class="mb-3">
                  <label class="form-label">Tipo de Dirección</label>
                  <select class="form-select" v-model.number="tipoDireccionSeleccionado" @change="tipoDireccionCambiado">
                    <option :value="null" disabled>Selecciona...</option>
                    <option v-for="t in tiposDireccion" :key="t.id" :value="t.id">{{ t.descripcion || t.value || t.label }}</option>
                  </select>
                  <div v-if="errors.tipo" class="invalid-feedback d-block">{{ errors.tipo }}</div>
                </div>

                <div v-if="tipoDireccionSeleccionado === 1" class="mb-3">
                  <label class="form-label">Opción</label>
                  <v-select
                    v-model.number="subSeleccion"
                    :options="subOpciones"
                    :reduce="reduceUnidad"
                    :get-option-label="getUnidadLabel"
                    :filterable="true"
                    :clearable="true"
                    :close-on-select="true"
                    :append-to-body="true"
                    :reset-on-options-change="false"
                    placeholder="Escribe para buscar..."
                    @search="onSearchUnidad"
                  />
                  <div v-if="loadingSubOptions" class="form-text">Cargando opciones…</div>
                  <div v-if="errors.sub" class="invalid-feedback d-block">{{ errors.sub }}</div>
                </div>

                <div v-if="tipoDireccionSeleccionado === 2" class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" v-model="descripcionDireccion" rows="3" maxlength="1000"></textarea>
                  <div class="form-text">Máximo 1000 caracteres.</div>
                  <div v-if="errors.descripcion" class="invalid-feedback d-block">{{ errors.descripcion }}</div>
                </div>

                <!-- REEMPLAZAR bloque de días + switches -->
                <!-- Días para asignación (solo si ES obligatoria) -->
                <div class="mb-3" v-if="esObligatoria">
                  <label class="form-label">Días para asignación</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="diasDireccion"
                    min="1"
                    max="145"
                    step="1"
                    @keydown.stop
                    @keydown.enter.prevent
                    @wheel.stop
                    @click.stop
                  />
                  <div v-if="errors.dias" class="invalid-feedback d-block">{{ errors.dias }}</div>
                  <div class="form-text">Ingresa un número entero entre 1 y 145.</div>
                </div>

                <!-- Checkbox: Obligatoria (si NO es obligatoria, se enviará con 0 días) -->
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="sw-obligatoria"
                      v-model="esObligatoria"
                      @change="alCambiarObligatoria"
                    />
                    <label class="form-check-label" for="sw-obligatoria">Plazo obligatorio</label>
                  </div>
                  <div v-if="!esObligatoria" class="text-muted small mt-1">
                    Se enviará con 0 días al no ser obligatoria.
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button class="btn btn-secondary" @click="cerrarModalDireccion">Cerrar</button>
                  <button class="btn btn-primary" :disabled="agregarDisabled" @click="agregarDireccion(direccionDocId)">
                    <span v-if="dirLoading" class="spinner-border spinner-border-sm me-1"></span>Agregar
                  </button>
                </div>
              </div>

              <!-- Tabla de direcciones (col der) -->
              <div class="col-lg-6">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="mb-0">Direcciones asignadas</h6>
                  <button
                    v-if="showEnviarTodas"
                    class="btn btn-success btn-sm"
                    :disabled="enviarTodoLoading"
                    @click.prevent="enviarTodasDirecciones"
                    title="Enviar todas las direcciones activas"
                  >
                    <span v-if="enviarTodoLoading" class="spinner-border spinner-border-sm me-1"></span>
                    Enviar todas
                  </button>
                </div>
                <div v-if="direcciones.length === 0" class="text-muted">No hay direcciones asignadas.</div>
                <div v-else class="table-responsive" style="max-height:420px; overflow:auto;">
                  <table class="table table-sm table-striped align-middle mb-0">
                    <thead class="table-light sticky-top">
                      <tr>
                        <!-- Visibles -->
                        <th>No. Denuncia</th>
                        <th>Unidad</th>
                        <th>Tipo dirección</th>
                        <th>Estado</th>
                        <th style="width:110px;">Detalles</th>
                        <th class="text-end" style="width:120px;">Acciones</th>

                        <!-- Ocultas (presentes en DOM) -->
                        <th class="d-none">idDirecciones</th>
                        <th class="d-none">idSicoda</th>
                        <th class="d-none">idDocumento</th>
                        <th class="d-none">codigoUnidadAdministrativa</th>
                        <th class="d-none">idTipoDireccion</th>
                        <th class="d-none">idEstatus</th>
                        <th class="d-none">pathDocumento</th>
                        <th class="d-none">direccionFisica</th>
                        <th class="d-none">usuarioIngresa</th>
                        <th class="d-none">fechaIngresa</th>
                        <th class="d-none">usuarioActualiza</th>
                        <th class="d-none">fechaActualiza</th>
                      </tr>
                    </thead>

                    <!-- Un tbody por cada dirección -->
                    <tbody v-for="dir in direcciones" :key="dir.idDirecciones">
                      <tr>
                        <!-- Visibles -->
                        <td>{{ show(dir.noDenuncia) }}</td>
                        <td style="max-width:240px;word-break:break-word">{{ show(dir.unidadDescripcion) }}</td>
                        <td>{{ show(dir.tipoDireccionDescripcion) }}</td>
                        <td>{{ show(dir.estadoDescripcion) }}</td>
                        <td>
                          <button class="btn btn-outline-secondary btn-sm" @click.prevent="toggleDetalle(dir)">
                            {{ dir._open ? 'Ocultar' : 'Ver' }}
                          </button>
                        </td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-danger"
                                  v-if="puedeEliminarDireccion(dir)"
                                  @click.prevent="eliminarDireccion(dir)">
                            Eliminar
                          </button>
                        </td>

                        <!-- Ocultas (pero presentes) -->
                        <td class="d-none">{{ dir.idDirecciones }}</td>
                        <td class="d-none">{{ dir.idSicoda }}</td>
                        <td class="d-none">{{ dir.idDocumento }}</td>
                        <td class="d-none">{{ dir.codigoUnidadAdministrativa }}</td>
                        <td class="d-none">{{ dir.idTipoDireccion }}</td>
                        <td class="d-none">{{ dir.idEstatus }}</td>
                        <td class="d-none">{{ dir.pathDocumento }}</td>
                        <td class="d-none">{{ dir.direccionFisica }}</td>
                        <td class="d-none">{{ dir.usuarioIngresa }}</td>
                        <td class="d-none">{{ fmtFecha(dir.fechaIngresa) }}</td>
                        <td class="d-none">{{ dir.usuarioActualiza }}</td>
                        <td class="d-none">{{ fmtFecha(dir.fechaActualiza) }}</td>
                      </tr>

                      <!-- Detalle expandible -->
                      <tr v-if="dir._open" class="table-active">
                        <td colspan="100">
                          <div class="row g-2 small">
                            <div class="col-12 col-md-6"><strong>ID dirección:</strong> {{ show(dir.idDirecciones) }}</div>
                            <div class="col-12 col-md-6"><strong>ID Sicoda:</strong> {{ show(dir.idSicoda) }}</div>
                            <div class="col-12 col-md-6"><strong>ID Documento:</strong> {{ show(dir.idDocumento) }}</div>
                            <div class="col-12 col-md-6"><strong>Código UA:</strong> {{ show(dir.codigoUnidadAdministrativa) }}</div>
                            <div class="col-12 col-md-6"><strong>ID Tipo Dirección:</strong> {{ show(dir.idTipoDireccion) }}</div>
                            <div class="col-12 col-md-6"><strong>ID Estatus:</strong> {{ show(dir.idEstatus) }}</div>
                            <div class="col-12">
                              <strong>Path documento:</strong>
                              <template v-if="dir.pathDocumento">
                                <a :href="dir.pathDocumento" target="_blank" rel="noopener">{{ short(dir.pathDocumento, 80) }}</a>
                              </template>
                              <template v-else>—</template>
                            </div>
                            <div class="col-12"><strong>Dirección física:</strong> {{ show(dir.direccionFisica) }}</div>
                            <div class="col-12 col-md-6"><strong>Usuario ingresa:</strong> {{ show(dir.usuarioIngresa) }}</div>
                            <div class="col-12 col-md-6"><strong>Fecha ingresa:</strong> {{ fmtFecha(dir.fechaIngresa) || '—' }}</div>
                            <div class="col-12 col-md-6"><strong>Usuario actualiza:</strong> {{ show(dir.usuarioActualiza) }}</div>
                            <div class="col-12 col-md-6"><strong>Fecha actualiza:</strong> {{ fmtFecha(dir.fechaActualiza) || '—' }}</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div> <!-- row -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import Global from '@/Global'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'TablaDocumentosExpediente',
  components: { vSelect },
  props: {
    id: { type: [String, Number], required: true },
    actor: { type: [String, Number], default: 1 },
    navigateOnHistory: { type: Boolean, default: true },
    historyRouteName: { type: String, default: 'historial-documento' },
    noDenuncia: { type: String, default: '' } // NUEVO (se usará en el título de la vista de direcciones)
  },
  data() {
    return {
      loading: false,
      downloadingId: null,
      sendingId: null,
      editingId: null,
      returningId: null,
      pdfGenId: null,
      viewPdfId: null,
      signingId: null,
      viewSignedId: null,
      movingId: null,
      docs: [],
      busy: {},

      // Modal Tipo Dirección
      mostrarModalDireccion: false,
      direccionDocId: null,
      tiposDireccion: [],
      tipoDireccionSeleccionado: null,
      subOpciones: [],
      subSeleccion: null,
      descripcionDireccion: '',
      lastUnidadQuery: '',
      searchTimer: null,
      subReqId: 0,

      // Días 0..31 + banderas
      diasDireccion: 1,
      esObligatoria: false,

      // Listado de direcciones
      direcciones: [],
      loadingSubOptions: false,
      dirLoading: false,
      enviarTodoLoading: false,

      ocultarDireccionDocIds: [],
      errors: { tipo: null, sub: null, descripcion: null, dias: null },

      isAlive: true
    }
  },
  beforeUnmount() { this.isAlive = false },
  mounted() { this.cargar() },
  watch: {
    id() { this.cargar() },
    actor() { this.cargar() }
  },
  computed: {
    agregarDisabled() { return this.dirLoading || !this.isValidDireccion() },
    showEnviarTodas() {
      return !!this.direccionDocId &&
        Array.isArray(this.direcciones) &&
        this.direcciones.some(d => Number(d?.idEstatus) === 1)
    }
  },
  methods: {
    // Helpers
    isRowBusy(id) { return !!this.busy[id] },
    markBusy(id, on = true) { this.busy[id] = on },

    // NUEVO: recarga dura de la página tras éxito
    async hardReloadAfterSuccess(title, text) {
      try { await this.cargar(true) } catch (e) { console.warn('reload fallback load', e) }
      await Swal.fire(title, text, 'success')
      try {
        if (this.$router && this.$router.go) this.$router.go(0)
        else window.location.reload()
      } catch (e) { window.location.reload() }
    },

    getEstadoId(doc) {
      // 1) por id en distintas claves
      const raw =
        doc?.estadoId ?? doc?.EstadoId ?? doc?.idEstatus ?? doc?.IdEstatus ??
        doc?.idEstado ?? doc?.IdEstado ?? doc?.idEstatusDocumento ?? doc?.idEstatusDoc
      const n = Number(raw)
      if (!Number.isNaN(n) && n > 0) return n
      // 2) por texto
      const t = this.estadoTexto(doc).toLowerCase()
      if (!t) return -1
      if (t.includes('asesor')) return 3
      if (t.includes('retorn')) return 4
      if (t.includes('aprob')) return 6
      if (t.includes('finaliz')) return 9
      if (t.includes('anulad')) return 10
      if (t.includes('traslad')) return 8
      if (t.includes('borrador') || t.includes('autor') || t.includes('pendiente')) return 1
      return -1
    },
    estadoTexto(doc) {
      return String(doc?.estado || doc?.estadoDescripcion || doc?.EstadoDescripcion || '').trim() || '—'
    },
    getTipoDocumentoId(doc) { return Number(doc?.idTipoDocumento ?? doc?.IdTipoDocumento ?? -1) },
    getTipoTransaccionId(doc) {
      return Number(
        doc?.idTipoTransaccion ??
        doc?.IdTipoTransaccion ??
        doc?.tipoTransaccionId ??
        doc?.TipoTransaccionId ??
        doc?.idTipoTransaccionDocumento ??
        -1
      )
    },
    isEnTraslado(doc) {
      const est = this.getEstadoId(doc)
      const trasladoIds = [8, 9, 12, 13, 7]
      if (trasladoIds.includes(est)) return true
      const desc = this.estadoTexto(doc).toLowerCase()
      return desc.includes('traslad')
    },

    // No permitir ver direcciones si es de Archivo o Procuración
    isArchivoOProcuracion(doc) {
      const tipoTrans = this.getTipoTransaccionId(doc) // 2/3: finales especiales
      if ([2, 3].includes(tipoTrans)) return true
      const t = String(
        doc?.tipo ||
        doc?.tipoDescripcion ||
        doc?.tipoDocumento ||
        doc?.tipoDocumentoDescripcion ||
        ''
      ).toLowerCase()
      return t.includes('archivo') || t.includes('procurac') // “procuración/procuracion”
    },

    // REGLAS por actor/estado (coherentes con lo solicitado)
    allowedActions(doc) {
      const a = {
        descargar: true, historial: true,
        editar: false, anular: false, enviar: false, retornar: false,
        generarPdf: false, verAprobado: false, firmar: false, verFirmado: false,
        trasladar: false, direccion: false, verDirecciones: false
      }

      const actorNum = Number(this.actor || 0)
      const st = Number(this.getEstadoId(doc))
      const estadoTxt = this.estadoTexto(doc).toLowerCase()
      const isSigned = Number(doc?.firmado ?? 0) === 1

      // Ver firmado base (>=7 o flag firmado)
      if (st >= 7 || isSigned) a.verFirmado = true

      if (actorNum === 2) {
        // Asesor:
        // - En estatus 2 o 5 (o si el texto dice "asesor") puede editar, anular, enviar y retornar.
        if ([2, 5].includes(st) || estadoTxt.includes('asesor')) {
          a.editar = true
          a.anular = true
          a.enviar = true
          a.retornar = true
        }
        // - En 7, 8 o 9: solo historial, descargar y ver firmado (ya activado arriba).
        if ([7, 8, 9].includes(st)) {
          a.editar = false
          a.anular = false
          a.enviar = false
          a.retornar = false
        }
        return a
      }

      if (actorNum === 3) {
        // Jefe:
        // - Estado 3: retornar, generar PDF, modificar, anular (más historial/descargar).
        if (st === 3) {
          a.retornar = true
          a.generarPdf = true
          a.editar = true
          a.anular = true
          return a
        }
        // - Estado 6 (aprobado): mismos que en 3 + firmar si NO está ya firmado
        if (st === 6) {
          a.retornar = true
          a.generarPdf = true
          a.editar = true
          a.anular = true
          a.firmar = !isSigned
          a.verAprobado = true
          return a
        }
        // Firmado o estado 7: NO mostrar enviar (solo historial/descargar/ver firmado)
        if (isSigned || st === 7) {
          // No asignar a.enviar para jefe cuando ya está firmado o finalizado
          return a
        }
        if (st >= 7) return a
      }

      if (actorNum === 1) {
        // Actor 1 (procurador/autor)
        const canWork = [1, 4].includes(st)
        a.editar = canWork
        a.anular = canWork
        a.enviar = canWork

        if (st === 7) {
          const tipoTrans = this.getTipoTransaccionId(doc)
          if ([2, 3].includes(tipoTrans)) a.trasladar = true
          else a.direccion = true
        }
        // Ver direcciones en 8 y 9, excepto Archivo/Procuración
        if (st === 8 || st === 9) {
          a.verDirecciones = !this.isArchivoOProcuracion(doc)
        }
        return a
      }

      // NUEVO: Actor 4 (Examinado)
      if (actorNum === 4) {
        // Descarga e historial ya están true.
        // Ver documento firmado si estado >=7 o marcado firmado (ya seteado arriba).
        // Ver direcciones solo en estados 8 o 9 y si no es Archivo/Procuración.
        a.verDirecciones = ([8, 9].includes(st)) && !this.isArchivoOProcuracion(doc)
        // Todo lo demás permanece false.
        return a
      }

      return a
    },

    // Navegación
    verDirecciones(doc) {
      const st = this.getEstadoId(doc)
      if (!doc?.idDocumento) return
      if (!([8, 9].includes(st)) || this.isArchivoOProcuracion(doc)) return
      try {
        this.$router.push({
          name: 'direcciones-documento',
          params: { idDocumento: String(doc.idDocumento) },
          query: { idSicoda: String(this.id), noDenuncia: this.noDenuncia || '' }
        })
      } catch {
        this.$emit('ver-direcciones', { idDocumento: doc.idDocumento, idSicoda: this.id, noDenuncia: this.noDenuncia || '' })
      }
    },

    // Carga
    async cargar(force = false) {
      if (!this.isAlive) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const params = { actor: Number(this.actor) || 1 }
        if (force) params.ts = Date.now()
        const { data } = await axios.get(
          `${Global.url}procuradorDenuncias/documentos/${this.id}`,
          { params, headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' } }
        )
        if (!this.isAlive) return
        this.docs = (data?.data || []).map(d => ({ ...d }))
        const hasTipo2o3 = Array.isArray(this.docs) && this.docs.some(d => [2, 3].includes(this.getTipoTransaccionId(d)))
        this.$emit('docs-change', this.docs)
        this.$emit('has-tipo2o3', hasTipo2o3)
      } catch (e) {
        if (!this.isAlive) return
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning')
          this.$router.push('/')
        } else {
          Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error')
          console.error('Error cargando documentos:', e)
        }
      } finally {
        if (this.isAlive) this.loading = false
      }
    },

    async scheduleReload(force = false) {
      try { Swal.close() } catch (e) { void 0 }
      try { this.cerrarModalDireccion && this.cerrarModalDireccion() } catch (e) { void 0 }
      await this.$nextTick()
      await new Promise(r => setTimeout(r, 80))
      if (!this.isAlive) return
      try { await this.cargar(force) } catch (err) { console.warn('scheduleReload', err) }
    },

    // Utilidades UI
    fmtFecha(v) {
      if (!v) return ''
      const d = new Date(v); if (isNaN(d)) return v
      const p = n => String(n).padStart(2, '0')
      return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    badgeForEstado(id) {
      switch (Number(id)) {
        case 1: return 'text-bg-primary'
        case 3: return 'text-bg-secondary'
        case 4: return 'text-bg-warning'   // correcciones
        case 5: return 'text-bg-info'
        case 6: return 'text-bg-success'
        case 7: return 'text-bg-info'
        case 8: return 'text-bg-dark'
        case 9: return 'text-bg-secondary'
        case 10: return 'text-bg-danger'   // anulado
        default: return 'text-bg-light'
      }
    },

    // Resalta la fila completa según estado (sin afectar otros estilos)
    rowClass(doc) {
      const st = Number(this.getEstadoId(doc))
      if (st === 4) return 'table-warning' // correcciones (amarillo)
      if (st === 10) return 'table-danger' // anulado (rojo)
      return ''
    },

    // Acciones comunes
    async descargar(doc) {
      this.downloadingId = doc.idDocumento
      try {
        const token = localStorage.getItem('token')
        const ver = (doc.fechaActualiza && new Date(doc.fechaActualiza).getTime())
          || (doc.fechaIngresa && new Date(doc.fechaIngresa).getTime()) || Date.now()
        const url = `${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/descargar?_v=${ver}`
        const resp = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
          responseType: 'blob'
        })
        let fileName = doc.nombreDocumento || 'documento.docx'
        const cd = resp.headers['content-disposition']
        if (cd) { const m = /filename="?([^"]+)"?/.exec(cd); if (m?.[1]) fileName = m[1] }
        const blob = new Blob([resp.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        const objUrl = URL.createObjectURL(blob)
        try { await this.$nextTick() } catch (e) { void 0 }
        try {
          if (!document.body) {
            window.open(objUrl, '_blank', 'noopener')
          } else {
            const a = document.createElement('a')
            a.style.display = 'none'; a.href = objUrl; a.download = fileName
            document.body.appendChild(a); a.click()
            setTimeout(() => {
              try { a.parentNode && a.parentNode.removeChild(a) } catch (e) { void 0 }
              try { URL.revokeObjectURL(objUrl) } catch (e) { void 0 }
            }, 150)
          }
        } catch {
          window.open(objUrl, '_blank', 'noopener')
          setTimeout(() => { try { URL.revokeObjectURL(objUrl) } catch (e) { void 0 } }, 60000)
        }
      } catch (e) {
        if (e.response?.status === 404) Swal.fire('No encontrado', 'Archivo no disponible en el servidor.', 'warning')
        else if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', 'No se pudo descargar el archivo.', 'error')
      } finally { this.downloadingId = null }
    },

    async anular(doc) {
      const { value: motivo, isConfirmed } = await Swal.fire({
        title: 'Anular documento',
        html: '<div class="text-start mb-2">Escribe el motivo de anulación (máx. 1000 caracteres):</div>',
        input: 'textarea',
        inputPlaceholder: 'Motivo de anulación…',
        inputAttributes: { maxlength: 1000, rows: 5, 'aria-label': 'Motivo de anulación' },
        showCancelButton: true, cancelButtonText: 'Cancelar', confirmButtonText: 'Anular',
        preConfirm: (val) => {
          const t = (val || '').trim()
          if (!t) { Swal.showValidationMessage('El motivo es obligatorio.'); return false }
          if (t.length > 1000) { Swal.showValidationMessage('Máximo 1000 caracteres.'); return false }
          return t
        },
        showLoaderOnConfirm: true, allowOutsideClick: () => !Swal.isLoading()
      })
      if (!isConfirmed) return
      this.markBusy(doc.idDocumento, true)
      try {
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        Swal.fire({ title: 'Procesando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        await axios.post(`${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/anular`,
          { motivo, usuario }, { headers: { Authorization: `Bearer ${token}` } })
        await this.hardReloadAfterSuccess('Anulado', 'El documento fue anulado correctamente.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo anular el documento.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.markBusy(doc.idDocumento, false) }
    },

    async enviar(doc) {
      const confirm = await Swal.fire({
        title: '¿Enviar documento?', text: 'Estas seguro de enviar el documento.', icon: 'question',
        showCancelButton: true, confirmButtonText: 'Sí, enviar', cancelButtonText: 'Cancelar'
      })
      if (!confirm.isConfirmed) return
      this.sendingId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        Swal.fire({ title: 'Procesando…', text: 'Por favor espera', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        await axios.post(`${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/enviar`,
          { usuario }, { headers: { Authorization: `Bearer ${token}` } })
        // Recarga dura para que el estado/acciones reflejen el actor actual
        await this.hardReloadAfterSuccess('Enviado', 'El documento fue enviado correctamente.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo enviar el documento.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.sendingId = null; this.markBusy(doc.idDocumento, false) }
    },

    async editar(doc) {
      const { value, isConfirmed } = await Swal.fire({
        title: 'Subir nueva versión',
        html: `
          <div class="text-start">
            <label class="form-label">Archivo (.docx)</label>
            <input type="file" id="swal-file" class="form-control mb-3" accept=".docx" />
            <label class="form-label">Comentario (máx. 1000)</label>
            <textarea id="swal-comentario" class="form-control" rows="4" maxlength="1000"
              placeholder="Describe el motivo de la actualización..."></textarea>
          </div>
        `,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'Subir', cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const fileInput = document.getElementById('swal-file')
          const txt = document.getElementById('swal-comentario')
          const f = fileInput?.files?.[0]; const comentario = (txt?.value || '').trim()
          if (!f) { Swal.showValidationMessage('Debes seleccionar un archivo .docx'); return false }
          const name = f.name?.toLowerCase() || ''
          if (!name.endsWith('.docx')) { Swal.showValidationMessage('El archivo debe ser .docx'); return false }
          if (!comentario) { Swal.showValidationMessage('El comentario es obligatorio.'); return false }
          if (comentario.length > 1000) { Swal.showValidationMessage('Máximo 1000 caracteres.'); return false }
          return { file: f, comentario }
        },
        showLoaderOnConfirm: true, allowOutsideClick: () => !Swal.isLoading()
      })
      if (!isConfirmed || !value) return
      try {
        this.editingId = doc.idDocumento
        Swal.fire({ title: 'Procesando…', text: 'Por favor espera', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        const fd = new FormData(); fd.append('file', value.file); fd.append('Usuario', usuario || ''); fd.append('Comentario', value.comentario)
        await axios.post(`${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/modificar`,
          fd, { headers: { Authorization: `Bearer ${token}` } })
        await this.hardReloadAfterSuccess('Actualizado', 'Se guardó la nueva versión del documento.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo actualizar el documento.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.editingId = null }
    },

    verHistorial(doc) {
      if (!doc?.idDocumento) return
      if (this.navigateOnHistory && this.$router) {
        try { this.$router.push({ name: this.historyRouteName, params: { idDocumento: doc.idDocumento } }) }
        catch { this.$emit('historial', doc) }
      } else { this.$emit('historial', doc) }
    },

    async retornar(doc) {
      const { value: comentario, isConfirmed } = await Swal.fire({
        title: 'Retornar documento',
        html: '<div class="text-start mb-2">Describe las anotaciones (máx. 1000 caracteres):</div>',
        input: 'textarea',
        inputPlaceholder: 'Anotaciones / correcciones para el autor…',
        inputAttributes: { maxlength: 1000, rows: 6, 'aria-label': 'Anotaciones' },
        showCancelButton: true, cancelButtonText: 'Cancelar', confirmButtonText: 'Retornar',
        preConfirm: (val) => {
          const t = (val || '').trim()
          if (!t) { Swal.showValidationMessage('El comentario es obligatorio.'); return false }
          if (t.length > 1000) { Swal.showValidationMessage('Máximo 1000 caracteres.'); return false }
          return t
        },
        showLoaderOnConfirm: true, allowOutsideClick: () => !Swal.isLoading()
      })
      if (!isConfirmed) return
      this.returningId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        Swal.fire({ title: 'Procesando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        await axios.post(`${Global.url}asesorDenuncias/documentos/${doc.idDocumento}/retornar`,
          { usuario, comentario }, { headers: { Authorization: `Bearer ${token}` } })
        await this.hardReloadAfterSuccess('Retornado', 'El documento fue retornado con anotaciones (estado 4).')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo retornar el documento.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.returningId = null; this.markBusy(doc.idDocumento, false) }
    },

    // Actor 3
    async generarPdf(doc) {
      this.pdfGenId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        Swal.fire({ title: 'Generando PDF…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        await axios.post(`${Global.url}jefe/documentos/${doc.idDocumento}/generar-pdf`,
          { usuario }, { headers: { Authorization: `Bearer ${token}` } })
        await this.hardReloadAfterSuccess('Listo', 'Se generó el PDF de la última versión y se guardó en el expediente.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo generar el PDF.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.pdfGenId = null; this.markBusy(doc.idDocumento, false) }
    },

    async verAprobado(doc) {
      this.viewPdfId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.get(`${Global.url}jefe/documentos/${doc.idDocumento}/pdf`,
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' })
        const blob = new Blob([resp.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      } catch (e) {
        if (e.response?.status === 404) Swal.fire('No encontrado', 'PDF aprobado no disponible en el servidor.', 'warning')
        else if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', 'No se pudo abrir el PDF aprobado.', 'error')
      } finally { this.viewPdfId = null; this.markBusy(doc.idDocumento, false) }
    },

    async firmar(doc) {
      this.signingId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        const { value, isConfirmed } = await Swal.fire({
          title: 'Firmar electrónicamente',
          html: `<div class="text-start"><label class="form-label">PIN/Contraseña de firma</label><input id="swal-pin" class="form-control" type="password" placeholder="••••••" /></div>`,
          showCancelButton: true, confirmButtonText: 'Firmar', cancelButtonText: 'Cancelar',
          focusConfirm: false, preConfirm: () => {
            const pin = (document.getElementById('swal-pin')?.value || '').trim()
            if (!pin) { Swal.showValidationMessage('Debes ingresar el PIN.'); return false }
            return pin
          }
        })
        if (!isConfirmed) return
        Swal.fire({ title: 'Firmando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        await axios.post(`${Global.url}jefe/documentos/${doc.idDocumento}/firmar`,
          { usuario, pin: value }, { headers: { Authorization: `Bearer ${token}` } })
        await this.hardReloadAfterSuccess('Firmado', 'El documento fue firmado correctamente.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo firmar el documento.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.signingId = null; this.markBusy(doc.idDocumento, false) }
    },

    async verFirmado(doc) {
      this.viewSignedId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.get(`${Global.url}jefe/documentos/${doc.idDocumento}/pdf-firmado`,
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' })
        const blob = new Blob([resp.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      } catch (e) {
        if (e.response?.status === 404) Swal.fire('No encontrado', 'PDF firmado no disponible.', 'warning')
        else if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', 'No se pudo abrir el PDF firmado.', 'error')
      } finally { this.viewSignedId = null; this.markBusy(doc.idDocumento, false) }
    },

    async trasladar(doc) {
      this.movingId = doc.idDocumento; this.markBusy(doc.idDocumento, true)
      try {
        const { isConfirmed } = await Swal.fire({
          title: '¿Trasladar documento a finalizado?',
          text: 'Esta acción moverá el expediente al estado final correspondiente.',
          icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, trasladar', cancelButtonText: 'Cancelar'
        })
        if (!isConfirmed) return
        Swal.fire({ title: 'Trasladando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
        const token = localStorage.getItem('token'); const usuario = this.$store?.state?.userEmail
        await axios.post(`${Global.url}procuradorDenuncias/documentos/${doc.idDocumento}/traslado`,
          { usuario }, { headers: { Authorization: `Bearer ${token}` } })
        // Recarga dura tras traslado
        await this.hardReloadAfterSuccess('Trasladado', 'El documento fue trasladado correctamente.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo trasladar el documento.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally { this.movingId = null; this.markBusy(doc.idDocumento, false) }
    },

    // Switch Obligatoria (invertido)
    alCambiarObligatoria() {
      if (this.esObligatoria) {
        if (!this.diasDireccion || this.diasDireccion < 1) this.diasDireccion = 1
      } else {
        this.diasDireccion = 0
      }
    },

    // Modal helpers
    abrirModalDireccion(doc) {
      this.direccionDocId = doc.idDocumento
      this.mostrarModalDireccion = true
      this.tipoDireccionSeleccionado = null
      this.subOpciones = []
      this.subSeleccion = null
      this.descripcionDireccion = ''
      this.diasDireccion = 1
      this.esObligatoria = false
      this.errors = { tipo: null, sub: null, descripcion: null, dias: null }
      this.cargarTiposDireccion()
      this.cargarDirecciones(doc.idDocumento)
    },
    cerrarModalDireccion() {
      this.mostrarModalDireccion = false
      this.direccionDocId = null
      this.diasDireccion = null
      this.esObligatoria = false
      this.direcciones = []
    },

    async cargarTiposDireccion() {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(`${Global.url}procuradorDenuncias/tipos-direccion`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.tiposDireccion = Array.isArray(data) ? data : (data?.data || [])
      } catch (e) {
        console.warn('cargarTiposDireccion error', e)
        this.tiposDireccion = [{ id: 1, descripcion: 'Opción 1' }, { id: 2, descripcion: 'Opción 2' }]
      }
    },

    // Normalizadores de opciones para v-select (siempre { id, descripcion })
    reduceUnidad(opt) {
      // v-select guarda solo el id numérico
      const id =
        opt?.id ?? opt?.ID ?? opt?.codigoUnidadAdministrativa ?? opt?.CODIGO_UNIDAD_ADMINISTRATIVA ??
        opt?.codigo ?? opt?.value
      return Number(id)
    },
    getUnidadLabel(opt) {
      return String(
        opt?.descripcion ?? opt?.DESCRIPCION ?? opt?.label ?? opt?.nombre ?? opt?.NOMBRE ?? opt?.text ?? opt ?? ''
      )
    },
    mapUnidadOption(raw) {
      const id = this.reduceUnidad(raw)
      const descripcion = this.getUnidadLabel(raw).trim()
      return { id, descripcion }
    },

    async cargarSubOpciones(tipoId, q = '') {
      this.loadingSubOptions = true
      const currentReq = ++this.subReqId
      try {
        const token = localStorage.getItem('token')
        const url = `${Global.url}procuradorDenuncias/direcciones/opciones?tipoId=${tipoId}${q ? `&q=${encodeURIComponent(q)}` : ''}`
        const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        if (currentReq !== this.subReqId) return
        const arr = Array.isArray(data) ? data : (data?.data || [])
        this.subOpciones = arr.map(this.mapUnidadOption).filter(o => Number.isFinite(o.id) && o.descripcion)
      } catch (e) {
        if (currentReq === this.subReqId) { console.warn('cargarSubOpciones error', e); this.subOpciones = [] }
      } finally {
        if (currentReq === this.subReqId) this.loadingSubOptions = false
      }
    },
    onSearchUnidad(q) {
      const query = (q || '').trim()
      // Si ya hay una opción seleccionada y el input quedó vacío por el click, no recargar ni limpiar.
      if (!query && Number(this.subSeleccion) > 0) return
      if (query === this.lastUnidadQuery) return
      this.lastUnidadQuery = query
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        if (this.tipoDireccionSeleccionado === 1) {
          this.cargarSubOpciones(1, query).catch(() => undefined)
        }
      }, 250)
    },

    async cargarDirecciones(idDocumento) {
      if (!idDocumento) { this.direcciones = []; return }
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(`${Global.url}procuradorDenuncias/documentos/${idDocumento}/direcciones`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' }
        })
        this.direcciones = Array.isArray(data) ? data : (data?.data || [])
      } catch (e) {
        console.warn('cargarDirecciones error', e); this.direcciones = []
      }
    },

    tipoDireccionCambiado() {
      this.errors.tipo = null
      this.errors.sub = null
      this.errors.descripcion = null
      this.subOpciones = []
      this.subSeleccion = null
      if (this.tipoDireccionSeleccionado === 1) this.cargarSubOpciones(this.tipoDireccionSeleccionado).catch(() => undefined)
    },

    validarDireccion() {
      if (!this.errors) this.errors = { tipo: null, sub: null, descripcion: null, dias: null }
      this.errors.tipo = null; this.errors.sub = null; this.errors.descripcion = null; this.errors.dias = null

      if (!this.tipoDireccionSeleccionado) { this.errors.tipo = 'Selecciona el tipo de dirección.'; return false }
      if (this.tipoDireccionSeleccionado === 1) {
        const val = Number(this.subSeleccion)
        if (!Number.isInteger(val) || val <= 0) { this.errors.sub = 'Selecciona una opción válida.'; return false }
      }
      if (this.tipoDireccionSeleccionado === 2) {
        const txt = (this.descripcionDireccion || '').trim()
        if (!txt) { this.errors.descripcion = 'La descripción es obligatoria.'; return false }
        if (txt.length > 1000) { this.errors.descripcion = 'Máximo 1000 caracteres.'; return false }
      }

      const dias = Number(this.esObligatoria ? this.diasDireccion : 0)
      if (this.esObligatoria) {
        if (!Number.isInteger(dias) || dias < 1 || dias > 145) {
          this.errors.dias = 'Deben ser días enteros entre 1 y 145.'; return false
        }
      }
      return true
    },

    isValidDireccion() {
      if (!this.tipoDireccionSeleccionado) return false
      if (this.tipoDireccionSeleccionado === 1) {
        const val = Number(this.subSeleccion)
        if (!Number.isInteger(val) || val <= 0) return false
      }
      if (this.tipoDireccionSeleccionado === 2) {
        const txt = (this.descripcionDireccion || '').trim()
        if (txt.length === 0 || txt.length > 1000) return false
      }
      const dias = Number(this.esObligatoria ? this.diasDireccion : 0)
      if (this.esObligatoria) {
        if (!Number.isInteger(dias) || dias < 1 || dias > 145) return false
      }
      return true
    },

    async agregarDireccion(idDocumento) {
      const docId = idDocumento ?? this.direccionDocId
      if (!docId) { Swal.fire('Error', 'Documento no seleccionado.', 'error'); return }
      if (!this.validarDireccion()) return
      this.dirLoading = true
      try {
        const token = localStorage.getItem('token')
        const usuario = this.$store?.state?.userEmail || 'sistema'
        const payload = {
          usuario,
          tipoDireccionId: Number(this.tipoDireccionSeleccionado),
          dias: Number(this.esObligatoria ? this.diasDireccion : 0) || 0,
          idDocumento: Number(docId)
        }
        if (Number(this.tipoDireccionSeleccionado) === 1) payload.opcionId = Number(this.subSeleccion)
        else payload.descripcion = (this.descripcionDireccion || '').trim()

        await axios.post(`${Global.url}procuradorDenuncias/documentos/${docId}/direccion`,
          payload, { headers: { Authorization: `Bearer ${token}` } })

        await this.cargarDirecciones(docId)
        if (this.isAlive) Swal.fire('Listo', 'Tipo de dirección asignado correctamente.', 'success')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo asignar el tipo de dirección.'
        if (e.response?.status === 401 || e.response?.status === 403) {
          await Swal.fire('Sesión expirada', 'Vuelve a iniciar sesión.', 'warning'); this.$router.push('/')
        } else Swal.fire('Error', msg, 'error')
      } finally {
        this.dirLoading = false
        try {
          this.tipoDireccionSeleccionado = null
          this.subOpciones = []
          this.subSeleccion = null
          this.descripcionDireccion = ''
          this.diasDireccion = 1
          this.esObligatoria = false
          this.errors = { tipo: null, sub: null, descripcion: null, dias: null }
        } catch (e) { void 0 }
      }
    },

    // Utilidades para el template de Direcciones
    show(v) {
      if (v === null || v === undefined) return '—'
      if (typeof v === 'string' && v.trim() === '') return '—'
      return v
    },
    short(text, max = 80) {
      const t = String(text || '')
      return t.length <= max ? t : `${t.slice(0, max - 1)}…`
    },
    toggleDetalle(dir) {
      if (!dir) return
      dir._open = !dir._open
    },
    puedeEliminarDireccion(dir) {
      // Permitir eliminar cuando está en estatus 1 (pendiente) por defecto
      const st = Number(dir?.idEstatus ?? dir?.estatus ?? 0)
      return st === 1
    },
    async eliminarDireccion(dir) {
      if (!dir?.idDirecciones) return
      const { isConfirmed } = await Swal.fire({
        title: 'Eliminar dirección',
        text: '¿Deseas eliminar esta dirección?',
        icon: 'question', showCancelButton: true,
        confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar'
      })
      if (!isConfirmed) return
      try {
        const token = localStorage.getItem('token')
        // Endpoint tentativo: ajusta si tu API usa otra ruta
        await axios.delete(`${Global.url}procuradorDenuncias/direcciones/${dir.idDirecciones}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.cargarDirecciones(this.direccionDocId)
        Swal.fire('Eliminada', 'La dirección fue eliminada.', 'success')
      } catch (e) {
        const msg = e.response?.data || 'No se pudo eliminar la dirección.'
        Swal.fire('Error', msg, 'error')
      }
    },
    async enviarTodasDirecciones() {
      if (!this.direccionDocId) return
      const { isConfirmed } = await Swal.fire({
        title: 'Enviar todas',
        text: '¿Enviar todas las direcciones activas?',
        icon: 'question', showCancelButton: true,
        confirmButtonText: 'Enviar', cancelButtonText: 'Cancelar'
      })
      if (!isConfirmed) return
      this.enviarTodoLoading = true
      try {
        const token = localStorage.getItem('token')
        const usuario =
          this.$store?.state?.userEmail ||
          localStorage.getItem('userEmail') ||
          localStorage.getItem('usuario') ||
          'sistema'

        const payload = {
          IdDocumento: Number(this.direccionDocId),
          IdSicoda: Number(this.id),
          Usuario: usuario
        }

        await axios.post(
          `${Global.url}procuradorDenuncias/documentos/${this.direccionDocId}/direcciones/enviar`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        // Recarga completa para reflejar cambios en toda la página
        await this.hardReloadAfterSuccess('Listo', 'Se enviaron todas las direcciones activas.')
      } catch (e) {
        const msg = e.response?.data || 'No se pudieron enviar las direcciones.'
        Swal.fire('Error', msg, 'error')
      } finally {
        this.enviarTodoLoading = false
      }
    },
  }
}
</script>

<style scoped>
/* ...existing code... */
:deep(.v-select) { width: 100%; }
:deep(.vs__dropdown-toggle) { border-color: #ced4da; }
:deep(.vs__selected) { color: inherit; }
/* ...existing code... */
</style>

<style>
/* Asegurar que el menú de vue-select quede por encima del modal */
.vs__dropdown-menu,
.v-select.vs--open .vs__dropdown-menu {
  z-index: 2000 !important; /* mayor que el modal (~1060) */
}

/* Evitar recortes dentro del modal */
.modal,
.modal .modal-dialog,
.modal .modal-content,
.modal .modal-body {
  overflow: visible !important;
}

.modal-header .btn-icon {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: .475rem;
}
</style>
