/**
 * PHOENIX UI CONTROLLER
 *
 * Executes UI commands from Claude Conscious Mind
 * Enables JARVIS-like conversational UI control
 *
 * Architecture:
 * - Receives UI commands from backend (modal, sidepanel, inline, takeover)
 * - Executes commands with smooth animations
 * - Respects voice/manual mode
 * - Integrates with existing Phoenix components
 */

class PhoenixUIController {
  constructor() {
    this.activeModals = new Map();
    this.activePanels = new Map();
    this.inlineWidgets = new Map();
    this.activeTakeovers = new Map();

    this.mode = 'voice'; // 'voice' or 'manual'
    this.animations = true; // Can be toggled

    console.log('[Phoenix UI Controller] Initialized');
  }

  /**
   * MAIN ENTRY POINT: Execute UI command from AI
   * @param {Object} uiCommand - Command from Claude/Gemini
   * @param {String} uiCommand.action - 'modal' | 'sidepanel' | 'inline' | 'takeover' | 'none'
   * @param {String} uiCommand.component - Which component to show
   * @param {Object} uiCommand.data - Data for the component
   * @param {String} uiCommand.animation - Animation style
   */
  execute(uiCommand) {
    if (!uiCommand || uiCommand.action === 'none') {
      console.log('[UI Controller] No UI action required');
      return;
    }

    console.log(`[UI Controller] Executing: ${uiCommand.action} (${uiCommand.component})`);

    switch (uiCommand.action) {
      case 'modal':
        this.showModal(uiCommand);
        break;
      case 'sidepanel':
        this.showSidePanel(uiCommand);
        break;
      case 'inline':
        this.showInline(uiCommand);
        break;
      case 'takeover':
        this.showTakeover(uiCommand);
        break;
      default:
        console.warn(`[UI Controller] Unknown action: ${uiCommand.action}`);
    }
  }

  /**
   * MODAL - Pop-up for focused content
   * Use for: Plans, detailed metrics, confirmations
   */
  showModal(command) {
    const { component, data = {}, animation = 'fade' } = command;

    // Create modal container
    const modalId = `modal-${component}-${Date.now()}`;
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = `phoenix-modal phoenix-modal-${animation}`;

    // Modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'phoenix-modal-backdrop';
    backdrop.onclick = () => this.closeModal(modalId);

    // Modal content
    const content = document.createElement('div');
    content.className = 'phoenix-modal-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'phoenix-modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.closeModal(modalId);

    // Render component based on type
    const componentContent = this.renderComponent(component, data);
    content.appendChild(closeBtn);
    content.appendChild(componentContent);

    modal.appendChild(backdrop);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Trigger animation
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    this.activeModals.set(modalId, modal);
    console.log(`[UI Controller] Modal shown: ${component}`);
  }

  /**
   * SIDEPANEL - Slide-in for analysis/metrics
   * Use for: Recovery details, workout analysis, financial breakdown
   */
  showSidePanel(command) {
    const { component, data = {}, animation = 'slide' } = command;

    const panelId = `panel-${component}-${Date.now()}`;
    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = `phoenix-sidepanel phoenix-sidepanel-${animation}`;

    // Panel header
    const header = document.createElement('div');
    header.className = 'phoenix-panel-header';

    const title = document.createElement('h3');
    title.textContent = this.getComponentTitle(component);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'phoenix-panel-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.closeSidePanel(panelId);

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Panel body
    const body = document.createElement('div');
    body.className = 'phoenix-panel-body';
    const componentContent = this.renderComponent(component, data);
    body.appendChild(componentContent);

    panel.appendChild(header);
    panel.appendChild(body);
    document.body.appendChild(panel);

    // Trigger animation
    requestAnimationFrame(() => {
      panel.classList.add('active');
    });

    this.activePanels.set(panelId, panel);
    console.log(`[UI Controller] Side panel shown: ${component}`);
  }

  /**
   * INLINE - Embed widget in conversation
   * Use for: Quick stats, mini charts, status cards
   */
  showInline(command) {
    const { component, data = {}, targetId = 'conversation-container' } = command;

    const widgetId = `inline-${component}-${Date.now()}`;
    const widget = document.createElement('div');
    widget.id = widgetId;
    widget.className = 'phoenix-inline-widget';

    const componentContent = this.renderComponent(component, data);
    widget.appendChild(componentContent);

    // Find target container (conversation feed, etc.)
    const target = document.getElementById(targetId);
    if (target) {
      target.appendChild(widget);

      // Scroll into view smoothly
      widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      this.inlineWidgets.set(widgetId, widget);
      console.log(`[UI Controller] Inline widget shown: ${component}`);
    } else {
      console.warn(`[UI Controller] Target container not found: ${targetId}`);
    }
  }

