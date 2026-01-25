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
import Global from '@/Global';
import 'vue-select/dist/vue-select.css';
import vSelect from 'vue-select';

export default {
    name: 'SelectMunicipio',
    components: { vSelect },
    props: {
        modelValue: {
    type: [String, Number],
    default: ''
  },
        placeholder: {
            type: String,
            default: 'Seleccionar municipio'
        },
        departamentoId: {
            type: [String, Number],
            default: null
        }
    },
    data() {
        return {
            options: [],
            url: Global.url,
        };
    },
    watch: {
  departamentoId: {
    immediate: true,
    handler(newVal) {
      if (newVal) {
        this.fetchMunicipios(newVal);
      } else {
        this.options = [];
      }
    }
  }
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
    methods: {
        async fetchMunicipios(idDepartamento) {
            // console.log("Cargando municipios para departamento", idDepartamento);

            try {
                const response = await fetch(`${this.url}utilidades/municipios/${idDepartamento}`);
                // console.log(response);
                this.options = await response.json();
            } catch (error) {
                console.error('Error al obtener municipios:', error);
            }
        }
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
