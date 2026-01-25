<template>
    <v-select
      :options="options"
      v-model="selectedValue"
      :reduce="option => option.value"
      @update:modelValue="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      label="label"
    />
  </template>
  
  <script>
  import axios from 'axios';
  import Global from '@/Global';
  import 'vue-select/dist/vue-select.css';
  import vSelect from 'vue-select';
  
  export default {
    name: 'SelectEtnia',
    components: { vSelect },
    props: {
      modelValue: [String, Number],
      placeholder: {
        type: String,
        default: 'Seleccionar etnia'
      }
    },
    data() {
      return {
        options: [],
        url: Global.url
      };
    },
    computed: {
      selectedValue: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        }
      }
    },
    mounted() {
      axios.get(this.url + 'utilidades/etnias')
        .then(res => {
          this.options = res.data;
        })
        .catch(err => {
          console.error('Error al obtener etnias:', err);
        });
    }
  };
  </script>
  
  <style scoped>
  .v-select {
    font-family: inherit;
    width: 100%;
    background-color: white;
  }
  </style>
  