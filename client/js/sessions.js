window.SessionsPage = {
  sessions: [],
  filteredSessions: [],
  filters: {
    search: '',
    upcoming: true
  },

  async render() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1><i class="bi bi-mic"></i> Upcoming Sessions</h1>
        <p>Upcoming and available sessions</p>
      </div>
      <div class="filter-bar">
        <div class="input-group">
          <label>Search Sessions</label>
          <input type="text" id="sessionSearch" class="form-control" placeholder="Session title..." onkeyup="SessionsPage.onSearch(this.value)" />
        </div>
        <button class="btn btn-outline" onclick="SessionsPage.onFilterChange('upcoming', true)">Upcoming Only</button>
        <button class="btn btn-outline" onclick="SessionsPage.onFilterChange('upcoming', false)">All Sessions</button>
        <button class="btn btn-outline" onclick="SessionsPage.loadSessions()">Reset</button>
      </div>
      <div id="sessionsGrid" class="card-grid"></div>
    `;

    await this.loadSessions();
  },

  async loadSessions() {
    const grid = document.getElementById('sessionsGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="text-center" style="padding: 40px;"><p>Loading sessions...</p></div>';

    try {
      const sessions = await api.get(`/sessions?upcomingOnly=${this.filters.upcoming}`);
      this.sessions = sessions.sessions || sessions || [];
      this.applyFilters();
    } catch (error) {
      grid.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  onSearch(value) {
    this.filters.search = value;
    this.applyFilters();
  },

  onFilterChange(filterName, value) {
    this.filters[filterName] = value;
    this.loadSessions();
  },

  applyFilters() {
    const grid = document.getElementById('sessionsGrid');
    if (!grid) return;

    const { search } = this.filters;

    this.filteredSessions = this.sessions.filter(session => {
      const matchesSearch = search === '' ||
        (session.title && session.title.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });

    this.renderSessions(this.filteredSessions);
  },

  renderSessions(sessions) {
    const grid = document.getElementById('sessionsGrid');
    if (!grid) return;

    if (!sessions || sessions.length === 0) {
      grid.innerHTML = '<div class="card"><p>No sessions found.</p></div>';
      return;
    }

    const now = new Date();
    grid.innerHTML = sessions.map(session => {
      const schedule = new Date(session.schedule);
      const isUpcoming = schedule > now;
      const isFull = (session.bookedCount || 0) >= session.capacity;
      const status = isUpcoming ? 'Upcoming' : 'Past';
      const statusClass = isUpcoming ? 'badge-info' : 'badge-secondary';

      const imageUrl = session.imageUrl || session.image_url || '';
      const coverHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${this.escapeHtml(session.title)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class='bi bi-mic-fill'></i>';">`
        : `<i class="bi bi-mic-fill"></i>`;

      return `
        <div class="book-card">
          <div class="book-cover" style="font-size: 24px;">${coverHtml}</div>
          <div class="book-title">${this.escapeHtml(session.title)}</div>
          <div class="book-author">by ${this.escapeHtml(session.librarianName)}</div>
          <div class="book-meta">
            <div><strong>Date:</strong> ${schedule.toLocaleDateString()}</div>
            <div><strong>Time:</strong> ${schedule.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div><strong>Duration:</strong> ${session.durationMinutes} min</div>
            <div><strong>Capacity:</strong> ${session.bookedCount || 0}/${session.capacity}</div>
            <span class="badge ${statusClass}">${status}</span>
            ${isFull ? '<span class="badge badge-warning">Full</span>' : ''}
          </div>
          <div class="book-meta" style="margin-top: 8px;">
            <div>${this.escapeHtml(session.description || '')}</div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-sm" onclick="SessionsPage.viewSession(${session.sessionId})" ${!isUpcoming || isFull ? 'disabled' : ''}>
              ${isFull ? 'Full' : isUpcoming ? 'Book Session' : 'Session Passed'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async viewSession(sessionId) {
    try {
      const session = await api.get(`/sessions/${sessionId}`);
      const container = document.getElementById('mainContent');
      if (!container) return;

      const schedule = new Date(session.schedule);
      const isUpcoming = schedule > new Date();
      const isFull = (session.bookedCount || 0) >= session.capacity;

      const imageUrl = session.imageUrl || session.image_url || '';
      const coverHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${this.escapeHtml(session.title)}" class="book-detail-cover" />`
        : `<i class="bi bi-mic-fill book-detail-cover"></i>`;

      container.innerHTML = `
        <div class="book-detail-card" style="display:flex; gap:24px; max-width:900px;">
          <div class="book-cover" style="width:200px; height:280px;">${coverHtml}</div>
          <div style="flex:1;">
            <h2 style="color:var(--maroon-dark);">${this.escapeHtml(session.title)}</h2>
            <p class="text-muted">by ${this.escapeHtml(session.librarianName)}</p>
            <p><strong>Date:</strong> ${schedule.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${schedule.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p><strong>Duration:</strong> ${session.durationMinutes} min</p>
            <p><strong>Capacity:</strong> ${session.bookedCount || 0}/${session.capacity}</p>
            <p><strong>Description:</strong> ${this.escapeHtml(session.description || 'No description available')}</p>
            <div class="action-buttons" style="margin-top:16px;">
              <button class="btn btn-sm" onclick="SessionsPage.bookSession(${session.sessionId})" ${!isUpcoming || isFull ? 'disabled' : ''}>
                ${isFull ? 'Full' : isUpcoming ? 'Book Session' : 'Session Passed'}
              </button>
              <button class="btn btn-sm btn-outline" onclick="SessionsPage.render()">Back</button>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error fetching session details:', error);
      alert('Error loading session details');
    }
  },

  bookSession(sessionId) {
    if (!auth.isAuthenticated()) {
      alert('Please log in to book sessions.');
      window.location.hash = '/login';
      return;
    }

    api.post('/session-bookings', { sessionId })
      .then(() => {
        alert('Session booked successfully!');
        this.render();
      })
      .catch(err => {
        alert('Error: ' + (err.data?.message || err.message));
      });
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
