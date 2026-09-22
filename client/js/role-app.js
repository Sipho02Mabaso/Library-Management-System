class RoleApp {
  constructor(role, routes) {
    this.role = role;
    this.routes = routes;
    this.currentRoute = '/';
  }

  init() {
    const currentUser = auth.getCurrentUser();
    if (!auth.isAuthenticated() || !currentUser || auth.getRole() !== this.role) {
      window.location.replace('index.html#/login');
      return;
    }

    this.bindNavigation();
    this.navigate(this.getRoute());
  }

  getRoute() {
    return (window.location.hash || '#/').replace('#', '') || '/';
  }

  bindNavigation() {
    window.addEventListener('hashchange', () => this.navigate(this.getRoute()));
    document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebarOverlay')?.addEventListener('click', () => this.closeSidebar());
    document.getElementById('logo')?.addEventListener('click', () => {
      window.location.hash = '/';
    });
    document.getElementById('logoutLink')?.addEventListener('click', (event) => {
      event.preventDefault();
      auth.logout();
    });
  }

  navigate(route) {
    this.currentRoute = this.routes[route] ? route : '/';
    this.closeSidebar();
    this.updateActiveLink();
    this.routes[this.currentRoute]();
  }

  toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('active');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
    const icon = document.querySelector('#sidebarToggle i');
    if (icon) icon.className = document.getElementById('sidebar')?.classList.contains('active') ? 'bi bi-x-lg' : 'bi bi-list';
  }

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('active');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
    const icon = document.querySelector('#sidebarToggle i');
    if (icon) icon.className = 'bi bi-list';
  }

  updateActiveLink() {
    document.querySelectorAll('#navLinks a[data-route]').forEach(link => {
      link.classList.toggle('active', link.dataset.route === this.currentRoute);
    });
  }
}

window.RoleApp = RoleApp;
