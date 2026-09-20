const API_BASE_URL = 'http://localhost:5005/api';
window.API_BASE_URL = API_BASE_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = data?.message || data?.title || `HTTP ${response.status}`;
        throw new ApiError(error, response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Network error', 0);
    }
  }

  async get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
  async post(endpoint, body) { return this.request(endpoint, { method: 'POST', body }); }
  async put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body }); }
  async del(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }

  async getBlob(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new ApiError('Failed to download report', response.status);
    }
    return await response.blob();
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearUser() {
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    this.clearToken();
    this.clearUser();
    window.location.href = '/index.html';
  }
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const api = new ApiClient();
