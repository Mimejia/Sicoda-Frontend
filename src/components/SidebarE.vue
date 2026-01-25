<template>
  <div class="layout">
    <aside
      :class="['sidebar', { 'is-collapsed': isCollapsed, open: sidebarOpen }]"
      :style="sidebarBgInline"
    >
      <div class="sidebar-header">
        <button class="icon-btn hamburger" @click="toggleNav" aria-label="Toggle menu" title="Menú">
          <i class="fas fa-bars"></i>
        </button>

        <div class="sidebar-actions">
          <!-- Botón de notificaciones: el click lo maneja la campana -->
          <div
            class="icon-btn bell-anchor"
            title="Notificaciones"
          >
            <NotificacionesDireccionesBell
              v-if="userHasRole('Asesor Denuncias')"
              :onlyUnread="true"
              :pageSize="10"
            />
          </div>
        </div>
      </div>

      <div class="logo-container">
        <img src="../assets/img/marnLogo.jpg" alt="Logo MARN" class="logo-full" />
        <img src="../assets/img/marnLogo.jpg" alt="Logo MARN" class="logo-mini" />
      </div>

      <ul class="nav-links">
        <!-- Ajusta los title para tooltip cuando está colapsado -->
        <li v-if="userHasRole('Oficial Receptor')">
          <router-link to="/mesaOficialR" class="nav-link" title="Ingresos del Portal">
            <i class="fas fa-cloud-upload-alt nav-icon"></i>
            <span class="nav-text">Ingresos del Portal</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Asesor Denuncias')">
          <router-link to="/mesaProcurador" class="nav-link" title="Denuncias en Tramite">
            <i class="fas fa-briefcase nav-icon"></i>
            <span class="nav-text">Denuncias en Tramite</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Asesor Denuncias')">
          <router-link to="/mesaAsesor" class="nav-link" title="Denuncias en Revisión">
            <i class="fas fa-search nav-icon"></i>
            <span class="nav-text">Denuncias en Revisión</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Asesor Denuncias')">
          <router-link to="/mesaJefe" class="nav-link" title="Denuncias con Jefe">
            <i class="fas fa-user-tie nav-icon"></i>
            <span class="nav-text">Denuncias con Jefe</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Asesor Denuncias')">
          <router-link to="/MesaDenunciasArch" class="nav-link" title="Denuncias Archivadas">
            <i class="fas fa-archive nav-icon"></i>
            <span class="nav-text">Denuncias Archivadas</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Asesor Denuncias')">
          <router-link to="/procuracion" class="nav-link" title="Denuncias en Procuración">
            <i class="fas fa-balance-scale nav-icon"></i>
            <span class="nav-text">Denuncias en Procuración</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Direcciones')">
          <router-link to="/mesaDirecciones" class="nav-link" title="Bandeja de Informes">
            <i class="fas fa-inbox nav-icon"></i>
            <span class="nav-text">Bandeja de Informes</span>
          </router-link>
        </li>
        <li v-if="userHasRole('Direcciones')">
          <router-link to="/mesaDireccionesDir" class="nav-link" title="Denuncias Registradas">
            <i class="fas fa-clipboard-list nav-icon"></i>
            <span class="nav-text">Denuncias Registradas</span>
          </router-link>
        </li>
        <li>
          <router-link to="/dashboard" class="nav-link" title="Dashboard">
            <i class="fas fa-chart-line nav-icon"></i>
            <span class="nav-text">Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link to="/mesa-denuncias" class="nav-link" title="Mesa de Denuncias">
            <i class="fas fa-table nav-icon"></i>
            <span class="nav-text">Mesa de Denuncias</span>
          </router-link>
        </li>
      </ul>

      <div class="user-section" @click.stop>
        <div class="user-box" @click="toggleDropdown">
          <img src="https://www.gravatar.com/avatar?d=mp&s=32" class="user-avatar" />
          <span class="user-email">{{ $store.state.userEmail }}</span>
          <i class="fa" :class="dropdownOpen ? 'fa-caret-up' : 'fa-caret-down'"></i>
        </div>
        <div v-if="dropdownOpen && !isCollapsed" class="user-dropdown-menu">
          <button @click="logout" class="dropdown-item">
            <i class="fa fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
    <main class="content" @click="closeOverlayOnMobile">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script>
