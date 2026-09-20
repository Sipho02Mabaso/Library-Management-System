window.LoginPage = {
  currentMode: 'login',

  render(mode = 'login') {
    this.currentMode = mode;
    const container = document.getElementById('mainContent');
    if (!container) return;

    const isLogin = mode === 'login';
    const isForgot = mode === 'forgot';

    if (isForgot) {
      container.innerHTML = `
        <div class="page-title">
          <h1><i class="bi bi-key"></i> Forgot Password</h1>
          <p>Enter your username or email to reset your password</p>
        </div>
        <div style="max-width: 440px; margin: 0 auto;">
          <div class="card">
            <h2 style="text-align: center; color: var(--maroon); margin-bottom: 20px;">Reset Password</h2>
            <form id="forgotForm">
              <div class="input-group">
                <label for="forgotInput">Username or Email</label>
                <input type="text" id="forgotInput" required placeholder="Enter username or email" />
              </div>
              <button type="submit" class="btn" style="width: 100%;">Send Reset Link</button>
            </form>
            <div style="text-align: center; margin-top: 16px;">
              <a href="#" onclick="LoginPage.render('login'); return false;" style="color: var(--maroon);">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      `;

      document.getElementById('forgotForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('forgotInput').value;
        alert(`If an account exists for '${input}', a password reset link has been sent to the registered email.`);
        this.render('login');
      });
      return;
    }

    container.innerHTML = `
      <div class="page-title">
        <h1>${isLogin ? 'Login' : 'Register'}</h1>
        <p>${isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
      </div>
      <div style="max-width: 440px; margin: 0 auto;">
        <div class="card">
          <h2 style="text-align: center; color: var(--maroon); margin-bottom: 20px;">${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <form id="authForm">
            ${!isLogin ? `
              <div class="input-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" required />
              </div>
            ` : ''}
            ${!isLogin ? `
              <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" required />
              </div>
              <div class="input-group">
                <label for="email">Email</label>
                <input type="email" id="email" required />
              </div>
            ` : `
              <div class="input-group">
                <label for="email">Email address</label>
                <input type="email" id="email" required />
              </div>
            `}
            <div class="input-group">
              <label for="password">Password</label>
              <input type="password" id="password" required minlength="6" />
            </div>
            ${!isLogin ? `
              <div class="input-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" required minlength="6" />
              </div>
            ` : ''}
            <button type="submit" class="btn" style="width: 100%;">${isLogin ? 'Login' : 'Register'}</button>
          </form>
          ${isLogin ? `
            <div style="text-align: center; margin-top: 16px;">
              <a href="#" onclick="LoginPage.render('forgot'); return false;" style="color: var(--maroon);">Forgot password?</a>
            </div>
          ` : ''}
          <div style="text-align: center; margin-top: 12px;">
            <a href="#" onclick="LoginPage.render('${isLogin ? 'register' : 'login'}'); return false;" style="color: var(--maroon); font-weight: 600;">
              ${isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('authForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.currentMode === 'login') {
        this.handleLogin();
      } else if (this.currentMode === 'register') {
        this.handleRegister();
      }
    });

    if (isLogin && this.savedRegisterData) {
      document.getElementById('email').value = this.savedRegisterData.email || '';
    }
  },

  savedRegisterData: null,

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await auth.login(email, password);
      const rolePages = {
        User: 'user.html',
        Librarian: 'librarian.html',
        Admin: 'admin.html'
      };
      window.location.href = rolePages[auth.getRole()] || 'index.html#/';
    } catch (error) {
      alert('Login failed: ' + (error.data?.message || error.message));
    }
  },

  async handleRegister() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await auth.register(username, email, password, fullName);
      alert('Registration successful. Please log in.');
      this.savedRegisterData = { email };
      this.render('login');
    } catch (error) {
      alert('Registration failed: ' + (error.data?.message || error.message));
    }
  }
};
