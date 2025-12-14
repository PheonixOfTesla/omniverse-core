/**
 * GENESIS PARSER
 * Natural language parser for widget creation requests
 * Extracts widget type, integrations, styling, and specifications
 */

class GenesisParser {
    constructor() {
        // Widget type patterns - Genesis creates ANYTHING (iframe embedding for external sites)
        this.widgetTypes = {
            // Phoenix API integrations (existing backend)
            'social-media-panel': /social\s*media|facebook|instagram|tiktok|twitter|linkedin/i,
            'calendar-view': /calendar|meeting|schedule|event|appointment/i,
            'workout-tracker': /workout|exercise|fitness|training|gym/i,
            'health-dashboard': /health|vitals|metrics|biometrics/i,
            'goal-tracker': /goal|objective|target|milestone/i,
            'finance-widget': /finance|budget|money|spending|transaction/i,
            'meditation-timer': /meditation|mindfulness|breathe|zen/i,
            'habit-tracker': /habit|routine|daily|streak/i,

            // Pure frontend widgets (no API needed)
            'timer-widget': /timer|stopwatch|countdown/i,
            'notes-panel': /notes|notepad|memo|write|jot/i,
            'quote-display': /quote|inspiration|motivat|affirmation/i,
            'dashboard-widget': /dashboard|overview|summary/i,
            'todo-list': /todo|task\s*list|checklist/i,

            // Iframe-embedded widgets (external sites)
            'music-player': /music|spotify|player|audio|song|playlist/i,
            'video-widget': /video|youtube|watch|stream/i,
            'weather-widget': /weather|forecast|temperature|climate/i,
            'news-widget': /news|headlines|articles/i,
            'email-widget': /email|gmail|inbox|google email|mail|check.*email/i,
            'maps-widget': /map|location|directions|navigation/i,
            'browser-panel': /browser|web|website|url/i,

            // Generic tracker
            'custom-tracker': /track|monitor|log/i
        };

        // Integration patterns
        this.integrations = {
            'facebook': /facebook|fb/i,
            'instagram': /instagram|insta|ig/i,
            'tiktok': /tiktok|tik\s*tok/i,
            'twitter': /twitter|tweet/i,
            'linkedin': /linkedin/i,
            'google-calendar': /google\s*calendar|gcal/i,
            'outlook': /outlook|office/i,
            'strava': /strava/i,
            'fitbit': /fitbit/i,
            'apple-health': /apple\s*health|health\s*app/i
        };

        // Color patterns
        this.colors = {
            'gold': /#FFD700|gold|golden/i,
            'cyan': /#00d9ff|#00ffff|cyan|aqua/i,
            'black': /#000000|#000|black/i,
            'white': /#FFFFFF|#FFF|white/i,
            'red': /#ff4444|#ff0000|red/i,
            'green': /#00ff7f|#00ff00|green/i,
            'blue': /#0066ff|#0000ff|blue/i,
            'purple': /#9370db|#8a2be2|purple|violet/i,
            'pink': /#ff1493|pink/i,
            'orange': /#ffa500|orange/i
        };

        // Size patterns
        this.sizes = {
            'small': /small|tiny|mini/i,
            'medium': /medium|normal|default/i,
            'large': /large|big|wide|full/i
        };
    }

    /**
     * Main parse function
     * @param {string} userInput - Natural language request
     * @returns {Object} Parsed widget specification
     */
    parse(userInput) {
        if (!userInput || typeof userInput !== 'string') {
            throw new Error('Invalid input: must be a non-empty string');
        }

        const sanitized = this.sanitizeInput(userInput);

        return {
            widgetType: this.extractWidgetType(sanitized),
            integrations: this.extractIntegrations(sanitized),
            styling: this.extractStyling(sanitized),
            size: this.extractSize(sanitized),
            controls: ['close', 'minimize', 'settings'], // Always include
            rawInput: userInput
        };
    }

