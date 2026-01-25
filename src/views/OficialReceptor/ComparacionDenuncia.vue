<template>
    <div class="card shadow-sm p-4">
       
        <!-- Contenedor de comparación -->
        <div class="contenedor-dos-columnas">
            <!-- Columna izquierda -->
            <div class="columna izquierda">
                <div class="alert alert-info text-center">
                    <strong>DENUNCIA BASE: {{ noDenunciaBase }}</strong>
                </div>
                <ComponenteIzquierdo :id="id" :soloLectura="true" />
            </div>

            <!-- Columna derecha -->
            <div class="columna derecha" v-if="idComparada">
                <div class="alert alert-warning text-center">
                    <strong>DENUNCIA COMPARADA: {{ noDenunciaComparada }}</strong>
                </div>
                <ComponenteIzquierdo :id="idComparada" :soloLectura="true" />
            </div>
        </div>

        <router-link to="/mesaOficialR" class="btn btn-secondary mt-3">
            <i class="fas fa-arrow-left me-2"></i> Regresar a la Bandeja
        </router-link>
    </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';

import ComponenteIzquierdo from '@/components/Reutilizable/ComponenteIzquierdo.vue';

export default {
    name: 'ComparacionDenuncia',
    components: { ComponenteIzquierdo },
    props: {
        id: { type: String, required: true }, // ID de la denuncia base
        nodenuncia: { type: String, required: true } // No de denuncia para buscar la comparación
    },
    data() {
        return {
            idComparada: null,
            noDenunciaBase: '',
            noDenunciaComparada: ''
        };
    }
    ,
    async mounted() {
        try {
            const token = localStorage.getItem('token');

            // 🔹 Obtener datos de la denuncia base
            const base = await axios.get(`${Global.url}denuncias/expediente/${this.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            this.noDenunciaBase = base.data.noDenuncia;

            // 🔹 Obtener ID y datos de la denuncia comparada
            const res = await axios.get(`${Global.url}denuncias/idbyno/${this.nodenuncia}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            this.idComparada = res.data.idSicoda;

            const comp = await axios.get(`${Global.url}denuncias/expediente/${this.idComparada}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            this.noDenunciaComparada = comp.data.noDenuncia;

        } catch (err) {
            console.error('Error al obtener datos:', err);
        }
    }

};
</script>

<style scoped>
.card {
    background-color: #fff;
    border-radius: 8px;
}

.contenedor-dos-columnas {
    display: flex;
    height: 700px;
    gap: 1rem;
}

.columna.izquierda,
.columna.derecha {
    width: 50%;
    max-height: 800px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 0.5rem;
}
</style>
