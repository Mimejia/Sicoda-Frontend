<template>
    <div class="card shadow-sm p-4">
        <h1 style="text-align: center;">Archivo de Denuncias</h1>
        <br>
        <div class="row mb-3">
            <div class="col-md-3">
                <select v-model="campoFiltro" class="form-select">
                    <option value="">-- Seleccione un campo --</option>
                    <option value="nodenuncia">N° Denuncia</option>
                    <option value="denunciado">Denunciado</option>
                    <option value="departamento">Departamento</option>
                    <option value="municipio">Municipio</option>
                    <option value="motivo">Motivo</option>
                    <option value="direccion">Dirección</option>
                    <option value="periodo">Periodo</option>
                    <option value="tipoDenuncia">Tipo de Denuncia</option>
                    <option value="anio">Año</option>
                    <option value="mes">Mes</option>
                </select>
            </div>

            <div class="col-md-4">
                <v-select v-if="campoFiltro" v-model="filtro" :options="opcionesFiltro" label="Filtro"
                    placeholder="Seleccione o escriba un valor" :filterable="true" :reduce="val => val"
                    class="form-control" />
            </div>

            <div class="col-md-2">
                <button @click="filtrar" class="btn btn-filtrar w-100">Filtrar</button>
            </div>

            <div class="col-md-2">
                <button @click="limpiarFiltros" class="btn btn-limpiar w-100">Limpiar</button>
            </div>

        </div>

        <div class="table-responsive">
            <table class="table table-bordered">
                <thead class="thead-dark" style="text-align: center;">
                    <tr>
                        <!-- <th>ID SICODA</th> -->
                        <th>Semáforo</th>
                        <th>No de Denuncia</th>
                        <!-- <th>Período</th> -->
                        <th>Estado</th>
                        <th>Denunciante</th>
                        <th>Denunciado</th>

                        <th>Dirección</th>
                        <th>Municipio</th>
                        <th>Departamento</th>


                        <th>Motivo</th>
                        <!-- <th>Asignado</th> -->
                        <th>Tipo de Denuncia</th>

                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;">
                    <tr v-for="denuncia in denuncias" :key="denuncia.idSicoda">
                        <td class="text-center align-middle celda-semaforo">
                            <div class="semaforo-wrapper">
                                <div class="tooltip-container">
                                    <i :class="[getSemaforoIcon(denuncia.fechaIngreso).icon, 'icono-semaforo']"
                                        :style="{ color: getSemaforoIcon(denuncia.fechaIngreso).color }" />
                                    <div class="tooltip-text">
                                        {{ getTooltipTexto(denuncia.fechaIngreso) }}
                                    </div>
                                </div>
                            </div>
                        </td>


                        <!-- <td>{{ denuncia.idSicoda }}</td> -->
                        <td><strong>{{ denuncia.noDenuncia }}</strong></td>
                        <!-- <td>{{ denuncia.periodoDenuncia }}</td> -->
                        <!-- <td>{{ denuncia.estado }}</td> -->
                        <td style="white-space: pre-line; max-width: 180px;">
                            <div class="d-flex flex-column align-items-center">
                                <div class="text-center mb-2">{{ denuncia.estado }}</div>
                                <br>
                                <button class="btn btn-sm btn-outline-primary" @click="irAHistorial(denuncia.idSicoda)"
                                    title="Ver historial de estados">
                                    <i class="fas fa-history"></i>
                                </button>
                            </div>
                        </td>
                        <td>{{ denuncia.denunciante }}</td>
                        <td>{{ denuncia.denunciado }}</td>

                        <td class="col-direccion">{{ denuncia.direccionActividad }}</td>
                        <td class="col-municipio">{{ denuncia.municipioDenunciado }}</td>
                        <td class="col-departamento">{{ denuncia.departamentoDenunciado }}</td>
                        <td class="col-motivo">{{ denuncia.motivoDenuncia }}</td>

                        <td class="text-center align-middle tipo-denuncia-cell">
                            <div class="tipo-denuncia-wrapper">
                                <!-- <i :class="getIconoTipo(denuncia.idTipoDenuncia)" class="tipo-icono"></i> -->
                                <div class="descripcion-tipo">
                                    {{ denuncia.descripcionDenuncia }}
                                </div>
                            </div>
                        </td>

                        <td class="text-center">
                            <!-- Ir a expediente -->
                            <button class="btn btn-icon btn-sm btn-warning" @click="irAExpediente(denuncia.idSicoda)">
                                <i class="fas fa-folder-open"></i>
                            </button>
                        </td>

                    </tr>
                </tbody>
            </table>
        </div>



        <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="btn btn-secondary" :disabled="pagina === 1"
                @click="pagina--; cargarDenuncias()">Anterior</button>
            <span>Página {{ pagina }} de {{ totalPaginas }}</span>
            <button class="btn btn-secondary" :disabled="pagina === totalPaginas"
                @click="pagina++; cargarDenuncias()">Siguiente</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';
