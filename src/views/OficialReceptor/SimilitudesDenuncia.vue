<template>
    <div class="card shadow-sm p-4">
        <h2 class="mb-4">Similitudes encontradas</h2>

        <div v-if="similitudes.length > 0" class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-primary">
                    <tr>
                        <th>Campo Comparado</th>
                        <th>Valor Coincidente</th>
                        <th>Denuncia</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(fila, idx) in filas" :key="`fila-${fila.denuncia}-${idx}`">
                        <!-- Sólo en la primera aparición del grupo mostramos estos TD con rowspan -->
                        <td v-if="fila.isFirst" :rowspan="fila.rowspan">
                            {{ fila.campo }}
                        </td>
                        <td v-if="fila.isFirst" :rowspan="fila.rowspan">
                            {{ fila.valor }}
                        </td>
                        <!-- Siempre mostramos el botón de la denuncia -->
                        <td>
                            <button class="btn btn-sm btn-primary" @click="irAExpediente(fila.idSicoda)">
                                {{ fila.codigo }}
                            </button>

                        </td>
                    </tr>
                </tbody>

            </table>
        </div>

        <div v-else>
            <p>No se encontraron similitudes para esta denuncia.</p>
        </div>

        <router-link to="/mesaOficialR" class="btn btn-secondary mt-3">
            <i class="fas fa-arrow-left me-2"></i> Regresar a la Bandeja
        </router-link>
    </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';

export default {
    name: 'SimilitudesDenuncia',
    props: {
        id: { type: [String, Number], required: true }
    },
    data() {
        return {
            similitudes: []
        };
    },
    methods: {
        irAExpediente(noDenuncia) {
            this.$router.push({ name: 'ComparacionDenuncia', params: { id: this.id, nodenuncia: noDenuncia } });
        }
    },
    async mounted() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${Global.url}denuncias/similitudes/${this.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            this.similitudes = response.data;
        } catch (error) {
            console.error('Error al obtener similitudes:', error);
        }
    },
    computed: {
        filas() {
            return this.similitudes.flatMap(sim =>
                sim.denuncias.map((denuncia, idx) => ({
                    campo: sim.campo,
                    valor: sim.valor,
                    codigo: denuncia.codigo,
                    idSicoda: denuncia.id,
                    isFirst: idx === 0,
                    rowspan: sim.denuncias.length
                }))
            );
        }
    },

};
</script>

<style scoped>
.card {
    background-color: #fff;
    border-radius: 8px;
}

.table th,
.table td {
    vertical-align: middle;
    text-align: center;
}

.table thead {
    font-weight: bold;
}

.table-hover tbody tr:hover {
    background-color: #f0f8ff;
}
</style>
