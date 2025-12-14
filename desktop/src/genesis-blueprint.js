/**
 * GENESIS BLUEPRINT GENERATOR
 * Creates detailed widget blueprints from parsed requests
 * Validates and fills in defaults
 */

class GenesisBlueprint {
    constructor() {
        this.parser = new GenesisParser();
    }

    /**
     * Generate complete blueprint from parsed request
     * @param {Object} parsedRequest - Output from GenesisParser
     * @returns {Object} Complete widget blueprint
     */
    generate(parsedRequest) {
        const dimensions = this.parser.getSizeDimensions(parsedRequest.size);

        const blueprint = {
            id: this.generateWidgetId(),
            name: this.generateWidgetName(parsedRequest.widgetType, parsedRequest.integrations),
            type: parsedRequest.widgetType,
            integrations: parsedRequest.integrations,
            styling: this.enhanceStyling(parsedRequest.styling),
            layout: {
                width: dimensions.width,
                height: dimensions.height,
                position: 'auto', // User will drag after creation
                resizable: true,
                draggable: true
            },
            controls: parsedRequest.controls,
            apis: this.getAPIsForType(parsedRequest.widgetType, parsedRequest.integrations),
            compatibility: {
                web: true,
                ios: this.checkIOSCompatibility(parsedRequest),
                mobile: true
            },
            created: new Date().toISOString(),
            rawInput: parsedRequest.rawInput
        };

        // Validate blueprint
        this.validateBlueprint(blueprint);

        return blueprint;
    }