import Swal from 'sweetalert2';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';


export default {
    name: 'MesaDenunciasArch',
    components: {
        'v-select': vSelect
    },
    data() {
        return {
            denuncias: [],
            pagina: 1,
            totalPaginas: 1,
            total: 0,
            pageSize: 10,
            filtro: '',
            campoFiltro: '',
            opcionesFiltro: [],
            tooltipVisible: false,
            tooltipTarget: null
        };
    },
    watch: {
        campoFiltro(newCampo) {
            if (!newCampo) {
                this.opcionesFiltro = [];
                return;
            }

            const token = localStorage.getItem('token');
            axios.get(`${Global.url}archivo/valoresFiltro`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { campo: newCampo }
            })
                .then(res => {
                    this.opcionesFiltro = res.data;
                })
                .catch(err => {
                    console.error('Error al cargar opciones de filtro:', err);
                });
        }
    },
    mounted() {
        this.cargarDenuncias();
        document.addEventListener('mousemove', this.actualizarTooltipPosicion);
    },
    beforeUnmount() {
        document.removeEventListener('mousemove', this.actualizarTooltipPosicion);
    },
    methods: {
        actualizarTooltipPosicion(e) {
            const tooltip = document.querySelector('.tooltip-container .tooltip-text');
            if (tooltip && tooltip.style.visibility === 'visible') {
                tooltip.style.top = `${e.clientY - 60}px`; // ajusta para que quede arriba del cursor
                tooltip.style.left = `${e.clientX + 12}px`;
            }
        },
        irAHistorial(idSicoda) {
            // Redirige a /historial/{idSicoda}
            this.$router.push({ name: 'HistorialEstados', params: { idSicoda: idSicoda } });
        },
        mostrarTooltip(e) {
            const row = e.currentTarget.closest('tr');
            const idTexto = row.querySelector('td:nth-child(2)')?.innerText.trim();
            this.tooltipTarget = idTexto;
            this.tooltipVisible = true;
        },

        ocultarTooltip() {
            this.tooltipVisible = false;
            this.tooltipTarget = null;
        },
        getTooltipTexto(fechaIngreso) {
            const dias = this.diasDesde(fechaIngreso);
            if (dias === null) return 'No hay actividades pendientes';

            if (dias <= 4) return `Menos de 5 días (estado óptimo)\n${dias} día(s)`;
            if (dias <= 9) return `Entre 5 y 9 días (advertencia)\n${dias} día(s)`;
            return `10 días o más (crítico)\n${dias} día(s)`;
        },
        formatSemaforoTooltip(fechaIngreso) {
            const dias = this.diasDesde(fechaIngreso);
            if (!fechaIngreso) return 'Fecha no disponible';

            if (dias <= 4) return `Menos de 5 días (estado óptimo)\n${dias} día(s)`;
            if (dias <= 9) return `Entre 5 y 9 días (advertencia)\n${dias} día(s)`;
            return `10 días o más (crítico)\n${dias} día(s)`;
        },


        async cargarDenuncias() {
            try {
                const token = localStorage.getItem('token');
                const params = {
                    page: this.pagina,
                    pageSize: this.pageSize
                };

                if (this.filtro && this.campoFiltro) {
                    if (['anio', 'mes', 'tipoDenuncia'].includes(this.campoFiltro)) {
                        params[this.campoFiltro] = parseInt(this.filtro);
                    } else {
                        params.campo = this.campoFiltro;
                        params.filtro = this.filtro;
                    }
                }

                const response = await axios.get(`${Global.url}archivo/listar`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                });

                this.denuncias = response.data.data;
                this.total = response.data.total;
                this.totalPaginas = Math.ceil(this.total / this.pageSize);

                if (this.denuncias.length === 0 && this.filtro && this.campoFiltro) {
                    Swal.fire('Sin resultados', 'No se encontraron denuncias para ese filtro.', 'info');
                }
            } catch (error) {
                console.error('Error al cargar denuncias:', error);
            }
        },
        filtrar() {
            if (!this.campoFiltro || !this.filtro.trim()) {
                Swal.fire('Falta información', 'Debe seleccionar un campo y un valor para filtrar.', 'warning');
                return;
            }

            this.pagina = 1;
            this.cargarDenuncias();
        },
        limpiarFiltros() {
            this.filtro = '';
            this.campoFiltro = '';
            this.pagina = 1;
            this.opcionesFiltro = [];
            this.cargarDenuncias();
        },
        irAExpediente(idSicoda) {
            this.$router.push({ path: `/expedienteP/${idSicoda}` });
        },
        // ...otros métodos
        getSemaforoColor(fechaIngreso) {
            const dias = this.diasDesde(fechaIngreso);
            if (dias === null) return 'gris';
            if (dias <= 4) return 'verde';
            if (dias <= 9) return 'amarillo';
            return 'rojo';
        },
        getSemaforoDescripcion(fechaIngreso) {
            const dias = this.diasDesde(fechaIngreso);
            if (dias === null) return 'No hay actividades pendientes';
            if (dias <= 4) return 'Denuncia reciente (1-4 días)';
            if (dias <= 9) return 'Denuncia intermedia (5-9 días)';
            return 'Denuncia antigua (10 días o más)';
        },
        diasDesde(fechaString) {
            if (!fechaString) return null;
            const f = new Date(fechaString);
            if (isNaN(f.getTime())) return null;
            const hoy = new Date();
            const diff = hoy - f;
            return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        },
        getSemaforoIcon(fechaIngreso) {
            const dias = this.diasDesde(fechaIngreso);
            if (dias === null) {
                return { icon: 'fas fa-circle', color: '#6c757d' }; // gris
            }
            return {
                icon: 'fas fa-circle',
                color: dias <= 4 ? 'green' : dias <= 9 ? 'orange' : 'red'
            };
        },
        getIconoTipo(idTipo) {
            switch (idTipo) {
                case 1: return 'fas fa-bullhorn';
                case 2: return 'fas fa-industry';
                case 3: return 'fas fa-tree';
                case 4: return 'fas fa-water';
                case 5: return 'fas fa-exclamation-triangle';
                default: return 'fas fa-question-circle';
            }
        }

    }
};
</script>

