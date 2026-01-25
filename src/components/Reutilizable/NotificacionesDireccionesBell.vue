<template>
  <div class="notify-wrapper" @click.stop>
    <button class="bell-btn" @click.stop="toggleDropdown" :disabled="loading" title="Notificaciones">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <teleport to="body">
      <div v-if="open" class="dropdown dropdown-teleported" :style="dropdownStyle" @click.stop>
        <div class="dropdown-header">
          <h6 class="title">Notificaciones</h6>
          <div class="actions">
            <button class="markall" :disabled="items.every(x => x.idEstatus !== 1)" @click="marcarTodas">
              Marcar todas como vistas
            </button>
            <button class="btn-close" @click="open=false" aria-label="Cerrar">×</button>
          </div>
        </div>

        <div v-if="loading" class="state">Cargando…</div>
        <div v-else-if="items.length === 0" class="state">Sin notificaciones</div>

        <ul v-else class="list">
          <li v-for="n in items" :key="n.idNotificacion" :class="['item',{unread:n.idEstatus===1}]" @click="abrirDetalle(n)">
            <div class="icon" :class="{unread:n.idEstatus===1}">
              <i class="fas fa-file"></i>
            </div>
            <div class="body">
              <div class="row1">
                <div class="title">{{ n.titulo }}</div>
                <span v-if="n.idEstatus===1" class="badge-new">Nuevo</span>
              </div>
              <div class="msg" :title="n.mensaje">{{ n.mensaje }}</div>
              <div class="meta">
                <span v-if="n.nombreDireccion">{{ n.nombreDireccion }} · </span>
                <span class="date">{{ fmtFecha(n.fechaIngresa) }}</span>
              </div>
            </div>
          </li>
        </ul>

        <div class="dropdown-footer">
          <router-link to="/notificaciones" class="btn-ver-todas">Ver todas las notificaciones</router-link>
          <div v-if="maxPage>1" class="pager">
            <button class="pg" :disabled="page<=1" @click="go(page-1)">Anterior</button>
            <span class="pg-info">Página {{ page }} / {{ maxPage }}</span>
            <button class="pg" :disabled="page>=maxPage" @click="go(page+1)">Siguiente</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import axios from 'axios'
import Global from '@/Global'
import Swal from 'sweetalert2'

