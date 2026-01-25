<template>
  <div class="container mt-4">
    <button class="btn btn-secondary mb-3" @click="volver">← Volver</button>
    <h2 class="mb-3">Historial de Estados: {{ idSicoda }}</h2>

    <div v-if="cargando" class="text-center my-5">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
    </div>

    <div v-else>
      <table class="table custom-table">
        <thead class="thead-dark">
          <tr>
            <th>Fecha Actividad</th>
            <th>Trámite</th>
            <th>Persona que realiza la actividad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, idx) in historial"
            :key="idx + item.fechaActividad"
            :class="getRowClass(item.estadoDescripcion)"
          >
            <td>{{ formatearFecha(item.fechaActividad) }}</td>
            <td>{{ item.descripcionEvento }}</td>
            <td>{{ item.usuarioActividad }}</td>
            <td class="text-center">
              <!-- Sólo aparece cuando descripcionEvento es "Análisis" -->
              <button
                v-if="esDescargable(item)"
                class="btn btn-icon btn-sm btn-danger"
                @click="generarPDF(idSicoda)"
              >
                <i class="fas fa-file-pdf"></i>
              </button>
            </td>
          </tr>
          <tr v-if="historial.length === 0">
            <td colspan="4" class="text-center py-3">
              No hay historial registrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Global from '@/Global';
import Swal from 'sweetalert2';

export default {
  name: 'HistorialEstados',
  props: {
    idSicoda: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      historial: [],
      cargando: true
    };
  },
  methods: {
    async cargarHistorial() {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get(
          `${Global.url}Denuncias/historial/${this.idSicoda}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.historial = resp.data;
      } catch (err) {
        console.error('Error al obtener historial:', err);
        if (err.response?.status === 404) {
          Swal.fire('Sin histórico', 'No se encontró historial para esta denuncia.', 'info');
        } else {
          Swal.fire('Error', 'Ocurrió un error al cargar el historial.', 'error');
        }
        this.historial = [];
      } finally {
        this.cargando = false;
      }
    },
    volver() {
      this.$router.back();
    },
    formatearFecha(fecha) {
      if (!fecha) return '-';
      const d = new Date(fecha);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    },
    getRowClass(estado) {
      if (!estado) return '';
      const est = estado.trim().toLowerCase();
      switch (est) {
        case 'registro': return 'borde-registro';
        case 'admisión': case 'admision': return 'borde-admision';
        case 'denegada': return 'borde-denegada';
        case 'ampliación': case 'ampliacion': return 'borde-ampliacion';
        case 'validación': case 'validacion': return 'borde-validacion';
        case 'análisis': case 'analisis': return 'borde-analisis';
        case 'revisión': case 'revision': return 'borde-revision';
        case 'aprobación': case 'aprobacion': return 'borde-aprobacion';
        case 'actual': return 'borde-actual';
        case 'no actual': return 'borde-noactual';
        default: return '';
      }
    },
    /**
     * Sólo devuelve true si el evento de la fila es "Análisis".
     */
    esDescargable(item) {
      const text = (item.descripcionEvento || '')
        .toString()
        .trim()
        .toLowerCase();
      return text === 'análisis' || text === 'analisis';
    },
    /**
     * Descarga el PDF de la denuncia.
     */
    generarPDF(id) {
      const token = localStorage.getItem('token');
      axios({
        url: `${Global.url}Utilidades/generar-pdf/${id}`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const blob = new Blob([res.data], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `Denuncia_${id}.pdf`;
          link.click();
        })
        .catch(err => {
          console.error('Error al generar el PDF:', err);
          Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
        });
    }
  },
  mounted() {
    this.cargarHistorial();
  }
};
</script>
<style scoped>
.container {
  max-width: 900px;
}

/* Encabezado oscuro */
.thead-dark th {
  background-color: #343a40;
  color: #fff;
}

/* Tabla sin bordes fuertes, con hover sutil */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.custom-table th,
.custom-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

/* Hover suave */
.custom-table tbody tr:hover {
  background-color: #f2f2f2;
}

/* Icono del estado (última columna) */
.icono-estado {
  font-size: 1.4rem;
  vertical-align: middle;
  opacity: 0.8;
}

/* Icono del evento (segunda columna) */
.icono-evento {
  font-size: 1.3rem;
  vertical-align: middle;
  opacity: 0.8;
}

/* ************************************************************* */
/* Clases para borde izquierdo según estado (colores pastel)    */
/* ************************************************************* */

/* Registro: gris claro */
.borde-registro {
  border-left: 5px solid #adb5bd;
  /* #adb5bd = gris */
  background-color: #f8f9fa;
  /* #f8f9fa = gris muy claro */
}

/* Admisión: azul claro */
.borde-admision {
  border-left: 5px solid #4dabf7;
  /* #4dabf7 = azul pastel */
  background-color: #e7f5ff;
  /* #e7f5ff = celeste muy suave */
}

/* Denegada: rojo suave */
.borde-denegada {
  border-left: 5px solid #f06595;
  /* #f06595 = rosa/rojo pastel */
  background-color: #ffe3e3;
  /* #ffe3e3 = rojo muy claro */
}

/* Ampliación: naranja suave */
.borde-ampliacion {
  border-left: 5px solid #fcc419;
  /* #fcc419 = amarillo mostaza */
  background-color: #fff9db;
  /* #fff9db = amarillo muy suave */
}

/* Validación: verde agua */
.borde-validacion {
  border-left: 5px solid #51cf66;
  /* #51cf66 = verde pastel */
  background-color: #e3fafc;
  /* #e3fafc = turquesa muy claro */
}

/* Análisis: azul suave */
.borde-analisis {
  border-left: 5px solid #339af0;
  /* #339af0 = azul vivo */
  background-color: #d0ebff;
  /* #d0ebff = celeste suave */
}

/* Revisión: morado suave */
.borde-revision {
  border-left: 5px solid #845ef7;
  /* #845ef7 = morado pastel */
  background-color: #f3f0ff;
  /* #f3f0ff = lila muy claro */
}

/* Aprobación: verde pastel */
.borde-aprobacion {
  border-left: 5px solid #69db7c;
  /* #69db7c = verde claro */
  background-color: #ebfbee;
  /* #ebfbee = verde muy suave */
}

/* ACTUAL: verde más oscuro */
.borde-actual {
  border-left: 5px solid #2f9e44;
  /* #2f9e44 = verde bosque */
  background-color: #e6fcf5;
  /* #e6fcf5 = verde muy pálido */
}

/* NO ACTUAL: amarillo apagado */
.borde-noactual {
  border-left: 5px solid #ffd43b;
  /* #ffd43b = amarillo pastel */
  background-color: #fff9db;
  /* misma que ampliación, para suavidad */
}

/* ************************************************************* */

/* Texto del estado en negrita */
.fw-bold {
  font-weight: 600 !important;
}
</style>
