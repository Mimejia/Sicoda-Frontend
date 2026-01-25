<template>
  <div class="d-flex gap-2">
    <button
      type="button"
      class="btn-toggle btn-si"
      :class="{ active: modelValue === true }"
      @click="$emit('update:modelValue', true)"
      :disabled="disabled"
    >
      <IconCheck class="mr-1" />
      Sí
    </button>

    <button
      type="button"
      class="btn-toggle btn-no"
      :class="{ active: modelValue === false }"
      @click="$emit('update:modelValue', false)"
      :disabled="disabled"
    >
      <IconX class="mr-1" />
      No
    </button>
  </div>
</template>

<script>
export default {
  name: 'BotonAnonimo',
  props: {
    modelValue: Boolean,
    disabled: Boolean
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.d-flex {
  display: flex;
}

.gap-2 {
  gap: 1rem;
}

/* Estilo base de ambos botones */
.btn-toggle {
  padding: 0.85rem 2rem;
  border-radius: 999px;
  border: none;
  font-weight: bold;
  color: white;
  transition: background-color 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Estilo botón "Sí" */
.btn-si {
  background-color: #c8e6c9; /* Verde claro grisáceo */
  color: #388e3c; /* Verde fuerte para texto */
}

/* Estilo botón "No" */
.btn-no {
  background-color: #ffcdd2; /* Rojo claro grisáceo */
  color: #d32f2f; /* Rojo fuerte para texto */
}

/* Cuando se activa (seleccionado) */
.btn-si.active {
  background-color: #388e3c; /* Verde oscuro activo */
  color: white;
}

.btn-no.active {
  background-color: #d32f2f; /* Rojo oscuro activo */
  color: white;
}
.btn-toggle:disabled {
  opacity: 1;
  cursor: not-allowed;
  pointer-events: none;
}

</style>
