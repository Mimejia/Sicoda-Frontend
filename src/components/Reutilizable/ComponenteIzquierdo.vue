<template>
  <!-- Encabezado azul -->
  <div class="escala-zoom" :style="zoomStyle">
    <!-- aquí va TODO tu contenido actual -->
    <div :style="{ fontSize: zoomLevel + 'rem' }">
      <div class="mb-3 d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-secondary" @click="reducirZoom">
          <i class="fas fa-search-minus"></i> Reducir
        </button>
        <button class="btn btn-sm btn-secondary" @click="aumentarZoom">
          <i class="fas fa-search-plus"></i> Aumentar
        </button>
      </div>


      <div class="card-body p-1">



        <!-- Inicio Switch de Denuncia Anonima -->
        <div class="form-group mb-6">
          <h3 class="font-weight-bold d-block mb-2">¿Quiéres que tu denuncia sea anónima?</h3>
          <BotonAnonimo v-model="denunciante.anonima" :disabled="soloLectura" />
        </div>
        <!-- Fin Switch de Denuncia Anonima -->


        <!-- Datos del denunciante -->
        <div class="bg-gray-300 p-4 rounded mb-6">

          <div class="alert alert-custom alert-notice alert-light-success font-weight-bolder" role="alert">
            <div class="mt-content-container">
              <div class="mt-tile">
                <h3>DATOS DEL DENUNCIANTE:</h3>
              </div>
              <div class="mt-content border-grey-salt text-secondary">
                <h4>
                  <p>
                    Datos de la persona que presenta la denuncia.
                  </p>
                </h4>
              </div>
            </div>
          </div>

          <!-- Panel con transición -->
          <div>
            <div class="form-group mb-6">
              <h3 class="font-weight-bold d-block mb-2">¿Es persona Individual?</h3>
              <BotonAnonimo v-model="denunciante.personaDenunciante"  :disabled="soloLectura"/>
            </div>

            <div class="form-group">
              <label for="nombre">Nombre del denunciante</label>
              <input type="text" class="form-control" v-model="denunciante.nombre" :readonly="soloLectura" />
            </div>


            <div class="form-group row">

              <div class="col-3">
                <label for="edad">Sexo</label>
                <input type="text" v-model="denunciante.sexo" class="form-control" :readonly="soloLectura" />
              </div>

              <div class="col-3">
                <label for="edad">Edad</label>
                <input type="text" v-model="denunciante.edad" class="form-control" :readonly="soloLectura" />

              </div>

              <div class="col-6">
                <label for="dpi">DPI</label>
                <input type="text" class="form-control" v-model="denunciante.dpi" :readonly="soloLectura" />

              </div>

            </div>

          </div>

          <!-- Inicio Correo electrónico -->
          <div class="form-group mb-5">
            <label for="correo">Correo electrónico</label>
            <input type="email" class="form-control" id="correo" v-model="denunciante.correo" :readonly="soloLectura" />

          </div>

          <div>
            <div class="form-group row">

              <div class="col-9">
                <label for="direccion">Dirección</label>
                <textarea class="form-control" id="direccion" v-model="denunciante.direccion" rows="2"
                  :readonly="soloLectura"></textarea>

              </div>

              <div class="col-3">
                <label for="telefono">Teléfono</label>
                <input type="text" class="form-control" id="telefono" v-model="denunciante.telefono"
                  :readonly="soloLectura" />

              </div>

            </div>

            <div class="form-group row">

              <div class="col-6">
                <label for="edad">Departamento</label>
                <input type="text" class="form-control" id="correo" v-model="denunciante.departamentoId"
                  :readonly="soloLectura" />

              </div>
              <div class="col-6">
                <label for="edad">Municipio</label>
                <input type="text" class="form-control" id="correo" v-model="denunciante.municipioId"
                  :readonly="soloLectura" />
              </div>
            </div>

            <div class="form-group row">

              <div class="col-6">
                <label for="edad">Idioma</label>
                <input type="text" class="form-control" id="correo" v-model="denunciante.idioma"
                  :readonly="soloLectura" />
              </div>

              <div class="col-6">
                <label for="edad">Etnia</label>
                <input type="text" class="form-control" id="correo" v-model="denunciante.etnia"
                  :readonly="soloLectura" />
              </div>
            </div>
          </div>
          <!-- Fin Datos del denunciante -->
        </div>

        <!-- Datos de la denuncia -->
        <div class="bg-gray-300 p-5 rounded mb-6">
          <div class="alert alert-custom alert-notice alert-light-success font-weight-bolder" role="alert">
            <div class="mt-content-container">
              <div class="mt-tile">
                <h3>DATOS DEL DENUNCIADO:</h3>
              </div>

              <div class="mt-content border-grey-salt text-secondary">
                <h4>
                  <p>
                    Datos de la persona en contra de quien se está presentando la denuncia.
                  </p>
                </h4>
              </div>
            </div>

          </div>

          <!-- Inicio Switch de Denuncia Anonima -->
          <div class="form-group mb-6">
            <h3 class="font-weight-bold d-block mb-2">¿Es persona Individual?</h3>
            <BotonAnonimo v-model="denunciado.persona" :disabled="soloLectura" />
          </div>
          <!-- Fin Switch de Denuncia Anonima -->

          <div class="form-group row">
            <div class="col-12">
              <label for="denuncia">Denunciado</label>
              <input type="text" class="form-control" id="nombre" v-model="denunciado.denunciado"
                :readonly="soloLectura" />
            </div>
          </div>
          <div>

            <div class="form-group row">

              <div class="col-3">
                <label for="edad">Sexo</label>
                <input type="text" v-model="denunciado.sexo" class="form-control" :readonly="soloLectura" />
              </div>

              <div class="col-3">
                <label for="edad">Edad</label>
                <input type="text" v-model="denunciado.edad" class="form-control" :readonly="soloLectura" />

              </div>

              <div class="col-6">
                <label for="edad">DPI</label>
                <input type="text" class="form-control" v-model="denunciado.dpi" :readonly="soloLectura" />

              </div>

            </div>
          </div>


          <div class="form-group mb-5">
            <label for="correo">Correo electrónico</label>
            <input type="email" class="form-control" id="correo" v-model="denunciado.correo" :readonly="soloLectura" />

          </div>

          <div class="form-group row">
            <div class="col-12">
              <label for="direccion">Dirección de la Actividad</label>
              <textarea class="form-control" id="direccion" v-model="denunciado.direccion" rows="2"
                :readonly="soloLectura"></textarea>

            </div>
          </div>

          <div class="form-group row">
            <div class="col-12">
              <label for="direccion">indicaciones para ubicar la dirección descrita:</label>
              <textarea class="form-control" id="direccion" v-model="denunciado.indicaciones" rows="2"
                :readonly="soloLectura"></textarea>

            </div>
          </div>

          <div class="form-group row">

            <div class="col-6">
              <label for="edad">Departamento</label>
              <input type="email" class="form-control" v-model="denunciado.departamentoId" :readonly="soloLectura" />
            </div>
            <div class="col-6">
              <label for="edad">Municipio</label>
              <input type="email" class="form-control" v-model="denunciado.municipioId" :readonly="soloLectura" />

            </div>
          </div>

          <div class="form-group row">

            <div class="col-6">
              <label for="edad">Idioma</label>
              <input type="email" class="form-control" v-model="denunciado.idioma" :readonly="soloLectura" />
            </div>

            <div class="col-6">
              <label for="edad">Etnia</label>
              <input type="email" class="form-control" v-model="denunciado.etnia" :readonly="soloLectura" />
            </div>
          </div>

          <div class="form-group mb-0">
            <h3 for="denuncia">Tipo De Denuncia</h3>
            <SelectTipoDenuncia v-model="denunciado.tipoDenunciaId" :disabled="soloLectura" />
          </div>

          <div class="form-group mt-4" v-if="denunciado.tipoDenunciaId === 6">
            <label for="otrosDetalle">Por favor, describa el tipo de denuncia</label>
            <textarea id="otrosDetalle" class="form-control" v-model="denunciado.tipoDenunciaOtros" rows="2"
              placeholder="Describa el motivo de la denuncia" :readonly="soloLectura"></textarea>
          </div>

          <div class="form-group mt-4">
            <label for="otrosDetalle">Por favor, describa el tipo de denuncia</label>
            <textarea id="otrosDetalle" class="form-control" v-model="denunciado.tipoDenunciaOtros" rows="2"
              :readonly="soloLectura"></textarea>
          </div>

          <div class="form-group mb-0">
            <label for="denuncia">Detalle o motivo de la denuncia</label>
            <textarea class="form-control" id="denuncia" v-model="denunciado.denuncia" rows="5"
              :readonly="soloLectura"></textarea>

          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import Global from '@/Global';

