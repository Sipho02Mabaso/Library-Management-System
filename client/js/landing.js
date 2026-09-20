window.Landing = {
  init() {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    document.body.classList.add('loaded');
    overlay.classList.add('fade-out');
    overlay.addEventListener('transitionend', () => {
      overlay.style.display = 'none';
    });
  }
};
