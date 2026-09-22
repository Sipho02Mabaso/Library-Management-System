window.ProfilePage = {
  async render() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1>Profile</h1>
        <p>Manage your account settings</p>
      </div>
      <div style="max-width: 560px; margin: 0 auto;">
        <div class="card">
          <h2 style="color: var(--maroon); margin-bottom: 20px;">Account Information</h2>
          <form id="profileForm">
            <div class="input-group">
              <label for="username">Username</label>
              <input type="text" id="username" readonly />
            </div>
            <div class="input-group">
              <label for="email">Email</label>
              <input type="email" id="email" required />
            </div>
            <div class="input-group">
              <label for="fullName">Full Name</label>
              <input type="text" id="fullName" required />
            </div>
            <div class="input-group">
              <label for="currentPassword">Current Password</label>
              <input type="password" id="currentPassword" />
            </div>
            <div class="input-group">
              <label for="newPassword">New Password</label>
              <input type="password" id="newPassword" />
            </div>
            <button type="submit" class="btn">Save Changes</button>
          </form>
        </div>
        <div class="card" style="margin-top: 20px;">
          <h2 style="color: var(--maroon); margin-bottom: 20px;">My Debt</h2>
          <div id="debtInfo" style="padding: 12px; background-color: var(--cream); border-radius: var(--radius-sm); font-size: 1.1rem;">
            <p>Loading debt balance...</p>
          </div>
        </div>
      </div>
    `;

    this.loadUserData();

    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });
  },

  async loadUserData() {
    try {
      const user = await api.get('/auth/me');
      document.getElementById('username').value = user.username;
      document.getElementById('email').value = user.email;
      document.getElementById('fullName').value = user.fullName;

      const debtDiv = document.getElementById('debtInfo');
      const debt = user.debtBalance;
      debtDiv.innerHTML = debt > 0
        ? `<p style="color: var(--maroon); font-weight: 600;">Outstanding Debt: ${debt.toFixed(2)} ZAR</p>`
        : `<p style="color: #16a34a; font-weight: 600;">No outstanding debt. Your account is in good standing.</p>`;
    } catch (error) {
      if (error.status === 401) {
        window.location.hash = '/login';
      }
    }
  },

  async saveProfile() {
    const dto = {
      email: document.getElementById('email').value,
      fullName: document.getElementById('fullName').value,
      currentPassword: document.getElementById('currentPassword').value || undefined,
      newPassword: document.getElementById('newPassword').value || undefined
    };

    try {
      await api.put('/auth/me', dto);
      alert('Profile updated successfully!');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
    } catch (error) {
      alert('Error updating profile: ' + (error.data?.message || error.message));
    }
  }
};
