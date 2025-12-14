/* ============================================
   PHOENIX DOCK - macOS/iOS Style Bottom Dock
   Unified system for minimized widgets, planets, and quick access
   ============================================ */

class PhoenixDock {
    constructor() {
        this.dockItems = [];
        this.minimizedWidgets = new Map(); // Store minimized widget data
        this.dockContainer = null;
        this.isExpanded = true;

        this.init();
    }

    init() {
        console.log('🎯 Initializing Phoenix Dock...');
        this.createDockUI();
        this.attachEventListeners();
        this.loadSavedState();
    }

    createDockUI() {
        // Create dock container
        const dock = document.createElement('div');
        dock.id = 'phoenix-dock';
        dock.className = 'phoenix-dock';

        dock.innerHTML = `
            <div class="dock-toggle" id="dock-toggle">
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </div>
            <div class="dock-items-container" id="dock-items-container">
                <!-- Planet Access Bubble -->
                <div class="dock-item dock-item-planets" data-type="planets" title="Planets">
                    <svg width="32" height="32" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1"/>
                        <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="currentColor" stroke-width="1"/>
                    </svg>
                    <span class="dock-item-label">Planets</span>
                </div>

                <!-- Minimized Widgets Container -->
                <div id="dock-widgets" class="dock-widgets-section"></div>

                <!-- Divider -->
                <div class="dock-divider"></div>

                <!-- Quick Access Items -->
                <div class="dock-item" data-type="genesis" title="Genesis">
                    <svg width="32" height="32" viewBox="0 0 24 24">
                        <path d="M4 2 L4 22 M20 2 L20 22" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
                        <circle cx="20" cy="8" r="1.5" fill="currentColor"/>
                        <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="20" cy="16" r="1.5" fill="currentColor"/>
                    </svg>
                    <span class="dock-item-label">Genesis</span>
                </div>

                <div class="dock-item" data-type="voice" title="Voice">
                    <svg width="32" height="32" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        <path d="M12 2 L12 6 M12 18 L12 22" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span class="dock-item-label">Voice</span>
                </div>

                <div class="dock-item" data-type="settings" title="Settings">
                    <svg width="32" height="32" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        <path d="M12 1v6m0 6v6m6-11h-6m-6 0h6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span class="dock-item-label">Settings</span>
                </div>
            </div>
        `;

        document.body.appendChild(dock);
        this.dockContainer = dock;
    }

    attachEventListeners() {
        // Toggle dock visibility
        const toggleBtn = document.getElementById('dock-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleDock());
        }

        // Planets bubble - opens sub-bubbles for each planet
        const planetsItem = document.querySelector('.dock-item-planets');
        if (planetsItem) {
            planetsItem.addEventListener('click', () => this.openPlanetsMenu());
        }

        // Quick access items
        document.querySelectorAll('.dock-item[data-type]').forEach(item => {
            const type = item.dataset.type;
            if (type !== 'planets') {
                item.addEventListener('click', () => this.handleDockItemClick(type));
            }
        });
    }

    toggleDock() {
        this.isExpanded = !this.isExpanded;
        const container = document.getElementById('dock-items-container');
        const toggle = document.getElementById('dock-toggle');

        if (this.isExpanded) {
            container.style.maxHeight = '80px';
            toggle.style.transform = 'rotate(0deg)';
        } else {
            container.style.maxHeight = '0';
            toggle.style.transform = 'rotate(180deg)';
        }

        this.saveState();
    }

