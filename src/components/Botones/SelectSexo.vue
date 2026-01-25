<template>
  <div class="form-group">
    <label for="sexo" class="font-weight-bold">Sexo</label>
    <v-select id="sexo" :options="options" v-model="selectedValue" :reduce="option => option.value" label="label"
      :placeholder="'Seleccione una opción'" />
  </div>
</template>

<script>
import Global from '@/Global';
import 'vue-select/dist/vue-select.css';
import vSelect from 'vue-select';

export default {
  name: 'SelectSexo',
  components: { vSelect },
  props: {
    modelValue: {
      type: [String, Number], // ✅ acepta string y number
      default: ''
    }
  }
  ,
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
    this.cargarSexos();
  },
  methods: {
    async cargarSexos() {
      try {
        const res = await fetch(this.url + 'utilidades/sexos');
        this.options = await res.json();
      } catch (error) {
        console.error('Error al obtener sexos:', error);
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
