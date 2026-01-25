<template>
  <div>
    <ul class="sticky-toolbar nav flex-column pl-2 pr-2 pt-3 pb-3 mt-4">

      <!--begin::Item-->
      <li class="nav-item mb-2" data-toggle="tooltip" title="" data-placement="left"
        data-original-title="Estado de la Denuncia">
        <router-link class="btn btn-sm btn-icon btn-bg-light btn-icon-warning btn-hover-warning" to="/EstadoDenuncia"
          target="_blank">
          <i class="flaticon2-telegram-logo"></i>
        </router-link>
        <!-- <a class="btn btn-sm btn-icon btn-bg-light btn-icon-warning btn-hover-warning"
          href="https://keenthemes.com/metronic/?page=docs" target="_blank">
          <i class="flaticon2-telegram-logo"></i>
        </a> -->
      </li>
      <!--end::Item-->
    </ul>

    <div class="container py-10">
      <!-- Encabezado azul -->
      <div class="rounded-top px-10 py-6 mb-0 " style="background-color: #0b2d52; color: white; text-align: center;">
        <h2 class="mb-0 text-uppercase font-weight-bold">INGRESO DE DENUNCIAS AMBIENTALES</h2>
      </div>

      <!-- Tarjeta con contenido -->
      <div class="card shadow-sm rounded-0 rounded-bottom">
        <div class="card-body p-10">


          <!-- Inicio Switch de Denuncia Anonima -->
          <div class="form-group mb-6">
            <h3 class="font-weight-bold d-block mb-2">¿Quiéres que tu denuncia sea anónima?</h3>
            <BotonAnonimo v-model="denunciante.anonima" />
          </div>
          <!-- Fin Switch de Denuncia Anonima -->


          <!-- Datos del denunciante -->
          <div class="bg-gray-300 p-5 rounded mb-6">

            <div class="alert alert-custom alert-notice alert-light-success font-weight-bolder" role="alert"
              v-if="!denunciante.anonima">
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

            <!-- Inicio Switch de Denuncia Anonima -->
            <div class="form-group mb-6" v-if="!denunciante.anonima">
              <h3 class="font-weight-bold d-block mb-2">¿Es persona Individual?</h3>
              <BotonAnonimo v-model="denunciante.persona" />
            </div>
            <!-- Fin Switch de Denuncia Anonima -->

            <!-- Panel con transición -->
            <div v-if="!denunciante.anonima">

              <div class="form-group row" v-if="!denunciante.persona">
                <div class="col-12">
                  <label for="denuncia">Empresa / Razón Social</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciante.empresaDenunciante"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciante.empresaDenunciante.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.empresaDenunciante.required.$invalid">La empresa es obligatoria.
                    </div>
                    <div v-if="v$.denunciante.empresaDenunciante.maxLength.$invalid">Máximo 100 caracteres.</div>
                  </div>
                </div>
              </div>

              <div class="form-group row" v-if="denunciante.persona">

                <div class="col-6">
                  <label for="nombre">Primer Nombre</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciante.primerN"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciante.primerN.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.primerN.required.$invalid">El primer nombre es obligatorio.
                    </div>
                    <div v-if="v$.denunciante.primerN.maxLength.$invalid">Máximo 50 caracteres</div>
                  </div>
                </div>
                <div class="col-6">
                  <label for="nombre">Segundo Nombre</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciante.segundoN"
                    placeholder="Ingrese su nombre completo" data-toggle="tooltip" data-html="true"
                    title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>, pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
                  <div v-if="v$.denunciante.segundoN.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.segundoN.maxLength.$invalid">Máximo 50 caracteres</div>
                  </div>
                </div>

              </div>

              <div class="form-group row" v-if="denunciante.persona">

                <div class="col-6">
                  <label for="nombre">Primer Apellido</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciante.primerA"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciante.primerA.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.primerA.required.$invalid">El primer apellido es obligatorio.
                    </div>
                    <div v-if="v$.denunciante.primerA.maxLength.$invalid">Máximo 50 caracteres</div>
                  </div>
                </div>
                <div class="col-6">
                  <label for="nombre">Segundo Apellido</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciante.segundoA"
                    placeholder="Ingrese su nombre completo" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
                    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
                  <div v-if="v$.denunciante.segundoA.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.segundoA.maxLength.$invalid">Máximo 50 caracteres</div>
                  </div>
                </div>

              </div>

              <div class="form-group row">

                <div class="col-3">
                  <SelectSexo v-model="denunciante.sexo" />
                </div>

                <div class="col-3">
                  <label for="edad">Edad</label>
                  <input type="number" v-model="denunciante.edad" class="form-control" placeholder="Ingrese su Edad"
                    data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
                  pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
                  <div v-if="v$.denunciante.edad.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.edad.numeric.$invalid">Debe ser un número</div>
                    <div v-if="v$.denunciante.edad.integer.$invalid">Debe ser un número entero</div>
                    <div v-if="v$.denunciante.edad.minValue.$invalid">Debe ser mayor o igual a 18</div>
                    <div v-if="v$.denunciante.edad.maxValue.$invalid">Debe ser menor o igual a 100</div>
                  </div>

                </div>

                <div class="col-6">
                  <label for="edad">DPI</label>
                  <input type="text" class="form-control" v-model="denunciante.dpi"
                    placeholder="Documento Personal de Identificación" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
                    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
                  <div v-if="v$.denunciante.dpi.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.dpi.numeric.$invalid">Debe contener solo números</div>
                    <div v-if="v$.denunciante.dpi.integer.$invalid">Debe ser un número entero</div>
                    <div v-if="v$.denunciante.dpi.minLength.$invalid">Debe tener exactamente 13 dígitos</div>
                    <div v-if="v$.denunciante.dpi.maxLength.$invalid">Debe tener exactamente 13 dígitos</div>
                  </div>


                </div>

              </div>

            </div>

            <!-- Inicio Correo electrónico -->
            <div class="form-group mb-5">
              <label for="correo">Correo electrónico</label>
              <input type="email" class="form-control" id="correo" v-model="denunciante.correo"
                placeholder="Correo electrónico" data-toggle="tooltip" data-html="true"
                title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>" />
              <div v-if="v$.denunciante.correo.$error" class="text-danger text-sm">
                <!-- <div v-if="v$.denunciante.correo.required.$invalid">El correo es obligatorio</div> -->
                <div v-if="v$.denunciante.correo.email.$invalid">Formato de correo inválido</div>
                <div v-if="v$.denunciante.correo.maxLength.$invalid">Máximo 150 caracteres</div>
              </div>

            </div>
            <!-- Fin Correo electrónico -->

            <div class="alert alert-custom alert-notice alert-light-danger" v-if="denunciante.anonima">
              <div class="mt-content-container">
                <div class="mt-tile">
                  <h3 class="text-secondary font-weight-bolder">IMPORTANTE
                  </h3>
                </div>

                <div class="mt-content border-grey-salt text-secondary">
                  <h4>
                    <p style="text-align: justify;">
                      Tu denuncia sera anónima, sin embargo, te recomendamos que ingreses un correo
                      electrónico
                      en caso de ser necesaria información adicional para darle seguimiento a tu denuncia.Ten presente
                      que el correo que proporciones se
                      considera información pública.
                    </p>
                  </h4>
                </div>

              </div>
            </div>

            <div v-if="!denunciante.anonima">
              <div class="form-group row">

                <div class="col-9">
                  <label for="direccion">Dirección</label>
                  <textarea class="form-control" id="direccion" v-model="denunciante.direccion" rows="2"
                    placeholder="Ingrese su dirección" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia."></textarea>
                  <div v-if="v$.denunciante.direccion.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.direccion.maxLength.$invalid">Máximo 1000 caracteres</div>
                  </div>
                </div>

                <div class="col-3">
                  <label for="telefono">Teléfono</label>
                  <input type="text" class="form-control" id="telefono" v-model="denunciante.telefono"
                    placeholder="número teléfonico" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />

                  <div v-if="v$.denunciante.telefono.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciante.telefono.numeric?.$invalid">Debe contener solo números</div>
                    <div v-if="v$.denunciante.telefono.integer?.$invalid">Debe ser un número entero</div>
                    <div v-if="v$.denunciante.telefono.minLength?.$invalid">Debe tener exactamente 8 dígitos</div>
                    <div v-if="v$.denunciante.telefono.maxLength?.$invalid">Debe tener exactamente 8 dígitos</div>
                  </div>

                </div>

              </div>

              <div class="form-group row">

                <div class="col-6">
                  <label for="edad">Departamento</label>
                  <SelectDepartamento v-model="denunciante.departamentoId" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />

                </div>
                <div class="col-6">
                  <label for="edad">Municipio</label>
                  <SelectMunicipio v-model="denunciante.municipioId" :departamentoId="denunciante.departamentoId"
                    data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
                </div>
              </div>

              <div class="form-group row">

                <div class="col-6">
                  <label for="edad">Idioma</label>
                  <SelectIdioma v-model="denunciante.idioma" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
                </div>

                <div class="col-6">
                  <label for="edad">Etnia</label>
                  <SelectEtnia v-model="denunciante.etnia" data-toggle="tooltip" data-html="true" title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>,
    pero recomendamos ingresarlo para <u>darle seguimiento</u> a su denuncia." />
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
              <BotonAnonimo v-model="denunciado.persona" />
            </div>
            <!-- Fin Switch de Denuncia Anonima -->

            <div class="form-group row" v-if="!denunciado.persona">
              <div class="col-12">
                <label for="denuncia">Empresa / Razón Social</label>
                <input type="text" class="form-control" id="nombre" v-model="denunciado.empresa"
                  placeholder="Ingrese su nombre completo" />
                <div v-if="v$.denunciado.empresa.$error" class="text-danger text-sm">
                  <div v-if="v$.denunciado.empresa.maxLength.$invalid">Máximo 100 caracteres.</div>
                </div>
              </div>
            </div>

            <div v-if="denunciado.persona">
              <div class="form-group row">

                <div class="col-6">
                  <label for="nombre">Primer Nombre</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciado.primerN"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciado.primerN.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciado.primerN.maxLength.$invalid">Máximo 50 caracteres.</div>
                  </div>
                </div>
                <div class="col-6">
                  <label for="nombre">Segundo Nombre</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciado.segundoN"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciado.segundoN.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciado.segundoN.maxLength.$invalid">Máximo 50 caracteres.</div>
                  </div>
                </div>

              </div>

              <div class="form-group row">

                <div class="col-6">
                  <label for="nombre">Primer Apellido</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciado.primerA"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciado.primerA.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciado.primerA.maxLength.$invalid">Máximo 50 caracteres.</div>
                  </div>
                </div>
                <div class="col-6">
                  <label for="nombre">Segundo Apellido</label>
                  <input type="text" class="form-control" id="nombre" v-model="denunciado.segundoA"
                    placeholder="Ingrese su nombre completo" />
                  <div v-if="v$.denunciado.segundoA.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciado.segundoA.maxLength.$invalid">Máximo 50 caracteres.</div>
                  </div>
                </div>

              </div>

              <div class="form-group row">

                <div class="col-3">
                  <SelectSexo v-model="denunciado.sexo" />
                </div>

                <div class="col-3">
                  <label for="edad">Edad</label>
                  <input type="number" v-model="denunciado.edad" class="form-control" placeholder="Ingrese su Edad" />
                  <div v-if="v$.denunciado.edad.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciado.edad.numeric.$invalid">Debe ser un número.</div>
                    <div v-if="v$.denunciado.edad.integer.$invalid">Debe ser un número entero.</div>
                    <div v-if="v$.denunciado.edad.minValue.$invalid">Debe ser mayor o igual a 18.</div>
                    <div v-if="v$.denunciado.edad.maxValue.$invalid">Debe ser menor o igual a 100.</div>
                  </div>

                </div>

                <div class="col-6">
                  <label for="edad">DPI</label>
                  <input type="text" class="form-control" v-model="denunciado.dpi"
                    placeholder="Documento Personal de Identificación" />
                  <div v-if="v$.denunciado.dpi.$error" class="text-danger text-sm">
                    <div v-if="v$.denunciado.dpi.numeric.$invalid">Debe contener solo números.</div>
                    <div v-if="v$.denunciado.dpi.integer.$invalid">Debe ser un número entero.</div>
                    <div v-if="v$.denunciado.dpi.minLength.$invalid">Debe tener exactamente 13 dígitos.</div>
                    <div v-if="v$.denunciado.dpi.maxLength.$invalid">Debe tener exactamente 13 dígitos.</div>
                  </div>


                </div>

              </div>
            </div>


            <div class="form-group mb-5">
              <label for="correo">Correo electrónico</label>
              <input type="email" class="form-control" id="correo" v-model="denunciado.correo"
                placeholder="Correo electrónico" data-toggle="tooltip" data-html="true"
                title="<i class='fas fa-info-circle text-info mr-1'></i> Este campo es <b>opcional</b>" />
              <div v-if="v$.denunciado.correo.$error" class="text-danger text-sm">
                <!-- <div v-if="v$.denunciante.correo.required.$invalid">El correo es obligatorio</div> -->
                <div v-if="v$.denunciado.correo.email.$invalid">Formato de correo inválido.</div>
                <div v-if="v$.denunciado.correo.maxLength.$invalid">Máximo 150 caracteres.</div>
              </div>

            </div>

            <div class="form-group row">
              <div class="col-12">
                <label for="direccion">Dirección de la Actividad</label>
                <textarea class="form-control" id="direccion" v-model="denunciado.direccion" rows="2"
                  placeholder="Ingrese su dirección"></textarea>
                <div v-if="v$.denunciado.direccion.$error" class="text-danger text-sm">
                  <div v-if="v$.denunciado.direccion.required.$invalid">La dirección de la actividad es obligatoria.
                  </div>
                  <div v-if="v$.denunciado.direccion.maxLength.$invalid">Máximo 1000 caracteres.</div>
                </div>
              </div>
            </div>

            <div class="form-group row">
              <div class="col-12">
                <label for="direccion">indicaciones para ubicar la dirección descrita:</label>
                <textarea class="form-control" id="direccion" v-model="denunciado.indicaciones" rows="2"
                  placeholder="Ingrese su dirección"></textarea>
                <div v-if="v$.denunciado.indicaciones.$error" class="text-danger text-sm">
                  <div v-if="v$.denunciado.indicaciones.maxLength.$invalid">Máximo 1000 caracteres.</div>
                </div>
              </div>
            </div>

            <div class="form-group row">

              <div class="col-6">
                <label for="edad">Departamento</label>
                <SelectDepartamento v-model="denunciado.departamentoId" />
                <div v-if="v$.denunciado.departamentoId.$error" class="text-danger text-sm">
                  <div v-if="v$.denunciado.departamentoId.required.$invalid">Seleccione un departamento</div>
                </div>


              </div>
              <div class="col-6">
                <label for="edad">Municipio</label>
                <SelectMunicipio v-model="denunciado.municipioId" :departamentoId="denunciado.departamentoId" />
                <div v-if="v$.denunciado.municipioId.$error" class="text-danger text-sm">
                  <div v-if="v$.denunciado.municipioId.required.$invalid">Seleccione un municipio</div>
                </div>
              </div>
            </div>

            <div class="form-group row">

              <div class="col-6">
                <label for="edad">Idioma</label>
                <SelectIdioma v-model="denunciado.idioma" />
              </div>

              <div class="col-6">
                <label for="edad">Etnia</label>
                <SelectEtnia v-model="denunciado.etnia" />
              </div>
            </div>

            <div class="form-group mb-0">
              <h3 for="denuncia">Tipo De Denuncia</h3>
              <SelectTipoDenuncia v-model="denunciado.tipoDenunciaId" />

            </div>

            <div class="form-group mt-4" v-if="denunciado.tipoDenunciaId === 6">
              <label for="otrosDetalle">Por favor, describa el tipo de denuncia</label>
              <textarea id="otrosDetalle" class="form-control" v-model="denunciado.tipoDenunciaOtros" rows="2"
                placeholder="Describa el motivo de la denuncia"></textarea>
              <!-- <div v-if="v$.denunciado.tipoDenunciaOtros?.$error" class="text-danger text-sm">
                <div v-if="v$.denunciado.tipoDenunciaOtros.required?.$invalid">
                  Este campo es obligatorio
                </div>
                <div v-if="v$.denunciado.tipoDenunciaOtros.maxLength?.$invalid">
                  Máximo 300 caracteres
                </div>
              </div> -->
            </div>


            <div class="form-group mb-0">
              <label for="denuncia">Detalle o motivo de la denuncia</label>
              <textarea class="form-control" id="denuncia" v-model="denunciado.denuncia" rows="5"
                placeholder="Describa la situación que desea denunciar"></textarea>
              <div v-if="v$.denunciado.denuncia.$error" class="text-danger text-sm">
                <div v-if="v$.denunciado.denuncia.required.$invalid">El detalle o motivo es obligatorio.</div>
                <div v-if="v$.denunciado.denuncia.maxLength.$invalid">Máximo 1000 caracteres.</div>
              </div>
            </div>

          </div>

          <!-- <div class="form-group mb-0">
            <SelectCalificacion v-model="calificacion" :error="calificacionError" />
          </div> -->

          <!-- antes: -->
          <!-- <div class="form-group row" v-if="isTpValid"> -->

          <!-- después: -->
          <div class="form-group row" v-if="showUnidad">
            <div class="col-6">
              <label for="unidad">Unidad Administrativa</label>
              <select id="unidad" v-model="unidadAdministrativa" class="form-control">
                <option value="" disabled>-- Seleccione Unidad --</option>
                <option v-for="u in unidades" :key="u.value" :value="u.value">
                  {{ u.label }}
                </option>
              </select>
              <div v-if="v$.unidadAdministrativa.$error" class="text-danger text-sm mt-1">
                <div v-if="v$.unidadAdministrativa.required.$invalid">
                  Selecciona una unidad administrativa
                </div>
              </div>
            </div>
          </div>

          <!-- … justo antes del bloque de “Aceptar términos” … -->
          <div v-if="isTpValid" class="form-group mb-5">
            <label class="file-upload-container" for="archivoPdf">
              <i class="fas fa-upload"></i>
              <span v-if="!adjunto">Seleccionar Archivo (máx 10 MB)</span>
              <span v-else>{{ adjunto.name }} ({{ formatSize(adjunto.size) }})</span>
            </label>

            <input id="archivoPdf" type="file" accept="application/pdf" @change="handleFileUpload" class="d-none" />

            <button v-if="adjunto" type="button" class="btn btn-sm btn-link text-danger mt-2 p-0" @click="removeFile">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>

            <div v-if="v$.adjunto.$error" class="text-danger mt-1">
              <div v-if="v$.adjunto.required.$invalid">
                Debes adjuntar un archivo
              </div>
              <div v-if="v$.adjunto.pdfFormat.$invalid">
                {{ v$.adjunto.pdfFormat.$message }}
              </div>
              <div v-if="v$.adjunto.maxSize.$invalid">
                {{ v$.adjunto.maxSize.$message }}
              </div>
            </div>
          </div>

          <!-- Términos -->
          <div class="form-group form-check mb-6">
            <input type="checkbox" class="form-check-input" id="terminos" v-model="otrosDatos.terminos" />
            <label class="form-check-label" for="terminos">
              Acepto los términos y condiciones
            </label>

            <div v-if="v$.$dirty && v$.otrosDatos.terminos.$error" class="text-danger text-sm mt-1">
              <div v-if="v$.otrosDatos.terminos.required.$invalid">
                {{ v$.otrosDatos.terminos.required.$message }}
              </div>
            </div>

          </div>

          <!-- Botón CREAR (cuando id es null o 0) -->
          <button v-if="this.id === null || this.id === 0" class="btn btn-success font-weight-bold"
            :disabled="isSubmitting" @click="submitForm">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin mr-2"></i> Enviando...
            </span>
            <span v-else>
              Enviar Denuncia
            </span>
          </button>

          <!-- Botón EDITAR (cuando id tiene valor válido distinto de null o 0) -->
          <button v-else class="btn btn-warning font-weight-bold" :disabled="isSubmitting" @click="updateForm">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin mr-2"></i> Enviando...
            </span>
            <span v-else>
              Actualizar Denuncia
            </span>
          </button>


        </div>
      </div>
    </div>

  </div>

