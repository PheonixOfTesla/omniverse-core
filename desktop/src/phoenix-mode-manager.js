/**
 * PHOENIX MODE MANAGER
 *
 * Manages Voice vs Manual interaction modes
 * Implements "steve jumps logic" - voice mode is visual-only, manual mode is interactive
 *
 * VOICE MODE:
 * - UI elements are visual demonstrations only
 * - Buttons are dimmed/disabled
 * - Everything controlled by voice
 * - ORB is primary interaction point
 *
 * MANUAL MODE:
 * - Full UI interactivity enabled
 * - Buttons and controls work normally
 * - Can still use voice, but clicking is available
 * - Traditional app interaction
 */

class PhoenixModeManager {
  constructor() {
    this.currentMode = 'manual'; // Default to manual
    this.listeners = new Set();

    // Check if mode preference exists
    const savedMode = localStorage.getItem('phoenixMode');
    if (savedMode) {
      this.currentMode = savedMode;
    }

    this.applyMode();
    console.log(`[Mode Manager] Initialized in ${this.currentMode} mode`);
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Check if in voice mode
   */
  isVoiceMode() {
    return this.currentMode === 'voice';
  }

  /**
   * Check if in manual mode
   */
  isManualMode() {
    return this.currentMode === 'manual';
  }

  /**
   * Set mode (voice or manual)
   */
  setMode(mode) {
    if (mode !== 'voice' && mode !== 'manual') {
      console.error('[Mode Manager] Invalid mode:', mode);
      return false;
    }

    if (this.currentMode === mode) {
      console.log('[Mode Manager] Already in', mode, 'mode');
      return true;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Save preference
    localStorage.setItem('phoenixMode', mode);

    // Apply mode to UI
    this.applyMode();

    // Notify listeners
    this.notifyListeners(mode, previousMode);

    console.log(`[Mode Manager] Switched from ${previousMode} to ${mode} mode`);

    // Show notification
    this.showModeChangeNotification(mode);

    return true;
  }

  /**
   * Toggle between voice and manual modes
   */
  toggleMode() {
    const newMode = this.currentMode === 'voice' ? 'manual' : 'voice';
    return this.setMode(newMode);
  }

  /**
   * Apply mode to the entire UI
   */
  applyMode() {
    // Set data attribute on body for CSS targeting
    document.body.setAttribute('data-phoenix-mode', this.currentMode);

    // Update Phoenix UI Controller if available
    if (window.phoenixUI) {
      window.phoenixUI.setMode(this.currentMode);
    }

    // Update mode-dependent UI elements
    this.updateUIElements();
  }

  /**
   * Update UI elements based on mode
   */
  updateUIElements() {
    if (this.isVoiceMode()) {
      // VOICE MODE: Disable interactive elements, show voice prompts
      this.enableVoiceMode();
    } else {
      // MANUAL MODE: Enable all interactive elements
      this.enableManualMode();
    }
  }

  /**
   * Enable voice mode styling and behavior
   */
  enableVoiceMode() {
    // Add voice mode indicators
    document.querySelectorAll('button, a, input').forEach(element => {
      // Don't disable critical elements like the mode toggle
      if (!element.classList.contains('mode-toggle') &&
          !element.classList.contains('critical-action')) {
        element.setAttribute('data-voice-mode', 'true');

        // Add tooltip explaining voice control
        if (!element.hasAttribute('title-original')) {
          element.setAttribute('title-original', element.title || '');
        }
        element.title = 'Use voice to interact - say "Phoenix, ' +
                       (element.textContent || element.ariaLabel || 'activate this') + '"';
      }
    });

    // Show voice mode indicator
    this.showVoiceModeIndicator();
  }

  /**
   * Enable manual mode styling and behavior
   */
  enableManualMode() {
    // Remove voice mode indicators
    document.querySelectorAll('[data-voice-mode]').forEach(element => {
      element.removeAttribute('data-voice-mode');

      // Restore original title
      const originalTitle = element.getAttribute('title-original');
      if (originalTitle !== null) {
        element.title = originalTitle;
        element.removeAttribute('title-original');
      }
    });

    // Hide voice mode indicator
    this.hideVoiceModeIndicator();
  }

  /**
   * Show voice mode indicator
   */
  showVoiceModeIndicator() {
    let indicator = document.getElementById('phoenix-voice-mode-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'phoenix-voice-mode-indicator';
      indicator.className = 'phoenix-voice-mode-indicator';
      indicator.innerHTML = `
        <div class="voice-mode-pulse"></div>
        <span class="voice-mode-text">🎤 Voice Mode Active</span>
        <button class="mode-toggle-btn" onclick="window.phoenixMode.toggleMode()">
          Switch to Manual
        </button>
      `;
      document.body.appendChild(indicator);
    }

    setTimeout(() => indicator.classList.add('show'), 100);
  }

  /**
   * Hide voice mode indicator
   */
  hideVoiceModeIndicator() {
    const indicator = document.getElementById('phoenix-voice-mode-indicator');
    if (indicator) {
      indicator.classList.remove('show');
      setTimeout(() => indicator.remove(), 300);
    }
  }

  /**
   * Show mode change notification
   */
  showModeChangeNotification(newMode) {
    const notification = document.createElement('div');
    notification.className = 'phoenix-mode-notification';
    notification.innerHTML = `
      <div class="mode-notification-icon">
        ${newMode === 'voice' ? '🎤' : '👆'}
      </div>
      <div class="mode-notification-text">
        <div class="mode-notification-title">
          ${newMode === 'voice' ? 'Voice Mode Activated' : 'Manual Mode Activated'}
        </div>
        <div class="mode-notification-description">
          ${newMode === 'voice'
            ? 'UI is now visual-only. Use voice for all interactions.'
            : 'You can now click buttons and interact normally.'}
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Register mode change listener
   */
  onModeChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of mode change
   */
  notifyListeners(newMode, oldMode) {
    this.listeners.forEach(callback => {
      try {
        callback(newMode, oldMode);
      } catch (error) {
        console.error('[Mode Manager] Listener error:', error);
      }
    });
  }

  /**
   * Create mode toggle button
   */
  createModeToggle(container) {
    const toggle = document.createElement('button');
    toggle.className = 'phoenix-mode-toggle mode-toggle';
    toggle.innerHTML = `
      <span class="mode-icon">${this.currentMode === 'voice' ? '🎤' : '👆'}</span>
      <span class="mode-label">${this.currentMode === 'voice' ? 'Voice' : 'Manual'}</span>
    `;
    toggle.onclick = () => this.toggleMode();

    if (container) {
      container.appendChild(toggle);
    }

    return toggle;
  }
}

// Initialize global instance
window.phoenixMode = new PhoenixModeManager();

// Listen for voice session changes
if (window.jarvis) {
  // When voice session starts, optionally switch to voice mode
  window.phoenixMode.onModeChange((newMode) => {
    console.log('[JARVIS] Mode changed to:', newMode);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhoenixModeManager;
}
