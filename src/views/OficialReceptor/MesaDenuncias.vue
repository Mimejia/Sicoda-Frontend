<template>
    <div class="card shadow-sm p-4">
        <h1 style="text-align: center;">Oficial Receptor</h1>
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

        <div class="d-flex justify-content-end mb-3">
            <div class="custom-dropdown" ref="dropdownRegistro">
                <button class="custom-dropdown-button" @click="toggleMenuRegistro">
                    <i class="fas fa-plus-circle me-2"></i> Nuevo Registro 
                    <i class="fas ms-2 transition-icon" :class="mostrarMenuRegistro ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </button>
                
                <transition name="dropdown-fade">
                    <ul class="custom-dropdown-menu" v-if="mostrarMenuRegistro">
                        <li v-for="opt in opcionesTp" :key="opt.tp">
                            <router-link class="dropdown-item" :to="{ name: 'RegistroDenuncia', query: { tp: opt.tp } }" @click="cerrarMenuRegistro">
                                <i class="fas fa-angle-right me-2 text-muted"></i> {{ opt.label }}
                            </router-link>
                        </li>
                    </ul>
                </transition>
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
                        <th>Denuncia Similar</th>
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

                        <!-- <td>{{ denuncia.usuarioAsignado }}</td> -->
                        <td style="white-space: pre-line; max-width: 180px;">
                            <div class="d-flex flex-column align-items-center">
                                <div class="text-center mb-2">
                                    {{ formatDenuncias(denuncia.denunciaSimilar) }}
                                </div>
                                <!-- Ver más -->
                                <button v-if="denuncia.denunciaSimilar !== null" class="btn btn-icon btn-sm btn-success"
                                    @click="verDetalle(denuncia)">
                                    <i class="fas fa-eye"></i>
                                </button>
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
    name: 'MesaDenuncias',
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
            opcionesTp: [
                { tp: '1', label: 'Registro Usuarios Externos' },
                { tp: '2', label: 'Registro Usuarios Internos' },
                { tp: '3', label: 'Registro Inspección' }
            ],
            // Control visual del menú "Nuevo Registro"
            mostrarMenuRegistro: false
        };
    },
    watch: {
        campoFiltro(newCampo) {
            if (!newCampo) {
                this.opcionesFiltro = [];
                return;
            }

            const token = localStorage.getItem('token');
            axios.get(`${Global.url}Denuncias/valoresFiltro`, {
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
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        toggleMenuRegistro(event) {
            // Evita que el click se propague al document y cierre el menú inmediatamente
            event.stopPropagation(); 
            this.mostrarMenuRegistro = !this.mostrarMenuRegistro;
        },
        cerrarMenuRegistro() {
            this.mostrarMenuRegistro = false;
        },
        handleClickOutside(event) {
            const dropdown = this.$refs.dropdownRegistro;
            if (dropdown && !dropdown.contains(event.target)) {
                this.cerrarMenuRegistro();
            }
        },
        verDetalle(denuncia) {
            if (denuncia.denunciaSimilar && denuncia.denunciaSimilar.trim() !== '') {
                this.$router.push({ path: `/similitudes/${denuncia.idSicoda}` });
            } else {
                Swal.fire({
                    title: `Detalle de ${denuncia.noDenuncia}`,
                    text: `Motivo: ${denuncia.motivoDenuncia}`,
                    icon: 'info'
                });
            }
        },
        irAHistorial(idSicoda) {
            // Redirige a /historial/{idSicoda}
            this.$router.push({ name: 'HistorialEstados', params: { idSicoda: idSicoda } });
        },
        getTooltipTexto(fechaIngreso) {
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

                const response = await axios.get(`${Global.url}Denuncias/listar`, {
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
            this.$router.push({ path: `/expediente/${idSicoda}` });
        },
        diasDesde(fechaString) {
            const fecha = new Date(fechaString);
            const hoy = new Date();
            const diferencia = hoy - fecha;
            return Math.floor(diferencia / (1000 * 60 * 60 * 24));
        },
        getSemaforoIcon(fechaIngreso) {
            if (!fechaIngreso) {
                return {
                    icon: 'fas fa-circle-question',
                    color: '#bdbdbd',
                    descripcion: 'Fecha no disponible'
                };
            }

            const fecha = new Date(fechaIngreso);
            const hoy = new Date();
            const diferenciaDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

            if (diferenciaDias <= 4) {
                return {
                    icon: 'fas fa-circle',
                    color: 'green',
                    descripcion: 'Menos de 5 días (estado óptimo)'
                };
            } else if (diferenciaDias <= 9) {
                return {
                    icon: 'fas fa-circle',
                    color: 'orange',
                    descripcion: 'Entre 5 y 9 días (advertencia)'
                };
            } else {
                return {
                    icon: 'fas fa-circle',
                    color: 'red',
                    descripcion: '10 días o más (crítico)'
                };
            }
        },
        formatDenuncias(denuncias) {
            if (!denuncias) return '';
            return denuncias.split(',').map(d => d.trim()).join('\n');
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

.tooltip-container {
    position: relative;
    display: inline-block;
}

.tooltip-container .tooltip-text {
    visibility: hidden;
    opacity: 0;
    width: max-content;
    max-width: 260px;
    white-space: pre-line;
    background-color: #212529;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 6px 10px;
    position: absolute;
    left: 10px;
    /* para moverlo hacia la derecha */
    transform: translateX(0);
    z-index: 1000;
    font-size: 0.85rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 1);
    transition: opacity 0.2s;
    top: -50px;
}

.tooltip-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
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
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.custom-dropdown-button {
  background: linear-gradient(135deg, #0BB783 0%, #099a6f 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(11, 183, 131, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.custom-dropdown-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(11, 183, 131, 0.3);
}

.custom-dropdown-button:active {
  transform: translateY(0);
}

.custom-dropdown-menu {
  /* display: block; controlado con v-if */
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 8px;
  min-width: 14rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  list-style: none;
  padding: 0.5rem 0;
  overflow: hidden;
}

.custom-dropdown-menu li {
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  color: #4B5563;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #F3F4F6;
  color: #111827;
}

.dropdown-item i {
  font-size: 0.8rem;
}

/* Animación de fade y slide */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.transition-icon {
    transition: transform 0.2s ease;
}

</style>