    /**
     * Sanitize user input
     */
    sanitizeInput(input) {
        return input
            .trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[^\w\s\-#,.()]/gi, '') // Remove special chars except common ones
            .substring(0, 500); // Limit length
    }

    /**
     * Extract widget type from input
     * GENESIS PRINCIPLE: If it doesn't match a predefined type, it's still valid.
     * We create ANYTHING the user describes.
     */
    extractWidgetType(input) {
        for (const [type, pattern] of Object.entries(this.widgetTypes)) {
            if (pattern.test(input)) {
                return type;
            }
        }
        // Default to custom-widget - Genesis creates ANYTHING
        return 'custom-widget';
    }

    /**
     * Extract integrations (Facebook, Instagram, etc.)
     */
    extractIntegrations(input) {
        const found = [];
        for (const [service, pattern] of Object.entries(this.integrations)) {
            if (pattern.test(input)) {
                found.push(service);
            }
        }
        return found.length > 0 ? found : ['none'];
    }

    /**
     * Extract styling specifications
     */
    extractStyling(input) {
        const styling = {
            border: this.extractBorderStyle(input),
            background: this.extractBackgroundColor(input),
            textColor: this.extractTextColor(input),
            accentColor: this.extractAccentColor(input)
        };

        // Fill defaults for missing values
        if (!styling.border) styling.border = '2px solid rgba(0, 217, 255, 0.5)';
        if (!styling.background) styling.background = 'rgba(0, 10, 20, 0.95)';
        if (!styling.textColor) styling.textColor = '#00d9ff';
        if (!styling.accentColor) styling.accentColor = '#FFD700';

        return styling;
    }

    /**
     * Extract border style
     */
    extractBorderStyle(input) {
        const borderMatch = input.match(/border[s]?\s+(gold|cyan|black|white|red|green|blue|purple|pink|orange)/i);
        if (borderMatch) {
            const color = this.getColorHex(borderMatch[1]);
            return `2px solid ${color}`;
        }

        // Check for explicit "gold borders" pattern
        for (const [colorName, pattern] of Object.entries(this.colors)) {
            if (input.match(new RegExp(`${colorName}\\s+border`, 'i'))) {
                return `2px solid ${this.getColorHex(colorName)}`;
            }
        }

        return null;
    }

    /**
     * Extract background color
     */
    extractBackgroundColor(input) {
        const bgMatch = input.match(/background[s]?\s+(gold|cyan|black|white|red|green|blue|purple|pink|orange)/i);
        if (bgMatch) {
            return this.getColorHex(bgMatch[1]);
        }

        // Check for explicit "black background" pattern
        for (const [colorName, pattern] of Object.entries(this.colors)) {
            if (input.match(new RegExp(`${colorName}\\s+background`, 'i')) ||
                input.match(new RegExp(`background\\s+${colorName}`, 'i'))) {
                return this.getColorHex(colorName);
            }
        }

        return null;
    }

    /**
     * Extract text color
     */
    extractTextColor(input) {
        const textMatch = input.match(/text[s]?\s+(gold|cyan|black|white|red|green|blue|purple|pink|orange)/i);
        if (textMatch) {
            return this.getColorHex(textMatch[1]);
        }
        return null;
    }

    /**
     * Extract accent color
     */
    extractAccentColor(input) {
        const accentMatch = input.match(/accent[s]?\s+(gold|cyan|black|white|red|green|blue|purple|pink|orange)/i);
        if (accentMatch) {
            return this.getColorHex(accentMatch[1]);
        }
        return null;
    }

    /**
     * Get hex color code from color name
     */
    getColorHex(colorName) {
        const colorMap = {
            'gold': '#FFD700',
            'cyan': '#00d9ff',
            'black': '#000000',
            'white': '#FFFFFF',
            'red': '#ff4444',
            'green': '#00ff7f',
            'blue': '#0066ff',
            'purple': '#9370db',
            'pink': '#ff1493',
            'orange': '#ffa500'
        };
        return colorMap[colorName.toLowerCase()] || '#00d9ff';
    }

    /**
     * Extract size hint
     */
    extractSize(input) {
        for (const [size, pattern] of Object.entries(this.sizes)) {
            if (pattern.test(input)) {
                return size;
            }
        }
        return 'medium'; // Default
    }

    /**
     * Get size dimensions
     */
    getSizeDimensions(size) {
        const dimensions = {
            'small': { width: 300, height: 400 },
            'medium': { width: 420, height: 580 },
            'large': { width: 600, height: 700 }
        };
        return dimensions[size] || dimensions['medium'];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.GenesisParser = GenesisParser;
}

console.log('✅ Genesis Parser loaded');
