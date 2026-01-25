<!-- src/views/ExpedienteDenunciaOficial.vue -->
<template>
  <div class="card shadow-sm p-4">
    <!-- Número de denuncia -->
    <div class="alert alert-dark" v-if="denuncia">
      <strong>NO-DENUNCIA: {{ denuncia.noDenuncia }}</strong>
    </div>

    <!-- Contenedor de dos columnas -->
    <div class="contenedor-dos-columnas">
      <!-- Columna izquierda -->
      <div class="columna izquierda">
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: tabSeleccionada === 'resumen' }"
              @click="tabSeleccionada = 'resumen'">
              Información de la Denuncia
            </button>
          </li>
          <li v-if="tipoDenu !== 4">
            <button
              class="nav-link"
              :class="{ active: tabSeleccionada === 'contacto' }"
              @click="tabSeleccionada = 'contacto'"
            >
              Documento Físico
            </button>
          </li>
          <!-- NUEVO: pestaña Informe cuando exista -->
          <li v-if="informeUrl">
            <button
              class="nav-link"
              :class="{ active: tabSeleccionada === 'informe' }"
              @click="tabSeleccionada = 'informe'">
              Informe
            </button>
          </li>
        </ul>

        <div class="tab-content p-3 border rounded bg-light">
          <div v-if="tabSeleccionada === 'resumen'">
            <h5>Información Denuncia</h5>
            <ComponenteIzquierdo :id="id" :soloLectura="true" />
          </div>

          <div v-if="tabSeleccionada === 'contacto'">
            <h4>Documento Físico</h4>
            <div class="pdf-container">
              <iframe
                v-if="documentoUrl"
                :src="documentoUrl"
                class="pdf-iframe"
                title="Informe PDF"
              ></iframe>
              <p v-else class="text-center mt-4">Cargando PDF…</p>
            </div>
          </div>

          <!-- NUEVO: contenido del Informe -->
          <div v-if="tabSeleccionada === 'informe'">
            <h4>Informe</h4>
            <div class="pdf-container">
              <iframe
                v-if="informeUrl"
                :src="informeUrl"
                class="pdf-iframe"
                title="Informe PDF"></iframe>
              <p v-else class="text-center mt-4">Sin informe disponible.</p>
            </div>
            <div class="mt-2 text-end">
              <a v-if="informeUrl" :href="informeUrl" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-up-right-from-square me-1"></i> Abrir en pestaña
              </a>
            </div>
          </div>
          
        </div>
      </div>
      <!-- /Columna izquierda -->

      <!-- Columna derecha -->
      <div class="columna derecha">
        <ComponenteDerecho
          v-if="denuncia"
          :id="id"
          :estado="denuncia.estado"
          :anotacione="denuncia.anotaciones"
          :tieneDocFisico="tieneDocFisico"
        />
      </div>
      <!-- /Columna derecha -->
    </div>
    <!-- /Contenedor de dos columnas -->

    <!-- Botón regresar -->
    <router-link to="/mesaOficialR" class="btn btn-secondary mt-3">
      <i class="fas fa-arrow-left me-2"></i> Regresar a la Bandeja
    </router-link>
  </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';
import Swal from 'sweetalert2';

import ComponenteIzquierdo from '@/components/Reutilizable/ComponenteIzquierdo.vue';
import ComponenteDerecho from '@/components/Reutilizable/ComponenteDerecho.vue';