    /* ============================================
       PLANETS MENU - 9 Planets + Desk
       ============================================ */
    openPlanetsMenu() {
        const planets = [
            { name: 'Mercury', icon: '☿', color: '#00ff88', planet: 'mercury' },
            { name: 'Venus', icon: '♀', color: '#ff6b35', planet: 'venus' },
            { name: 'Earth', icon: '⊕', color: '#00d9ff', planet: 'earth' },
            { name: 'Mars', icon: '♂', color: '#ff4444', planet: 'mars' },
            { name: 'Jupiter', icon: '♃', color: '#ffaa00', planet: 'jupiter' },
            { name: 'Saturn', icon: '♄', color: '#8844ff', planet: 'saturn' },
            { name: 'Uranus', icon: '⛢', color: '#00ffff', planet: 'uranus' },
            { name: 'Neptune', icon: '♆', color: '#4444ff', planet: 'neptune' },
            { name: 'Desk', icon: '🖥️', color: '#00d9ff', planet: 'desk' }
        ];

        // Create planet bubbles menu
        const menuContainer = document.createElement('div');
        menuContainer.className = 'planet-bubbles-menu';
        menuContainer.id = 'planet-bubbles-menu';

        let bubblesHTML = '<div class="planet-bubbles-title">Select Planet</div><div class="planet-bubbles-grid">';

        planets.forEach(p => {
            bubblesHTML += `
                <div class="planet-bubble" data-planet="${p.planet}" style="--planet-color: ${p.color}">
                    <div class="planet-bubble-icon">${p.icon}</div>
                    <div class="planet-bubble-name">${p.name}</div>
                </div>
            `;
        });

        bubblesHTML += '</div>';
        menuContainer.innerHTML = bubblesHTML;

        // Add to DOM
        document.body.appendChild(menuContainer);

        // Animate in
        setTimeout(() => menuContainer.classList.add('show'), 10);

        // Add click handlers
        menuContainer.querySelectorAll('.planet-bubble').forEach(bubble => {
            bubble.addEventListener('click', (e) => {
                const planet = e.currentTarget.dataset.planet;
                this.openPlanet(planet);
                this.closePlanetsMenu();
            });
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.planet-bubbles-menu') && !e.target.closest('.dock-item-planets')) {
                    this.closePlanetsMenu();
                }
            }, { once: true });
        }, 100);
    }

    closePlanetsMenu() {
        const menu = document.getElementById('planet-bubbles-menu');
        if (menu) {
            menu.classList.remove('show');
            setTimeout(() => menu.remove(), 300);
        }
    }

    openPlanet(planet) {
        console.log(`🪐 Opening ${planet}...`);

        // If it's desk mode, switch to desk
        if (planet === 'desk' && window.openPhoenixDesk) {
            window.openPhoenixDesk();
            return;
        }

        // Otherwise open planet hologram (existing function)
        if (window.openPlanetHologram) {
            window.openPlanetHologram(planet);
        } else {
            console.warn(`⚠️ openPlanetHologram function not found`);
        }
    }

    /* ============================================
       WIDGET MINIMIZATION
       ============================================ */
    minimizeWidget(widgetId, widgetData) {
        console.log(`Minimizing widget: ${widgetId}`);

        // Store widget data
        this.minimizedWidgets.set(widgetId, widgetData);

        // Create dock bubble for this widget
        const widgetBubble = document.createElement('div');
        widgetBubble.className = 'dock-item dock-item-widget';
        widgetBubble.dataset.widgetId = widgetId;
        widgetBubble.title = widgetData.title || 'Widget';

        widgetBubble.innerHTML = `
            <div class="dock-widget-preview" style="background: ${widgetData.color || '#00d9ff'}">
                ${widgetData.icon || widgetData.title?.charAt(0) || 'W'}
            </div>
            <span class="dock-item-label">${widgetData.title || 'Widget'}</span>
        `;

        // Click to restore
        widgetBubble.addEventListener('click', () => this.restoreWidget(widgetId));

        // Add to dock
        const widgetsSection = document.getElementById('dock-widgets');
        if (widgetsSection) {
            widgetsSection.appendChild(widgetBubble);
        }

        this.saveState();
    }

    restoreWidget(widgetId) {
        console.log(`Restoring widget: ${widgetId}`);

        const widgetData = this.minimizedWidgets.get(widgetId);
        if (!widgetData) return;

        // Trigger widget restore event
        window.dispatchEvent(new CustomEvent('phoenix:restore-widget', {
            detail: { widgetId, widgetData }
        }));

        // Remove from dock
        const bubble = document.querySelector(`.dock-item-widget[data-widget-id="${widgetId}"]`);
        if (bubble) bubble.remove();

        // Remove from storage
        this.minimizedWidgets.delete(widgetId);
        this.saveState();
    }

    /* ============================================
       QUICK ACCESS HANDLERS
       ============================================ */
    handleDockItemClick(type) {
        console.log(`Dock item clicked: ${type}`);

        switch(type) {
            case 'genesis':
                if (window.switchToGenesisMode) {
                    window.switchToGenesisMode();
                }
                break;
            case 'voice':
                if (window.startPhoenixVoiceCommand) {
                    window.startPhoenixVoiceCommand();
                }
                break;
            case 'settings':
                if (window.toggleSettingsMenu) {
                    window.toggleSettingsMenu();
                }
                break;
        }
    }

    /* ============================================
       PERSISTENCE
       ============================================ */
    saveState() {
        const state = {
            isExpanded: this.isExpanded,
            minimizedWidgets: Array.from(this.minimizedWidgets.entries())
        };
        localStorage.setItem('phoenixDockState', JSON.stringify(state));
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem('phoenixDockState');
            if (!saved) return;

            const state = JSON.parse(saved);
            this.isExpanded = state.isExpanded ?? true;

            // Restore minimized widgets
            if (state.minimizedWidgets) {
                state.minimizedWidgets.forEach(([id, data]) => {
                    this.minimizeWidget(id, data);
                });
            }

            // Apply expansion state
            if (!this.isExpanded) {
                this.toggleDock();
            }
        } catch (error) {
            console.warn('Could not load dock state:', error);
        }
    }
}

// Initialize dock when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.phoenixDock = new PhoenixDock();
    });
} else {
    window.phoenixDock = new PhoenixDock();
}

// Global functions for widget manager integration
window.minimizeWidgetToDock = function(widgetId, widgetData) {
    if (window.phoenixDock) {
        window.phoenixDock.minimizeWidget(widgetId, widgetData);
    }
};
