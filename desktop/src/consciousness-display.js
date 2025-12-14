/**
 * PHOENIX CONSCIOUSNESS DISPLAY SYSTEM
 * Wires backend pattern detection to frontend UI
 * Makes Phoenix feel "alive" by showing what it's thinking
 */

class PhoenixConsciousnessDisplay {
    constructor() {
        this.insights = [];
        this.currentMood = 'neutral'; // calm, concerned, excited, analytical
        this.updateInterval = null;
        this.lastUpdate = null;
        this.isVisible = false;
    }

    /**
     * Initialize consciousness display
     * Call this after user logs in
     */
    async init() {
        console.log('[Consciousness] Initializing display system...');

        // Create UI overlay for insights
        this.createInsightOverlay();

        // Start polling backend for consciousness updates
        this.startConsciousnessPolling();

        // Wire to orb animations
        this.wireOrbEmotions();

        console.log('[Consciousness] ✅ System online');
    }

    /**
     * Create floating insight panel
     */
    createInsightOverlay() {
        // Check if already exists
        if (document.getElementById('consciousness-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'consciousness-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 30px;
            width: 320px;
            max-height: 400px;
            background: rgba(0, 10, 20, 0.95);
            border: 1px solid rgba(0, 217, 255, 0.3);
            border-radius: 16px;
            padding: 20px;
            z-index: 9997;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 30px rgba(0, 217, 255, 0.2);
        `;

        panel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div id="consciousness-mood-indicator" style="
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(0, 217, 255, 0.8);
                    box-shadow: 0 0 10px rgba(0, 217, 255, 0.6);
                "></div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.6); letter-spacing: 1px;">
                    PHOENIX INSIGHTS
                </div>
            </div>
            <div id="consciousness-insights" style="
                max-height: 300px;
                overflow-y: auto;
                color: #fff;
            "></div>
        `;

        document.body.appendChild(panel);
    }

    /**
     * Show insights panel
     */
    show() {
        const panel = document.getElementById('consciousness-panel');
        if (panel) {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
            panel.style.pointerEvents = 'auto';
            this.isVisible = true;
        }
    }

    /**
     * Hide insights panel
     */
    hide() {
        const panel = document.getElementById('consciousness-panel');
        if (panel) {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            panel.style.pointerEvents = 'none';
            this.isVisible = false;
        }
    }

    /**
     * Toggle visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Start polling backend for pattern detections
     */
    startConsciousnessPolling() {
        // Poll every 30 seconds for new insights
        this.updateInterval = setInterval(() => {
            this.fetchConsciousnessData();
        }, 30000);

        // Immediate first fetch
        this.fetchConsciousnessData();
    }

    /**
     * Fetch consciousness data from backend
     */
    async fetchConsciousnessData() {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) return;

            const baseUrl = (window.PhoenixConfig && window.PhoenixConfig.API_BASE_URL)
                ? window.PhoenixConfig.API_BASE_URL
                : 'https://pal-backend-production.up.railway.app/api';

            // TEMPORARY: Backend doesn't have this endpoint yet
            // When backend adds GET /api/consciousness/dashboard-insights, uncomment:
            /*
            const response = await fetch(`${baseUrl}/consciousness/dashboard-insights`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log('[Consciousness] Backend endpoint not yet available');
                return;
            }

            const data = await response.json();
            this.updateInsights(data.insights);
            this.updateMood(data.mood);
            */

            // DEMO MODE: Generate sample insights based on local data
            this.generateDemoInsights();

        } catch (error) {
            console.error('[Consciousness] Fetch error:', error);
        }

        this.lastUpdate = new Date();
    }

