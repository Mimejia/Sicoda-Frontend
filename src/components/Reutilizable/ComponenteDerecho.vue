<template>
  <div class="componente-derecho">
    <ul class="nav nav-tabs mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: tabSeleccionada === 'resumen' }"
          @click="tabSeleccionada = 'resumen'">
          Clasificar
        </button>
      </li>

      <!-- Pestaña Denegar (visible cuando ya está clasificada y no está denegada) -->
      <li v-if="mostrarDenegarTab" class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: tabSeleccionada === 'denegar' }"
          @click="tabSeleccionada = 'denegar'">
          Denegar
        </button>
      </li>

      <!-- NUEVO: pestaña Anexar (solo estado 1/2 y con documento físico) -->
      <li v-if="mostrarAnexar" class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: tabSeleccionada === 'anexar' }"
          @click="tabSeleccionada = 'anexar'">
          Anexar
        </button>
      </li>

      <li class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: tabSeleccionada === 'historial' }"
          @click="tabSeleccionada = 'historial'">
          Ampliación
        </button>
      </li>
      <li v-if="estado !== 4 && tipoCalificacion !== 0" class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: tabSeleccionada === 'aceptacion' }"
          @click="tabSeleccionada = 'aceptacion'">
          Aceptación
        </button>
      </li>
    </ul>

    <div class="tab-content p-3 border rounded bg-light">
      <div v-if="tabSeleccionada === 'resumen'">
        <h5>Clasificación de Denuncia</h5>
        <SelectClasificacion v-model="tipoDenunciaId" :disabled="tipoCalificacion !== 0" />

        <div class="form-group mt-4" v-if="Array.isArray(tipoDenunciaId) && tipoDenunciaId.includes(15)">
          <label for="otrosDetalle">Por favor, describa el tipo de denuncia</label>
          <textarea id="otrosDetalle" class="form-control" v-model="otros" rows="2"
            placeholder="Describa el tipo de la denuncia"
            :readonly="soloLectura || (tipoCalificacion !== 0)"></textarea>

          <div v-if="v$.otros?.$error" class="text-danger text-sm">
            <div v-if="v$.otros.required?.$invalid">
              Este campo es obligatorio
            </div>
            <div v-if="v$.otros.maxLength?.$invalid">
              Máximo 300 caracteres
            </div>
          </div>

        </div>
        
        <button v-if="tipoCalificacion === 0" class="btn btn-primary mt-2" @click="clasificarDenuncia">
          Clasificar
        </button>

      </div>

      <div v-if="tabSeleccionada === 'denegar'">
        <!-- Denegar -->
        <div class="panel-denegar border rounded-3 bg-white shadow-sm">
          <div class="panel-header d-flex align-items-center gap-2 px-3 py-2 border-bottom">
            <i class="fas fa-ban text-danger"></i>
            <strong>Denegar expediente</strong>
          </div>
          <div class="px-3 py-3">
            <label for="justificacion" class="form-label fw-semibold mb-1">Motivo de Denegación</label>
            <textarea
              id="justificacion"
              v-model="justificacionDenegacion"
              :class="['form-control', {'is-invalid': v$.justificacionDenegacion.$error}]"
              rows="5"
              maxlength="1000"
              placeholder="Ingrese el motivo (máximo 1000 caracteres)">
            </textarea>
            <div class="d-flex justify-content-between mt-1 small text-muted">
              <span>Este campo es obligatorio.</span>
              <span>{{ contadorDenegacion }}/1000</span>
            </div>
            <div class="invalid-feedback d-block" v-if="v$.justificacionDenegacion.$error">
              <span v-if="v$.justificacionDenegacion.required.$invalid">Campo requerido.</span>
              <span v-else-if="v$.justificacionDenegacion.maxLength.$invalid">Máximo 1000 caracteres.</span>
            </div>

            <div class="mt-3">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label fw-semibold mb-0">Tipo de denegación</label>
                <span class="badge bg-light text-danger border border-danger">Obligatorio</span>
              </div>
              <div class="input-group input-group-sm select-denegacion">
                <span class="input-group-text bg-white"><i class="fas fa-list-check text-muted"></i></span>
                <select
                  v-model="idTipoDenegacion"
                  :aria-invalid="v$.idTipoDenegacion.$error || !!errores.idTipoDenegacion"
                  :aria-describedby="'help-tipo-deneg'"
                  :class="['form-select', {'is-invalid': v$.idTipoDenegacion.$error || !!errores.idTipoDenegacion}]"
                  required>
                  <option value="" disabled>Seleccione un tipo…</option>
                  <option v-for="t in listaTiposDenegacion" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </div>
              <div v-if="v$.idTipoDenegacion.$error || errores.idTipoDenegacion" class="invalid-feedback d-block small">
                {{ errores.idTipoDenegacion || 'Seleccione un tipo de denegación' }}
              </div>
              <div id="help-tipo-deneg" class="form-text d-flex justify-content-between">
                <span>Necesario para registrar la denegación.</span>
                <span class="text-muted">{{ listaTiposDenegacion.length }} opciones</span>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-danger px-4" @click="denegarDenuncia">
                <i class="fas fa-ban me-2"></i>Denegar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- NUEVO: contenido de la pestaña Anexar -->
      <div v-if="tabSeleccionada === 'anexar'">
        <div class="panel-anexar border rounded-3 bg-white shadow-sm">
          <div class="panel-header d-flex align-items-center gap-2 px-3 py-2 border-bottom">
            <i class="fas fa-paperclip text-primary"></i>
            <strong>Anexar</strong>
            <span class="badge bg-light text-primary border border-primary ms-auto">Estado válido ({{ estado }})</span>
          </div>
          <div class="px-3 py-3">
            <label class="form-label fw-semibold mb-1">Comentario</label>
            <textarea
              v-model="comentarioAnexar"
              :class="['form-control', {'is-invalid': v$.comentarioAnexar.$error}]"
              rows="5" maxlength="2000"
              placeholder="Ingrese el comentario (máx. 2000 caracteres)"></textarea>
            <div class="d-flex justify-content-between small mt-1 text-muted">
              <span>Obligatorio</span>
              <span>{{ comentarioAnexar.length }}/2000</span>
            </div>
            <div v-if="v$.comentarioAnexar.$error" class="invalid-feedback d-block">
              <span v-if="v$.comentarioAnexar.required.$invalid">Campo requerido.</span>
              <span v-else-if="v$.comentarioAnexar.maxLength.$invalid">Máximo 2000 caracteres.</span>
            </div>
            <div class="text-end mt-3">
              <button class="btn btn-primary"
                :disabled="enviando || v$.comentarioAnexar.$invalid"
                @click="enviarAnexo">
                <i v-if="enviando" class="fas fa-spinner fa-spin me-2"></i>
                <i v-else class="fas fa-paper-plane me-2"></i>
                Enviar Expediente
              </button>
            </div>

            <!-- Historial -->
            <div class="mt-4">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="fas fa-clock text-secondary"></i>
                <strong>Historial de traslados</strong>
                <span class="small text-muted">({{ traslados.length }})</span>
              </div>
              <div v-if="cargandoHist" class="text-muted small">
                <i class="fas fa-spinner fa-spin me-2"></i>Cargando historial…
              </div>
              <div v-else-if="!traslados.length" class="text-muted small">Sin registros.</div>
              <ul v-else class="list-group small">
                <li v-for="t in traslados" :key="t.id" class="list-group-item">
                  <div class="d-flex justify-content-between">
                    <span class="fw-semibold">{{ personaLabel(t.idPersona) }}</span>
                    <span class="text-muted">{{ formatFecha(t.fechaIngresa) }}</span>
                  </div>
                  <div class="mt-1">{{ t.descripcion }}</div>
                  <div class="text-muted mt-1">Por: {{ t.usuarioIngresa }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabSeleccionada === 'historial'">
        <!-- Ampliación -->
        <h4>Anotaciones</h4>

        <div class="form-group">
          <textarea id="justificacion" v-model="anotaciones" class="form-control" rows="5" maxlength="1000"
            placeholder="Ingrese el motivo (máximo 1000 caracteres)"
            :readonly="soloLectura || (estado === 4)"></textarea>
          <br>
          <p class="text-danger" v-if="v$.anotaciones.$error">
            <span v-if="v$.anotaciones.required.$invalid">Campo requerido.</span>
            <span v-if="v$.anotaciones.maxLength.$invalid">Máximo 1000 caracteres.</span>
          </p>
        </div>

        <button v-if="estado !== 4 && estado !== 5" class="btn btn-warning mt-2" @click="ampliarDenuncia">Solicitar
          ampliación</button>
      </div>

      <div v-if="tabSeleccionada === 'aceptacion'">
        <!-- Aceptación -->
        <h4>Observaciones</h4>

        <div class="form-group">
          <textarea id="justificacion" v-model="justificacionDenegacion" class="form-control" rows="5" maxlength="1000"
            placeholder="Ingrese el motivo (máximo 1000 caracteres)"></textarea>
          <br>
          <p class="text-danger" v-if="v$.justificacionAceptacion.$error">
            <span v-if="v$.justificacionAceptacion.maxLength.$invalid">Máximo 1000 caracteres.</span>
          </p>
        </div>

        <button class="btn btn-primary mt-2" @click="aceptarDenuncia">Aceptar</button>
      </div>
    </div>

  </div>
</template>

<script>
import Global from '@/Global'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, requiredIf, helpers } from '@vuelidate/validators'
import axios from 'axios'
import Swal from 'sweetalert2'
import SelectClasificacion from '../Botones/SelectClasificacion.vue';