import NotificacionesDireccionesBell from '@/components/Reutilizable/NotificacionesDireccionesBell.vue'
export default {
  name: 'SidebarPersonalizado',
  components: { NotificacionesDireccionesBell },
  data() {
    return {
      sidebarOpen: false,
      isCollapsed: false,
      isMobile: false,
      dropdownOpen: false,
      sidebarColor: '#004a94' // azul MARN anterior; cámbialo si deseas
    };
  },
  computed: {
    sidebarBgInline() {
      return `background: ${this.sidebarColor} !important;`;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 1024;
      if (this.isMobile) { this.isCollapsed = true; this.sidebarOpen = false; }
      else { this.sidebarOpen = false; this.isCollapsed = false; }
    },
    toggleNav() { if (this.isMobile) this.sidebarOpen = !this.sidebarOpen; else this.isCollapsed = !this.isCollapsed; },
    closeOverlayOnMobile() { if (this.isMobile && this.sidebarOpen) this.sidebarOpen = false; },
    toggleDropdown() { if (!this.isCollapsed) this.dropdownOpen = !this.dropdownOpen; },
    handleClickOutside(event) {
      const container = this.$el.querySelector('.user-section');
      if (container && !container.contains(event.target)) this.dropdownOpen = false;
    },
    userHasRole(role) { return this.$store.state.userRoles.includes(role); },
    logout() { this.$store.dispatch('logout').then(() => this.$router.push('/login')); }
  }
};
</script>

<style scoped>
/* Paleta MARN */
:root{
  --sb-solid:#003b79;    /* Azul original MARN */
  --sb-accent:#4fd1ff;
  --sb-hover:#0e5fbe;
  --chip:#ffffff14;
  --chip-b:#ffffff28;
}

.layout { display:flex; height:100vh; overflow:hidden; flex-direction:row; }

/* Sidebar */
.sidebar{
  position:fixed; inset:0 auto 0 0; width:258px;
  background: var(--sb-solid) !important;   /* Color sólido (sin degradado) */
  color:#fff; padding:12px; display:flex; flex-direction:column; justify-content:space-between;
  transition:width .25s ease, box-shadow .25s ease; z-index:1050;
  overflow-x:visible; overflow-y:hidden;
  box-sizing:border-box;
}

