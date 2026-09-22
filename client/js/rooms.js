window.RoomsPage = {
  rooms: [],
  filteredRooms: [],
  filters: {
    search: '',
    capacity: ''
  },

  async render() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1><i class="bi bi-building"></i> Rooms</h1>
        <p>View available rooms and book time slots</p>
      </div>
      <div class="filter-bar">
        <div class="input-group">
          <label>Search Rooms</label>
          <input type="text" id="roomSearch" class="form-control" placeholder="Room name..." onkeyup="RoomsPage.onSearch(this.value)" />
        </div>
        <div class="input-group">
          <label>Min Capacity</label>
          <select id="capacityFilter" class="form-control" onchange="RoomsPage.onCapacityChange(this.value)">
            <option value="">Any</option>
            <option value="1">1+ people</option>
            <option value="2">2+ people</option>
            <option value="4">4+ people</option>
            <option value="6">6+ people</option>
            <option value="10">10+ people</option>
          </select>
        </div>
        <button class="btn btn-outline" onclick="RoomsPage.loadRooms()">Reset</button>
      </div>
      <div id="roomsGrid" class="card-grid"></div>
    `;

    await this.loadRooms();
  },

  async loadRooms() {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="text-center" style="padding: 40px;"><p>Loading rooms...</p></div>';

    try {
      const rooms = await api.get('/rooms');
      this.rooms = rooms.rooms || rooms || [];
      this.filters = { search: '', capacity: '' };
      this.applyFilters();
    } catch (error) {
      grid.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  onSearch(value) {
    this.filters.search = value;
    this.applyFilters();
  },

  onCapacityChange(value) {
    this.filters.capacity = value;
    this.applyFilters();
  },

  applyFilters() {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;

    const { search, capacity } = this.filters;

    this.filteredRooms = this.rooms.filter(room => {
      const matchesSearch = search === '' ||
        (room.name && room.name.toLowerCase().includes(search.toLowerCase()));
      const matchesCapacity = capacity === '' || (room.capacity || 0) >= parseInt(capacity);
      return matchesSearch && matchesCapacity;
    });

    this.renderRooms(this.filteredRooms);
  },

  renderRooms(rooms) {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;

    if (!rooms || rooms.length === 0) {
      grid.innerHTML = '<div class="card"><p>No rooms found.</p></div>';
      return;
    }

    grid.innerHTML = rooms.map(room => {
      const imageUrl = room.imageUrl || room.image_url || '';
      const coverHtml = imageUrl
        ? `<img class="room-image" data-fallback="room" src="${imageUrl}" alt="${this.escapeHtml(room.name)}" />`
        : `<i class="bi bi-building-fill"></i>`;

      return `
        <div class="book-card">
          <div class="book-cover" style="font-size: 24px;">${coverHtml}</div>
          <div class="book-title">${this.escapeHtml(room.name)}</div>
          <div class="book-author">Capacity: ${room.capacity} people</div>
          <div class="book-meta">
            <div>${this.escapeHtml(room.description || 'No description available')}</div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-sm" onclick="RoomsPage.viewSlots(${room.roomId})">View Available Slots</button>
          </div>
        </div>
      `;
    }).join('');
    grid.querySelectorAll('.book-cover img[data-fallback="room"]').forEach(image => {
      image.addEventListener('error', () => {
        const icon = document.createElement('i');
        icon.className = 'bi bi-building-fill';
        image.replaceWith(icon);
      }, { once: true });
    });
  },

  async viewSlots(roomId) {
    if (!auth.isAuthenticated()) {
      alert('Please log in to book rooms.');
      window.location.hash = '/login';
      return;
    }

    try {
      const data = await api.get(`/rooms/${roomId}`);
      const roomName = data.name || 'Room';

      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = new Date().toISOString().split('T')[0];

      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex;
        align-items: center; justify-content: center; z-index: 10000;
      `;
      modal.className = 'slots-modal';

      const allRooms = (await api.get('/rooms')).rooms || (await api.get('/rooms')) || [];
      const roomExists = allRooms.find(r => r.roomId === roomId);

      modal.innerHTML = `
        <div class="card" style="max-width: 560px; width: 90%; max-height: 70vh; overflow-y: auto;">
          <h3>${this.escapeHtml(roomName)} - Available Slots</h3>
          <div class="input-group">
            <label for="slotDate">Select Date</label>
            <input type="date" id="slotDate" />
          </div>
          <div id="slotsList" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
            <p class="text-muted">Select a date to see available slots.</p>
          </div>
          <button class="btn btn-sm btn-outline" style="margin-top: 16px;" onclick="this.closest('.slots-modal').remove()">Close</button>
        </div>
      `;
      document.body.appendChild(modal);

      const slotDateInput = modal.querySelector('#slotDate');
      slotDateInput.value = new Date().toISOString().split('T')[0];
      await this.loadSlotsForDate(modal, roomId, slotDateInput.value);

      slotDateInput.addEventListener('change', async () => {
        await this.loadSlotsForDate(modal, roomId, slotDateInput.value);
      });
    } catch (error) {
      alert('Error loading slots: ' + error.message);
    }
  },

  async loadSlotsForDate(modal, roomId, date) {
    const slotsList = modal.querySelector('#slotsList');
    if (!slotsList) return;

    slotsList.innerHTML = '<p class="text-muted">Loading...</p>';

    try {
      const slots = await api.get(`/room-bookings/available/${roomId}?date=${date}`);
      const availableSlots = slots.filter(s => s.startTime !== s.endTime);

      if (availableSlots.length === 0) {
        slotsList.innerHTML = '<p class="text-muted">No available slots for this date.</p>';
        return;
      }

      slotsList.innerHTML = availableSlots.map(s => {
        const start = s.startTime.split('.')[0] || s.startTime;
        const end = s.endTime.split('.')[0] || s.endTime;
        return `<button class="btn btn-sm btn-outline" onclick="RoomsPage.bookSlot(${roomId}, '${s.startTime}', '${s.endTime}')">${start} - ${end}</button>`;
      }).join('');
    } catch (error) {
      slotsList.innerHTML = '<p class="text-danger">Error loading slots.</p>';
    }
  },

  bookSlot(roomId, startTime, endTime) {
    api.post('/room-bookings', { roomId, startTime, endTime })
      .then(() => {
        alert('Room booked successfully!');
        document.querySelector('.slots-modal')?.remove();
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
