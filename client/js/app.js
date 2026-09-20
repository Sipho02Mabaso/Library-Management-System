class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = '/';
  }

  init() {
    this.dismissLoadingOverlay();
    this.setupEventListeners();
    this.navigateTo(this.getRouteFromHash());
  }

  dismissLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    document.body.classList.add('loaded');
    overlay.classList.add('fade-out');
    window.setTimeout(() => {
      overlay.style.display = 'none';
    }, 700);
  }

  getRouteFromHash() {
    const hash = window.location.hash || '#/';
    return hash.replace('#', '');
  }

  setupEventListeners() {
    window.addEventListener('hashchange', () => {
      this.navigateTo(this.getRouteFromHash());
    });

    document.getElementById('sidebarToggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSidebar();
    });

    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
      this.closeSidebar();
    });

    document.getElementById('profileTrigger')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleProfileDropdown();
    });

    document.getElementById('profileDropdown')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      this.closeProfileDropdown();
    });

    document.getElementById('logo')?.addEventListener('click', () => {
      window.location.hash = '/';
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    if (sidebar.classList.contains('active')) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const icon = document.getElementById('sidebarToggle').querySelector('i');

    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    if (icon) icon.className = 'bi bi-x-lg';
  }

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const icon = document.getElementById('sidebarToggle').querySelector('i');

    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (icon) icon.className = 'bi bi-list';
  }

  toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  closeProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }

  navigateTo(route) {
    this.currentRoute = route;
    this.closeSidebar();
    this.updateNav();

    const handler = this.routes[route] || this.routes['/'];
    if (handler) {
      handler();
    } else {
      this.showNotFound();
    }
  }

  updateNav() {
    const user = auth.getCurrentUser();
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const navLinks = document.getElementById('navLinks');

    if (user && profileTrigger) {
      profileTrigger.style.display = 'flex';
      const initials = user.fullName?.split(' ').map(n => n[0]).join('') || user.username?.substring(0, 2) || '?';
      profileTrigger.textContent = initials.toUpperCase();

      if (profileDropdown) {
        profileDropdown.innerHTML = `
          <div class="dropdown-item" onclick="router.navigateTo('/profile'); return false;">Profile</div>
          <div class="dropdown-submenu">
            <div class="dropdown-item" onclick="router.navigateTo('/bookings'); return false;">Booked Books</div>
            <div class="dropdown-item" onclick="router.navigateTo('/room-bookings'); return false;">Booked Rooms</div>
            <div class="dropdown-item" onclick="router.navigateTo('/session-bookings'); return false;">Booked Sessions</div>
          </div>
          <div class="dropdown-item" onclick="router.navigateTo('/debt'); return false;">Debt</div>
          <div class="dropdown-item" onclick="auth.logout()">Log out</div>
        `;
      }
    } else if (profileTrigger) {
      profileTrigger.style.display = 'none';
    }

    if (navLinks) {
      navLinks.innerHTML = '';
      navLinks.appendChild(this.createNavItem('Books', '/books', 'bi-book'));
      navLinks.appendChild(this.createNavItem('Rooms', '/rooms', 'bi-building'));
      navLinks.appendChild(this.createNavItem('Sessions', '/sessions', 'bi-mic'));
      if (auth.isAuthenticated()) {
        navLinks.appendChild(this.createNavItem('My Bookings', '/bookings', 'bi-journal'));
        navLinks.appendChild(this.createNavItem('Saved Books', '/saved-books', 'bi-bookmark-star'));
        navLinks.appendChild(this.createNavItem('My Debt', '/debt', 'bi-currency-exchange'));
      }
      if (auth.isAdmin()) {
        navLinks.appendChild(this.createNavItem('Admin Panel', '/admin', 'bi-gear'));
      }
      if (auth.isLibrarian() || auth.isAdmin()) {
        navLinks.appendChild(this.createNavItem('Librarian', '/librarian', 'bi-person-workspace'));
      }
      if (auth.isAuthenticated()) {
        navLinks.appendChild(this.createNavItem('Logout', '#logout', 'bi-box-arrow-right'));
      } else {
        navLinks.appendChild(this.createNavItem('Login', '/login', 'bi-person'));
      }
    }
  }

  createNavItem(label, route, iconClass) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + route;
    a.innerHTML = `<i class="bi ${iconClass} sidebar-icon"></i><span class="sidebar-label">${label}</span>`;
    a.classList.toggle('active', this.currentRoute === route);

    if (route === '#logout') {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
      });
    }
    li.appendChild(a);
    return li;
  }

  showNotFound() {
    const main = document.getElementById('mainContent');
    if (main) {
      main.innerHTML = '<div class="card"><h2>Page Not Found</h2><p>The page you are looking for does not exist.</p></div>';
    }
  }
}

let router;
document.addEventListener('DOMContentLoaded', () => {
  router = new Router(window.APP_ROUTES || {});
  router.init();
});
