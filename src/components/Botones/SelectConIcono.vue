<template>
    <div>
      <label :for="id" class="form-label">{{ label }}</label>
      <select
        :id="id"
        class="form-select"
        v-model="selectedValue"
        @change="emitChange"
      >
        <option disabled value="">Seleccione una opción</option>
        <option
          v-for="opcion in options"
          :key="opcion.value"
          :value="opcion.value"
          v-html="renderOption(opcion)"
        ></option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SelectConIcono',
    props: {
      options: {
        type: Array,
        required: true,
      },
      modelValue: {
        required: true,
      },
      label: {
        type: String,
        default: 'Seleccione:',
      },
      id: {
        type: String,
        default: 'select-con-icono'
      }
    },
    computed: {
      selectedValue: {
        get() {
          return this.modelValue;
        },
        set(val) {
          this.$emit('update:modelValue', val);
        }
      }
    },
    methods: {
      renderOption(opcion) {
        return `<i class="${opcion.icon} me-2"></i> ${opcion.label}`;
      },
      emitChange() {
        this.$emit('change', this.modelValue);
      }
    }
  }
  </script>
  
  <style scoped>
  select.form-select option {
    padding-left: 1.5rem;
  }
  </style>
  