<style scoped>
.icono-semaforo {
    font-size: 2.3rem;
    cursor: pointer;
}

.card {
    background-color: #fff;
    border-radius: 8px;
}

.btn-filtrar {
    background-color: #287ec4;
    /* verde oscuro */
    color: white;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-filtrar:hover {
    background-color: #154e7e;
}

.btn-limpiar {
    background-color: #e0e0e0;
    /* gris claro */
    color: #333;
    border: none;
    transition: background-color 0.3s ease;
}

.btn-limpiar:hover {
    background-color: #bdbdbd;
}

.semaforo {
    display: inline-block;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 2px solid #ccc;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.verde {
    background-color: #4caf50;
}

.amarillo {
    background-color: #ffeb3b;
}

.rojo {
    background-color: #f44336;
}

.semaforo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.semaforo-wrapper i {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
}

.semaforo-wrapper i:hover {
    transform: scale(1.2);
}

td:nth-child(9) {
    /* Ajusta según el orden exacto si cambia */
    max-width: 180px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

td:nth-child(2) {
    /* Ajusta según el orden exacto si cambia */
    max-width: 180px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

td {
    overflow: visible !important;
    position: relative;
    z-index: 1;
}

.tipo-denuncia-cell {
    vertical-align: middle;
}

.tipo-denuncia-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.tipo-icono {
    font-size: 2.5rem;
    /* 100% más grande que lo normal */
    margin-bottom: 0.25rem;
    color: #2c3e50;
}

.descripcion-tipo {
    font-size: 0.95rem;
    text-align: center;
    max-width: 120px;
    word-wrap: break-word;
}

.motivo-denuncia {
    font-size: 0.95rem;
    /* Letra más pequeña */
    max-width: 240px;
    /* Más ancho */
    min-width: 180px;
    /* Ancho mínimo */
    white-space: pre-wrap;
    /* Soporta saltos de línea si los hubiera */
    word-wrap: break-word;
    /* Rompe palabras largas */
}

.col-municipio {
    font-size: 0.95rem;
    max-width: 140px;
    min-width: 100px;
    white-space: normal;
    word-wrap: break-word;
}

.col-departamento {
    font-size: 0.95rem;
    max-width: 120px;
    min-width: 80px;
    white-space: normal;
    word-wrap: break-word;
}

.col-motivo {
    font-size: 0.95rem;
    max-width: 400px;
    min-width: 350px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.col-direccion {
    font-size: 0.95rem;
    max-width: 200px;
    min-width: 150px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.icono-semaforo {
    font-size: 2.5rem;
    /* Aumenta el tamaño del ícono */
    width: 1.8rem;
    height: 1.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.celda-semaforo {
    position: relative;
    overflow: visible !important;
}

.tooltip-custom {
    position: absolute;
    top: -45px;
    left: 0;
    transform: translateX(-20%);
    background-color: #212529;
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    white-space: nowrap;
    font-size: 0.8rem;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tooltip-container {
    position: relative;
    display: inline-block;
}

.tooltip-container .tooltip-text {
    visibility: hidden;
    opacity: 0;
    width: max-content;
    max-width: 300px;
    white-space: pre-line;
    background-color: rgba(33, 37, 41, 0.97);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px 12px;
    position: fixed;
    /* ✅ el cambio clave */
    top: auto;
    left: auto;
    z-index: 99999;
    /* asegúrate de que sea más alto que cualquier celda */
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    transition: opacity 0.2s ease;
}

.tooltip-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
}

.celda-semaforo {
    position: relative;
    overflow: visible !important;
    z-index: 1;
    /* asegúrate de que sea menor que el tooltip */
}
</style>