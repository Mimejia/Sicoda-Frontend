<template>
    <div class="form-group">
      <label class="font-weight-bold">¿Cómo calificarías esta denuncia?</label>
      <div class="d-flex justify-content-between">
        <div
          v-for="cal in calificaciones"
          :key="cal.value"
          @click="seleccionar(cal.value)"
          class="text-center cursor-pointer p-2"
          :class="{ 'border border-success rounded': modelValue === cal.value }"
          style="width: 18%; transition: 0.3s;"
        >
          <div class="emoji" :style="{ fontSize: '1.8rem' }">{{ cal.emoji }}</div>
          <div class="mt-1 small">{{ cal.label }}</div>
        </div>
      </div>
      <div v-if="error" class="text-danger small mt-2">
        Debes seleccionar una calificación
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SelectCalificacion',
    props: {
      modelValue: Number,
      error: Boolean
    },
    emits: ['update:modelValue'],
    data() {
      return {
        calificaciones: [
          { value: 1, label: 'Muy Mala', emoji: '😠' },
          { value: 2, label: 'Mala', emoji: '🙁' },
          { value: 3, label: 'Normal', emoji: '😐' },
          { value: 4, label: 'Buena', emoji: '🙂' },
          { value: 5, label: 'Muy Buena', emoji: '😄' }
        ]
      };
    },
    methods: {
      seleccionar(valor) {
        this.$emit('update:modelValue', valor);
      }
    }
  };
  </script>
  
  <style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
  </style>
  