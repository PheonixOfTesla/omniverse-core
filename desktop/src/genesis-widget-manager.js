/**
 * GENESIS WIDGET MANAGER
 * Manages widget persistence and state in localStorage
 */

class GenesisWidgetManager {
    constructor() {
        this.storageKey = 'genesis_widgets';
        this.widgets = this.loadWidgets();
    }

    /**
     * Save widget to localStorage
     */
    saveWidget(widgetId, widgetData) {
        this.widgets[widgetId] = {
            ...widgetData,
            lastUpdated: new Date().toISOString()
        };

        this.persist();
        console.log(`✅ Widget saved: ${widgetId}`);
    }

    /**
     * Load all user widgets from localStorage
     */
    loadWidgets() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load widgets:', error);
            return {};
        }
    }

    /**
     * Delete widget
     */
    deleteWidget(widgetId) {
        delete this.widgets[widgetId];
        this.persist();
        console.log(`🗑️ Widget deleted: ${widgetId}`);
    }

    /**
     * Update widget position
     */
    updateWidgetPosition(widgetId, x, y) {
        if (this.widgets[widgetId]) {
            this.widgets[widgetId].position = { x, y };
            this.persist();
        }
    }

    /**
     * Update widget state (minimized, etc.)
     */
    updateWidgetState(widgetId, state) {
        if (this.widgets[widgetId]) {
            this.widgets[widgetId].state = state;
            this.persist();
        }
    }

    /**
     * Get all widgets
     */
    getAllWidgets() {
        return Object.values(this.widgets);
    }

    /**
     * Get widget by ID
     */
    getWidget(widgetId) {
        return this.widgets[widgetId];
    }

    /**
     * Persist to localStorage
     */
    persist() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.widgets));
        } catch (error) {
            console.error('Failed to persist widgets:', error);
        }
    }

    /**
     * Clear all widgets
     */
    clearAll() {
        this.widgets = {};
        this.persist();
        console.log('🗑️ All widgets cleared');
    }

    /**
     * Export widget configuration
     */
    exportWidget(widgetId) {
        const widget = this.widgets[widgetId];
        if (!widget) return null;

        return JSON.stringify(widget, null, 2);
    }

    /**
     * Import widget configuration
     */
    importWidget(configJSON) {
        try {
            const config = JSON.parse(configJSON);
            const newId = `genesis_widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.saveWidget(newId, config);
            return newId;
        } catch (error) {
            console.error('Failed to import widget:', error);
            return null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.genesisWidgetManager = new GenesisWidgetManager();
}

console.log('✅ Genesis Widget Manager loaded');
