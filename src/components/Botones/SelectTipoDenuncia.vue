<template>
  <div class="row">
    <div v-for="opcion in opciones" :key="opcion.value" class="col-md-6 mb-4">
      <button type="button" class="card w-100 text-left p-4 border"
        :class="{ 'border-primary shadow-sm': modelValue === opcion.value }" @click="seleccionar(opcion.value)" :disabled="disabled">
        <div class="d-flex align-items-center">
          <div class="icon-container mr-4">
            <i :class="[iconos[opcion.value] || 'fas fa-question', 'text-primary']" style="font-size: 2rem;"></i>
          </div>


          <div class="flex-grow-1">
            <h6 class="font-weight-bold mb-1">{{ opcion.label }}</h6>
            <p class="font-weight-bold mb-0">{{ opcion.name }}</p>
          </div>

          <div v-if="modelValue === opcion.value" class="ml-2">
            <i class="fas fa-check-circle text-success" style="font-size: 1.5rem;"></i>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';

export default {
  name: 'SelectTipoDenuncia',
  props: {
    modelValue: {
      type: [Number, null, undefined],
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      opciones: [],
      iconos: {
        1: 'fas fa-wind',         // Aire
        2: 'fas fa-volume-up',    // Ruido
        3: 'fas fa-trash-alt',    // Suelo
        4: 'fas fa-water',        // Agua
        5: 'fas fa-eye',          // Visual
        6: 'fas fa-question'      // Otros
      }
    };
  },
  mounted() {
    axios.get(`${Global.url}utilidades/tipo-denuncias`)
      .then(res => {
        if (Array.isArray(res.data)) {
          this.opciones = res.data;
        } else {
          console.warn('Respuesta inválida:', res.data);
          this.opciones = [];
        }
      })
      .catch(err => {
        console.error('Error al cargar tipos de denuncia:', err);
      });
  },
  methods: {
    seleccionar(valor) {
      if (valor !== this.modelValue) {
        this.$emit('update:modelValue', valor);
      }
    }
  }
};
</script>

<style scoped>
.card {
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0 0.75rem rgba(0, 0, 0, 0.1);
}

.icon-container {
  width: 3rem;
  display: flex;
  justify-content: center;
}
button:disabled {
  cursor: not-allowed;
  pointer-events: none;
}

</style>