export default {
  name: 'NotificacionesDireccionesBell',
  props: { pageSize: { type: Number, default: 10 }, onlyUnread: { type: Boolean, default: true } },
  data() {
    return {
      open: false,
      loading: false,
      items: [],
      total: 0,
      page: 1,
      unreadCount: 0,
      pollTimer: null,
      dropdownStyle: {}
    }
  },
  computed: {
    currentUser() {
      return (
        this.$store?.state?.userName ||
        localStorage.getItem('nombreUsuario') ||
        this.$store?.state?.userEmail ||
        localStorage.getItem('userEmail') ||
        localStorage.getItem('usuario') || ''
      )
    },
    maxPage() { return Math.max(1, Math.ceil(this.total / this.pageSize)) }
  },
  methods: {
    token() { return localStorage.getItem('token') || '' },
    userParams(extra={}) { return { usuario: this.currentUser, ...extra } },
    normalizeRow(r={}) {
      return {
        idNotificacion: r.idNotificacion ?? r.id ?? r.IdNotificacion,
        idEstatus: r.idEstatus ?? r.estatus ?? r.status ?? 2,
        titulo: r.titulo ?? r.asunto ?? r.title ?? '',
        mensaje: r.mensaje ?? r.descripcion ?? r.message ?? '',
        nombreDireccion: r.nombreDireccion ?? r.direccion ?? r.nombre_direccion ?? '',
        fechaIngresa: r.fechaIngresa ?? r.fecha_ingresa ?? r.fechaIngreso ?? r.fecha ?? r.createdAt ?? '',
        tipoArchivo: r.tipoArchivo ?? r.tipo_archivo ?? '',
        estado: r.estado ?? '',
        noDenuncia: r.noDenuncia ?? r.nodenuncia ?? r.no_denuncia ?? r.numeroDenuncia ?? '',
        noDocumento: r.noDocumento ?? r.no_documento ?? r.nombreDocumento ?? r.documento ?? '',
        // idsicoda desde backend (propiedad en minúsculas)
        idSicoda: r.idSicoda ?? r.IdSicoda ?? r.idsicoda ?? null,
        archivoDisponible: r.archivoDisponible ?? r.tieneArchivo ?? !!(r.archivoBase64 || r.archivo || r.documento),
        archivoBase64: r.archivoBase64 ?? null
      }
    },
    fmtFecha(v) {
      if (!v) return '—'
      const d = new Date(v); if (isNaN(d)) return String(v)
      const pad = n => String(n).padStart(2,'0')
      return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },

    async toggleDropdown() {
      if (this.open) {
        this.open = false
        window.removeEventListener('resize', this.positionDropdown)
        window.removeEventListener('scroll', this.positionDropdown, true)
        return
      }
      this.dropdownStyle = this.computeDropdownStyle()
      this.open = true
      if (this.items.length === 0) this.cargarLista()
      window.addEventListener('resize', this.positionDropdown, { passive: true })
      window.addEventListener('scroll', this.positionDropdown, true)
    },
    positionDropdown() { this.dropdownStyle = this.computeDropdownStyle() },
    computeDropdownStyle() {
      const btn = this.$el?.querySelector('.bell-btn'); if (!btn) return this.dropdownStyle
      const r = btn.getBoundingClientRect(), vw = innerWidth, vh = innerHeight
      const width = 420, gap = 8, maxH = Math.min(420, vh - 16)
      let left = r.right + gap; if (left + width > vw - 8) left = Math.max(8, vw - width - 8)
      let top = r.top; if (top + maxH > vh - 8) top = Math.max(8, vh - maxH - 8)
      return { position:'fixed', left:`${left}px`, top:`${top}px`, width:`${width}px`, maxHeight:`${maxH}px` }
    },

    async cargarLista() {
      if (!this.currentUser) return
      this.loading = true
      try {
        const { data } = await axios.get(`${Global.url}NotificacionesDirecciones`, {
          params: this.userParams({ page:this.page, pageSize:this.pageSize, onlyUnread:this.onlyUnread }),
          headers: { Authorization: `Bearer ${this.token()}` }
        })
        const rows = Array.isArray(data?.data) ? data.data : []
        this.items = rows.map(this.normalizeRow)
        this.total = Number(data?.total || rows.length || 0)
      } finally { this.loading = false }
    },
    async cargarCount() {
      if (!this.currentUser) return
      try {
        const { data } = await axios.get(`${Global.url}NotificacionesDirecciones/unread-count`, {
          params: this.userParams(), headers: { Authorization: `Bearer ${this.token()}` }
        })
        this.unreadCount = Number(data?.count || 0)
      } catch (e) { void e }
    },
    async marcarUna(n) {
      if (n.idEstatus !== 1) return
      try {
        await axios.post(`${Global.url}NotificacionesDirecciones/${n.idNotificacion}/visto`, null, {
          params: this.userParams(), headers: { Authorization: `Bearer ${this.token()}` }
        })
        n.idEstatus = 2
        this.unreadCount = Math.max(0, this.unreadCount - 1)
        if (this.onlyUnread) {
          this.items = this.items.filter(x => x.idNotificacion !== n.idNotificacion)
          this.total = Math.max(0, this.total - 1)
        }
      } catch (e) { void e }
    },
    async marcarTodas() {
      const ids = this.items.filter(x=>x.idEstatus===1).map(x=>x.idNotificacion)
      if (ids.length===0) return
      try {
        await axios.post(`${Global.url}NotificacionesDirecciones/visto-multiples`, ids, {
          params: this.userParams(), headers: { Authorization: `Bearer ${this.token()}` }
        })
        this.items.forEach(x => x.idEstatus = 2)
        if (this.onlyUnread) this.items = []
        this.cargarCount()
      } catch (e) { void e }
    },
    async go(p) { this.page = Math.min(this.maxPage, Math.max(1,p)); await this.cargarLista() },

    async abrirDetalle(n) {
      await this.marcarUna(n)
      const html = `
        <div class="swl">
          <div><strong>Dirección:</strong> ${this.safe(n.nombreDireccion||'-')}</div>
          <div><strong>Estado:</strong> ${this.safe(n.estado||'-')}</div>
          <div><strong>Tipo de archivo:</strong> ${this.safe(n.tipoArchivo||'PDF')}</div>
          <div><strong>No. Denuncia:</strong> ${this.safe(n.noDenuncia||'-')}</div>
          <div><strong>No. Documento:</strong> ${this.safe(n.noDocumento||'-')}</div>
          <hr/>
          <div><strong>Título:</strong> ${this.safe(n.titulo||'')}</div>
          <div><strong>Mensaje:</strong><br/> ${this.safe(n.mensaje||'')}</div>
        </div>
      `
      const res = await Swal.fire({
        title: 'Detalle de notificación',
        html, width: 700,
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        showDenyButton: true,
        denyButtonText: 'Ver expediente',
        confirmButtonText: 'Ver archivo',
        reverseButtons: true
      })
      if (res.isConfirmed) return this.verArchivo(n)
      if (res.isDenied) return this.verExpediente(n)
    },
    safe(v){ return String(v ?? '').replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s])) },

    async verArchivo(n) {
      try {
        if (n.archivoBase64) {
          const url = `data:application/pdf;base64,${n.archivoBase64}`; return window.open(url,'_blank','noopener')
        }
        const resp = await axios.get(`${Global.url}NotificacionesDirecciones/${n.idNotificacion}/archivo`, {
          params: this.userParams(), headers: { Authorization: `Bearer ${this.token()}` }, responseType: 'blob'
        })
        const url = URL.createObjectURL(resp.data); window.open(url,'_blank','noopener'); setTimeout(()=>URL.revokeObjectURL(url),60000)
      } catch { Swal.fire('Error','No se pudo abrir el archivo.','error') }
    },

    // Ir a expediente como en MesaDenunciasP
    verExpediente(n) {
      const idsicodaRaw = n?.idSicoda ?? n?.idsicoda
      const idsicoda = Number(idsicodaRaw)
      if (!Number.isFinite(idsicoda) || idsicoda <= 0) {
        return Swal.fire('Información', 'Esta notificación no tiene IdSicoda.','info')
      }
      this.open = false
      this.$nextTick(()=> this.$router.push({ path: `/expedienteP/${idsicoda}` }).catch(()=>{}))
    },

    handleOutside(e){ if (this.open && !this.$el.contains(e.target)) this.open=false }
  },
  mounted() {
    document.addEventListener('click', this.handleOutside)
    this.cargarCount()
    this.pollTimer = setInterval(()=>this.cargarCount(), 30000)
  },
  watch: { $route(){ this.open = false } },
  beforeUnmount(){
    document.removeEventListener('click', this.handleOutside)
    clearInterval(this.pollTimer)
    window.removeEventListener('resize', this.positionDropdown)
    window.removeEventListener('scroll', this.positionDropdown, true)
  }
}
</script>

