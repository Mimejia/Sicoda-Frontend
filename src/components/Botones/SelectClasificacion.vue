<template>
  <div>
    <!-- Iteramos cada bloque -->
    <div
      v-for="(bloque, idx) in bloques"
      :key="idx"
      class="bloque-opciones"
    >
      <div class="row">
        <div
          v-for="opcion in bloque"
          :key="opcion.value"
          class="col-md-6 mb-4"
        >
          <button
            type="button"
            class="card w-100 text-left p-4 border"
            :class="{ 'border-primary shadow-sm': modelValue.includes(opcion.value) }"
            @click="toggleSeleccion(opcion.value)"
            :disabled="disabled"
          >
            <div class="d-flex align-items-center">
              <div class="icon-container mr-4">
                <i
                  :class="[ iconos[opcion.value] || 'fas fa-question', 'text-primary' ]"
                  style="font-size: 2rem;"
                ></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="font-weight-bold mb-1">{{ opcion.name }}</h6>
              </div>
              <div v-if="modelValue.includes(opcion.value)" class="ml-2">
                <i
                  class="fas fa-check-circle text-success"
                  style="font-size: 1.5rem;"
                ></i>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Separador blanco entre bloques -->
      <div
        v-if="idx < bloques.length - 1"
        class="separator-block"
      ></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Global from '@/Global'

export default {
  name: 'SelectClasificacion',
  props: {
    modelValue: {
      type: Array,
      default: () => []
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
        1: 'fas fa-ban',
        2: 'fas fa-check-circle',
        3: 'fas fa-file-alt',
        4: 'fas fa-file-excel',
        5: 'fas fa-wind',
        6: 'fas fa-mountain',
        7: 'fas fa-eye',
        8: 'fas fa-volume-up',
        9: 'fas fa-leaf',
        10: 'fas fa-gem',
        11: 'fas fa-water',
        12: 'fas fa-tools',
        13: 'fas fa-file-contract',
        14: 'fas fa-ellipsis-h',
        15: 'fas fa-question-circle'
      }
    }
  },
  computed: {
    // Partimos el arreglo cuando encontramos la opción "Visual"
    bloques() {
      const bloques = []
      let actual = []
      for (const opc of this.opciones) {
        if (opc.name === 'Visual') {
          bloques.push(actual)
          actual = []
        }
        actual.push(opc)
      }
      if (actual.length) bloques.push(actual)
      return bloques
    }
  },
  mounted() {
    axios
      .get(`${Global.url}utilidades/tipo-clasificacion`)
      .then(res => {
        this.opciones = Array.isArray(res.data) ? res.data : []
      })
      .catch(err => {
        console.error('Error al cargar tipos de clasificación:', err)
      })
  },
  methods: {
    toggleSeleccion(valor) {
      if (this.disabled) return
      const sel = [...this.modelValue]
      const i = sel.indexOf(valor)
      i >= 0 ? sel.splice(i, 1) : sel.push(valor)
      this.$emit('update:modelValue', sel)
    }
  }
}
</script>

<style scoped>
.bloque-opciones {
  margin-bottom: 1.5rem;
}

.separator-block {
  width: 100%;
  height: 1.25rem;                /* Ajusta la altura del gap */
  background-color: #fff;         /* Blanco puro */
  border-radius: 0.25rem;         /* Bordes suaves opcionales */
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); /* Luz interior para destacar */
  margin: 1rem 0;                 /* Espacio arriba y abajo */
}

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