</template>

<script>
import useVuelidate from '@vuelidate/core';
import { ref, reactive, computed, onMounted } from 'vue';
import Global from '@/Global';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { required, requiredIf, maxLength, email, numeric, integer, minValue, maxValue, minLength, helpers } from '@vuelidate/validators';
export default {
  /* global $ */
  name: 'RegistroDenuncia',
  props: {
    id: { type: [String, Number], required: false, default: null },
    tp: { type: [String, Number], default: null }
  },
  watch: {
    'denunciante.anonima'(nuevoValor) {
      if (nuevoValor) {
        this.$swal({
          title: 'Denuncia Anónima Activada',
          text: '',
          icon: 'info',
          confirmButtonColor: '#0BB783',
          confirmButtonText: 'Entendido',
          didOpen: () => {
            const icon = document.querySelector('.swal2-icon');
            if (icon) {
              icon.style.margin = '0 auto';
            }
          }
        });

      }
    },
    'denunciante.departamentoId'() {
      // Cuando el departamento del denunciante cambia, borra el municipio
      this.denunciante.municipioId = '';
    },
    'denunciado.departamentoId'() {
      // Cuando el departamento del denunciado cambia, borra el municipio
      this.denunciado.municipioId = '';
    }
  },
  components: {
    // SelectCalificacion
  },
  setup(props) {
    const route = useRoute()
    const tpResolved = computed(() => {
      return route.query?.tpd ?? route.query?.tp ?? props.tp ?? null
    })
    const isTpd = computed(() => route.query?.tpd != null)
    const isTpValid = computed(() => ['1','2','3'].includes(String(tpResolved.value)))
    const showUnidad = computed(() => isTpValid.value && !isTpd.value)
    // Presencia de prefijo en URL (tp o tpd) para exigir sesión
    const hasTpOrTpd = computed(() => route.query?.tpd != null || route.query?.tp != null)

    // ② Ref para el archivo PDF
    const adjunto = ref(null)

    // ③ Nuevo: Lista de unidades y su selección
    const unidades = ref([])
    const unidadAdministrativa = ref(null)

    const calificacion = ref(null);
    const calificacionError = ref(false);

    const isSubmitting = ref(false);
    const denunciante = reactive({
      persona: false,
      anonima: false,
      correo: '',
      empresaDenunciante: '',
      primerN: '',
      segundoN: '',
      primerA: '',
      segundoA: '',
      telefono: '',
      direccion: '',
      sexo: '',
      edad: null,
      dpi: '',
      departamentoId: '',
      municipioId: '',
      idioma: '',
      etnia: ''
    });

    const denunciado = reactive({
      persona: false,
      empresa: '',
      primerN: '',
      segundoN: '',
      primerA: '',
      segundoA: '',
      correo: '',
      dpi: '',
      telefono: '',
      direccion: '',
      indicaciones: '',
      departamentoId: '',
      municipioId: '',
      idioma: '',
      etnia: '',
      sexo: '',
      edad: null,
      denuncia: '',
      tipoDenunciaId: 0,
      tipoDenunciaOtros: ''
    });

    const otrosDatos = reactive({
      terminos: false
    });

    const validations = computed(() => ({
      adjunto: {
        required: requiredIf(() => isTpValid.value),
        pdfFormat: helpers.withMessage(
          'Solo PDF permitido',
          file => !isTpValid.value || (file && file.type === 'application/pdf')
        ),
        maxSize: helpers.withMessage(
          'Máx. 10 MB',
          file => !isTpValid.value || (file && file.size <= 10 * 1024 * 1024)
        )
      },
      unidadAdministrativa: {
        // Con tpd NO es obligatorio (ni visible). Con tp SÍ.
        required: requiredIf(() => showUnidad.value)
      },
      denunciante: {
        correo: { email, maxLength: maxLength(150) },
        empresaDenunciante: {
          required: requiredIf(() => !denunciante.anonima && !denunciante.persona),
          maxLength: maxLength(100)
        },
        primerN: {
          required: requiredIf(() => !denunciante.anonima && denunciante.persona),
          maxLength: maxLength(50)
        },
        segundoN: { maxLength: maxLength(50) },
        primerA: {
          required: requiredIf(() => !denunciante.anonima && denunciante.persona),
          maxLength: maxLength(50)
        },
        // primerA: { maxLength: maxLength(50) },
        segundoA: { maxLength: maxLength(50) },
        // telefono: { required: () => !denunciante.anonima },
        telefono: {
          numeric,
          integer,
          minLength: minLength(8),
          maxLength: maxLength(8)
        },
        direccion: { maxLength: maxLength(1000) },
        edad: {
          integer,
          numeric,
          minValue: minValue(18),
          maxValue: maxValue(100)
        },
        dpi: {
          numeric,
          integer,
          minLength: minLength(13),
          maxLength: maxLength(13)
        },
      },
      denunciado: {
        denuncia: { required, maxLength: maxLength(1000) },
        empresa: { maxLength: maxLength(100) },
        correo: { email, maxLength: maxLength(150) },
        primerN: { maxLength: maxLength(50) },
        segundoN: { maxLength: maxLength(50) },
        // primerA: { required: () => !denunciante.anonima, maxLength: maxLength(75) },
        primerA: { maxLength: maxLength(50) },
        segundoA: { maxLength: maxLength(50) },
        // telefono: { required: () => !denunciante.anonima },
        telefono: {
          numeric,
          integer,
          minLength: minLength(8),
          maxLength: maxLength(8)
        },
        direccion: { required, maxLength: maxLength(1000) },
        indicaciones: { maxLength: maxLength(1000) },
        edad: {
          integer,
          numeric,
          minValue: minValue(18),
          maxValue: maxValue(100)
        },
        dpi: {
          numeric,
          integer,
          minLength: minLength(13),
          maxLength: maxLength(13)
        },
        departamentoId: { required },
        municipioId: { required },
        // tipoDenunciaId: {
        //   required: helpers.withMessage('Debes seleccionar el tipo de denuncia', value => !!value && value > 0)
        // },
        // tipoDenunciaOtros: {
        //   required: requiredIf(() => denunciado.tipoDenunciaId === 6),
        //   maxLength: maxLength(300)
        // }

        tipoDenunciaOtros: {
          maxLength: maxLength(300)
        }
      },
      otrosDatos: {
        terminos: {
          required: helpers.withMessage('Debes aceptar los términos y condiciones', value => value === true)
        }
      }

    }));

    // ⑥ Inicia Vuelidate
    const state = reactive({ adjunto, unidadAdministrativa, denunciante, denunciado, otrosDatos })
    const v$ = useVuelidate(validations, state)

    // ⑦ Fetch de unidades al montar
    onMounted(async () => {
      try {
        const { data } = await axios.get(`${Global.url}utilidades/unidades`)
        unidades.value = data   // espera [{ label, value }, …]
      } catch (e) {
        console.error('No cargaron unidades', e)
      }
    })

    // ⑥ Handler para carga de archivo
    function handleFileUpload(e) {
      adjunto.value = e.target.files[0] || null
      v$.value.adjunto.$touch()
    }

    return {
      isTpValid,
      tpResolved,
      isTpd,
      hasTpOrTpd,
      showUnidad,
      adjunto,
      unidades, unidadAdministrativa,
      handleFileUpload,
      denunciante,
      denunciado,
      otrosDatos,
      calificacion,
      calificacionError,
      v$,
      isSubmitting
    };
  },

  mounted() {
    // Activa todos los tooltips en este componente
    $('[data-toggle="tooltip"]').tooltip();
    this.cargarDatos();
  },

  methods: {
    isLoggedIn() {
      const s = this.$store?.state || {}
      const hasStoreUser = !!(s.userEmail || s.userName) || (Array.isArray(s.userRoles) && s.userRoles.length > 0)
      const hasLocalUser = !!(localStorage.getItem('userEmail') || localStorage.getItem('nombreUsuario') || localStorage.getItem('usuario'))
      const hasToken = !!localStorage.getItem('token')
      return hasToken || hasStoreUser || hasLocalUser
    },
    getUsuario() {
      const s = this.$store?.state || {}
      return (
        s.userEmail ||
        s.userName ||
        localStorage.getItem('userEmail') ||
        localStorage.getItem('nombreUsuario') ||
        localStorage.getItem('usuario') ||
        ''
      )
    },
    toggleAnonima() {
      this.denunciante.anonima = !this.denunciante.anonima;
    },

    removeFile() {
      this.adjunto = null;
      this.v$.adjunto.$reset();
    },
    formatSize(bytes) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    async pedirDecisionFirma() {
      const res = await this.$swal({
        title: 'Confirmar envío',
        text: '¿Deseas enviar la denuncia con firma electrónica?',
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Con firma electrónica',
        denyButtonText: 'Sin firma',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      })
      if (res.isDismissed) return { canceled: true }
      if (res.isDenied) return { conFirma: false, canceled: false }
      // Confirmado: pedir PIN (máximo 25 caracteres)
      const pinRes = await this.$swal({
        title: 'PIN de firma',
        input: 'password',
        inputLabel: 'Ingresa tu PIN de firma electrónica',
        inputPlaceholder: 'Máximo 25 caracteres',
        inputAttributes: { maxlength: 25, autocapitalize: 'off', autocorrect: 'off' },
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Firmar y enviar',
        inputValidator: (v) => {
          const s = (v ?? '').toString()
          if (!s) return 'El PIN es obligatorio'
          if (s.length > 25) return 'El PIN debe tener como máximo 25 caracteres'
          return undefined
        }
      })
      if (pinRes.isDismissed) return { canceled: true }
      return { conFirma: true, pin: pinRes.value, canceled: false }
    },

    async submitForm() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        this.$swal('Faltan campos requeridos', 'Por favor llena los campos obligatorios.', 'error');
        return;
      }
      if (!this.denunciado.denuncia?.trim()) {
        this.$swal('Campo obligatorio', 'Debes llenar el motivo de la denuncia.', 'error');
        return;
      }
      // PDF obligatorio cuando tp/tdp ∈ {1,2,3}
      if (this.isTpValid && !this.adjunto) {
        this.$swal('Archivo requerido', 'Adjunta un PDF de hasta 10 MB.', 'warning');
        return;
      }
      // Sesión requerida solo si la URL trae tp o tpd
      if (this.hasTpOrTpd && !this.isLoggedIn()) {
        this.$swal('Sesión requerida', 'Inicia sesión para usar este tipo de registro.', 'warning');
        return;
      }
      // Decisión de firma electrónica: solo nuevo registro, con tpd y tpd != 1
      let conFirma = false; let pinFirma = null;
      if (this.isTpd && String(this.tpResolved) !== '1' && (this.id === null || this.id === 0)) {
        const r = await this.pedirDecisionFirma();
        if (r?.canceled) return; // no enviar
        conFirma = !!r?.conFirma;
        pinFirma = r?.pin || null;
      }
     const tpdVal = this.isTpd ? String(this.tpResolved) : '';
     const usuario = this.getUsuario();

      this.isSubmitting = true;
      this.limpiarEspacios(this.denunciante);
      this.limpiarEspacios(this.denunciado);
      this.limpiarEspacios(this.otrosDatos);

      const form = new FormData();
      // --- Denunciante ---
      form.append('EmpresaDenunciante', this.denunciante.empresaDenunciante || '');
      form.append('PrimerNombre', this.denunciante.primerN || '');
      form.append('SegundoNombre', this.denunciante.segundoN || '');
      form.append('PrimerApellido', this.denunciante.primerA || '');
      form.append('SegundoApellido', this.denunciante.segundoA || '');
      form.append('Sexo', this.denunciante.sexo || '');
      form.append('Edad', this.denunciante.edad || '');
      form.append('Etnia', this.denunciante.etnia || '');
      form.append('ComunidadLinguistica', this.denunciante.idioma || '');
      form.append('DpiDenunciante', this.denunciante.dpi || '');
      form.append('TelefonoDenunciante', this.denunciante.telefono || '');
      form.append('DireccionDenunciante', this.denunciante.direccion || '');
      form.append('IdMunicipioDenunciante', this.denunciante.municipioId || '');
      form.append('IdDepartamentoDenunciante', this.denunciante.departamentoId || '');
      form.append('CorreoDenunciante', this.denunciante.correo || '');
      form.append('EsPersonaIndividualD', this.denunciante.persona ? 'true' : 'false');

      // --- Denunciado ---
      form.append('EsPersonaIndividual', this.denunciado.persona ? 'true' : 'false');
      form.append('Empresa', this.denunciado.empresa || '');
      form.append('PrimerNombreDdo', this.denunciado.primerN || '');
      form.append('SegundoNombreDdo', this.denunciado.segundoN || '');
      form.append('PrimerApellidoDdo', this.denunciado.primerA || '');
      form.append('SegundoApellidoDdo', this.denunciado.segundoA || '');
      form.append('DpiDdo', this.denunciado.dpi || '');
      form.append('TelefonoDdo', this.denunciado.telefono || '');
      form.append('DireccionDdo', this.denunciado.direccion || '');
      form.append('ReferenciaDireccionDdo', this.denunciado.indicaciones || '');
      form.append('IdMunicipioDdo', this.denunciado.municipioId || '');
      form.append('IdDepartamentoDdo', this.denunciado.departamentoId || '');
      form.append('CorreoDdo', this.denunciado.correo || '');
      form.append('SexoDdo', this.denunciado.sexo || '');
      form.append('ComunidadDdo', this.denunciado.idioma || '');
      form.append('EtniaDdo', this.denunciado.etnia || '');
      form.append('Edad_Ddo', this.denunciado.edad || '');

      // --- Denuncia ---
      form.append('Asunto', this.denunciado.denuncia);
      form.append('IdTipoDenuncia', this.denunciado.tipoDenunciaId || '');
      form.append('Otros', this.denunciado.tipoDenunciaId === 6 ? this.denunciado.tipoDenunciaOtros : '');
      form.append('Terminos', this.otrosDatos.terminos ? 'true' : 'false');
      form.append('EsAnonima', this.denunciante.anonima ? 'true' : 'false');
      form.append('PeriodoDenuncia', new Date().getFullYear().toString());

      // --- Unidad Administrativa (solo cuando showUnidad=true) ---
      if (this.showUnidad && this.unidadAdministrativa) {
        form.append('UnidadAdministrativa', this.unidadAdministrativa);
      }
      // --- PDF (requerido si isTpValid) ---
      if (this.isTpValid && this.adjunto) {
        form.append('DocumentoFisico', this.adjunto);
        form.append('tipoF', String(this.tpResolved));
      }
      // --- Firma electrónica y tpd / usuario ---
      form.append('ConFirma', conFirma ? 'true' : 'false');
      form.append('PinFirma', conFirma && pinFirma ? pinFirma : '');
      form.append('tpd', tpdVal);
      form.append('usuario', usuario);

      // 4) Enviar como multipart/form-data
      try {
        const response = await axios.post(
          `${Global.url}denuncias/crear`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data?.noDenuncia && response.data?.idDenuncia) {
          await this.$swal({
            title: 'Denuncia registrada',
            text: `Tu número de denuncia es: ${response.data.noDenuncia}`,
            icon: 'success',
            confirmButtonColor: '#0BB783',
            allowOutsideClick: false
          });
          this.mostrarSwalCalificacion(response.data.idDenuncia);
        }
      } catch (error) {
        const msg = error.response?.data?.mensaje || 'Ocurrió un error al guardar la denuncia.';
        this.$swal('Error', msg, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },


    // async submitForm() {
    //   this.v$.$touch();

    //   if (this.v$.$invalid) {
    //     this.$swal(
    //       'Faltan campos requeridos',
    //       'Por favor llena los campos obligatorios.',
    //       'error'
    //     );
    //     return;
    //   }

    //   if (!this.denunciado.denuncia || this.denunciado.denuncia.trim() === '') {
    //     this.$swal('Campo obligatorio', 'Debes llenar el motivo de la denuncia.', 'error');
    //     return;
    //   }

    //   // Validación adicional: si tp=1|2|3, asegúrate de tener archivo
    //   if (this.isTpValid && !this.adjunto) {
    //     this.$swal('Archivo requerido', 'Adjunta un PDF de hasta 10 MB.', 'warning')
    //     return
    //   }

    //   this.isSubmitting = true;

    //   this.limpiarEspacios(this.denunciante);
    //   this.limpiarEspacios(this.denunciado);
    //   this.limpiarEspacios(this.otrosDatos);

    //   const payload = {

    //     //Denunciante
    //     empresaDenunciante: this.denunciante.empresaDenunciante || null,
    //     primerNombre: this.denunciante.primerN || null,
    //     segundoNombre: this.denunciante.segundoN || null,
    //     primerApellido: this.denunciante.primerA || null,
    //     segundoApellido: this.denunciante.segundoA || null,
    //     sexo: Number(this.denunciante.sexo) || null,
    //     edad: this.denunciante.edad || null,
    //     etnia: Number(this.denunciante.etnia) || null,
    //     comunidadLinguistica: Number(this.denunciante.idioma) || null,
    //     dpiDenunciante: this.denunciante.dpi || null,
    //     telefonoDenunciante: this.denunciante.telefono || null,
    //     direccionDenunciante: this.denunciante.direccion || null,
    //     idMunicipioDenunciante: Number(this.denunciante.municipioId) || null,
    //     idDepartamentoDenunciante: Number(this.denunciante.departamentoId) || null,
    //     correoDenunciante: this.denunciante.correo || null,
    //     esPersonaIndividualD: this.denunciante.persona,

    //     // Denunciante
    //     esPersonaIndividual: this.denunciado.persona,
    //     empresa: this.denunciado.empresa || null,
    //     primerNombreDdo: this.denunciado.primerN || null,
    //     segundoNombreDdo: this.denunciado.segundoN || null,
    //     primerApellidoDdo: this.denunciado.primerA || null,
    //     segundoApellidoDdo: this.denunciado.segundoA || null,
    //     dpiDdo: this.denunciado.dpi || null,
    //     telefonoDdo: this.denunciado.telefono || null,
    //     direccionDdo: this.denunciado.direccion || null,
    //     referenciaDireccionDdo: this.denunciado.indicaciones || null,
    //     idMunicipioDdo: Number(this.denunciado.municipioId) || null,
    //     idDepartamentoDdo: Number(this.denunciado.departamentoId) || null,
    //     correoDdo: this.denunciado.correo || null,
    //     sexoDdo: Number(this.denunciado.sexo) || null,
    //     comunidadDdo: Number(this.denunciado.idioma) || null,
    //     etniaDdo: Number(this.denunciado.etnia) || null,
    //     edad_Ddo: this.denunciado.edad || null,

    //     // Denuncia
    //     asunto: this.denunciado.denuncia,
    //     idTipoDenuncia: Number(this.denunciado.tipoDenunciaId) || null,
    //     otros: this.denunciado.tipoDenunciaId === 6 ? this.denunciado.tipoDenunciaOtros : null,
    //     terminos: this.otrosDatos.terminos,
    //     esAnonima: this.denunciante.anonima,
    //     periodoDenuncia: new Date().getFullYear(),
    //     // idCalificacion: this.calificacion
    //   };

    //   try {
    //     const response = await axios.post(`${Global.url}denuncias/crear`, payload);

    //     if (response.data?.noDenuncia && response.data?.idDenuncia) {
    //       // Primer Swal mostrando número de denuncia
    //       this.$swal({
    //         title: 'Denuncia registrada',
    //         text: `Tu número de denuncia es: ${response.data.noDenuncia}`,
    //         icon: 'success',
    //         confirmButtonColor: '#0BB783',
    //         allowOutsideClick: false, // Para forzar a que presione OK primero
    //       }).then(() => {
    //         // Aquí mostramos el segundo Swal para la calificación
    //         this.mostrarSwalCalificacion(response.data.idDenuncia);
    //       });
    //     }


    //   } catch (error) {
    //     const mensaje = error.response?.data?.mensaje || 'Ocurrió un error al guardar la denuncia.';
    //     this.$swal({
    //       title: 'Error',
    //       text: mensaje,
    //       icon: 'error',
    //       confirmButtonColor: '#F64E60'
    //     });
    //   } finally {
    //     this.isSubmitting = false;
    //   }
    // },

    async updateForm() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        this.$swal('Faltan campos requeridos', 'Por favor llena los campos obligatorios.', 'error');
        return;
      }
      if (!this.denunciado.denuncia || this.denunciado.denuncia.trim() === '') {
        this.$swal('Campo obligatorio', 'Debes llenar el motivo de la denuncia.', 'error');
        return;
      }
      // Firma en modificación: solo si tpd y tpd != 1
      let conFirma = false;
      let pinFirma = '';
      if (this.isTpd && String(this.tpResolved) !== '1') {
        const r = await this.pedirDecisionFirma();
        if (r?.canceled) return;
        conFirma = !!r?.conFirma;
        pinFirma = r?.pin || '';
      }
      const tpdVal = this.isTpd ? String(this.tpResolved) : '';
      const usuario = this.getUsuario();

      this.isSubmitting = true;
      this.limpiarEspacios(this.denunciante);
      this.limpiarEspacios(this.denunciado);
      this.limpiarEspacios(this.otrosDatos);

      const payload = {
        // Denunciante
        empresaDenunciante: this.denunciante.empresaDenunciante || null,
        primerNombre: this.denunciante.primerN || null,
        segundoNombre: this.denunciante.segundoN || null,
        primerApellido: this.denunciante.primerA || null,
        segundoApellido: this.denunciante.segundoA || null,
        sexo: Number(this.denunciante.sexo) || null,
        edad: this.denunciante.edad || null,
        etnia: Number(this.denunciante.etnia) || null,
        comunidadLinguistica: Number(this.denunciante.idioma) || null,
        dpiDenunciante: this.denunciante.dpi || null,

        // ← Enviar el teléfono como STRING, no como número
        telefonoDenunciante: this.denunciante.telefono
          ? String(this.denunciante.telefono)
          : null,

        direccionDenunciante: this.denunciante.direccion || null,
        idMunicipioDenunciante: Number(this.denunciante.municipioId) || null,
        idDepartamentoDenunciante: Number(this.denunciante.departamentoId) || null,
        correoDenunciante: this.denunciante.correo || null,
        esPersonaIndividualD: this.denunciante.persona,

        // Denunciado
        esPersonaIndividual: this.denunciado.persona,
        empresa: this.denunciado.empresa || null,
        primerNombreDdo: this.denunciado.primerN || null,
        segundoNombreDdo: this.denunciado.segundoN || null,
        primerApellidoDdo: this.denunciado.primerA || null,
        segundoApellidoDdo: this.denunciado.segundoA || null,
        dpiDdo: this.denunciado.dpi || null,

        // ← Enviar el teléfono denunciado como STRING
        telefonoDdo: this.denunciado.telefono
          ? String(this.denunciado.telefono)
          : null,

        direccionDdo: this.denunciado.direccion || null,
        referenciaDireccionDdo: this.denunciado.indicaciones || null,
        idMunicipioDdo: Number(this.denunciado.municipioId) || null,
        idDepartamentoDdo: Number(this.denunciado.departamentoId) || null,
        correoDdo: this.denunciado.correo || null,
        sexoDdo: Number(this.denunciado.sexo) || null,
        comunidadDdo: Number(this.denunciado.idioma) || null,
        etniaDdo: Number(this.denunciado.etnia) || null,
        edad_Ddo: this.denunciado.edad || null,

        // Denuncia
        asunto: this.denunciado.denuncia,
        idTipoDenuncia: Number(this.denunciado.tipoDenunciaId) || null,
        otros: this.denunciado.tipoDenunciaId === 6
          ? this.denunciado.tipoDenunciaOtros
          : null,
        terminos: this.otrosDatos.terminos,
        esAnonima: this.denunciante.anonima,
        periodoDenuncia: new Date().getFullYear(),

        // ← idSicoda como número, no como cadena
        idSicoda: Number(this.id),
        // Extras requeridos: tpd, firma y usuario
        tpd: tpdVal,
        ConFirma: conFirma,
        PinFirma: pinFirma,
        usuario
      };

      try {
        const response = await axios.post(`${Global.url}denuncias/update`, payload);

        if (response.data.success) {
          // Primer Swal mostrando número de denuncia
          this.$swal({
            title: 'Denuncia Actualizada',
            text: `Los datos de tu denuncia ha sido actualizada y enviadas nuevamente`,
            icon: 'success',
            confirmButtonColor: '#0BB783',
            allowOutsideClick: false, // Para forzar a que presione OK primero
          }).then(() => {
            // Aquí mostramos el segundo Swal para la calificación
            this.$router.push('/RegistroDenuncia');
          });
        }


      } catch (error) {
        const mensaje = error.response?.data?.mensaje || 'Ocurrió un error al guardar la denuncia.';
        this.$swal({
          title: 'Error',
          text: mensaje,
          icon: 'error',
          confirmButtonColor: '#F64E60'
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async mostrarSwalCalificacion(idDenuncia) {
      await this.$swal({
        title: 'Califica tu experiencia',
        width: 600, // ✅ Aumenta el ancho del SweetAlert
        padding: '2em', // ✅ Aumenta el espacio interior
        html: `
      <style>
        .calificacion-opcion {
          background-color: #f3f6f9;
          border: 2px solid transparent;
          width: 90px; /* ✅ Más ancho */
          height: 100px; /* ✅ Más alto */
          text-align: center;
          font-size: 1.5rem;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .calificacion-opcion:hover {
          background-color: #e0f7fa;
          border-color: #0BB783;
          transform: scale(1.05); /* ✅ Efecto zoom al pasar mouse */
        }
      </style>
      <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
        <button type="button" class="calificacion-opcion" data-value="1">😡<br><small>Muy Mala</small></button>
        <button type="button" class="calificacion-opcion" data-value="2">😞<br><small>Mala</small></button>
        <button type="button" class="calificacion-opcion" data-value="3">😐<br><small>Normal</small></button>
        <button type="button" class="calificacion-opcion" data-value="4">😊<br><small>Buena</small></button>
        <button type="button" class="calificacion-opcion" data-value="5">😍<br><small>Muy Buena</small></button>
      </div>
    `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Omitir',
        didOpen: () => {
          const botones = this.$swal.getHtmlContainer().querySelectorAll('.calificacion-opcion');
          botones.forEach(btn => {
            btn.addEventListener('click', async () => {
              const valorSeleccionado = parseInt(btn.getAttribute('data-value'));

              try {
                await axios.post(`${Global.url}denuncias/calificar`, {
                  idDenuncia,
                  idCalificacion: valorSeleccionado
                });
                this.$swal({
                  title: '¡Gracias!',
                  text: 'Tu calificación ha sido registrada exitosamente.',
                  icon: 'success',
                  confirmButtonColor: '#0BB783'
                }).then(() => {
                  window.location.reload();
                });
              } catch (error) {
                console.error('Error al registrar calificación:', error);
                window.location.reload();
              }
            });
          });
        }
      }).then(result => {
        if (result.isDismissed) {
          window.location.reload();
        }
      });
    },

    resetForm() {
      this.v$.$reset();

      this.denunciante = {
        anonima: false,
        correo: '',
        primerN: '',
        segundoN: '',
        primerA: '',
        segundoA: '',
        telefono: '',
        direccion: '',
        sexo: '',
        edad: null,
        dpi: '',
        departamentoId: '',
        municipioId: '',
        idioma: '',
        etnia: ''
      };

      this.denunciado = {
        idpersona: false,
        empresa: '',
        primerN: '',
        segundoN: '',
        primerA: '',
        segundoA: '',
        correo: '',
        dpi: '',
        telefono: '',
        direccion: '',
        indicaciones: '',
        departamentoId: '',
        municipioId: '',
        idioma: '',
        etnia: '',
        sexo: '',
        edad: null,
        denuncia: '',
        tipoDenunciaId: 0,
        tipoDenunciaOtros: ''
      };

      this.otrosDatos = {
        terminos: false
      };

      this.calificacion = null;
      this.calificacionError = false;

    },

    limpiarEspacios(obj) {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
        }
      });
    },

    async cargarDatos() {
      console.log(this.id);
      console.log(this.tpResolved);
      if (this.id != null && this.id >= 1) {
        console.log(this.id)
        try {
          const response = await axios.get(`${Global.url}denuncias/denuncia/${this.id}`);

          // ✅ Aquí procesas los datos si todo va bien
          this.datos = response.data;
          console.log(response.data);

          //Denunciante
          this.denunciante.empresaDenunciante = response.data.empresaDenunciante;
          this.denunciante.primerN = response.data.primerNombre;
          this.denunciante.segundoN = response.data.segundoNombre;
          this.denunciante.primerA = response.data.primerApellido;
          this.denunciante.segundoA = response.data.segundoApellido;
          this.denunciante.sexo = response.data.sexo;
          this.denunciante.edad = response.data.edad;
          this.denunciante.etnia = response.data.etnia;
          this.denunciante.idioma = response.data.comunidadLinguistica;
          this.denunciante.dpi = response.data.dpiDenunciante;
          this.denunciante.telefono = response.data.telefonoDenunciante;
          this.denunciante.direccion = response.data.direccionDenunciante;
          this.denunciante.departamentoId = response.data.idDepartamentoDenunciante;
          this.denunciante.municipioId = response.data.idMunicipioDenunciante;
          this.denunciante.correo = response.data.correoDenunciante;
          this.denunciante.persona = response.data.idPersonaDenuciante === 2;
          this.denunciante.anonima = response.data.idAnonima === 2;

          // Denunciado
          this.denunciado.persona = response.data.idpersona === 1;
          this.denunciado.empresa = response.data.empresaDdo,
            this.denunciado.primerN = response.data.primerNombreDdo,
            this.denunciado.segundoN = response.data.segundoNombreDdo,
            this.denunciado.primerA = response.data.primerApellidoDdo,
            this.denunciado.segundoA = response.data.segundoApellidoDdo,
            this.denunciado.dpi = response.data.dpiDdo,
            this.denunciado.telefono = response.data.telefonoDdo,
            this.denunciado.direccion = response.data.direccionDdo;
          this.denunciado.indicaciones = response.data.indicaciones,
            this.denunciado.departamentoId = response.data.idDepartamentoDdo;
          this.denunciado.municipioId = response.data.idMunicipioDdo;

          this.denunciado.correo = response.data.correoDdo,
            this.denunciado.sexo = response.data.sexoDdo,
            this.denunciado.idioma = response.data.comunidadDdo,
            this.denunciado.etnia = response.data.etniaDdo,
            this.denunciado.edad = response.data.edadDdo,

            // // Denuncia
            this.denunciado.denuncia = response.data.asunto;
          this.denunciado.tipoDenunciaId = response.data.idTipoDenuncia;
          this.denunciado.tipoDenunciaOtros = response.data.otrosRegisto;

        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.$swal('No encontrada', error.response.data.mensaje, 'error')
              .then(() => this.$router.push('/RegistroDenuncia'));
          } else if (error.response && error.response.status === 400) {
            this.$swal('No permitido', error.response.data.mensaje, 'warning')
              .then(() => this.$router.push('/RegistroDenuncia'));
          } else {
            this.$swal('Error', 'Ocurrió un error inesperado.', 'error');
          }
        }

      }
      else if (this.tpResolved != null && Number(this.tpResolved) >= 1) {
        // Modo con tp desde query/prop; no redirigir
        if (!this.isLoggedIn()) {
          console.info('Registro con tp requiere sesión. Usuario no autenticado.')
        }
        console.log(this.tpResolved);
       }
       else {
         this.$router.push('/RegistroDenuncia');
       }
    }
  }
}

</script>

<style scoped>
.file-upload-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: #0BB783;
  color: #fff;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.file-upload-container:hover {
  background-color: #099a6b;
}

.file-upload-container i {
  font-size: 1.2rem;
}

textarea.form-control {
  resize: none;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.calificacion-opcion {
  background-color: #f3f6f9;
  border: none;
  width: 100px;
  text-align: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.calificacion-opcion:hover {
  background-color: #e0f7fa;
  border-color: #0BB783;
}
</style>