  /**
   * TAKEOVER - Full-screen for critical content
   * Use for: Critical interventions, onboarding, major updates
   */
  showTakeover(command) {
    const { component, data = {}, animation = 'zoom' } = command;

    const takeoverId = `takeover-${component}-${Date.now()}`;
    const takeover = document.createElement('div');
    takeover.id = takeoverId;
    takeover.className = `phoenix-takeover phoenix-takeover-${animation}`;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'phoenix-takeover-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.closeTakeover(takeoverId);

    // Content
    const content = document.createElement('div');
    content.className = 'phoenix-takeover-content';
    const componentContent = this.renderComponent(component, data);
    content.appendChild(componentContent);

    takeover.appendChild(closeBtn);
    takeover.appendChild(content);
    document.body.appendChild(takeover);

    // Trigger animation
    requestAnimationFrame(() => {
      takeover.classList.add('active');
    });

    this.activeTakeovers.set(takeoverId, takeover);
    console.log(`[UI Controller] Takeover shown: ${component}`);
  }

  /**
   * RENDER COMPONENT - Dynamically render based on component type
   */
  renderComponent(component, data) {
    const container = document.createElement('div');
    container.className = `phoenix-component phoenix-component-${component}`;

    switch (component) {
      case 'plan':
        container.innerHTML = this.renderPlanComponent(data);
        break;
      case 'metric':
        container.innerHTML = this.renderMetricComponent(data);
        break;
      case 'custom':
        container.innerHTML = data.html || '<p>Custom component</p>';
        break;
      default:
        container.innerHTML = `<p>Component: ${component}</p>`;
    }

    return container;
  }

  /**
   * RENDER PLAN COMPONENT
   */
  renderPlanComponent(data) {
    const { planType = 'active', planId = null } = data;

    // If holistic orchestrator is available, integrate directly
    if (window.holisticOrchestrator) {
      if (planType === 'create') {
        // Trigger create plan UI
        setTimeout(() => window.holisticOrchestrator.showCreatePlanUI(), 100);
        return `
          <div class="plan-component">
            <h2>Create New Plan</h2>
            <p>Opening plan creation interface...</p>
          </div>
        `;
      } else if (planType === 'all') {
        // Trigger all plans view
        setTimeout(() => window.holisticOrchestrator.showAllPlans(), 100);
        return `
          <div class="plan-component">
            <h2>All Plans</h2>
            <p>Loading your holistic plans...</p>
          </div>
        `;
      } else if (planId) {
        // Trigger specific plan view
        setTimeout(() => window.holisticOrchestrator.showDetailedView(planId), 100);
        return `
          <div class="plan-component">
            <h2>Plan Details</h2>
            <p>Loading plan details...</p>
          </div>
        `;
      }
    }

    // Default active plan view
    return `
      <div class="plan-component">
        <h2>Your Active Plan</h2>
        <p>Opening your active holistic plan...</p>
        <div class="plan-actions">
          <button onclick="window.phoenixUI.navigateToPlan()">View Full Plan</button>
        </div>
      </div>
    `;
  }

  /**
   * RENDER METRIC COMPONENT
   */
  renderMetricComponent(data) {
    const { domain = 'mercury' } = data;
    return `
      <div class="metric-component">
        <h2>${domain.charAt(0).toUpperCase() + domain.slice(1)} Metrics</h2>
        <p>Detailed metrics for ${domain}</p>
        <div class="metric-chart">
          <!-- Chart placeholder -->
          <div class="placeholder-chart"></div>
        </div>
      </div>
    `;
  }

  /**
   * CLOSE METHODS
   */
  closeModal(modalId) {
    const modal = this.activeModals.get(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        this.activeModals.delete(modalId);
      }, 300); // Wait for animation
    }
  }

  closeSidePanel(panelId) {
    const panel = this.activePanels.get(panelId);
    if (panel) {
      panel.classList.remove('active');
      setTimeout(() => {
        panel.remove();
        this.activePanels.delete(panelId);
      }, 300);
    }
  }

  closeTakeover(takeoverId) {
    const takeover = this.activeTakeovers.get(takeoverId);
    if (takeover) {
      takeover.classList.remove('active');
      setTimeout(() => {
        takeover.remove();
        this.activeTakeovers.delete(takeoverId);
      }, 300);
    }
  }

  /**
   * HELPER METHODS
   */
  getComponentTitle(component) {
    const titles = {
      plan: 'Your Plan',
      metric: 'Metrics',
      recovery: 'Recovery Analysis',
      workout: 'Workout Details',
      custom: 'Details'
    };
    return titles[component] || component.charAt(0).toUpperCase() + component.slice(1);
  }

  navigateToPlan() {
    // Navigate to holistic orchestrator
    if (window.holisticOrchestrator) {
      window.holisticOrchestrator.show();
    }
  }

  /**
   * SET MODE - Voice vs Manual
   */
  setMode(mode) {
    if (mode !== 'voice' && mode !== 'manual') {
      console.warn(`[UI Controller] Invalid mode: ${mode}`);
      return;
    }

    this.mode = mode;
    console.log(`[UI Controller] Mode set to: ${mode}`);

    // Update UI behavior based on mode
    document.body.setAttribute('data-phoenix-mode', mode);
  }

  /**
   * CLOSE ALL - Clean up all active UI elements
   */
  closeAll() {
    this.activeModals.forEach((modal, id) => this.closeModal(id));
    this.activePanels.forEach((panel, id) => this.closeSidePanel(id));
    this.activeTakeovers.forEach((takeover, id) => this.closeTakeover(id));
    console.log('[UI Controller] All UI elements closed');
  }
}

// Initialize global instance
window.phoenixUI = new PhoenixUIController();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhoenixUIController;
}
