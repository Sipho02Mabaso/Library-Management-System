window.BooksPage = {
  books: [],
  filteredBooks: [],
  filters: {
    search: '',
    genre: '',
    author: ''
  },

  async render() {
    const container = document.getElementById('mainContent');
    if (!container) return;

    container.innerHTML = `
      <div class="page-title">
        <h1><i class="bi bi-book"></i> Browse Books</h1>
        <p>Browse our collection of books</p>
      </div>
      <div class="filter-bar">
        <div class="input-group">
          <label>Search Books</label>
          <input type="text" id="bookSearch" class="form-control" placeholder="Title or author..." onkeyup="BooksPage.onSearch(this.value)" />
        </div>
        <div class="input-group">
          <label>Genre</label>
          <select id="genreFilter" class="form-control" onchange="BooksPage.onGenreChange(this.value)">
            <option value="">All Genres</option>
          </select>
        </div>
        <div class="input-group">
          <label>Author</label>
          <input type="text" id="authorFilter" class="form-control" placeholder="Author name..." onkeyup="BooksPage.onAuthorChange(this.value)" />
        </div>
        <button class="btn btn-outline" onclick="BooksPage.loadBooks()">Reset</button>
      </div>
      <div id="booksGrid" class="card-grid"></div>
    `;

    await this.loadBooks();
  },

  async loadBooks() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="text-center" style="padding: 40px;"><p>Loading books...</p></div>';

    try {
      const books = await api.get('/books');
      this.books = books.books || books || [];
      this.filters = { search: '', genre: '', author: '' };
      this.populateGenreFilter();
      this.applyFilters();
    } catch (error) {
      grid.innerHTML = `<div class="card"><p style="color: var(--maroon-dark);">Error: ${error.message}</p></div>`;
    }
  },

  onSearch(value) {
    this.filters.search = value;
    this.applyFilters();
  },

  onGenreChange(value) {
    this.filters.genre = value;
    this.applyFilters();
  },

  onAuthorChange(value) {
    this.filters.author = value;
    this.applyFilters();
  },

  populateGenreFilter() {
    const select = document.getElementById('genreFilter');
    if (!select) return;

    const genres = [...new Set(this.books
      .map(book => (book.genre || '').trim())
      .filter(Boolean))]
      .sort((first, second) => first.localeCompare(second));

    select.innerHTML = '<option value="">All Genres</option>' + genres
      .map(genre => `<option value="${this.escapeHtml(genre)}">${this.escapeHtml(genre)}</option>`)
      .join('');
  },

  applyFilters() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    const { search, genre, author } = this.filters;

    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = search === '' ||
        (book.title && book.title.toLowerCase().includes(search.toLowerCase())) ||
        (book.author && book.author.toLowerCase().includes(search.toLowerCase()));
      const matchesGenre = genre === '' ||
        (book.genre && book.genre.toLowerCase() === genre.toLowerCase()) ||
        (book.genre && book.genre.toLowerCase() === genre.toLowerCase());
      const matchesAuthor = author === '' ||
        (book.author && book.author.toLowerCase().includes(author.toLowerCase()));
      return matchesSearch && matchesGenre && matchesAuthor;
    });

    this.renderBooks(this.filteredBooks);
  },

  renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    if (!books || books.length === 0) {
      grid.innerHTML = '<div class="card"><p>No books found.</p></div>';
      return;
    }

    grid.innerHTML = books.map(book => this.renderBookCard(book)).join('');
    grid.querySelectorAll('.book-cover img[data-fallback="book"]').forEach(image => {
      image.addEventListener('error', () => {
        const icon = document.createElement('i');
        icon.className = 'bi bi-book-fill';
        image.replaceWith(icon);
      }, { once: true });
    });
  },

  renderBookCard(book) {
    const coverUrl = book.imageUrl || book.image_url || '';
    const coverHtml = coverUrl
      ? `<img class="book-image" data-fallback="book" src="${coverUrl}" alt="${this.escapeHtml(book.title)}" />`
      : `<img class="book-image" src="assets/book-icon.svg" alt="${this.escapeHtml(book.title)}" />`;

    const isAvailable = (book.availableQuantity || book.availableCopies || 0) > 0;
    const saveBtn = auth.isAuthenticated()
      ? `<button class="btn btn-sm btn-outline" title="Save for later" onclick="BooksPage.saveBook(${book.bookId || book.id})"><i class="bi bi-bookmark-star"></i></button>`
      : '';

    return `
      <div class="book-card">
        <div class="book-cover">${coverHtml}</div>
        <div class="book-title">${this.escapeHtml(book.title)}</div>
        <div class="book-author">by ${this.escapeHtml(book.author)}</div>
        <div class="book-meta">
          <div>Genre: ${this.escapeHtml(book.genre || 'Not specified')}</div>
          <div>ISBN: ${this.escapeHtml(book.isbn)}</div>
          <div>Shelf: ${this.escapeHtml(book.shelfLocation)}</div>
          <div>Available: <strong>${book.availableQuantity || book.availableCopies || 0}</strong> of ${book.quantity || book.copies}</div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-sm" onclick="BooksPage.borrowBook(${book.bookId || book.id}, '${this.escapeHtml(book.title)}')" ${!isAvailable ? 'disabled' : ''}>
            ${!isAvailable ? 'Not Available' : 'Borrow'}
          </button>
          <button class="btn btn-sm btn-outline" onclick="BooksPage.viewBook(${book.bookId || book.id})">Details</button>
          ${saveBtn}
        </div>
      </div>
    `;
  },

  async viewBook(bookId) {
    try {
      const book = await api.get(`/books/${bookId}`);
      const container = document.getElementById('mainContent');
      if (!container) return;

      const coverUrl = book.imageUrl || book.image_url || '';
      const coverHtml = coverUrl
        ? `<img src="${coverUrl}" alt="${this.escapeHtml(book.title)}" class="book-detail-cover" />`
        : `<i class="bi bi-book-fill book-detail-cover"></i>`;

      const isAvailable = (book.availableQuantity || book.availableCopies || 0) > 0;
      const saveBtn = auth.isAuthenticated()
        ? `<button class="btn btn-sm btn-outline" title="Save for later" onclick="BooksPage.saveBook(${book.id || book.bookId})"><i class="bi bi-bookmark-star"></i> Save</button>`
        : '';

      container.innerHTML = `
        <div class="book-detail-card" style="display:flex; gap:24px; max-width:900px;">
          <div class="book-cover" style="width:200px; height:280px;">${coverHtml}</div>
          <div style="flex:1;">
            <h2 style="color:var(--maroon-dark);">${this.escapeHtml(book.title)}</h2>
            <p class="text-muted">by ${this.escapeHtml(book.author)}</p>
            <p><strong>Genre:</strong> ${this.escapeHtml(book.genre || 'Not specified')}</p>
            <p><strong>ISBN:</strong> ${this.escapeHtml(book.isbn)}</p>
            <p><strong>Shelf:</strong> ${this.escapeHtml(book.shelfLocation)}</p>
            <p><strong>Available:</strong> ${book.availableQuantity || book.availableCopies || 0} of ${book.quantity || book.copies}</p>
            ${book.description ? `<p><strong>Description:</strong> ${this.escapeHtml(book.description)}</p>` : ''}
            <div class="action-buttons" style="margin-top:16px;">
              <button class="btn btn-sm" onclick="BooksPage.borrowBook(${book.id || book.bookId}, '${this.escapeHtml(book.title)}')" ${!isAvailable ? 'disabled' : ''}>
                ${!isAvailable ? 'Not Available' : 'Borrow'}
              </button>
              <button class="btn btn-sm btn-outline" onclick="router.navigateTo('/books')">Back</button>
              ${saveBtn}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error fetching book details:', error);
      alert('Error loading book details');
    }
  },

  async saveBook(bookId) {
    if (!auth.isAuthenticated()) {
      alert('Please log in to save books');
      return;
    }

    try {
      const response = await fetch(`${window.API_BASE_URL || 'http://localhost:5005'}/api/saved-books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ bookId: parseInt(bookId) })
      });

      if (response.ok) {
        alert('Book saved!');
      } else if (response.status === 409) {
        alert('This book is already saved.');
      } else {
        const error = await response.text();
        alert('Error saving book: ' + error);
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book.');
    }
  },

  borrowBook(bookId, title) {
    if (!auth.isAuthenticated()) {
      alert('Please log in to borrow books.');
      window.location.hash = '/login';
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const defaultDueDate = dueDate.toISOString().split('T')[0];

    const modal = this.createBorrowModal(bookId, title, defaultDueDate);
    document.body.appendChild(modal);
  },

  createBorrowModal(bookId, title, defaultDueDate) {
    const div = document.createElement('div');
    div.className = 'borrow-modal';
    div.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 10000;
    `;
    div.innerHTML = `
      <div class="card" style="max-width: 480px; width: 90%;">
        <h3>Borrow: ${title}</h3>
        <p>Default borrowing period: 30 days.</p>
        <form id="borrowForm">
          <div class="input-group">
            <label for="dueDate">Due Date (max 30 days from today)</label>
            <input type="date" id="dueDate" required value="${defaultDueDate}" />
          </div>
          <div class="action-buttons">
            <button type="submit" class="btn btn-sm">Confirm Borrow</button>
            <button type="button" class="btn btn-sm btn-outline" onclick="this.closest('.borrow-modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    div.querySelector('#borrowForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const dueDateInput = e.target.querySelector('#dueDate').value;
      try {
        await api.post('/borrows', { bookId, customDueDate: dueDateInput + 'T23:59:59Z' });
        alert('Book borrowed successfully!');
        div.remove();
        this.render();
      } catch (err) {
        alert('Error: ' + (err.data?.message || err.message));
        div.remove();
      }
    });
    return div;
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
