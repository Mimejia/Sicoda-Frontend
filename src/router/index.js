import { createRouter, createWebHistory } from 'vue-router'

// Importa vistas nuevas
import Dashboard from '@/views/Dashboard/Dashboard.vue'
import MesaDenuncias from '@/views/Dashboard/MesaDenuncias.vue'

// Define las rutas
const routes = [
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/mesa-denuncias', name: 'MesaDenuncias', component: MesaDenuncias },
  // 404 fallback (opcional si ya lo tienes)
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router