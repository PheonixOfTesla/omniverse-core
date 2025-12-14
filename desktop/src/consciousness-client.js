/* ============================================
   PHOENIX CONSCIOUSNESS CLIENT
   Maintains persistent connection to backend consciousness
   Receives proactive updates and orchestration commands
   ============================================ */

class ConsciousnessClient {
    constructor() {
        this.isConnected = false;
        this.orchestrationCache = null;
        this.lastOrchestrationTime = 0;
        this.sessionId = this.generateSessionId();
        this.biometricData = {};
        this.hasGreeted = false; // Track if proactive greeting shown

        console.log('[Consciousness] Client initialized');
    }

    /* ============================================
       PROACTIVE INITIALIZATION - Auto-greet on app open
       ============================================ */
    async initProactive() {
        try {
            // Non-blocking - run in background
            setTimeout(async () => {
                // Wait for core systems to load (max 5 seconds)
                await Promise.race([
                    this.waitForSystems(),
                    new Promise(resolve => setTimeout(resolve, 5000))
                ]);

                // Build comprehensive context
                const context = await this.buildAppOpenContext();

                // Fetch orchestration from backend (5s timeout built-in)
                const orchestration = await this.orchestrate(context, null);

                if (orchestration) {
                    // Display widgets from orchestration
                    if (window.widgetManager && orchestration.widgets) {
                        window.widgetManager.displayFromOrchestration(orchestration);
                    }

                    // Trigger proactive greeting with context
                    if (window.phoenixVoice && !this.hasGreeted) {
                        this.hasGreeted = true;
                        await window.phoenixVoice.proactiveGreeting(context, orchestration);
                    }
                }
            }, 500); // Delay to not block app initialization
        } catch (error) {
            // Silent fail - proactive greeting is optional
        }
    }