export default {
  name: 'ComponenteIzquierdo',
  props: {
    id: { type: [String, Number], required: true },
    soloLectura: { type: Boolean, default: false }
  },
  data() {
    return {
      zoomLevel: 1, // base = 1x
      denunciante: {
        nombre: '',
        sexo: '',
        edad: '',
        dpi: '',
        correo: '',
        direccion: '',
        telefono: '',
        departamentoId: '',
        municipioId: '',
        idioma: '',
        etnia: '',
        anonima: false,
        personaDenunciante: false
      },
      denunciado: {
        persona: false,
        denunciado: '',
        sexo: '',
        edad: '',
        dpi: '',
        correo: '',
        direccion: '',
        indicaciones: '',
        departamentoId: '',
        municipioId: '',
        idioma: '',
        etnia: '',
        tipoDenunciaId: undefined,
        tipoDenunciaOtros: '',
        denuncia: ''
      },
      otrosDatos: {
        terminos: false
      }
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Global.url}denuncias/expediente/${this.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      console.log(data);
      // Datos del denunciante
      this.denunciante.nombre = data.denunciante;
      this.denunciante.sexo = data.sexoDenunciante;
      this.denunciante.edad = data.edadDenunciante;
      this.denunciante.dpi = data.dpiDenunciante;
      this.denunciante.correo = data.correoDenunciante;
      this.denunciante.direccion = data.direccionDenunciante;
      this.denunciante.telefono = data.telefonoDenunciante;
      this.denunciante.departamentoId = data.departamentoDenunciante;
      this.denunciante.municipioId = data.municipioDenunciante;
      this.denunciante.idioma = data.idiomaDenunciante;
      this.denunciante.etnia = data.etniaDenunciante;
      this.denunciante.anonima = data.idAnonima === 2; // true si anónima
      this.denunciante.personaDenunciante = data.personaDenunciante === 2;

      // Datos del denunciado
      this.denunciado.denunciado = data.denunciado;
      this.denunciado.sexo = data.sexoDenunciado;
      this.denunciado.edad = data.edadDenunciado;
      this.denunciado.dpi = data.dpiDenunciado;
      this.denunciado.correo = data.correoDenunciado;
      this.denunciado.direccion = data.direccionDenunciado;
      this.denunciado.indicaciones = data.indicacionesDenunciado;
      this.denunciado.departamentoId = data.departamentoDenunciado;
      this.denunciado.municipioId = data.municipioDenunciado;
      this.denunciado.idioma = data.idiomaDenunciado;
      this.denunciado.etnia = data.etniaDenunciado;
      this.denunciado.tipoDenunciaId =
        data.idTipoDenuncia !== null && data.idTipoDenuncia !== ''
          ? Number(data.idTipoDenuncia)
          : undefined;
      this.denunciado.denuncia = data.motivoDenuncia;
      this.denunciado.tipoDenunciaOtros = data.otros;
      this.denunciado.persona = data.idPersona === 2;

    } catch (error) {
      console.error('Error al cargar el expediente:', error);
    }
  },
  methods: {
    aumentarZoom() {
      if (this.zoomLevel < 2.6) this.zoomLevel += 0.1;
    },
    reducirZoom() {
      if (this.zoomLevel > 0.4) this.zoomLevel -= 0.1;
    }
  },
  computed: {
    zoomStyle() {
      return {
        transform: `scale(${this.zoomLevel})`,
        transformOrigin: 'top left',
        width: `${100 / this.zoomLevel}%` // para evitar corte del contenido
      };
    }
  }


};
</script>

<style scoped>
.componente-izquierdo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo label {
  font-weight: bold;
  display: block;
}

.campo span {
  display: inline-block;
  margin-left: 10px;
}

.tipo-denuncia {
  display: flex;
  gap: 1rem;
}

.campo button {
  margin-top: 5px;
}
</style>