<style scoped>
/* Botón campana */
.notify-wrapper { position: relative; }
.bell-btn { position: relative; background: transparent; border: 0; color: #fff; font-size: 20px; padding: 6px 10px; cursor: pointer; }
.badge { position: absolute; top: -2px; right: -2px; background: #dc3545; color: #fff; min-width: 18px; height: 18px; border-radius: 9px; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; box-shadow: 0 0 0 2px #002c5e; }

/* Dropdown teletransportado a body com z-index alto */
.dropdown { position: fixed; width: 420px; background: #fff; color: #333; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,.15); overflow: hidden; }
.dropdown-teleported { z-index: 100000; pointer-events: auto; }

/* Header */
.dropdown-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; background: #f9fafb; }
.dropdown-header .title { margin: 0; font-weight: 600; color: #111827; flex: 1; }
.dropdown-header .actions { display: flex; align-items: center; gap: 8px; }
.markall { background: #eef2ff; color: #1f4cc9; border: 0; border-radius: 6px; padding: 6px 8px; cursor: pointer; font-size: 12px; }
.markall:disabled { opacity: .5; cursor: default; }
.btn-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; width: 28px; height: 28px; border-radius: 6px; }

/* Lista */
.list { list-style: none; margin: 0; padding: 0; max-height: 360px; overflow: auto; }
.item { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background-color .2s ease; }
.item:hover { background: #f9fafb; }
.item.unread { background: #fef7f0; border-left: 3px solid #f59e0b; }
.icon { width: 36px; height: 36px; border-radius: 8px; background: #eef2ff; display: flex; align-items: center; justify-content: center; color: #3b82f6; }
.icon.unread { background: #e8fff3; color: #10b981; }
.body { flex: 1; min-width: 0; }
.row1 { display: flex; align-items: center; gap: 8px; }
.title { font-weight: 600; font-size: 13px; color: #111827; line-height: 1.3; }
.badge-new { background: #f59e0b; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.msg { color: #6b7280; font-size: 12px; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meta { color: #777; font-size: 12px; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
.dot { opacity: .6; }

/* Footer */
.dropdown-footer { padding: 12px 16px; border-top: 1px solid #f3f4f6; background: #f9fafb; }
.btn-ver-todas { display: block; text-align: center; text-decoration: none; width: 100%; background: #3b82f6; color: #fff !important; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background-color .2s ease; }
.btn-ver-todas:hover { background: #2563eb; }
.pager { display: flex; align-items: center; justify-content: space-between; margin-top: 10px }
.pg { background: #f1f3f5; border: 0; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 12px }
.pg:disabled { opacity: .6; cursor: default }
.pg-info { color: #666; font-size: 12px }
</style>