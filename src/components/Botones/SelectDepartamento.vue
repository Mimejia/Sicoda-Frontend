<template>
    <v-select :options="options" v-model="selectedValue" :reduce="option => option.value"
        @update:modelValue="$emit('update:modelValue', $event)" :placeholder="placeholder" label="label" />

</template>

<script>
import axios from 'axios';
import Global from '../../Global'; // Corrige según tu estructura real
import 'vue-select/dist/vue-select.css';
import vSelect from 'vue-select';

export default {
    name: 'SelectDepartamento',
    components: { vSelect },
    props: {
        modelValue: {
            type: [String, Number],
            default: ''
        },
        placeholder: {
            type: String,
            default: 'Seleccionar Departamento'
        }
    },
    data() {
        return {
            options: [],
            url: Global.url,
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
        axios.get(this.url + 'utilidades/departamentos')
            .then(res => {
                this.options = res.data;
            })
            .catch(err => {
                console.error('Error al obtener departamentos:', err);
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
