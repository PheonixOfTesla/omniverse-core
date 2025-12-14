/**
 * GENESIS DOCK
 * Icon-based widget management system
 * Widgets appear as icons in dock, click to open/close
 */

class GenesisDock {
    constructor() {
        this.icons = new Map(); // widgetId → icon element
        this.widgets = new Map(); // widgetId → widget element
        this.dockElement = null;

        // Debug mode
        this.DEBUG = true;

        // Icon mappings for widget types (Font Awesome)
        this.widgetIcons = {
            'email-widget': { icon: 'fa-solid fa-envelope', label: 'Gmail' },
            'music-player': { icon: 'fa-solid fa-music', label: 'Music' },
            'video-widget': { icon: 'fa-solid fa-video', label: 'Video' },
            'weather-widget': { icon: 'fa-solid fa-cloud-sun', label: 'Weather' },
            'news-widget': { icon: 'fa-solid fa-newspaper', label: 'News' },
            'notes-panel': { icon: 'fa-solid fa-note-sticky', label: 'Notes' },
            'timer-widget': { icon: 'fa-solid fa-stopwatch', label: 'Timer' },
            'maps-widget': { icon: 'fa-solid fa-map-location-dot', label: 'Maps' },
            'todo-list': { icon: 'fa-solid fa-list-check', label: 'Todo' },
            'browser-panel': { icon: 'fa-solid fa-globe', label: 'Browser' },
            'social-media-panel': { icon: 'fa-solid fa-share-nodes', label: 'Social' },
            'calendar-view': { icon: 'fa-solid fa-calendar-days', label: 'Calendar' },
            'quote-display': { icon: 'fa-solid fa-quote-left', label: 'Quotes' },
            'dashboard-widget': { icon: 'fa-solid fa-chart-line', label: 'Dashboard' },
            'custom-widget': { icon: 'fa-solid fa-wand-magic-sparkles', label: 'Custom' }
        };

        this.init();
    }

    /**
     * Debug logging
     */
    log(...args) {
        if (this.DEBUG) console.log(...args);
    }

    /**
     * Error logging
     */
    error(...args) {
        console.error(...args);
    }

    /**
     * Initialize dock
     */
    init() {
        try {
            this.createDock();
            this.log('🎯 Genesis Dock initialized');
        } catch (error) {
            this.error('Failed to initialize Genesis Dock:', error);
        }
    }

    /**
     * Create dock HTML structure
     */
    createDock() {
        const dock = document.createElement('div');
        dock.id = 'genesis-dock';
        dock.innerHTML = `
            <div class="dock-icons" id="dock-icons-container"></div>
            <button class="dock-add-btn" id="dock-add-btn" title="Create custom widget">
                <i class="fa-solid fa-plus"></i>
            </button>
        `;

        document.body.appendChild(dock);
        this.dockElement = dock;

        // Add button opens Genesis text input
        const addBtn = document.getElementById('dock-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openGenesisInput());
        }
    }

    /**
     * Add widget to dock
     * @param {HTMLElement} widget - The widget DOM element
     * @param {Object} blueprint - Widget blueprint
     */
    addWidget(widget, blueprint) {
        if (!widget || !blueprint) {
            this.error('Invalid widget or blueprint provided to addWidget');
            return;
        }

        const widgetId = widget.id;
        if (!widgetId) {
            this.error('Widget missing ID');
            return;
        }

        try {
            // Get icon info for this widget type
            const iconInfo = this.widgetIcons[blueprint.type] || this.widgetIcons['custom-widget'];

            // Create dock icon
            const dockIcon = this.createDockIcon(widgetId, iconInfo, blueprint);

            // Add to dock
            const container = document.getElementById('dock-icons-container');
            if (!container) {
                this.error('Dock icons container not found');
                return;
            }
            container.appendChild(dockIcon);

            // Store references
            this.icons.set(widgetId, dockIcon);
            this.widgets.set(widgetId, widget);

            // Start with widget hidden
            widget.style.display = 'none';

            // Show ready notification with blinking arrow
            this.showReadyNotification(dockIcon, blueprint.name);

            this.log(`✅ Added ${blueprint.name} to dock`);
        } catch (error) {
            this.error('Error adding widget to dock:', error);
        }
    }