    /**
     * Generate unique widget ID
     */
    generateWidgetId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `genesis_widget_${timestamp}_${random}`;
    }

    /**
     * Generate user-friendly widget name
     * GENESIS PRINCIPLE: Extract meaningful name from user's description
     */
    generateWidgetName(type, integrations) {
        const typeNames = {
            // Phoenix API widgets
            'social-media-panel': 'Social Media Dashboard',
            'calendar-view': 'Calendar',
            'workout-tracker': 'Workout Tracker',
            'health-dashboard': 'Health Metrics',
            'goal-tracker': 'Goals',
            'finance-widget': 'Finance Overview',
            'meditation-timer': 'Meditation Timer',
            'habit-tracker': 'Habit Tracker',

            // Pure frontend widgets
            'timer-widget': 'Timer',
            'notes-panel': 'Notes Panel',
            'quote-display': 'Quote Display',
            'dashboard-widget': 'Dashboard',
            'todo-list': 'Todo List',

            // Iframe-embedded widgets
            'music-player': 'Music Player',
            'video-widget': 'Video Player',
            'weather-widget': 'Weather',
            'news-widget': 'News Feed',
            'maps-widget': 'Maps',
            'browser-panel': 'Web Browser',

            // Generic
            'custom-tracker': 'Custom Tracker',
            'custom-widget': 'Custom Interface'
        };

        let name = typeNames[type] || 'Custom Interface';

        // Add integration names if relevant
        if (integrations && integrations.length > 0 && integrations[0] !== 'none') {
            const integrationsStr = integrations.slice(0, 3).join(', ');
            name += ` (${integrationsStr})`;
        }

        return name;
    }

    /**
     * Enhance styling with computed values
     */
    enhanceStyling(styling) {
        return {
            ...styling,
            borderRadius: '16px',
            shadow: this.generateShadowFromBorder(styling.border),
            backdropFilter: 'blur(20px)',
            opacity: 0.95
        };
    }

    /**
     * Generate shadow based on border color
     */
    generateShadowFromBorder(border) {
        // Extract color from border string
        const colorMatch = border.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\)/);
        if (colorMatch) {
            const color = colorMatch[0];
            return `0 8px 40px ${color}33, 0 0 30px ${color}44`;
        }
        return '0 8px 40px rgba(0, 217, 255, 0.3)';
    }

    /**
     * Get required APIs for widget type
     */
    getAPIsForType(widgetType, integrations) {
        const apiMap = {
            'social-media-panel': integrations.map(i => `/integrations/${i}`),
            'calendar-view': ['/earth/calendar', '/earth/events'],
            'workout-tracker': ['/venus/workouts', '/venus/exercises'],
            'health-dashboard': ['/mercury/health', '/mercury/vitals'],
            'goal-tracker': ['/mars/goals', '/mars/progress'],
            'finance-widget': ['/jupiter/transactions', '/jupiter/budget'],
            'meditation-timer': ['/neptune/meditation', '/neptune/sessions'],
            'habit-tracker': ['/mars/habits', '/mars/streaks']
        };

        return apiMap[widgetType] || [];
    }

    /**
     * Check iOS/Capacitor compatibility
     */
    checkIOSCompatibility(parsedRequest) {
        // Most widgets are iOS compatible
        // Only external integrations might have issues
        const problematicIntegrations = ['facebook', 'instagram', 'tiktok'];
        const hasProblematic = parsedRequest.integrations.some(i =>
            problematicIntegrations.includes(i)
        );

        return !hasProblematic; // Return true if no problematic integrations
    }

    /**
     * Validate blueprint completeness
     */
    validateBlueprint(blueprint) {
        const required = ['id', 'name', 'type', 'styling', 'layout', 'controls'];
        const missing = required.filter(field => !blueprint[field]);

        if (missing.length > 0) {
            throw new Error(`Invalid blueprint: missing fields ${missing.join(', ')}`);
        }

        // Validate dimensions
        if (blueprint.layout.width < 200 || blueprint.layout.height < 150) {
            throw new Error('Widget dimensions too small');
        }

        if (blueprint.layout.width > 1200 || blueprint.layout.height > 900) {
            throw new Error('Widget dimensions too large');
        }

        return true;
    }

    /**
     * Convert blueprint to preview HTML for modal
     */
    toPreviewHTML(blueprint) {
        return `
            <div class="blueprint-section">
                <div class="blueprint-section-title">📦 Components</div>
                <div class="blueprint-section-content">
                    <ul class="blueprint-list">
                        ${this.getComponentsList(blueprint)}
                    </ul>
                </div>
            </div>

            <div class="blueprint-section">
                <div class="blueprint-section-title">🎨 Styling</div>
                <div class="blueprint-section-content">
                    <ul class="blueprint-list">
                        <li class="blueprint-list-item">Border: ${blueprint.styling.border}</li>
                        <li class="blueprint-list-item">Background: ${blueprint.styling.background}</li>
                        <li class="blueprint-list-item">Text: ${blueprint.styling.textColor}</li>
                        <li class="blueprint-list-item">Accent: ${blueprint.styling.accentColor}</li>
                    </ul>
                </div>
            </div>

            <div class="blueprint-section">
                <div class="blueprint-section-title">📐 Layout</div>
                <div class="blueprint-section-content">
                    <ul class="blueprint-list">
                        <li class="blueprint-list-item">Size: ${blueprint.layout.width}x${blueprint.layout.height}px</li>
                        <li class="blueprint-list-item">Position: ${blueprint.layout.position}</li>
                        <li class="blueprint-list-item">Draggable: ${blueprint.layout.draggable ? '✓ Yes' : '✗ No'}</li>
                        <li class="blueprint-list-item">Resizable: ${blueprint.layout.resizable ? '✓ Yes' : '✗ No'}</li>
                    </ul>
                </div>
            </div>

            <div class="blueprint-section">
                <div class="blueprint-section-title">🎛️ Controls</div>
                <div class="blueprint-section-content">
                    <ul class="blueprint-list">
                        ${blueprint.controls.map(c => `<li class="blueprint-list-item">${this.getControlIcon(c)} ${c}</li>`).join('')}
                    </ul>
                </div>
            </div>

            ${blueprint.apis && blueprint.apis.length > 0 ? `
            <div class="blueprint-section">
                <div class="blueprint-section-title">⚙️ APIs Used</div>
                <div class="blueprint-section-content">
                    <ul class="blueprint-list">
                        ${blueprint.apis.map(api => `<li class="blueprint-list-item">${api}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}

            <div class="blueprint-section">
                <div class="blueprint-section-title">📱 Compatibility</div>
                <div class="blueprint-section-content">
                    ${blueprint.compatibility.web ? '✓ Web' : '✗ Web'}  •
                    ${blueprint.compatibility.ios ? '✓ iOS' : '✗ iOS'}  •
                    ${blueprint.compatibility.mobile ? '✓ Mobile' : '✗ Mobile'}
                </div>
            </div>
        `;
    }

    /**
     * Get components list based on widget type
     */
    getComponentsList(blueprint) {
        const componentMap = {
            // Phoenix API widgets
            'social-media-panel': blueprint.integrations.filter(i => i !== 'none').map(i => `${i} Feed`),
            'calendar-view': ['Event List', 'Day View', 'Week Summary'],
            'workout-tracker': ['Exercise Log', 'Progress Chart', 'Stats'],
            'health-dashboard': ['Vital Signs', 'Metrics Chart', 'Trends'],
            'goal-tracker': ['Goal List', 'Progress Bars', 'Milestones'],
            'finance-widget': ['Balance', 'Transactions', 'Budget Status'],
            'meditation-timer': ['Timer', 'Session Log', 'Streak Counter'],
            'habit-tracker': ['Habit Grid', 'Streaks', 'Statistics'],

            // Pure frontend widgets
            'timer-widget': ['Digital Display', 'Start/Stop Controls', 'Reset Button'],
            'notes-panel': ['Text Area', 'Save Button', 'Local Storage'],
            'quote-display': ['Quote Text', 'Author', 'Refresh Button'],
            'dashboard-widget': ['Metric Cards', 'Statistics', 'Charts'],
            'todo-list': ['Task Items', 'Checkboxes', 'Add Button'],

            // Iframe-embedded widgets
            'music-player': ['Embedded Player', 'Playback Controls', 'Playlist'],
            'video-widget': ['Video Player', 'Controls', 'Fullscreen'],
            'weather-widget': ['Current Weather', 'Forecast', 'Location'],
            'news-widget': ['Headlines', 'Articles', 'Live Feed'],
            'email-widget': ['Inbox View', 'Compose', 'Search'],
            'maps-widget': ['Map View', 'Search', 'Directions'],
            'browser-panel': ['Web Page', 'Navigation', 'URL Bar']
        };

        const components = componentMap[blueprint.type] || ['Main Content', 'Interactive Elements', 'Controls'];
        return components.map(c => `<li class="blueprint-list-item">${c}</li>`).join('');
    }

    /**
     * Get icon for control type
     */
    getControlIcon(control) {
        const icons = {
            'close': '✕',
            'minimize': '▼',
            'settings': '⚙️',
            'drag': '⋮⋮'
        };
        return icons[control] || '•';
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.GenesisBlueprint = GenesisBlueprint;
}

console.log('✅ Genesis Blueprint Generator loaded');
