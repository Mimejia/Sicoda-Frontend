// routes.js (Vue 3)
import { createRouter, createWebHistory } from 'vue-router'

import LoginE from '../components/Login.vue'
import HomeE from '../components/Home.vue'
import ErrorComponent from '../components/ErrorComponent.vue'
import AboutE from '../views/OficialReceptor/About.vue'
import registroD from '../components/UsuariosExternos/RegistroDenuncia.vue'
import EstadoDenuncia from '../components/UsuariosExternos/ValidacionUsuario.vue'
import MesaDenuncias from '../views/OficialReceptor/MesaDenuncias.vue'
import ExpedienteDenuncia from '../views/OficialReceptor/ExpedienteDenunciaOficial.vue'
import ExpedienteOfiProcurador from '../views/ProcuradorDenuncias/ExpedienteOfiProcurador.vue'
import ExpedienteAsesor from '../views/AsesorDenuncias/ExpedienteAsesor.vue'
import ExpedienteProcurador from '../views/Procurador/ExpedienteProcurador.vue'
import SimilitudesDenuncia from '../views/OficialReceptor/SimilitudesDenuncia.vue'
import MesaProcurador from '../views/Procurador/MesaDenunciasP.vue'
import MesaAsesor from '../views/AsesorDenuncias/MesaDenunciasA.vue'
import MesaDenunciasJ from '@/views/JefeDenuncias/MesaDenunciasJ.vue'
import ExpedienteJefe from '@/views/JefeDenuncias/ExpedienteJefe.vue'
import MesaArch from '@/views/ArchivoDenuncias/MesaDenunciasA.vue'
import MesaProcuracion from '@/views/ProcuradorDenuncias/MesaDenunciasPro.vue'
import DireccionesDocumento from '@/views/Procurador/DireccionesDocumento.vue'
import MesaDireccionesInternas from '@/views/Direcciones Internas/MesaDireccionesInternas.vue'
import ExpedienteDirInternas from '@/views/Direcciones Internas/ExpedienteDirInternas.vue'
import MesaDireccionesDir from '@/views/Direcciones Internas/MesaDenunciasDir.vue'
import ExpedienteDirecciones from '@/views/Direcciones Internas/ExpedienteDirecciones.vue'
import DashboardView from '@/views/Dashboard/Dashboard.vue'
import MesaDenunciasDashboard from '@/views/Dashboard/MesaDenuncias.vue'

import HistorialEstados from '@/views/OficialReceptor/HistorialEstados.vue'
import Notificaciones from '@/views/Notificaciones/NotificacionesDireccionesMesa.vue'

const routes = [
  {
    path: '/',
    component: HomeE,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: AboutE },
      { path: 'mesaOficialR', component: MesaDenuncias },
      { path: 'mesaProcurador', component: MesaProcurador },
      { path: 'mesaAsesor', component: MesaAsesor },
      { path: 'mesaDirecciones', component: MesaDireccionesInternas },
      { path: 'mesaDireccionesDir', component: MesaDireccionesDir },
      { path: 'MesaDenunciasArch', component: MesaArch },
      { path: 'procuracion', component: MesaProcuracion },
      { path: 'expediente/:id', component: ExpedienteDenuncia, props: true },
      { path: 'expedienteOfiP/:id', component: ExpedienteOfiProcurador, props: true },
      { path: 'expedienteP/:id', component: ExpedienteProcurador, props: true },
      { path: 'expedienteD/:id/:idDireccion', component: ExpedienteDirInternas, props: true },
      { path: 'expedienteD/:id', component: ExpedienteDirInternas, props: true },
      { path: 'expedienteA/:id', component: ExpedienteAsesor, props: true },
      { path: 'expedienteJ/:id', component: ExpedienteJefe, props: true },
      { path: 'mesaJefe', component: MesaDenunciasJ },
      {
        path: '/similitudes/:id',
        name: 'SimilitudesDenuncia',
        component: SimilitudesDenuncia,
        props: true
      },
      {
        path: '/comparar/:id/:nodenuncia',
        name: 'ComparacionDenuncia',
        component: () => import('@/views/OficialReceptor/ComparacionDenuncia.vue'),
        props: true
      },
      {
        path: '/historial/:idSicoda',
        name: 'HistorialEstados',
        component: HistorialEstados,
        props: true
      },
      {
        path: '/documento/:idDocumento/historial',
        name: 'historial-documento',
        component: () => import('@/views/Procurador/HistorialDocumento.vue'),
        props: true
      },
      {
        path: '/procurador/direcciones/:idDocumento',
        name: 'direcciones-documento',
        component: DireccionesDocumento,
        props: true
      },
      {
        path: '/notificaciones',
        name: 'notificaciones',
        component: Notificaciones, // usa el import estático ya declarado
        meta: { requiresAuth: true }
      },
      {
        path: '/expediente-dir/:idSicoda',
        name: 'ExpedienteDir',
        component: ExpedienteDirecciones,
        props: true
      },
      // ------------------ NUEVO: Dashboard y Mesa (NO se borran rutas existentes) ------------------
      { path: 'dashboard', name: 'Dashboard', component: DashboardView },
      { path: 'mesa-denuncias', name: 'MesaDenunciasDashboard', component: MesaDenunciasDashboard },
      // ---------------------------------------------------------------------------------------------
    ],
  },
  { path: '/login', component: LoginE, meta: { requiresGuest: true } },
  { path: '/RegistroDenuncia', component: registroD },
  { path: '/:pathMatch(.*)*', component: ErrorComponent },
  { path: '/EstadoDenuncia', component: EstadoDenuncia },
  {
    path: '/RegistroDenuncia',
    name: 'RegistroDenuncia',
    component: registroD,
    props: route => ({ tp: route.query.tp || null })
  },
  {
    path: '/RegistroDenuncia/:id',
    name: 'SubsanarRequisitos',
    component: registroD,
    props: true
  },
  // { path: '/RegistroDenuncia/:id', name:'SubsanarRequisitos', component: registroD, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