export default {
  name: 'ComponenteDerecho',
  components: { SelectClasificacion },
  props: {
    id: { type: [String, Number], required: true },
    estado: { type: [String, Number], required: true },
    anotacione: { type: [String, Number], required: true },
    soloLectura: { type: Boolean, default: false },
    tieneDocFisico: { type: Boolean, default: false }
  },
  data() {
    return {
      tabSeleccionada: 'resumen', // pestaña inicial
      justificacionDenegacion: '',
      justificacionAceptacion: '',
      tipoDenunciaId: [],
      otros: '',
      tipoCalificacion: 0,
      anotaciones: '',
      idTipoDenegacion: '',
      listaTiposDenegacion: [],
      errores: { idTipoDenegacion: '' },
      comentarioAnexar: '',
      enviando: false,
      traslados: [],
      cargandoHist: false
    }
  },
  async mounted() {
    this.validarEstado();
    this.validarAnotacion();
    this.cargarTiposDenegacion()
    // Si abre directo en Anexar
    if (this.tabSeleccionada === 'anexar') this.cargarHistorialTraslados()
  },
  watch: {
    tabSeleccionada(nuevo) {
      if (nuevo === 'anexar' && !this.traslados.length) {
        this.cargarHistorialTraslados()
      }
    }
  },
  validations() {
    return {
      justificacionDenegacion: {
        required,
        maxLength: maxLength(1000)
      },
      justificacionAceptacion: {
        maxLength: maxLength(1000)
      },
      tipoDenunciaId: {
        required: helpers.withMessage('Debe seleccionar al menos una opción', v => Array.isArray(v) && v.length > 0)
      },
      otros: {
        required: requiredIf(function () {
          return this.tipoDenunciaId.includes(15);
        }),
        maxLength: maxLength(300)
      },
      anotaciones: {
        required,
        maxLength: maxLength(1000)
      },
      idTipoDenegacion: {
        required
      },
      comentarioAnexar: { required, maxLength: maxLength(2000) }
    };
  },
  setup() {
    return { v$: useVuelidate() };
  },
  computed: {
    contadorDenegacion() {
      return (this.justificacionDenegacion || '').length;
    },
    // Solo mostrar cuando estado 1 o 2 y existe documento físico
    mostrarAnexar() {
      const n = Number(this.estado)
      return (n === 1 || n === 2) && !!this.tieneDocFisico
    },
    // Mostrar pestaña Denegar cuando ya está clasificada y aún no denegada
    mostrarDenegarTab() {
      const n = Number(this.estado)
      return this.tipoCalificacion !== 0 && n !== 4
    }
  },
  methods: {
    async cargarTiposDenegacion() {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data } = await axios.get(`${Global.url}DenunciasInter/tipos-denegacion`, { headers })
        const arr = Array.isArray(data) ? data
          : (Array.isArray(data?.data) ? data.data
          : (Array.isArray(data?.result) ? data.result : []))
        const mapItem = (o) => {
          if (!o || typeof o !== 'object') return null
          const keys = Object.keys(o)
          let id = null, nombre = ''
          for (const k of keys) {
            const kl = k.toLowerCase()
            if (kl.includes('id_tipo') || kl === 'id' || kl === 'idtipodenegacion') { id = Number(o[k]); if (id) break }
          }
          for (const k of keys) {
            if (k.toLowerCase().includes('descripcion')) { nombre = String(o[k] ?? '').trim(); if (nombre) break }
          }
          return id && nombre ? { id, nombre } : null
        }
        this.listaTiposDenegacion = arr.map(mapItem).filter(Boolean)
      } catch (e) {
        this.listaTiposDenegacion = []
      }
    },

    async denegarDenuncia() {
      this.v$.justificacionDenegacion.$touch();
      if (this.v$.justificacionDenegacion.$invalid) return;

      this.errores.idTipoDenegacion = ''
      if (!this.idTipoDenegacion) {
        this.errores.idTipoDenegacion = 'Seleccione un tipo de denegación'
        return
      }
      // Motivo ya validado por Vuelidate (1000 máx). Solo normalizamos el texto.
      const motivo = (this.justificacionDenegacion || '').trim()

      const body = {
        idSicoda: Number(this.id),
        usuario: this.$store.state.userEmail || '',
        idTipoDenegacion: Number(this.idTipoDenegacion),
        motivo
      }
      const headers = {}
      const token = localStorage.getItem('token'); if (token) headers.Authorization = `Bearer ${token}`

      await axios.post(`${Global.url}DenunciasInter/denegar`, body, { headers })

      Swal.fire({
        icon: 'success',
        title: 'Denuncia denegada',
        text: 'La denuncia fue denegada correctamente.',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.$router.push('/mesaOficialR')
      })
    },

    async aceptarDenuncia() {
      this.v$.justificacionAceptacion.$touch();
      if (this.v$.justificacionAceptacion.$invalid) return;

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${Global.url}OficialReceptor/aceptar`, {
          id_sicoda: this.id,
          justificacion: this.justificacionAceptacion,
          usuarioIngreso: this.$store.state.userEmail,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await Swal.fire({
          icon: 'success',
          title: 'Denuncia Aceptada',
          text: 'La denuncia fue aceptada y trasladada correctamente.',
          confirmButtonText: 'Aceptar'
        });

        this.$router.push('/mesaOficialR');
      } catch (error) {
        console.error('Error al aceptar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al procesar la aceptación.',
          confirmButtonText: 'Aceptar'
        });
      }
    },

    async clasificarDenuncia() {
      this.v$.tipoDenunciaId.$touch();

      if (
        this.v$.tipoDenunciaId.$invalid ||
        this.tipoDenunciaId === null ||
        (this.tipoDenunciaId === 15 && this.v$.otros.$invalid)
      ) return;

      try {
        const token = localStorage.getItem('token');

        // Construye un arreglo de objetos para enviar
        const payload = this.tipoDenunciaId.map(idClasificacion => ({
          idDenu: Number(this.id),
          idClasificacion: Number(idClasificacion),
          otros: idClasificacion === 15 ? this.otros : '',
          usuarioIngreso: this.$store.state.userEmail
        }));

        await axios.post(`${Global.url}OficialReceptor/clasificar`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await Swal.fire({
          icon: 'success',
          title: 'Clasificación exitosa',
          text: 'Se registraron las clasificaciones correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          location.reload();
        });

      } catch (error) {
        console.error('Error al clasificar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar las clasificaciones.',
          confirmButtonText: 'Aceptar'
        });
      }
    },

    async validarEstado() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${Global.url}OficialReceptor/validacion/${this.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Si vienen clasificaciones
        if (Array.isArray(response.data.tipoCalificacion) && response.data.tipoCalificacion.length > 0) {
          this.tipoCalificacion = 1; // ya tiene clasificaciones, se deshabilita
          this.tipoDenunciaId = response.data.tipoCalificacion;
        } else {
          this.tipoCalificacion = 0; // no tiene, se habilita
          this.tipoDenunciaId = [];
        }

        this.otros = response.data.otros ?? '';
      }
      catch (error) {
        if (error.response && error.response.status === 400) {
          Swal.fire('Acceso Denegado', error.response.data, 'warning').then(() => {
            this.$router.push('/');
          });
        } else if (error.response && error.response.status === 404) {
          Swal.fire('No encontrado', error.response.data, 'error').then(() => {
            this.$router.push('/');
          });
        } else {
          Swal.fire('Error', 'Ocurrió un error al procesar el expediente.', 'error');
        }
      }
    },

    async ampliarDenuncia() {
      this.v$.anotaciones.$touch();
      if (this.v$.anotaciones.$invalid) return;

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${Global.url}OficialReceptor/ampliar`, {
          id_sicoda: this.id,
          justificacion: this.anotaciones,
          usuarioIngreso: this.$store.state.userEmail // se mapea a "UsuarioIngreso",
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await Swal.fire({
          icon: 'success',
          title: 'Anotaciones Creadas',
          text: 'Sus Anotaciones fueron creadas y trasladadas con el denunciante.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          location.reload(); // 🔁 Recarga la página al cerrar el Swal
        });

      } catch (error) {
        console.error('Error al crear anotaciones:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al procesar las anotaciones.',
          confirmButtonText: 'Aceptar'
        });
      }
    },

    async validarAnotacion() {
      if (this.estado == 4 || this.estado == 5) {
        this.anotaciones = this.anotacione;
      }
    },
    personaLabel(id) {
      return Number(id) === 1
        ? 'Oficial receptor de Patrullas'
        : Number(id) === 2
          ? 'Oficial de Procuración'
          : 'N/D'
    },
    formatFecha(f) {
      try { return new Date(f).toLocaleString() } catch { return f || '' }
    },
    async enviarAnexo() {
      this.v$.comentarioAnexar.$touch()
      if (this.v$.comentarioAnexar.$invalid) return
      this.enviando = true
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const body = {
          idSicoda: Number(this.id),
          usuario: this.$store?.state?.userEmail || '',
          tipo: 1,
          comentario: (this.comentarioAnexar || '').trim()
        }
        await axios.post(`${Global.url}DenunciasInter/anexar`, body, { headers })
        await Swal.fire('OK', 'Expediente enviado.', 'success')
        this.$router.push('/mesaOficialR')
      } catch (e) {
        Swal.fire('Error', e?.response?.data || 'Error al enviar.', 'error')
      } finally {
        this.enviando = false
      }
    },
    async cargarHistorialTraslados() {
      this.cargandoHist = true
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        // Endpoint 2 (propuesto): GET DenunciasInter/traslados/{idSicoda}
        const { data } = await axios.get(`${Global.url}DenunciasInter/traslados/${this.id}`, { headers })
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        this.traslados = arr.map(x => ({
          id: x.idTraslado ?? x.ID_TRASLADO ?? x.id_traslado,
          idPersona: x.idPersona ?? x.ID_PERSONA ?? x.id_persona,
          descripcion: x.descripcion ?? x.DESCRIPCION ?? '',
          usuarioIngresa: x.usuarioIngresa ?? x.USUARIO_INGRESA ?? '',
          fechaIngresa: x.fechaIngresa ?? x.FECHA_INGRESA ?? ''
        }))
      } catch {
        this.traslados = []
      } finally {
        this.cargandoHist = false
      }
    }
  }
}
</script>

<style scoped>
/* Estética existente */
.panel-denegar { background: #ffffff; }
.panel-denegar .panel-header { background: #f8f9fb; }
.form-control.is-invalid, .form-select.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 .1rem rgba(220,53,69,.08);
}
.select-denegacion .input-group-text { border-right: 0; }
.select-denegacion .form-select {
  border-left: 0;
  transition: box-shadow .15s ease, border-color .15s ease, background-color .15s ease;
}
.select-denegacion .form-select:hover { background-color: #fcfcfd; }
.select-denegacion .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 .15rem rgba(13,110,253,.15);
}
.card-header { background:#f8f9fb; }
/* Panel de anexar */
.panel-anexar { background:#fff; }
.panel-anexar .panel-header { background:#f8f9fb; }
</style>
>