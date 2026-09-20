window.LibrarianPage = {
  state: { books: [], sessions: [], rooms: [], editing: null },

  async desk() {
    const main = document.getElementById('mainContent');
    if (!main) return;
    main.innerHTML = `
      <div class="page-title"><h1><i class="bi bi-speedometer2"></i> Librarian Desk</h1><p>Manage the collection, sessions, and rooms.</p></div>
      <div class="stats-grid librarian-stats">
        ${this.statCard('Books', 'librarianBooksChart', 'booksTotal')}
        ${this.statCard('Sessions', 'librarianSessionsChart', 'sessionsTotal')}
        ${this.statCard('Rooms', 'librarianRoomsChart', 'roomsTotal')}
      </div>
      <div class="card-grid librarian-quick-links">
        <div class="card"><button class="btn" type="button" onclick="window.location.hash='/books'"><i class="bi bi-book"></i> Manage Books</button></div>
        <div class="card"><button class="btn" type="button" onclick="window.location.hash='/sessions'"><i class="bi bi-mic"></i> Manage Sessions</button></div>
        <div class="card"><button class="btn" type="button" onclick="window.location.hash='/rooms'"><i class="bi bi-building"></i> Manage Rooms</button></div>
      </div>`;
    try {
      const [books, sessions, rooms] = await Promise.all([api.get('/books'), api.get('/sessions'), api.get('/rooms')]);
      const values = {
        booksTotal: (books.books || books || []).length,
        sessionsTotal: (sessions.sessions || sessions || []).length,
        roomsTotal: (rooms.rooms || rooms || []).length
      };
      Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
      this.drawChart('librarianBooksChart', values.booksTotal, '#800020');
      this.drawChart('librarianSessionsChart', values.sessionsTotal, '#a30029');
      this.drawChart('librarianRoomsChart', values.roomsTotal, '#b26a00');
    } catch (error) { this.toast('Unable to load desk statistics.', 'error'); }
  },

  statCard(label, chartId, valueId) {
    return `<div class="stat-card"><div class="stat-card-content"><div class="stat-label">${label}</div><div class="stat-value" id="${valueId}">-</div><div class="stat-status">Live total</div></div><canvas class="stat-chart" id="${chartId}"></canvas></div>`;
  },

  async books() {
    this.state.editing = null;
    const main = document.getElementById('mainContent');
    main.innerHTML = this.pageHeaderWithAction('Manage Books', 'Create and maintain the library collection.', 'Create Book', 'book') + '<div id="librarianTable"></div>';
    await this.loadBooks();
  },

  bookForm(book = null) {
    return `<section class="card librarian-form-card"><div class="section-heading"><h2>${book ? 'Edit Book' : 'Create Book'}</h2><button class="icon-button" type="button" onclick="LibrarianPage.resetForm()" title="Clear form"><i class="bi bi-x-lg"></i></button></div><form id="bookForm" class="management-form"><input type="hidden" name="id" value="${book?.bookId || ''}"><div class="input-group"><label>Title</label><input name="title" required value="${this.escape(book?.title)}"></div><div class="input-group"><label>Author</label><input name="author" required value="${this.escape(book?.author)}"></div><div class="input-group"><label>ISBN</label><input name="isbn" required value="${this.escape(book?.isbn)}"></div><div class="input-group"><label>Genre</label><input name="genre" required value="${this.escape(book?.genre)}"></div><div class="input-group"><label>Shelf location</label><input name="shelfLocation" required value="${this.escape(book?.shelfLocation)}"></div><div class="input-group"><label>Quantity</label><input name="quantity" type="number" min="1" required value="${book?.quantity || ''}"></div><div class="input-group form-wide"><label>Description</label><textarea name="description" rows="3">${this.escape(book?.description)}</textarea></div><div class="input-group"><label>Cover image</label><input name="image" type="file" accept="image/*"><input name="imageUrl" type="hidden" value="${this.escape(book?.imageUrl)}"><small class="text-muted">Choose an image or keep the existing cover.</small></div><button class="btn" type="submit">${book ? 'Update Book' : 'Create Book'}</button>${book ? '<button class="btn btn-outline" type="button" onclick="LibrarianPage.resetForm()">Cancel Edit</button>' : ''}</form></section>`;
  },

  async loadBooks() {
    try { const data = await api.get('/books'); this.state.books = data.books || data || []; this.renderBookTable(); } catch (error) { this.showError(error.message); }
  },

  renderBookTable() {
    document.getElementById('librarianTable').innerHTML = this.tableCard('Books', ['Title', 'Author', 'Genre', 'Quantity', 'Available', 'Actions'], this.state.books.map(book => [book.title, book.author, book.genre || 'Not specified', book.quantity, book.availableQuantity, `<button class="btn btn-sm btn-outline" onclick="LibrarianPage.editBook(${book.bookId})">Edit</button> <button class="btn btn-sm btn-danger" onclick="LibrarianPage.deleteItem('books', ${book.bookId}, '${this.escape(book.title)}')">Delete</button>`]));
    document.getElementById('bookForm')?.addEventListener('submit', event => this.saveBook(event));
  },

  async saveBook(event) {
    event.preventDefault();
    const form = event.target;
    const data = await this.formData(form);
    const id = form.id.value;
    try { await (id ? api.put(`/books/${id}`, data) : api.post('/books', data)); this.toast(id ? 'Book updated successfully.' : 'Book created successfully.'); await this.books(); } catch (error) { this.toast(error.data?.message || error.message, 'error'); }
  },

  async editBook(id) { const book = this.state.books.find(item => item.bookId === id); if (book) this.openModal(this.bookForm(book)); },

  async sessions() {
    const main = document.getElementById('mainContent');
    main.innerHTML = this.pageHeaderWithAction('Manage Sessions', 'Create and maintain library sessions.', 'Create Session', 'session') + '<div id="librarianTable"></div>';
    await this.loadSessions();
  },

  sessionForm(session = null) {
    const schedule = session?.schedule ? new Date(session.schedule).toISOString().slice(0, 16) : '';
    return `<section class="card librarian-form-card"><div class="section-heading"><h2>${session ? 'Edit Session' : 'Create Session'}</h2><button class="icon-button" type="button" onclick="LibrarianPage.resetForm()" title="Clear form"><i class="bi bi-x-lg"></i></button></div><form id="sessionForm" class="management-form"><input type="hidden" name="id" value="${session?.sessionId || ''}"><div class="input-group"><label>Title</label><input name="title" required value="${this.escape(session?.title)}"></div><div class="input-group"><label>Schedule</label><input name="schedule" type="datetime-local" required value="${schedule}"></div><div class="input-group"><label>Duration (minutes)</label><input name="durationMinutes" type="number" min="1" required value="${session?.durationMinutes || 60}"></div><div class="input-group"><label>Capacity</label><input name="capacity" type="number" min="1" required value="${session?.capacity || 20}"></div><div class="input-group form-wide"><label>Description</label><textarea name="description" rows="3" required>${this.escape(session?.description)}</textarea></div><div class="input-group"><label>Session image</label><input name="image" type="file" accept="image/*"><input name="imageUrl" type="hidden" value="${this.escape(session?.imageUrl)}"></div><button class="btn" type="submit">${session ? 'Update Session' : 'Create Session'}</button>${session ? '<button class="btn btn-outline" type="button" onclick="LibrarianPage.resetForm()">Cancel Edit</button>' : ''}</form></section>`;
  },

  async loadSessions() { try { const data = await api.get('/sessions?upcomingOnly=false'); this.state.sessions = data.sessions || data || []; this.renderSessionTable(); } catch (error) { this.showError(error.message); } },
  renderSessionTable() { document.getElementById('librarianTable').innerHTML = this.tableCard('Sessions', ['Title', 'Schedule', 'Duration', 'Capacity', 'Actions'], this.state.sessions.map(item => [item.title, new Date(item.schedule).toLocaleString(), `${item.durationMinutes} min`, `${item.bookedCount || 0}/${item.capacity}`, `<button class="btn btn-sm btn-outline" onclick="LibrarianPage.editSession(${item.sessionId})">Edit</button> <button class="btn btn-sm btn-danger" onclick="LibrarianPage.deleteItem('sessions', ${item.sessionId}, '${this.escape(item.title)}')">Delete</button>`])); document.getElementById('sessionForm')?.addEventListener('submit', event => this.saveSession(event)); },
  async saveSession(event) { event.preventDefault(); const form = event.target; const data = await this.formData(form); delete data.id; data.schedule = new Date(data.schedule).toISOString(); data.durationMinutes = Number(data.durationMinutes); data.capacity = Number(data.capacity); try { const id = form.id.value; await (id ? api.put(`/sessions/${id}`, data) : api.post('/sessions', data)); this.toast(id ? 'Session updated successfully.' : 'Session created successfully.'); await this.sessions(); } catch (error) { this.toast(error.data?.message || error.message, 'error'); } },
  editSession(id) { const item = this.state.sessions.find(session => session.sessionId === id); if (item) this.openModal(this.sessionForm(item)); },

  async rooms() { const main = document.getElementById('mainContent'); main.innerHTML = this.pageHeaderWithAction('Manage Rooms', 'Create rooms and maintain their availability.', 'Create Room', 'room') + '<div id="librarianTable"></div><div id="roomBookingsTable"></div>'; await this.loadRooms(); await this.loadRoomBookings(); },
  roomForm(room = null) { return `<section class="card librarian-form-card"><div class="section-heading"><h2>${room ? 'Edit Room' : 'Create Room'}</h2><button class="icon-button" type="button" onclick="LibrarianPage.resetForm()" title="Clear form"><i class="bi bi-x-lg"></i></button></div><form id="roomForm" class="management-form"><input type="hidden" name="id" value="${room?.roomId || ''}"><div class="input-group"><label>Room name</label><input name="name" required value="${this.escape(room?.name)}"></div><div class="input-group"><label>Capacity</label><input name="capacity" type="number" min="1" required value="${room?.capacity || ''}"></div><div class="input-group form-wide"><label>Description</label><textarea name="description" rows="3">${this.escape(room?.description)}</textarea></div><div class="input-group"><label>Room image</label><input name="image" type="file" accept="image/*"><input name="imageUrl" type="hidden" value="${this.escape(room?.imageUrl)}"></div><button class="btn" type="submit">${room ? 'Update Room' : 'Create Room'}</button>${room ? '<button class="btn btn-outline" type="button" onclick="LibrarianPage.resetForm()">Cancel Edit</button>' : ''}</form></section>`; },
  async loadRooms() { try { const data = await api.get('/rooms'); this.state.rooms = data.rooms || data || []; this.renderRoomTable(); } catch (error) { this.showError(error.message); } },
  renderRoomTable() { document.getElementById('librarianTable').innerHTML = this.tableCard('Rooms', ['Name', 'Capacity', 'Description', 'Actions'], this.state.rooms.map(item => [item.name, item.capacity, item.description || 'No description', `<button class="btn btn-sm btn-outline" onclick="LibrarianPage.editRoom(${item.roomId})">Edit</button> <button class="btn btn-sm btn-danger" onclick="LibrarianPage.deleteItem('rooms', ${item.roomId}, '${this.escape(item.name)}')">Delete</button>`])); document.getElementById('roomForm')?.addEventListener('submit', event => this.saveRoom(event)); },
  async loadRoomBookings() {
    const target = document.getElementById('roomBookingsTable');
    if (!target) return;
    try {
      const results = await Promise.all(this.state.rooms.map(room => api.get(`/room-bookings/room/${room.roomId}`)));
      const bookings = results.flatMap((items, index) => (items || []).map(item => ({ ...item, roomName: item.roomName || this.state.rooms[index].name })));
      target.innerHTML = this.tableCard('Room Bookings', ['Room', 'User', 'Start', 'End', 'Status', 'Actions'], bookings.map(item => [item.roomName, item.username, new Date(item.startTime).toLocaleString(), new Date(item.endTime).toLocaleString(), item.status, `<button class="btn btn-sm btn-danger" onclick="LibrarianPage.removeBooking(${item.bookingId})">Remove</button>`]));
    } catch (error) {
      target.innerHTML = `<div class="card"><p class="text-danger">Unable to load room bookings: ${this.escape(error.message)}</p></div>`;
    }
  },
  async removeBooking(id) { if (!confirm('Remove this room booking?')) return; try { await api.del(`/room-bookings/${id}/cancel`); this.toast('Room booking removed successfully.'); await this.rooms(); } catch (error) { this.toast(error.data?.message || error.message, 'error'); } },
  async saveRoom(event) { event.preventDefault(); const form = event.target; const data = await this.formData(form); delete data.id; data.capacity = Number(data.capacity); try { const id = form.id.value; await (id ? api.put(`/rooms/${id}`, data) : api.post('/rooms', data)); this.toast(id ? 'Room updated successfully.' : 'Room created successfully.'); await this.rooms(); } catch (error) { this.toast(error.data?.message || error.message, 'error'); } },
  editRoom(id) { const item = this.state.rooms.find(room => room.roomId === id); if (item) this.openModal(this.roomForm(item)); },

  async deleteItem(type, id, label) { if (!confirm(`Delete ${label}?`)) return; try { await api.del(`/${type}/${id}`); this.toast(`${label} deleted successfully.`); await this[type](); } catch (error) { this.toast(error.data?.message || error.message, 'error'); } },
  openCreateModal(type) {
    const forms = { book: this.bookForm(), session: this.sessionForm(), room: this.roomForm() };
    this.openModal(forms[type]);
  },
  openModal(content) {
    const modal = document.createElement('div');
    modal.className = 'management-modal';
    modal.innerHTML = `<div class="management-modal-dialog"><button class="management-modal-close" type="button" aria-label="Close"><i class="bi bi-x-lg"></i></button>${content}</div>`;
    document.body.appendChild(modal);
    modal.querySelector('.management-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', event => { if (event.target === modal) modal.remove(); });
    const form = modal.querySelector('form');
    if (form) {
      const resource = form.getAttribute('id').replace('Form', '');
      form.addEventListener('submit', async event => {
        await this[`save${resource.charAt(0).toUpperCase() + resource.slice(1)}`](event);
        if (document.body.contains(modal)) modal.remove();
      });
    }
  },
  resetForm() { document.querySelector('.management-modal')?.remove(); },
  async formData(form) { const data = Object.fromEntries(new FormData(form).entries()); delete data.image; const file = form.querySelector('input[name="image"]')?.files?.[0]; if (file) data.imageUrl = await this.readFile(file); return data; },
  readFile(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); },
  pageHeader(title, subtitle) { return `<div class="page-title"><h1>${title}</h1><p>${subtitle}</p></div>`; },
  pageHeaderWithAction(title, subtitle, action, type) { return `<div class="page-title page-title-action"><div><h1>${title}</h1><p>${subtitle}</p></div><button class="btn" type="button" onclick="LibrarianPage.openCreateModal('${type}')"><i class="bi bi-plus-lg"></i> ${action}</button></div>`; },
  tableCard(title, headers, rows) { return `<section class="card management-table-card"><div class="section-heading"><h2>${title}</h2><span class="text-muted">${rows.length} record(s)</span></div><div class="table-wrap"><table class="table"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">No records found.</td></tr>`}</tbody></table></div></section>`; },
  drawChart(id, value, color) { const canvas = document.getElementById(id); if (!canvas) return; const width = canvas.clientWidth || 320; const height = 64; const ratio = window.devicePixelRatio || 1; canvas.width = width * ratio; canvas.height = height * ratio; const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio); const points = Array.from({ length: 7 }, (_, index) => ({ x: width * index / 6, y: 40 - Math.sin(index * 0.8) * 5 - Math.min(Number(value) || 1, 20) * 0.3 })); ctx.beginPath(); ctx.moveTo(0, height); points.forEach(point => ctx.lineTo(point.x, point.y)); ctx.lineTo(width, height); ctx.fillStyle = `${color}22`; ctx.fill(); ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); },
  toast(message, type = 'success') { let toast = document.getElementById('librarianToast'); if (!toast) { toast = document.createElement('div'); toast.id = 'librarianToast'; toast.className = 'feedback-toast'; document.body.appendChild(toast); } toast.className = `feedback-toast ${type}`; toast.textContent = message; toast.classList.add('show'); window.clearTimeout(this.toastTimer); this.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200); },
  showError(message) { const target = document.getElementById('librarianTable'); if (target) target.innerHTML = `<div class="card"><p class="text-danger">${this.escape(message)}</p></div>`; },
  escape(value) { const div = document.createElement('div'); div.textContent = value || ''; return div.innerHTML; }
};
