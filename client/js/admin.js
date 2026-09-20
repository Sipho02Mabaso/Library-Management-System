window.AdminPage = {
  async render() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>
      <div id="adminContent"></div>
    `;

    this.showLoading();

    try {
      const [stats, users] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      this.renderStats(stats, users);
    } catch (error) {
      this.showError(error.message);
    }
  },

  showLoading() {
    const content = document.getElementById('adminContent');
    if (content) {
      content.innerHTML = '<div class="card"><p>Loading admin dashboard...</p></div>';
    }
  },

  showError(message) {
    const content = document.getElementById('adminContent');
    if (content) {
      content.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${message}</p></div>`;
    }
  },

  renderStats(stats, users) {
    const content = document.getElementById('adminContent');
    if (!content) return;

    content.innerHTML = `
      <div class="stats-grid">
        ${this.renderPrimaryStat('Users', stats.totalUsers, 'usersChart')}
        ${this.renderPrimaryStat('Books', stats.totalBooks, 'booksChart')}
        ${this.renderPrimaryStat('Active Borrows', stats.activeBorrows, 'borrowsChart')}
      </div>
      <div class="stats-secondary">
        ${this.renderSecondaryStat('Sessions', stats.totalSessions)}
        ${this.renderSecondaryStat('Rooms', stats.totalRooms)}
        ${this.renderSecondaryStat('Overdue', stats.overdueBorrows)}
        ${this.renderSecondaryStat('Outstanding Fines', `${Number(stats.outstandingFines || 0).toFixed(2)} ZAR`)}
        ${this.renderSecondaryStat('Librarians', stats.librarianCount)}
        ${this.renderSecondaryStat('Admins', stats.adminCount)}
      </div>
      <div class="card" style="margin-top: 20px;">
        <h3 style="color: var(--maroon); margin-bottom: 12px;">Users</h3>
        <div id="usersTable"></div>
      </div>
    `;

    this.renderSparkline('usersChart', stats.totalUsers, '#800020', 'rgba(128, 0, 32, 0.12)');
    this.renderSparkline('booksChart', stats.totalBooks, '#a30029', 'rgba(163, 0, 41, 0.12)');
    this.renderSparkline('borrowsChart', stats.activeBorrows, '#b26a00', 'rgba(178, 106, 0, 0.12)');
    this.renderUsersTable(users);
    this.renderCreateUserForm();
  },

  renderPrimaryStat(label, value, chartId) {
    return `<div class="stat-card"><div class="stat-card-content"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-status">Live total</div></div><canvas class="stat-chart" id="${chartId}" aria-label="${label} live total chart"></canvas></div>`;
  },

  renderSecondaryStat(label, value) {
    return `<div class="stat-secondary-card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`;
  },

  renderSparkline(canvasId, value, strokeColor, fillColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const width = canvas.clientWidth || 320;
    const height = 64;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const context = canvas.getContext('2d');
    context.scale(pixelRatio, pixelRatio);
    const baseline = Math.max(1, Number(value) || 0);
    const points = Array.from({ length: 7 }, (_, index) => ({
      x: (width / 6) * index,
      y: 40 - Math.sin(index * 0.8) * 5 - Math.min(baseline, 20) * 0.3
    }));

    context.beginPath();
    context.moveTo(points[0].x, height);
    points.forEach(point => context.lineTo(point.x, point.y));
    context.lineTo(points[points.length - 1].x, height);
    context.closePath();
    context.fillStyle = fillColor;
    context.fill();

    context.beginPath();
    points.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.stroke();
  },

  renderUsersTable(users) {
    const table = document.getElementById('usersTable');
    if (!table) return;

    if (!users || users.length === 0) {
      table.innerHTML = '<p>No users found.</p>';
      return;
    }

    table.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Debt</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.username}</td>
              <td>${user.email}</td>
              <td>${user.fullName}</td>
              <td>${user.debtBalance?.toFixed(2) || '0.00'} ZAR</td>
              <td>${user.isActive ? 'Yes' : 'No'}</td>
              <td>
                ${user.isActive
                  ? `<button class="btn btn-sm btn-outline" onclick="AdminPage.setUserStatus(${user.userId}, false)">Block</button>`
                  : `<button class="btn btn-sm" onclick="AdminPage.setUserStatus(${user.userId}, true)">Unblock</button>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  async deactivateUser(userId) {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.del(`/admin/user/${userId}`);
      alert('User deactivated!');
      this.render();
    } catch (error) {
      alert('Error: ' + (error.data?.message || error.message));
    }
  },

  async setUserStatus(userId, isActive) {
    const action = isActive ? 'unblock' : 'block';
    if (!isActive && !confirm('Block this user? They will not be able to log in.')) return;

    try {
      await api.put(`/admin/user/${userId}/status`, { isActive });
      alert(`User ${action}ed successfully.`);
      this.render();
    } catch (error) {
      alert(`Unable to ${action} user: ` + (error.data?.message || error.message));
    }
  },

  renderCreateUserForm() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    const form = document.createElement('div');
    form.className = 'card admin-create-user';
    form.innerHTML = `
      <h3 style="color: var(--maroon); margin-bottom: 12px;">Create User</h3>
      <form id="createUserForm" class="filter-bar">
        <div class="input-group"><label for="newFullName">Full name</label><input id="newFullName" required /></div>
        <div class="input-group"><label for="newUsername">Username</label><input id="newUsername" required /></div>
        <div class="input-group"><label for="newEmail">Email</label><input id="newEmail" type="email" required /></div>
        <div class="input-group"><label for="newPassword">Temporary password</label><input id="newPassword" type="password" minlength="6" required /></div>
        <div class="input-group"><label for="newRole">Role</label><select id="newRole"><option value="0">User</option><option value="1">Librarian</option><option value="2">Admin</option></select></div>
        <button class="btn" type="submit">Create User</button>
      </form>
    `;
    content.appendChild(form);
    form.querySelector('#createUserForm').addEventListener('submit', event => this.createUser(event));
  },

  async createUser(event) {
    event.preventDefault();
    const form = event.target;
    try {
      await api.post('/admin/users', {
        fullName: form.querySelector('#newFullName').value,
        username: form.querySelector('#newUsername').value,
        email: form.querySelector('#newEmail').value,
        password: form.querySelector('#newPassword').value,
        role: Number(form.querySelector('#newRole').value)
      });
      alert('User created successfully.');
      this.render();
    } catch (error) {
      alert('Unable to create user: ' + (error.data?.message || error.message));
    }
  },

  renderReportsSection() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    const reportsHtml = `
      <div class="card" style="margin-top: 20px;">
        <h3 style="color: var(--maroon); margin-bottom: 12px;">Reports</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('borrows')">Export Borrows CSV</button>
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('fines')">Export Fines CSV</button>
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('rooms')">Export Rooms CSV</button>
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('users')">Export Users CSV</button>
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('sessions')">Export Sessions CSV</button>
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('logs')">Export Logs CSV</button>
          <button class="btn btn-sm btn-outline" onclick="AdminPage.downloadReport('activity')">Export Activity CSV</button>
        </div>
      </div>
    `;

    // Append after stats
    const card = document.createElement('div');
    card.innerHTML = reportsHtml;
    content.appendChild(card);
  },

  async downloadReport(type) {
    try {
      const blob = await api.getBlob(`/reports/${type}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-report-${type}-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading report: ' + error.message);
    }
  },

  renderLogsSection() {
    const content = document.getElementById('adminContent');
    if (!content) return;

    const logsHtml = `
      <div class="card" style="margin-top: 20px;">
        <h3 style="color: var(--maroon); margin-bottom: 12px;">Recent Activity Logs</h3>
        <div id="logsTable">
          <p>Loading logs...</p>
        </div>
      </div>
    `;

    const card = document.createElement('div');
    card.innerHTML = logsHtml;
    content.appendChild(card);

    this.loadLogs();
  },

  async renderReportsPage() {
    const container = document.getElementById('mainContent');
    if (!container) return;
    container.innerHTML = '<div class="page-title"><h1>Reports</h1><p>Reports, activity logs, and blocked accounts.</p></div><div id="adminContent"></div>';
    this.renderReportsSection();
    this.renderLogsSection();
    await this.renderBlockedAccounts();
  },

  async renderBlockedAccounts() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    const users = await api.get('/admin/users');
    const blocked = users.filter(user => !user.isActive);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginTop = '20px';
    card.innerHTML = `<h3 style="color: var(--maroon); margin-bottom: 12px;">Blocked Accounts</h3>${blocked.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>${blocked.map(user => `<tr><td>${user.fullName}</td><td>${user.email}</td><td>${user.role}</td><td><button class="btn btn-sm" onclick="AdminPage.setUserStatus(${user.userId}, true)">Unblock</button></td></tr>`).join('')}</tbody></table></div>` : '<p>No blocked accounts.</p>'}`;
    content.appendChild(card);
  },

  async loadLogs() {
    const container = document.getElementById('logsTable');
    if (!container) return;

    try {
      const logs = await api.get('/logs');
      if (!logs || logs.length === 0) {
        container.innerHTML = '<p>No logs found.</p>';
        return;
      }

      container.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity</th>
              <th>User</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.action}</td>
                <td>${log.entityType}</td>
                <td>${log.username || 'System'}</td>
                <td>${log.details || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      container.innerHTML = `<p style="color: var(--maroon-dark);">Error: ${error.message}</p>`;
    }
  }
};