    /**
     * Generate demo insights until backend endpoint exists
     */
    generateDemoInsights() {
        const hour = new Date().getHours();
        const demoInsights = [];

        // Time-based insights
        if (hour >= 6 && hour < 9) {
            demoInsights.push({
                type: 'proactive',
                priority: 'medium',
                message: 'Morning recovery metrics loading. I\'ll analyze your overnight data.',
                planet: 'mercury',
                timestamp: new Date()
            });
        } else if (hour >= 12 && hour < 14) {
            demoInsights.push({
                type: 'suggestion',
                priority: 'low',
                message: 'Energy dip detected around this time yesterday. Consider a brief walk.',
                planet: 'earth',
                timestamp: new Date()
            });
        } else if (hour >= 21) {
            demoInsights.push({
                type: 'proactive',
                priority: 'medium',
                message: 'Optimal sleep window approaching. I\'m tracking your wind-down routine.',
                planet: 'mercury',
                timestamp: new Date()
            });
        }

        // Pattern-based insights - DISABLED (use real backend data only)
        // Mock data removed - patterns should come from /api/phoenix/patterns endpoint

        this.updateInsights(demoInsights);

        // Set mood based on insights
        const hasConcern = demoInsights.some(i => i.priority === 'high');
        const hasExcitement = demoInsights.some(i => i.type === 'pattern');

        if (hasConcern) {
            this.updateMood('concerned');
        } else if (hasExcitement) {
            this.updateMood('analytical');
        } else {
            this.updateMood('calm');
        }
    }

    /**
     * Update displayed insights
     */
    updateInsights(insights) {
        this.insights = insights;

        const container = document.getElementById('consciousness-insights');
        if (!container) return;

        if (insights.length === 0) {
            container.innerHTML = `
                <div style="color: rgba(255,255,255,0.4); font-size: 13px; text-align: center; padding: 20px;">
                    Monitoring your systems...
                </div>
            `;
            return;
        }

        container.innerHTML = insights.map(insight => {
            const priorityColors = {
                high: '#ff4444',
                medium: '#ffaa00',
                low: '#00d9ff'
            };

            const planetEmojis = {
                mercury: '📍',
                venus: '🏋️',
                earth: '🌍',
                mars: '🎯',
                jupiter: '💰',
                saturn: '🏛️',
                uranus: '💡',
                neptune: '🧘'
            };

            return `
                <div style="
                    background: rgba(255,255,255,0.03);
                    border-left: 3px solid ${priorityColors[insight.priority]};
                    padding: 12px;
                    margin-bottom: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    line-height: 1.5;
                ">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span>${planetEmojis[insight.planet] || '🔮'}</span>
                        <span style="
                            font-size: 10px;
                            color: rgba(255,255,255,0.5);
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">
                            ${insight.type}
                        </span>
                    </div>
                    <div style="color: rgba(255,255,255,0.9);">
                        ${insight.message}
                    </div>
                </div>
            `;
        }).join('');

        // Auto-show panel if high priority insight
        if (insights.some(i => i.priority === 'high') && !this.isVisible) {
            this.show();

            // Auto-hide after 10 seconds
            setTimeout(() => this.hide(), 10000);
        }
    }

    /**
     * Update mood indicator
     */
    updateMood(mood) {
        this.currentMood = mood;

        const indicator = document.getElementById('consciousness-mood-indicator');
        if (!indicator) return;

        const moodColors = {
            calm: 'rgba(0, 217, 255, 0.8)',
            concerned: 'rgba(255, 68, 68, 0.8)',
            excited: 'rgba(0, 255, 127, 0.8)',
            analytical: 'rgba(156, 39, 176, 0.8)'
        };

        indicator.style.background = moodColors[mood] || moodColors.calm;
        indicator.style.boxShadow = `0 0 15px ${moodColors[mood] || moodColors.calm}`;

        // Pulse animation for excited/concerned
        if (mood === 'excited' || mood === 'concerned') {
            indicator.style.animation = 'consciousness-pulse 2s infinite';
        } else {
            indicator.style.animation = 'none';
        }
    }

