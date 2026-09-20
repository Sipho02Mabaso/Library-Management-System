class SavedBooksPage {
  constructor() {
    this.savedBooks = [];
    this.loading = false;
  }

  async render() {
    const main = document.getElementById('mainContent');
    if (!main) return;

    main.innerHTML = `
      <div class="page-title">
        <h1><i class="bi bi-bookmark-star"></i> Saved Books</h1>
        <p>Books you have saved for later</p>
      </div>
      <div class="card">
        <p id="savedMessage" style="display:none;"></p>
        <div id="savedList" class="book-grid"></div>
      </div>
    `;

    const listEl = main.querySelector('#savedList');

    if (!auth.isAuthenticated()) {
      main.innerHTML = '<div class="card"><p>Please log in to view saved books.</p><button class="btn btn-primary" onclick="router.navigateTo(\'/login\')">Login</button></div>';
      return;
    }

    listEl.innerHTML = '<p class="text-muted">Loading saved books...</p>';
    await this.loadSavedBooks();
  }

  async loadSavedBooks() {
    const main = document.getElementById('mainContent');
    if (!main) return;

    const listEl = main.querySelector('#savedList');
    const messageEl = main.querySelector('#savedMessage');

    if (this.loading) return;
    this.loading = true;

    try {
      const data = await api.get('/saved-books');
      this.savedBooks = data.savedBooks || data || [];

      if (!this.savedBooks.length) {
        listEl.innerHTML = '<p class="text-muted">You have not saved any books yet. Browse books to save them!</p>';
        if (messageEl) messageEl.style.display = 'none';
        return;
      }

      listEl.innerHTML = this.savedBooks.map(book => this.renderBookCard(book)).join('');
    } catch (error) {
      console.error('Error loading saved books:', error);
      listEl.innerHTML = '<p class="text-danger">Error loading saved books.</p>';
    } finally {
      this.loading = false;
    }
  }

  renderBookCard(book) {
    const coverUrl = book.imageUrl || book.image_url || '';
    const coverHtml = coverUrl
      ? `<img src="${coverUrl}" alt="${book.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class='bi bi-book-fill'></i>';">`
      : `<img src="assets/book-icon.svg" alt="${book.title}" />`;

    return `
      <div class="book-card" data-id="${book.id || book.bookId || ''}">
        <div class="book-cover">${coverHtml}</div>
        <div class="book-title">${book.title || 'Untitled'}</div>
        <div class="book-author">${book.author || 'Unknown Author'}</div>
        <div class="book-meta">
          <span>${book.genre || book.category || 'N/A'}</span>
          <span>| Copies: ${book.copies || book.availableCopies || 0}</span>
        </div>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline" onclick="SavedBooksPage.removeSaved(${book.id || book.bookId || 0})">
            <i class="bi bi-bookmark-star"></i> Unsave
          </button>
          <button class="btn btn-sm btn-outline" onclick="BooksPage.viewBook(${book.bookId || book.id || 0})">Details</button>
        </div>
      </div>
    `;
  }

  static async removeSaved(bookId) {
    if (!confirm('Remove this book from saved?')) return;

    try {
      await api.del(`/saved-books/${bookId}`);
      alert('Book removed from saved.');
      if (SavedBooksPage.instance) await SavedBooksPage.instance.loadSavedBooks();
    } catch (error) {
      console.error('Error removing saved book:', error);
      alert('Error removing book: ' + (error.data?.message || error.message));
    }
  }
}

window.SavedBooksPage = SavedBooksPage;
SavedBooksPage.instance = new SavedBooksPage();
