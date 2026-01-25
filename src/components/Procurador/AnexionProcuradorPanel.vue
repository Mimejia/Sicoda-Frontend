<template>
  <div class="panel-anexion border rounded bg-white shadow-sm">
    <div class="panel-header px-3 py-2 border-bottom d-flex align-items-center gap-2">
      <i class="fas fa-link text-primary"></i>
      <strong>Anexión de Expediente</strong>
    </div>
    <div class="p-3">
      <label class="form-label fw-semibold mb-1">Seleccionar denuncia (estado 8)</label>
      <v-select
        :options="opciones"
        :reduce="o => o.id"
        label="label"
        v-model="idDestino"
        :class="{'is-invalid': validar && !idDestino}"
        placeholder="Escriba para buscar..."
        @search="onSearch" />
      <div class="invalid-feedback d-block" v-if="validar && !idDestino">
        Selección obligatoria.
      </div>

      <div class="mt-3">
        <button class="btn btn-success me-2"
                :disabled="enviando || !idDestino"
                @click="anexarExpediente">
          <i v-if="enviando && accion==='anexar'" class="fas fa-spinner fa-spin me-1"></i>
          <i v-else class="fas fa-check me-1"></i>
          Anexar
        </button>

        <button class="btn btn-outline-danger"
                :disabled="enviando || !idDestino"
                @click="mostrarDenegar = !mostrarDenegar">
          <i class="fas fa-ban me-1"></i> Denegar Anexión
        </button>
      </div>

      <!-- Denegar -->
      <div v-if="mostrarDenegar" class="mt-4">
        <label class="form-label fw-semibold mb-1">Motivo de no anexión</label>
        <textarea
          v-model="motivoDenegar"
          :class="['form-control', {'is-invalid': validarDenegar && !motivoValido}]"
          rows="4"
          maxlength="1000"
          placeholder="Explique la razón (mín. 10, máx. 1000 caracteres)"></textarea>
        <div class="invalid-feedback d-block" v-if="validarDenegar && !motivoValido">
          El motivo es obligatorio (10–1000 caracteres).
        </div>
        <div class="text-end mt-2">
          <button class="btn btn-danger"
                  :disabled="enviando || !idDestino"
                  @click="denegarAnexion">
            <i v-if="enviando && accion==='denegar'" class="fas fa-spinner fa-spin me-1"></i>
            <i v-else class="fas fa-ban me-1"></i> Denegar y Regresar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import axios from 'axios'
import Swal from 'sweetalert2'
import Global from '@/Global'

export default {
  name: 'AnexionProcuradorPanel',
  components: { vSelect },
  props: {
    idOrigen: { type: [String, Number], required: true }
  },
  data() {
    return {
      opciones: [],
      idDestino: null,
      buscarTexto: '',
      enviando: false,
      validar: false,
      mostrarDenegar: false,
      motivoDenegar: '',
      validarDenegar: false,
      accion: ''
    }
  },
  computed: {
    motivoValido() {
      const m = (this.motivoDenegar || '').trim()
      return m.length >= 10 && m.length <= 1000
    }
  },
  mounted() {
    this.cargarOpciones()
  },
  methods: {
    async cargarOpciones() {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const params = this.buscarTexto ? { q: this.buscarTexto } : {}
        const { data } = await axios.get(`${Global.url}Procurador/denuncias-anexables`, { headers, params })
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        this.opciones = arr.map(d => ({
          id: d.idSicoda ?? d.id ?? d.ID_SICODA,
          label: d.noDenuncia ?? d.NO_DENUNCIA
        })).filter(o => o.id && o.label)
      } catch {
        this.opciones = []
      }
    },
    onSearch(txt) {
      this.buscarTexto = txt
      this.cargarOpciones()
    },
    async anexarExpediente() {
      this.validar = true
      if (!this.idDestino) return
      this.enviando = true
      this.accion = 'anexar'
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const body = {
          idOrigen: Number(this.idOrigen),
          idDestino: Number(this.idDestino),
          usuario: this.$store?.state?.userEmail || ''
        }
        await axios.post(`${Global.url}Procurador/anexar`, body, { headers })
        await Swal.fire('Éxito', 'Expediente anexado correctamente.', 'success')
        this.$router.push('/mesaProcuracion')
      } catch (e) {
        Swal.fire('Error', e?.response?.data || 'No fue posible anexar.', 'error')
      } finally {
        this.enviando = false
        this.accion = ''
      }
    },
    async denegarAnexion() {
      this.validarDenegar = true
      if (!this.idDestino || !this.motivoValido) return
      this.enviando = true
      this.accion = 'denegar'
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const body = {
          idOrigen: Number(this.idOrigen),
          idDestino: Number(this.idDestino),
          usuario: this.$store?.state?.userEmail || '',
          motivo: (this.motivoDenegar || '').trim()
        }
        await axios.post(`${Global.url}Procurador/denegar-anexion`, body, { headers })
        await Swal.fire('Proceso', 'Anexión denegada.', 'success')
        this.$router.push('/mesaProcuracion')
      } catch (e) {
        Swal.fire('Error', e?.response?.data || 'No fue posible denegar.', 'error')
      } finally {
        this.enviando = false
        this.accion = ''
      }
    }
  }
}
</script>

<style scoped>
.panel-anexion .panel-header { background:#f8f9fb; }
.v-select.is-invalid .vs__dropdown-toggle { border-color:#dc3545; }
.v-select.is-invalid .vs__dropdown-toggle:focus { box-shadow:0 0 0 .2rem rgba(220,53,69,.15); }
</style>