export default {
  name: 'ExpedienteDenunciaOficial',
  components: { ComponenteIzquierdo, ComponenteDerecho },
  props: {
    id: { type: String, required: true }
  },
  data() {
    return {
      denuncia: null,
      tipoDenu: null,
      documentoUrl: '',
      tabSeleccionada: 'resumen', // definimos una pestaña por defecto
      // Denegar
      listaTiposDenegacion: [],
      denegando: false,
      // NUEVO
      informeUrl: '',
      tieneDocFisico: false
    };
  },
  computed: {
    // Bloquea botón si el estado ya es final
    puedeDenegar() {
      const est = (this.denuncia?.estado || '').toString().toUpperCase();
      return est !== 'ACEPTADO' && est !== 'DENEGADO';
    }
  },
  async mounted() {
    try {
      const token   = localStorage.getItem('token');
      const usuario = this.$store.state.userEmail;
      const { data } = await axios.post(
        `${Global.url}OficialReceptor/expediente/${this.id}`,
        { usuarioIngreso: usuario },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.denuncia  = data;
      this.tipoDenu  = Number(data.tipoDenu);

      if (this.tipoDenu !== 4 && data.documentoFisico) {
        this.documentoUrl = 'data:application/pdf;base64,' + data.documentoFisico;
        this.tieneDocFisico = true;
      } else {
        this.tieneDocFisico = false;
      }

      // NUEVO: armar URL absoluta del informe si viene
      if (data.pathInforme) {
        const origin = (() => {
          try { return new URL(Global.url, window.location.origin).origin; } catch { return ''; }
        })();
        const rel = ('' + data.pathInforme).startsWith('/') ? ('' + data.pathInforme) : '/' + data.pathInforme;
        this.informeUrl = origin + rel;
      }

      if (data.actualizado) {
        Swal.fire('Expediente Actualizado', data.message, 'success');
      }
    } catch (error) {
      const resp = error.response;
      if (resp?.status === 400) {
        await Swal.fire('Acceso Denegado', resp.data, 'warning');
        this.$router.push('/');
      } else if (resp?.status === 404) {
        await Swal.fire('No Encontrado', resp.data, 'error');
        this.$router.push('/');
      } else {
        Swal.fire('Error', 'Ocurrió un error al procesar el expediente.', 'error');
      }
    }
  },
  methods: {
    async cargarTiposDenegacion() {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const url = `${Global.url}DenunciasInter/tipos-denegacion`;
        const { data } = await axios.get(url, { headers });

        const rawArray = Array.isArray(data)
          ? data
          : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.result) ? data.result : []));

        const mapItem = (o) => {
          if (!o || typeof o !== 'object') return null;
          const keys = Object.keys(o);
          let idVal = null;
          for (const k of keys) {
            const kl = k.toLowerCase();
            if (kl.includes('id_tipo') || kl === 'id' || kl === 'idtipodenegacion') {
              idVal = Number(o[k]); if (!isNaN(idVal) && idVal > 0) break;
            }
          }
          let descVal = '';
          for (const k of keys) {
            const kl = k.toLowerCase();
            if (kl.includes('descripcion')) { descVal = (o[k] ?? '').toString().trim(); if (descVal) break; }
          }
          if (!idVal || !descVal) return null;
          return { id: idVal, nombre: descVal };
        };

        this.listaTiposDenegacion = rawArray.map(mapItem).filter(x => x && x.id > 0 && x.nombre.length);
      } catch (e) {
        console.error('Tipos denegación ERROR', e);
        await Swal.fire('Aviso', 'No fue posible cargar los tipos de denegación.', 'info');
        this.listaTiposDenegacion = [];
      }
    },

    async denegarExpediente() {
      if (!this.puedeDenegar) {
        Swal.fire('Acción bloqueada', 'No permitido en este estado.', 'info');
        return;
      }

      if (!this.listaTiposDenegacion.length) {
        await this.cargarTiposDenegacion();
      }
      if (!this.listaTiposDenegacion.length) {
        Swal.fire('Error', 'No hay tipos de denegación configurados.', 'error');
        return;
      }

      // Mantiene la esencia: validación de motivo; ahora también tipo requerido.
      const radiosHtml = this.listaTiposDenegacion.map(o => `
        <label class="d-flex align-items-center gap-2 mb-1">
          <input type="radio" name="tipoDeneg" value="${o.id}" />
          <span>${o.nombre}</span>
        </label>
      `).join('');

      const { value, isDismissed } = await Swal.fire({
        title: 'Denegar expediente',
        width: 650,
        html: `
          <div class="text-start">
            <div class="mb-3">
              <label class="form-label fw-semibold mb-1">Tipo de denegación</label>
              <div id="swTiposDeneg" class="d-grid">${radiosHtml}</div>
            </div>
            <div>
              <label class="form-label fw-semibold mb-1">Motivo</label>
              <textarea id="swMotivoDeneg" class="form-control form-control-sm" rows="5" maxlength="500"
                placeholder="Describe el motivo… (máximo 500 caracteres)"></textarea>
              <div class="form-text mt-1">Ambos campos son obligatorios. Máximo 500 caracteres.</div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Denegar',
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        preConfirm: () => {
          const checked = document.querySelector('input[name="tipoDeneg"]:checked');
          const idTipo = Number((checked?.value || '').trim());
          const motivo = String((document.getElementById('swMotivoDeneg')?.value || '')).trim();
          if (!idTipo) { Swal.showValidationMessage('Seleccione un tipo de denegación'); return false; }
          if (!motivo) { Swal.showValidationMessage('El motivo es obligatorio'); return false; }
          if (motivo.length > 500) { Swal.showValidationMessage('Máximo 500 caracteres'); return false; }
          return { idTipo, motivo };
        }
      });
      if (isDismissed) return;

      this.denegando = true;
      try {
        const body = {
          idSicoda: Number(this.id),
          usuario: this.$store.state.userEmail || '',
          idTipoDenegacion: value.idTipo,
          motivo: value.motivo
        };
        const headers = {};
        const token = localStorage.getItem('token'); if (token) headers.Authorization = `Bearer ${token}`;

        await axios.post(`${Global.url}DenunciasInter/denegar`, body, { headers });
        await Swal.fire('Listo', 'El expediente fue denegado.', 'success');
        // Redirección directa a Procuración
        this.$router.push('/procuracion');
        return;
      } catch (e) {
        const msg = e.response?.data?.mensaje || 'Error al denegar.';
        Swal.fire('Error', msg, 'error');
      } finally {
        this.denegando = false;
      }
    }
  }
};
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 8px;
}

/* Contenedor de dos columnas */
.contenedor-dos-columnas {
  display: flex;
  height: 700px;
  gap: 1rem;
}

.columna.izquierda,
.columna.derecha {
  width: 50%;
  max-height: 800px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 0.5rem;
}

/* PDF */
.pdf-container {
  height: 700px;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.columna.izquierda {
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem; 
}
</style>
