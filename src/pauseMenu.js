/**
 * ============================================
 * ESC PAUSE MENU
 * Resume, Settings, Quit overlay
 * ============================================
 */

export class PauseMenu {
  constructor(player) {
    this.player = player;
    this.isOpen = false;
    this._buildHTML();
    this._initListeners();
  }

  _buildHTML() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'pause-menu';
    this.overlay.className = 'pause-overlay hidden';
    this.overlay.innerHTML = `
      <div class="pause-panel">
        <h2 class="pause-title">PAUSED</h2>
        <p class="pause-subtitle">Corporate Office Simulator</p>
        <div class="pause-buttons">
          <button class="pause-btn resume" id="pause-resume">
            <span class="btn-icon">▶</span> Resume
          </button>
          <button class="pause-btn quit" id="pause-quit">
            <span class="btn-icon">✕</span> Quit to Menu
          </button>
        </div>
        <div class="pause-controls">
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span>
          <span><kbd>Mouse</kbd> Look</span>
          <span><kbd>E</kbd> Interact</span>
          <span><kbd>ESC</kbd> Menu</span>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);
  }

  _initListeners() {
    document.getElementById('pause-resume').addEventListener('click', () => {
      this.close();
      this.player.lock();
    });
    document.getElementById('pause-quit').addEventListener('click', () => {
      this.isOpen = false;
      this.overlay.classList.add('hidden');
      this.player.paused = false;
      const overlay = document.getElementById('start-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
      }
    });
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.overlay.classList.remove('hidden');
    this.player.paused = true;
    document.exitPointerLock();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.classList.add('hidden');
    this.player.paused = false;
    // We let main.js or player.js handle pointer lock after closing the UI
    // to avoid race conditions with UI clicks.
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}