/* Header */
.sidebar-header{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.sidebar-actions{ margin-left:auto; display:flex; align-items:center; gap:8px; }

/* Botones ícono */
.icon-btn{
  width:38px;height:38px;border-radius:12px;border:1px solid var(--chip-b);
  background:var(--chip); color:#fff; display:inline-flex; align-items:center; justify-content:center;
  cursor:pointer; transition:background .2s ease,border-color .2s ease,transform .1s ease;
}
.icon-btn:hover{ background:#ffffff26; border-color:#ffffff40; }
.icon-btn:active{ transform:scale(.98); }
.hamburger i{ font-size:18px; }

/* Campana */
.bell-anchor{ position:relative; z-index:2001; }
.bell-anchor :deep(.fa-bell), .bell-anchor :deep(svg){
  color:#fff !important; width:18px;height:18px;font-size:18px; display:block;
}

/* Popup de notificaciones anclado a la IZQUIERDA del botón y visible en hover */
.bell-anchor :deep(.dropdown-menu),
.bell-anchor :deep(.menu),
.bell-anchor :deep(.popover),
.bell-anchor :deep(.dropdown-content),
.bell-anchor :deep(.notifications-popover){
  position:absolute !important;
  left:auto !important;
  right:calc(100% + 10px) !important; /* abre a la izquierda */
  top:0 !important;
  transform:none !important;
  min-width:280px; max-height:70vh; overflow:auto;
  z-index:2200 !important; box-shadow:0 12px 30px #00000045, 0 1px 0 #ffffff0e;
  border-radius:12px;
  opacity:0; visibility:hidden; pointer-events:none;
}

/* Forzar visible al pasar el mouse por el botón (sin click) */
.bell-anchor:hover :deep(.dropdown-menu),
.bell-anchor:hover :deep(.menu),
.bell-anchor:hover :deep(.popover),
.bell-anchor:hover :deep(.dropdown-content),
.bell-anchor:hover :deep(.notifications-popover){
  opacity:1; visibility:visible; pointer-events:auto;
}

/* Logo */
.logo-container{ text-align:center; margin:8px 0 14px; }
.logo-full{ width:100%; display:block; border-radius:10px; box-shadow:0 1px 0 #00000020 inset; }
.logo-mini{ display:none; width:32px;height:32px;border-radius:8px; margin:0 auto; }

/* Nav */
.nav-links{
  list-style:none; padding:6px; margin:0; flex:1;
  overflow-y:auto; overflow-x:hidden; /* sin barra horizontal */
  scrollbar-width:thin;
}
.nav-links::-webkit-scrollbar{ width:8px; }
.nav-links::-webkit-scrollbar-thumb{ background:#ffffff33; border-radius:6px; }
.nav-links::-webkit-scrollbar-track{ background:transparent; }

.nav-link{
  display:flex; align-items:center; gap:12px; padding:10px 12px; color:#fff; text-decoration:none;
  border-radius:12px; font-size:1.02rem; transition:background .2s ease, color .2s;
}
.nav-link:hover{ background:var(--sb-hover); }
.nav-icon{
  width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center;
  border-radius:10px; background:var(--chip); border:1px solid var(--chip-b); font-size:18px; flex:0 0 36px;
}
.nav-text{ flex:1; white-space:nowrap; }

/* Activo */
.nav-link.router-link-exact-active{
  background:linear-gradient(90deg,#ffffff24,transparent);
  box-shadow:inset 0 0 0 1px #ffffff22, 0 6px 14px #0000002a;
  position:relative;
}
.nav-link.router-link-exact-active::before{
  content:''; position:absolute; left:-6px; top:10px; bottom:10px; width:3px; border-radius:2px; background:var(--sb-accent);
}

/* Usuario */
.user-section{ border-top:1px solid #ffffff38; padding-top:10px; }
.user-box{
  display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px; border-radius:12px;
  background:var(--chip); color:#fff; border:1px solid var(--chip-b); transition:background .2s ease,border-color .2s;
}
.user-box:hover{ background:#ffffff26; border-color:#ffffff40; }
.user-avatar{ width:28px; height:28px; border-radius:50%; background:#fff; }
.user-dropdown-menu{
  margin-top:8px; background:#073a6f; border-radius:12px; box-shadow:0 12px 30px #00000045;
  border:1px solid #ffffff24; overflow:hidden;
}
.dropdown-item{
  width:100%; padding:12px 14px; background:none; border:none; color:#fff; text-align:left;
  font-size:.98rem; cursor:pointer;
}
.dropdown-item:hover{ background:#0d5fb4; }

/* Contenido */
.content{ flex:1; margin-left:258px; padding:1.5rem; overflow-y:auto; transition:margin-left .25s ease; background:#f4f6f8; }

/* Colapsado (solo íconos) */
.sidebar.is-collapsed{ width:88px; }               /* antes 76px */
.sidebar.is-collapsed .logo-full{ display:none; }
.sidebar.is-collapsed .logo-mini{ display:block; }
.sidebar.is-collapsed .nav-text{ display:none; }
.sidebar.is-collapsed .nav-link{ justify-content:center; padding:10px; }
.sidebar.is-collapsed .user-email, .sidebar.is-collapsed .user-box .fa{ display:none; }
.sidebar.is-collapsed .user-box{ justify-content:center; }
.sidebar.is-collapsed ~ .content{ margin-left:88px; }  /* antes 76px */

/* Mobile/Tablet */
@media (max-width:1024px){
  .sidebar{ width:88px; }              /* antes 76px */
  .content{ margin-left:88px; padding:1rem; }  /* antes 76px */
  .sidebar.open{ position:fixed; left:0; width:264px; box-shadow:0 0 0 9999px rgba(0,0,0,.35); }

  .sidebar.open .nav-text{ display:inline; }
  .sidebar.open .logo-full{ display:block; }
  .sidebar.open .logo-mini{ display:none; }
  .sidebar.open .user-email, .sidebar.open .user-box .fa{ display:inline; }
  .sidebar.open .user-box{ justify-content:flex-start; }
}
</style>