    /**
     * Wire consciousness to orb visual state
     */
    wireOrbEmotions() {
        // If phoenixOrb exists, sync mood with orb color
        setInterval(() => {
            if (window.phoenixOrb && window.phoenixOrb.setOrbState) {
                const stateMap = {
                    calm: 'idle',
                    concerned: 'error',
                    excited: 'success',
                    analytical: 'listening'
                };

                const orbState = stateMap[this.currentMood];
                if (orbState && window.phoenixOrb.currentState !== orbState) {
                    // Don't override active listening/speaking
                    if (window.phoenixOrb.currentState === 'idle') {
                        window.phoenixOrb.setOrbState(orbState);
                    }
                }
            }
        }, 5000);

        // PROACTIVE INTELLIGENCE: DISABLED - too frequent and not context-aware yet
        // this.enableProactiveInsights();
    }

    /**
     * Enable proactive insights - Phoenix initiates conversations
     */
    enableProactiveInsights() {
        // Check for important insights every 2 minutes
        setInterval(() => {
            this.considerProactiveAlert();
        }, 120000); // 2 minutes
    }

    /**
     * Decide if Phoenix should proactively speak an insight
     */
    considerProactiveAlert() {
        // Only if user is on dashboard and not actively using voice
        if (!window.location.pathname.includes('dashboard')) return;
        if (window.phoenixOrb && window.phoenixOrb.currentState === 'listening') return;
        if (window.phoenixOrb && window.phoenixOrb.currentState === 'speaking') return;

        // Check for high-priority insights that haven't been spoken
        const highPriorityInsights = this.insights.filter(i =>
            i.priority === 'high' &&
            !i.spoken &&
            (Date.now() - new Date(i.timestamp).getTime()) < 300000 // < 5 minutes old
        );

        if (highPriorityInsights.length > 0) {
            const insight = highPriorityInsights[0];
            this.proactivelySpeak(insight);
            insight.spoken = true;
        }
    }

    /**
     * Phoenix proactively speaks an insight
     */
    async proactivelySpeak(insight) {
        console.log('[Consciousness] 🔮 Proactive insight:', insight.message);

        // Make orb pulse to get attention
        if (window.phoenixOrb && window.phoenixOrb.setOrbState) {
            window.phoenixOrb.setOrbState('thinking');

            // After 1 second, speak
            setTimeout(() => {
                if (window.phoenixVoice && window.phoenixVoice.speak) {
                    window.phoenixVoice.speak(`I noticed something. ${insight.message}`);
                } else if (window.PhoenixVoiceSystem && window.PhoenixVoiceSystem.speak) {
                    window.PhoenixVoiceSystem.speak(`I noticed something. ${insight.message}`);
                }

                // Show the insights panel
                this.show();
            }, 1000);
        }
    }

    /**
     * Stop all consciousness updates
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const panel = document.getElementById('consciousness-panel');
        if (panel) {
            panel.remove();
        }
    }

    /**
     * Force refresh insights
     */
    async refresh() {
        console.log('[Consciousness] Manual refresh requested');
        await this.fetchConsciousnessData();
        this.show();
    }

    /**
     * Get current insights for voice system
     */
    getInsightsSummary() {
        if (this.insights.length === 0) {
            return "I'm monitoring your systems. No alerts at the moment.";
        }

        const highPriority = this.insights.filter(i => i.priority === 'high');
        if (highPriority.length > 0) {
            return `I have ${highPriority.length} important insight${highPriority.length > 1 ? 's' : ''} for you. ${highPriority[0].message}`;
        }

        return `I've detected ${this.insights.length} pattern${this.insights.length > 1 ? 's' : ''}. ${this.insights[0].message}`;
    }
}

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes consciousness-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.7; }
    }

    #consciousness-insights::-webkit-scrollbar {
        width: 6px;
    }

    #consciousness-insights::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 3px;
    }

    #consciousness-insights::-webkit-scrollbar-thumb {
        background: rgba(0, 217, 255, 0.3);
        border-radius: 3px;
    }

    #consciousness-insights::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 217, 255, 0.5);
    }
`;
document.head.appendChild(style);

// Global instance
window.PhoenixConsciousness = new PhoenixConsciousnessDisplay();

console.log('✅ Consciousness Display System loaded');
