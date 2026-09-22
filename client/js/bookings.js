window.BookingsPage = {
  async render(tab = 'books') {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1>My Bookings</h1>
        <p>View your borrowed books, room bookings, and session bookings</p>
      </div>
      <div style="margin-bottom: 20px;">
        <button class="btn btn-sm btn-outline" onclick="BookingsPage.render('books')">Borrowed Books</button>
        <button class="btn btn-sm btn-outline" onclick="BookingsPage.render('rooms')">Room Bookings</button>
        <button class="btn btn-sm btn-outline" onclick="BookingsPage.render('sessions')">Session Bookings</button>
      </div>
      <div id="bookingsContent"></div>
    `;

    this.showTab(tab);
  },

  showTab(tab) {
    const content = document.getElementById('bookingsContent');
    if (!content) return;

    content.innerHTML = '<div class="card"><p>Loading...</p></div>';

    switch (tab) {
      case 'books':
        this.loadBorrows();
        break;
      case 'rooms':
        this.loadRoomBookings();
        break;
      case 'sessions':
        this.loadSessionBookings();
        break;
    }
  },

  async loadBorrows() {
    const content = document.getElementById('bookingsContent');
    if (!content) return;

    try {
      const borrows = await api.get('/borrows/my-borrows');
      if (!borrows || borrows.length === 0) {
        content.innerHTML = '<div class="card"><p>No active borrows.</p></div>';
        return;
      }

      content.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Borrowed</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${borrows.map(b => {
              const due = new Date(b.dueDate);
              const today = new Date();
              const isOverdue = today > due && !b.returnDate;
              const statusText = b.returnDate ? 'Returned' : isOverdue ? 'Overdue' : 'Active';
              const statusClass = b.returnDate ? 'badge-success' : isOverdue ? 'badge-warning' : 'badge-info';
              const fine = b.fineAmount ? `${b.fineAmount.toFixed(2)} ZAR` : '-';
              return `
                <tr>
                  <td><strong>${b.bookTitle}</strong><br><small>${b.bookAuthor}</small></td>
                  <td>${new Date(b.borrowDate).toLocaleDateString()}</td>
                  <td>${due.toLocaleDateString()}</td>
                  <td><span class="badge ${statusClass}">${statusText}</span></td>
                  <td>${fine}</td>
                  <td>${!b.returnDate ? `<button class="btn btn-sm btn-outline" onclick="BookingsPage.returnBook(${b.borrowId})">Return</button>` : ''}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      content.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  async returnBook(borrowId) {
    if (!confirm('Return this book?')) return;
    try {
      await api.post('/borrows/return', { borrowId });
      alert('Book returned successfully!');
      this.loadBorrows();
    } catch (error) {
      alert('Error: ' + (error.data?.message || error.message));
    }
  },

  async loadRoomBookings() {
    const content = document.getElementById('bookingsContent');
    if (!content) return;

    try {
      const bookings = await api.get('/room-bookings/my-bookings');
      if (!bookings || bookings.length === 0) {
        content.innerHTML = '<div class="card"><p>No room bookings.</p></div>';
        return;
      }

      content.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => `
              <tr>
                <td><strong>${b.roomName}</strong></td>
                <td>${new Date(b.startTime).toLocaleString()} - ${new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td><span class="badge badge-info">${b.status}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="BookingsPage.cancelRoomBooking(${b.bookingId})">Cancel</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      content.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  async cancelRoomBooking(bookingId) {
    if (!confirm('Cancel this room booking?')) return;
    try {
      await api.del(`/room-bookings/${bookingId}`);
      alert('Booking cancelled!');
      this.loadRoomBookings();
    } catch (error) {
      alert('Error: ' + (error.data?.message || error.message));
    }
  },

  async loadSessionBookings() {
    const content = document.getElementById('bookingsContent');
    if (!content) return;

    try {
      const bookings = await api.get('/session-bookings/my-bookings');
      if (!bookings || bookings.length === 0) {
        content.innerHTML = '<div class="card"><p>No session bookings.</p></div>';
        return;
      }

      content.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => `
              <tr>
                <td><strong>${b.sessionTitle}</strong></td>
                <td><span class="badge badge-info">${b.status}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="BookingsPage.cancelSessionBooking(${b.bookingId})">Cancel</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      content.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  async cancelSessionBooking(bookingId) {
    if (!confirm('Cancel this session booking?')) return;
    try {
      await api.del(`/session-bookings/${bookingId}`);
      alert('Booking cancelled!');
      this.loadSessionBookings();
    } catch (error) {
      alert('Error: ' + (error.data?.message || error.message));
    }
  }
};