    /**
     * Create dock icon element
     */
    createDockIcon(widgetId, iconInfo, blueprint) {
        const icon = document.createElement('div');
        icon.className = 'genesis-dock-icon';
        icon.setAttribute('data-widget-id', widgetId);
        icon.innerHTML = `
            <i class="${iconInfo.icon} dock-icon"></i>
            <div class="icon-label">${iconInfo.label}</div>
            <div class="ready-arrow">← Ready!</div>
        `;

        // Click to toggle widget
        icon.addEventListener('click', () => {
            this.toggleWidget(widgetId);
        });

        return icon;
    }

    /**
     * Show ready notification with blinking arrow
     */
    showReadyNotification(dockIcon, widgetName) {
        if (!dockIcon) return;

        try {
            // Add ready class for animation
            dockIcon.classList.add('ready-blink');

            // Phoenix announces
            if (window.genesisController?.phoenixSpeak) {
                window.genesisController.phoenixSpeak(`Your ${widgetName} is ready!`);
            }

            // Remove blink after 5 seconds
            setTimeout(() => {
                dockIcon.classList.remove('ready-blink');
            }, 5000);
        } catch (error) {
            this.error('Error showing ready notification:', error);
        }
    }

    /**
     * Toggle widget open/closed
     */
    toggleWidget(widgetId) {
        const widget = this.widgets.get(widgetId);
        const icon = this.icons.get(widgetId);

        if (!widget || !icon) {
            this.error(`Widget or icon not found for ID: ${widgetId}`);
            return;
        }

        try {
            if (widget.style.display === 'none' || !widget.style.display) {
                // Open widget
                widget.style.display = 'block';
                widget.classList.add('genesis-widget-pop-in');
                icon.classList.add('active');

                // Phoenix announces opening
                const widgetName = widget.querySelector('.widget-title')?.textContent || 'widget';
                if (window.genesisController?.phoenixSpeak) {
                    window.genesisController.phoenixSpeak(`Opening ${widgetName}`);
                }

                // Remove animation class after animation completes
                setTimeout(() => {
                    widget.classList.remove('genesis-widget-pop-in');
                }, 300);

            } else {
                // Close widget
                widget.classList.add('genesis-widget-pop-out');
                icon.classList.remove('active');

                // Phoenix announces closing
                if (window.genesisController?.phoenixSpeak) {
                    window.genesisController.phoenixSpeak('Minimizing to dock');
                }

                setTimeout(() => {
                    widget.style.display = 'none';
                    widget.classList.remove('genesis-widget-pop-out');
                }, 300);
            }
        } catch (error) {
            this.error('Error toggling widget:', error);
        }
    }

    /**
     * Remove widget from dock
     */
    removeWidget(widgetId) {
        const icon = this.icons.get(widgetId);
        if (icon) {
            icon.remove();
            this.icons.delete(widgetId);
        }
        this.widgets.delete(widgetId);
    }

    /**
     * Open Genesis input for custom widget creation
     */
    openGenesisInput() {
        // Switch to Genesis mode if not already
        if (typeof switchToGenesisMode === 'function') {
            switchToGenesisMode();
        }

        // Focus input
        const input = document.getElementById('genesis-input');
        if (input) {
            input.focus();
        }
    }

    /**
     * Show/hide dock
     */
    show() {
        if (this.dockElement) {
            this.dockElement.classList.add('visible');
        }
    }

    hide() {
        if (this.dockElement) {
            this.dockElement.classList.remove('visible');
        }
    }

    /**
     * Get all widget IDs in dock
     */
    getWidgetIds() {
        return Array.from(this.widgets.keys());
    }

    /**
     * Clear all widgets from dock
     */
    clearAll() {
        this.icons.forEach((icon, widgetId) => {
            const widget = this.widgets.get(widgetId);
            if (widget) {
                widget.remove();
            }
            icon.remove();
        });

        this.icons.clear();
        this.widgets.clear();
    }
}

// Initialize global dock
if (typeof window !== 'undefined') {
    try {
        window.genesisDock = new GenesisDock();
        if (window.genesisDock.DEBUG) {
            console.log('✅ Genesis Dock loaded');
        }
    } catch (error) {
        console.error('Failed to initialize Genesis Dock:', error);
    }
}
