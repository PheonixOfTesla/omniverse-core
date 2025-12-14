/**
 * OMNIVERSE BRIDGE
 *
 * Detects if Omniverse Desktop is running locally (localhost:8080)
 * Routes AI requests to local (FREE) or cloud (PAID) automatically
 *
 * User experience:
 * - Has Omniverse Desktop running → uses local AI (free, unlimited)
 * - No Omniverse Desktop → uses Phoenix Cloud (paid, requires subscription)
 */

class OmniverseBridge {
  constructor() {
    this.omniverseAvailable = false;
    this.omniverseUrl = 'http://localhost:8080';
    this.cloudUrl = 'https://pal-backend-production.up.railway.app';
    this.checkInterval = null;
  }

  async init() {
    console.log('🌉 Initializing Omniverse Bridge...');

    // Check if Omniverse Desktop is running
    await this.detectOmniverse();

    // Re-check every 30 seconds (in case user starts/stops Omniverse)
    this.checkInterval = setInterval(() => {
      this.detectOmniverse();
    }, 30000);

    if (this.omniverseAvailable) {
      console.log('🏝️  Omniverse Desktop detected - using local AI (FREE)');
      this.showOmniverseStatus(true);
    } else {
      console.log('☁️  No Omniverse Desktop - using Phoenix Cloud');
      this.showOmniverseStatus(false);
    }
  }

  async detectOmniverse() {
    /**
     * Try to connect to localhost:8080
     * If successful, Omniverse Desktop is running
     */

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);

      const response = await fetch(`${this.omniverseUrl}/health`, {
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeout);

      const wasAvailable = this.omniverseAvailable;
      this.omniverseAvailable = response.ok;

      // If status changed, notify user
      if (wasAvailable !== this.omniverseAvailable) {
        if (this.omniverseAvailable) {
          console.log('✅ Omniverse Desktop connected');
          this.showNotification('Omniverse Desktop connected - now using local AI (free)', 'success');
        } else {
          console.log('❌ Omniverse Desktop disconnected');
          this.showNotification('Omniverse Desktop disconnected - now using cloud AI', 'warning');
        }
        this.showOmniverseStatus(this.omniverseAvailable);
      }

      return this.omniverseAvailable;

    } catch (error) {
      this.omniverseAvailable = false;
      return false;
    }
  }

  async query(prompt, options = {}) {
    /**
     * Main query method
     * Routes to local or cloud based on availability + user preference
     */

    // Check if we should force cloud (user preference or Omniverse unavailable)
    const forceCloud = options.forceCloud || !this.omniverseAvailable;

    if (forceCloud) {
      return await this.queryCloud(prompt, options);
    } else {
      return await this.queryLocal(prompt, options);
    }
  }

  async queryLocal(prompt, options = {}) {
    /**
     * Query Omniverse Desktop (localhost:8080)
     * FREE, unlimited, private
     */

    console.log('🏝️  Querying Omniverse Desktop (local)...');

    try {
      const response = await fetch(`${this.omniverseUrl}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Omniverse query failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        response: data.response,
        substrate: 'local',
        model: 'kimi-k2-7b',
        cost: 0 // FREE!
      };

    } catch (error) {
      console.error('Local query failed, falling back to cloud:', error);

      // Fallback to cloud if local fails
      return await this.queryCloud(prompt, options);
    }
  }

  async queryCloud(prompt, options = {}) {
    /**
     * Query Phoenix Cloud
     * PAID, requires subscription
     */

    console.log('☁️  Querying Phoenix Cloud...');

    // Check if user has subscription
    const hasSubscription = await this.checkCloudSubscription();

    if (!hasSubscription) {
      return {
        success: false,
        error: 'No cloud subscription',
        upgrade: {
          message: 'You\'ve reached your free tier limit',
          options: [
            {
              label: 'Download Omniverse Desktop (Free Forever)',
              url: 'https://omniverse.ai/download'
            },
            {
              label: 'Upgrade to Phoenix Cloud ($9/mo)',
              url: 'https://phoenix.ai/pricing'
            }
          ]
        }
      };
    }

    try {
      const token = localStorage.getItem('phoenixToken');

      const response = await fetch(`${this.cloudUrl}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Cloud query failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        response: data.response,
        substrate: 'cloud',
        model: data.model || 'claude-haiku',
        cost: data.cost || 0.01
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processConsciousness(input) {
    /**
     * Process through 4-layer consciousness
     * Routes to local or cloud
     */

    if (this.omniverseAvailable) {
      // Use local consciousness
      const response = await fetch(`${this.omniverseUrl}/consciousness/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      return await response.json();

    } else {
      // Use cloud consciousness
      const token = localStorage.getItem('phoenixToken');

      const response = await fetch(`${this.cloudUrl}/consciousness/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ input })
      });

      return await response.json();
    }
  }

  async checkCloudSubscription() {
    /**
     * Check if user has active Phoenix Cloud subscription
     */

    const token = localStorage.getItem('phoenixToken');
    if (!token) return false;

    try {
      const response = await fetch(`${this.cloudUrl}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.active === true;

    } catch (error) {
      return false;
    }
  }

  showOmniverseStatus(available) {
    /**
     * Update UI to show Omniverse status
     */

    // Create/update status indicator
    let indicator = document.getElementById('omniverse-status');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'omniverse-status';
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid ${available ? '#00FF00' : '#FFD700'};
        border-radius: 8px;
        padding: 10px 15px;
        font-size: 12px;
        color: ${available ? '#00FF00' : '#FFD700'};
        z-index: 10000;
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(indicator);
    }

    if (available) {
      indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; background: #00FF00; border-radius: 50%; animation: pulse 2s infinite;"></div>
          <span>🏝️ Omniverse Desktop (Local, Free)</span>
        </div>
      `;
    } else {
      indicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 8px; height: 8px; background: #FFD700; border-radius: 50%;"></div>
          <span>☁️ Phoenix Cloud</span>
        </div>
      `;
    }
  }

  showNotification(message, type = 'info') {
    /**
     * Show toast notification
     */

    if (typeof showToast === 'function') {
      showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}]`, message);
    }
  }

  async showDownloadPrompt() {
    /**
     * Show prompt to download Omniverse Desktop
     */

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
    `;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #00D9FF;
        border-radius: 16px;
        padding: 40px;
        max-width: 500px;
        color: #00D9FF;
        text-align: center;
      ">
        <h2 style="font-size: 24px; margin-bottom: 20px;">
          🏝️ Get Your Private Island
        </h2>
        <p style="margin-bottom: 30px; opacity: 0.8;">
          Download Omniverse Desktop to use Phoenix AI locally, for free, forever.
          Your data never leaves your device.
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
          <a href="https://omniverse.ai/download" style="
            background: linear-gradient(135deg, #00D9FF, #0099CC);
            color: #000;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
          ">
            Download Free
          </a>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            background: transparent;
            border: 1px solid #00D9FF;
            color: #00D9FF;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
          ">
            Maybe Later
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Create global instance
window.omniverseBridge = new OmniverseBridge();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.omniverseBridge.init();
  });
} else {
  window.omniverseBridge.init();
}

export default window.omniverseBridge;
