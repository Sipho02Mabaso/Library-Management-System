class Auth {
  constructor(apiClient) {
    this.api = apiClient;
  }

  async login(email, password) {
    const data = await this.api.post('/auth/login', { email, password });
    this.api.setToken(data.token);
    await this.fetchAndStoreCurrentUser();
    return data;
  }

  async register(username, email, password, fullName) {
    const data = await this.api.post('/auth/register', { username, email, password, fullName });
    return data;
  }

  async fetchAndStoreCurrentUser() {
    const user = await this.api.get('/auth/me');
    this.api.setUser(user);
    return user;
  }

  getCurrentUser() {
    return this.api.getUser();
  }

  getRole() {
    const role = this.api.getUser()?.role;
    if (typeof role === 'number' || (typeof role === 'string' && /^\d+$/.test(role))) {
      return ['User', 'Librarian', 'Admin'][Number(role)] || null;
    }
    return role || null;
  }

  isAuthenticated() {
    return this.api.isAuthenticated();
  }

  isAdmin() {
    return this.getRole() === 'Admin';
  }

  isLibrarian() {
    return this.getRole() === 'Librarian';
  }

  logout() {
    this.api.logout();
  }
}

const auth = new Auth(api);
