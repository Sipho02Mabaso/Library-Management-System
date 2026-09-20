window.DebtPage = {
  async render() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1>My Debt & Fines</h1>
        <p>Outstanding fines and debt balance</p>
      </div>
      <div id="debtContent"></div>
    `;

    this.showLoading();
    this.loadDebt();
  },

  showLoading() {
    const content = document.getElementById('debtContent');
    if (content) {
      content.innerHTML = '<div class="card"><p>Loading debt information...</p></div>';
    }
  },

  async loadDebt() {
    const content = document.getElementById('debtContent');
    if (!content) return;

    try {
      const [fines, user] = await Promise.all([
        api.get('/fines/my-fines'),
        api.get('/auth/me')
      ]);

      let finesHtml = '';
      if (fines && fines.length > 0) {
        finesHtml = `
          <table class="table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${fines.map(fine => `
                <tr>
                  <td>${fine.bookTitle}</td>
                  <td>${fine.amount.toFixed(2)} ZAR</td>
                  <td><span class="badge ${fine.isPaid ? 'badge-success' : 'badge-warning'}">${fine.isPaid ? 'Paid' : 'Outstanding'}</span></td>
                  <td>${new Date(fine.createdAt).toLocaleDateString()}</td>
                  <td>
                    ${!fine.isPaid ? `<button class="btn btn-sm btn-outline" onclick="DebtPage.payFine(${fine.fineId})">Pay</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        finesHtml = '<div class="card"><p>No fines found.</p></div>';
      }

      content.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
          <h3 style="color: var(--maroon);">Total Debt Balance</h3>
          <p style="font-size: 1.5rem; font-weight: 700; color: var(--maroon);">${user.debtBalance.toFixed(2)} ZAR</p>
        </div>
        <div class="card">
          <h3 style="color: var(--maroon); margin-bottom: 12px;">Fines History</h3>
          ${finesHtml}
        </div>
      `;
    } catch (error) {
      if (error.status === 401) {
        window.location.hash = '/login';
        return;
      }
      content.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  async payFine(fineId) {
    if (!confirm('Pay this fine?')) return;
    try {
      await api.post('/fines/pay', { fineId });
      alert('Fine paid successfully!');
      this.loadDebt();
    } catch (error) {
      alert('Error paying fine: ' + (error.data?.message || error.message));
    }
  }
};
