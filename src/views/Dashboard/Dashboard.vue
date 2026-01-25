<template>
  <div class="card p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0">Dashboard</h2>
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <input type="text" class="form-control form-control-sm" placeholder="Buscar (No, Motivo, Usuario, Depto/Muni)" v-model="filters.q" />
        <select class="form-select form-select-sm" v-model="filters.estado">
          <option value="">Estado: Todos</option>
        </select>
        <select class="form-select form-select-sm" v-model="filters.tipoIngreso">
          <option value="">Ingreso: Todos</option>
          <option value="FISICA">FISICA</option>
          <option value="DIGITAL">DIGITAL</option>
        </select>
        <select class="form-select form-select-sm" v-model="filters.ingresadaDelegacion">
          <option value="">Delegación: Todas</option>
          <option value="Ingreso por delegación">Ingreso por delegación</option>
          <option value="No es ingreso por Delegación">No es ingreso por Delegación</option>
        </select>
        <button class="btn btn-sm btn-primary" @click="cargarTodo" :disabled="loading">
          <i class="fas fa-sync-alt me-1"></i> Aplicar filtros
        </button>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-3" v-for="card in cards" :key="card.key">
        <div class="p-3 border rounded bg-light h-100">
          <div class="text-muted small">{{ card.label }}</div>
          <div class="display-6 fw-bold">{{ kpi[card.key] ?? 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row g-3 mt-3">
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Gráfico: Denuncias por Tipo</div>
          <canvas id="barTipos"></canvas>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Gráfico: Denuncias por Estado</div>
          <canvas id="pieEstados"></canvas>
        </div>
      </div>
    </div>

    <!-- Gráficos avanzados -->
    <div class="row g-3 mt-3">
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Delegación vs Tipo de Ingreso</div>
          <canvas id="stackDelegacionIngreso"></canvas>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Distribución por Unidad</div>
          <canvas id="barUnidad"></canvas>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-3">
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Sexo Denunciante</div>
          <canvas id="doughnutSexoDenunciante"></canvas>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Sexo Denunciado</div>
          <canvas id="doughnutSexoDenunciado"></canvas>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-3">
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Denuncias por Tipo</div>
          <ul class="list-group list-group-flush">
            <li v-for="t in denunciasPorTipo" :key="t.idTipo" class="list-group-item d-flex justify-content-between">
              <span>{{ t.nombre }}</span><span class="fw-semibold">{{ t.total }}</span>
            </li>
            <li v-if="!denunciasPorTipo.length" class="list-group-item text-muted small">Sin datos.</li>
          </ul>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Denuncias por Estado</div>
          <ul class="list-group list-group-flush">
            <li v-for="e in denunciasPorEstado" :key="e.estado" class="list-group-item d-flex justify-content-between">
              <span>{{ e.estado }}</span><span class="fw-semibold">{{ e.total }}</span>
            </li>
            <li v-if="!denunciasPorEstado.length" class="list-group-item text-muted small">Sin datos.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-3">
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Documentos por Tipo</div>
          <ul class="list-group list-group-flush">
            <li v-for="t in documentosPorTipo" :key="t.tipo" class="list-group-item d-flex justify-content-between">
              <span>{{ t.tipo }}</span><span class="fw-semibold">{{ t.total }}</span>
            </li>
            <li v-if="!documentosPorTipo.length" class="list-group-item text-muted small">Sin datos.</li>
          </ul>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded">
          <div class="fw-bold mb-2">Documentos por Estado</div>
          <ul class="list-group list-group-flush">
            <li v-for="e in documentosPorEstado" :key="e.estado" class="list-group-item d-flex justify-content-between">
              <span>{{ e.estado }}</span><span class="fw-semibold">{{ e.total }}</span>
            </li>
            <li v-if="!documentosPorEstado.length" class="list-group-item text-muted small">Sin datos.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
      <router-link class="btn btn-outline-secondary" to="/mesa-denuncias">
        <i class="fas fa-table me-1"></i> Ver Mesa de Denuncias
      </router-link>
    </div>
  </div>
</template>

<script>
import { getKpi } from '@/services/dashboardService'

export default {
  name: 'DashboardView', // multi-word para ESLint
  data() {
    return {
      loading: false,
      filters: { q: '', estado: '', tipoIngreso: '', ingresadaDelegacion: '' },
      kpi: { totalDenuncias: 0, totalDocumentos: 0, documentosFirmados: 0, documentosAnulados: 0 },
      denunciasPorTipo: [],
      denunciasPorEstado: [],
      documentosPorTipo: [],
      documentosPorEstado: [],
      // charts
      chartsReady: false,
      cards: [
        { key: 'totalDenuncias', label: 'Total Denuncias' },
        { key: 'totalDocumentos', label: 'Total Documentos' },
        { key: 'documentosFirmados', label: 'Documentos Firmados' },
        { key: 'documentosAnulados', label: 'Documentos Anulados' },
      ],
    }
  },
  mounted() { this.cargarTodo() },
  methods: {
    async cargarTodo() {
      this.loading = true
      const params = { ...this.filters }
      try {
        const resp = await getKpi(params)
        // Mapear con estructura de mesa/kpi
        this.kpi = resp.kpi || { totalDenuncias: resp.total || 0 }
        this.denunciasPorTipo = resp.porTipoDenuncia || []
        this.denunciasPorEstado = resp.porEstado || []
        this.documentosPorTipo = resp.documentosPorTipo || []
        this.documentosPorEstado = resp.documentosPorEstado || []
        this.porDelegacion = resp.porDelegacion || []
        this.porTipoIngreso = resp.porTipoIngreso || []
        this.porUnidad = resp.porUnidad || []
        this.porSexoDenunciante = resp.porSexoDenunciante || []
        this.porSexoDenunciado = resp.porSexoDenunciado || []
        this.$nextTick(() => this.renderCharts())
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        this.loading = false
      }
    },
    renderCharts() {
      this.chartsReady = false
      const Chart = window.Chart
      if (!Chart) return
      // Bar: Denuncias por Tipo
      const barEl = this.$el.querySelector('#barTipos')
      if (barEl) {
        const labels = this.denunciasPorTipo.map(x => x.nombre || x.tipo || x.label)
        const data = this.denunciasPorTipo.map(x => x.total)
        new Chart(barEl, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Denuncias por Tipo', data, backgroundColor: '#3b82f6' }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        })
      }
      // Pie: Denuncias por Estado
      const pieEl = this.$el.querySelector('#pieEstados')
      if (pieEl) {
        const labels = this.denunciasPorEstado.map(x => x.estado || x.label)
        const data = this.denunciasPorEstado.map(x => x.total)
        new Chart(pieEl, {
          type: 'pie',
          data: { labels, datasets: [{ data, backgroundColor: ['#16a34a','#f59e0b','#ef4444','#6366f1','#10b981','#f97316'] }] },
          options: { responsive: true }
        })
      }
      // Stacked: Delegación vs TipoIngreso (aproximación por totales)
      const stackEl = this.$el.querySelector('#stackDelegacionIngreso')
      if (stackEl && this.porDelegacion && this.porTipoIngreso) {
        const delegLabels = this.porDelegacion.map(x => x.delegacion)
        const tipos = ['FISICA','DIGITAL','Sin Datos.']
        const colors = ['#2563eb','#10b981','#9ca3af']
        const datasets = tipos.map((tipo, i) => ({
          label: tipo,
          backgroundColor: colors[i],
          data: delegLabels.map(() => {
            const match = this.porTipoIngreso.find(t => (t.tipo || '').trim() === tipo)
            return match ? match.total : 0
          })
        }))
        new Chart(stackEl, {
          type: 'bar',
          data: { labels: delegLabels, datasets },
          options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }
        })
      }
      // Horizontal bar: Unidades
      const unidadEl = this.$el.querySelector('#barUnidad')
      if (unidadEl && this.porUnidad) {
        const labels = this.porUnidad.map(x => x.unidad)
        const data = this.porUnidad.map(x => x.total)
        new Chart(unidadEl, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Por Unidad', data, backgroundColor: '#f59e0b' }] },
          options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }
        })
      }
      // Doughnut: Sexo Denunciante
      const sexDenEl = this.$el.querySelector('#doughnutSexoDenunciante')
      if (sexDenEl && this.porSexoDenunciante) {
        const labels = this.porSexoDenunciante.map(x => x.sexo)
        const data = this.porSexoDenunciante.map(x => x.total)
        new Chart(sexDenEl, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: ['#06b6d4','#a855f7','#f43f5e','#22c55e','#f59e0b'] }] },
          options: { responsive: true }
        })
      }
      // Doughnut: Sexo Denunciado
      const sexDdoEl = this.$el.querySelector('#doughnutSexoDenunciado')
      if (sexDdoEl && this.porSexoDenunciado) {
        const labels = this.porSexoDenunciado.map(x => x.sexo)
        const data = this.porSexoDenunciado.map(x => x.total)
        new Chart(sexDdoEl, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: ['#06b6d4','#a855f7','#f43f5e','#22c55e','#f59e0b'] }] },
          options: { responsive: true }
        })
      }
      this.chartsReady = true
    }
  },
}
</script>

<style scoped>
.display-6 { font-size: 2rem; }
</style>