    async waitForSystems() {
        // Wait for critical systems to be ready (max 3 seconds)
        let attempts = 0;
        while (attempts < 30) {
            if (window.phoenixAPI && window.widgetManager) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        // Proceed anyway after 3 seconds
        return false;
    }

    async buildAppOpenContext() {
        const now = new Date();
        const hour = now.getHours();

        // Determine time of day
        let timeOfDay = 'morning';
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else if (hour >= 21 || hour < 6) timeOfDay = 'night';

        const context = {
            trigger: 'app_open',
            timeOfDay: timeOfDay,
            timestamp: now.toISOString(),
            hour: hour,
            dayOfWeek: now.getDay(),
            location: 'dashboard'
        };

        // Fetch quick metrics if API available (3-second timeout)
        if (window.phoenixAPI) {
            try {
                // Parallel fetch key metrics with 3s timeout
                const timeout = new Promise(resolve => setTimeout(() => resolve([null, null, null]), 3000));
                const fetches = Promise.all([
                    window.phoenixAPI.getMercuryRecoveryScore().catch(() => null),
                    window.phoenixAPI.getEarthTodaySchedule().catch(() => null),
                    window.phoenixAPI.getPhoenixInsights().catch(() => null)
                ]);

                const [recovery, calendar, insights] = await Promise.race([fetches, timeout]);

                if (recovery) context.recovery = recovery.score || null;
                if (calendar) context.upcomingEvents = calendar.events?.length || 0;
                if (insights) context.insights = insights.insights?.slice(0, 3) || [];
            } catch (error) {
                // Silent fail - context is optional
            }
        }

        return context;
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /* ============================================
       ORCHESTRATION - Get UI instructions from backend
       ============================================ */
    async orchestrate(context = {}, voiceQuery = null) {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) return null;

            // Throttle orchestration calls (max once per 5 seconds unless voice query)
            const now = Date.now();
            if (!voiceQuery && (now - this.lastOrchestrationTime) < 5000) {
                return this.orchestrationCache;
            }

            const requestBody = {
                context: {
                    time: new Date().toISOString(),
                    location: context.location || 'unknown',
                    activity: context.activity || 'unknown',
                    ...context
                },
                biometrics: this.biometricData
            };

            if (voiceQuery) {
                requestBody.voiceQuery = voiceQuery;
            }

            // 5-second timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${window.PhoenixConfig.API_BASE_URL}/interface/orchestrate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.success && data.orchestration) {
                this.orchestrationCache = data.orchestration;
                this.lastOrchestrationTime = now;
                return data.orchestration;
            }

            return null;

        } catch (error) {
            // Silent fail - orchestration is optional
            return null;
        }
    }

    /* ============================================
       BIOMETRIC UPDATE - Update consciousness with latest biometrics
       ============================================ */
    updateBiometrics(biometrics) {
        this.biometricData = {
            ...this.biometricData,
            ...biometrics,
            lastUpdated: new Date().toISOString()
        };

        console.log('[Consciousness] Biometrics updated:', this.biometricData);

        // Trigger re-orchestration if significant change
        if (this.shouldReOrchestrate(biometrics)) {
            console.log('[Consciousness] Significant biometric change detected, re-orchestrating...');
            this.orchestrate();
        }
    }

    shouldReOrchestrate(newBiometrics) {
        if (!this.biometricData) return true;

        // Re-orchestrate if recovery drops below 60 or rises above 80
        if (newBiometrics.recoveryScore) {
            const oldScore = this.biometricData.recoveryScore || 70;
            if ((oldScore >= 60 && newBiometrics.recoveryScore < 60) ||
                (oldScore < 80 && newBiometrics.recoveryScore >= 80)) {
                return true;
            }
        }

        // Re-orchestrate if HRV changes significantly (>15%)
        if (newBiometrics.hrv && this.biometricData.hrv) {
            const change = Math.abs(newBiometrics.hrv - this.biometricData.hrv) / this.biometricData.hrv;
            if (change > 0.15) return true;
        }

        return false;
    }

    /* ============================================
       INTERACTION LOGGING - Track user engagement
       ============================================ */
    async logInteraction(widgetId, action, additionalData = {}) {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) return;

            const interaction = {
                sessionId: this.sessionId,
                widgetId,
                action,
                context: {
                    time: new Date(),
                    timeOfDay: this.getTimeOfDay(),
                    displayedWidgets: additionalData.displayedWidgets || [],
                    layoutType: additionalData.layoutType || 'expanded'
                },
                dwellTime: additionalData.dwellTime || 0,
                interactionDepth: additionalData.interactionDepth || 0,
                outcome: additionalData.outcome || 'neutral',
                widgetData: additionalData.widgetData || {},
                biometrics: this.biometricData
            };

            await fetch(`${window.PhoenixConfig.API_BASE_URL}/interface/interaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(interaction)
            });

            console.log('[Consciousness] Interaction logged:', widgetId, action);

        } catch (error) {
            console.error('[Consciousness] Interaction logging error:', error);
        }
    }

    /* ============================================
       PREFERENCES - Get/Update user preferences
       ============================================ */
    async getPreferences() {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) return null;

            const response = await fetch(`${window.PhoenixConfig.API_BASE_URL}/interface/preferences`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.preferences;
            }

            return null;

        } catch (error) {
            console.error('[Consciousness] Get preferences error:', error);
            return null;
        }
    }

    async updatePreferences(preferences) {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) return false;

            const response = await fetch(`${window.PhoenixConfig.API_BASE_URL}/interface/preferences`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                console.log('[Consciousness] Preferences updated');
                // Re-orchestrate with new preferences
                this.orchestrate();
                return true;
            }

            return false;

        } catch (error) {
            console.error('[Consciousness] Update preferences error:', error);
            return false;
        }
    }

    async updateDayPriorities(day, priorities) {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) return false;

            const response = await fetch(`${window.PhoenixConfig.API_BASE_URL}/interface/priorities/${day}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ priorities })
            });

            if (response.ok) {
                console.log(`[Consciousness] ${day} priorities updated:`, priorities);
                return true;
            }

            return false;

        } catch (error) {
            console.error('[Consciousness] Update priorities error:', error);
            return false;
        }
    }

    /* ============================================
       UTILITIES
       ============================================ */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /* ============================================
       AUTO ORCHESTRATION - Periodic re-orchestration
       ============================================ */
    startAutoOrchestration(intervalMinutes = 5) {
        setInterval(() => {
            console.log('[Consciousness] Auto re-orchestration');
            this.orchestrate();
        }, intervalMinutes * 60 * 1000);

        console.log(`[Consciousness] Auto orchestration enabled (every ${intervalMinutes} minutes)`);
    }
}

// Initialize consciousness client
let consciousnessClient;

document.addEventListener('DOMContentLoaded', () => {
    consciousnessClient = new ConsciousnessClient();
    window.consciousnessClient = consciousnessClient;

    // Start auto re-orchestration every 5 minutes
    consciousnessClient.startAutoOrchestration(5);

    // Initial orchestration
    consciousnessClient.orchestrate();

    console.log('[Consciousness] Client ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConsciousnessClient;
}
