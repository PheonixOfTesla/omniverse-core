/**
 * ============================================================================
 * PHOENIX WEBSOCKET MANAGER - GOD-LEVEL REAL-TIME CONSCIOUSNESS
 * ============================================================================
 *
 * Handles all real-time communication:
 * - AI streaming (Gemini 3 responses)
 * - Live data (sports, stocks, weather)
 * - Proactive consciousness (suggestions)
 * - Planet system syncing (Mercury, Venus, Earth, Mars, Jupiter)
 */

class PhoenixSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Connect to Phoenix backend WebSocket
     */
    async connect(token) {
        if (this.connected) {
            console.log('[Phoenix Socket] Already connected');
            return;
        }

        const apiUrl = (window.PhoenixConfig?.API_BASE_URL || 'https://pal-backend-production.up.railway.app/api').replace('/api', '');

        console.log('[Phoenix Socket] Connecting to:', apiUrl);

        // Dynamically import Socket.io client
        const { io } = await import('https://cdn.socket.io/4.7.2/socket.io.esm.min.js');

        this.socket = io(apiUrl, {
            auth: { token },
            transports: ['websocket', 'polling'], // WebSocket preferred, polling fallback
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 10000
        });

        this.setupConnectionHandlers();
        this.setupEventListeners();
    }

    /**
     * Connection lifecycle handlers
     */
    setupConnectionHandlers() {
        this.socket.on('connect', () => {
            console.log('✅ [Phoenix Socket] Connected - Real-time consciousness active');
            this.connected = true;
            this.reconnectAttempts = 0;

            // Authenticate
            const token = localStorage.getItem('phoenixToken');
            this.socket.emit('authenticate', token);
        });

        this.socket.on('authenticated', (data) => {
            console.log('🔐 [Phoenix Socket] Authenticated:', data.userId);

            // Enable consciousness engine
            this.enableConsciousness();

            // Sync all planet systems
            this.syncAllPlanets();

            // Trigger connected event
            this.trigger('connected', data);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('⚠️  [Phoenix Socket] Disconnected:', reason);
            this.connected = false;
            this.trigger('disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ [Phoenix Socket] Connection error:', error.message);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ [Phoenix Socket] Max reconnection attempts reached. Falling back to HTTP.');
                this.trigger('connection-failed', { error });
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 [Phoenix Socket] Reconnected after ${attemptNumber} attempts`);
            this.trigger('reconnected', { attemptNumber });
        });
    }

    /**
     * Setup event listeners for all real-time data
     */
    setupEventListeners() {
        // ============================================
        // AI STREAMING (Gemini 3)
        // ============================================
        this.socket.on('phoenix-thinking', (data) => {
            console.log('🧠 Phoenix is thinking...');
            this.trigger('ai-thinking', data);
        });

        this.socket.on('phoenix-response-chunk', (data) => {
            // Stream response chunk by chunk (ChatGPT-style)
            this.trigger('ai-chunk', data);
        });

        this.socket.on('phoenix-response-complete', (data) => {
            console.log('✅ Phoenix response complete');
            this.trigger('ai-complete', data);
        });

        this.socket.on('phoenix-error', (data) => {
            console.error('❌ Phoenix error:', data.error);
            this.trigger('ai-error', data);
        });

        // ============================================
        // COMPLEX QUERIES (Multi-step streaming)
        // ============================================
        this.socket.on('progress', (data) => {
            console.log(`📊 Progress: Step ${data.step} - ${data.message}`);
            this.trigger('query-progress', data);
        });

        this.socket.on('plan-ready', (data) => {
            console.log('✅ Plan generated');
            this.trigger('plan-ready', data);
        });

        // ============================================
        // REAL-TIME DATA STREAMS
        // ============================================

        // Sports scores
        this.socket.on('game-update', (data) => {
            console.log(`🏈 Game update: Q${data.score.quarter}`);
            this.trigger('sports-update', data);
        });

        this.socket.on('game-final', (data) => {
            console.log('🏁 Game final:', data.finalScore);
            this.trigger('sports-final', data);
        });

        // Stock prices
        this.socket.on('stock-update', (data) => {
            this.trigger('stock-update', data);
        });

        this.socket.on('stock-alert', (data) => {
            console.log(`💰 Stock alert: ${data.message}`);
            this.trigger('stock-alert', data);
        });

        // Calendar changes
        this.socket.on('calendar-update', (data) => {
            console.log(`📅 Calendar ${data.type}:`, data.event.summary);
            this.trigger('calendar-change', data);
        });

        // Weather updates
        this.socket.on('weather-update', (data) => {
            this.trigger('weather-update', data);
        });

        // ============================================
        // CONSCIOUSNESS ENGINE
        // ============================================
        this.socket.on('proactive-suggestion', (data) => {
            console.log('💡 Proactive suggestion:', data.message);
            this.trigger('suggestion', data);
        });

        this.socket.on('layout-update', (data) => {
            console.log('🎨 Widget layout updated');
            this.trigger('widget-layout', data);
        });

        // ============================================
        // PLANET SYSTEM UPDATES
        // ============================================
        this.socket.on('mercury-update', (data) => {
            console.log('💪 Mercury (Health) updated');
            this.trigger('mercury', data);
        });

        this.socket.on('venus-update', (data) => {
            console.log('🍽️ Venus (Nutrition/Fitness) updated');
            this.trigger('venus', data);
        });

        this.socket.on('earth-update', (data) => {
            console.log('🌍 Earth (Calendar) updated');
            this.trigger('earth', data);
        });

        this.socket.on('mars-update', (data) => {
            console.log('🎯 Mars (Goals) updated');
            this.trigger('mars', data);
        });

        this.socket.on('jupiter-update', (data) => {
            console.log('💰 Jupiter (Finance) updated');
            this.trigger('jupiter', data);
        });
    }

    // ============================================
    // EVENT SUBSCRIPTION (Pub/Sub pattern)
    // ============================================

    /**
     * Subscribe to events
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from events
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    /**
     * Trigger event
     */
    trigger(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    // ============================================
    // EMIT EVENTS TO SERVER
    // ============================================

    /**
     * Ask Phoenix AI a question (streaming response)
     */
    askPhoenix(message, personality = 'friendly_helpful') {
        if (!this.connected) {
            console.warn('⚠️  Socket not connected, falling back to HTTP');
            return false;
        }

        console.log('🎤 Asking Phoenix:', message);
        this.socket.emit('ask-phoenix', { message, personality });
        return true;
    }

    /**
     * Complex multi-step query
     */
    complexQuery(query, context = {}) {
        if (!this.connected) return false;

        console.log('🔍 Complex query:', query);
        this.socket.emit('complex-query', { query, context });
        return true;
    }

    /**
     * Track live sports game
     */
    trackGame(gameId) {
        if (!this.connected) return false;

        console.log('🏈 Tracking game:', gameId);
        this.socket.emit('track-game', { gameId });
        return true;
    }

    /**
     * Track stock price with alert
     */
    trackStock(symbol, alertPrice = null) {
        if (!this.connected) return false;

        console.log('📈 Tracking stock:', symbol);
        this.socket.emit('track-stock', { symbol, alertPrice });
        return true;
    }

    /**
     * Watch calendar for changes
     */
    watchCalendar() {
        if (!this.connected) return false;

        console.log('📅 Watching calendar');
        this.socket.emit('watch-calendar');
        return true;
    }

    /**
     * Track weather updates
     */
    trackWeather(location) {
        if (!this.connected) return false;

        this.socket.emit('track-weather', { location });
        return true;
    }

    /**
     * Enable consciousness engine (proactive suggestions)
     */
    enableConsciousness() {
        if (!this.connected) return false;

        console.log('🧠 Enabling consciousness engine');
        this.socket.emit('enable-consciousness');
        return true;
    }

    /**
     * Request widget layout orchestration
     */
    requestLayout() {
        if (!this.connected) return false;

        this.socket.emit('request-layout');
        return true;
    }

    /**
     * Sync all planet systems
     */
    syncAllPlanets() {
        if (!this.connected) return false;

        console.log('🌍 Syncing all planet systems');
        this.socket.emit('sync-mercury');
        this.socket.emit('sync-venus');
        this.socket.emit('sync-earth');
        this.socket.emit('sync-mars');
        this.socket.emit('sync-jupiter');
        return true;
    }

    /**
     * Sync specific planet
     */
    syncPlanet(planet) {
        if (!this.connected) return false;

        const planetMap = {
            'mercury': 'sync-mercury',
            'venus': 'sync-venus',
            'earth': 'sync-earth',
            'mars': 'sync-mars',
            'jupiter': 'sync-jupiter'
        };

        const event = planetMap[planet.toLowerCase()];
        if (event) {
            this.socket.emit(event);
            return true;
        }
        return false;
    }

    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            console.log('👋 [Phoenix Socket] Disconnecting');
            this.socket.disconnect();
            this.connected = false;
        }
    }

    /**
     * Check connection status
     */
    isConnected() {
        return this.connected;
    }
}

// ============================================
// EXPORT GLOBAL INSTANCE
// ============================================
window.PhoenixSocket = window.PhoenixSocket || new PhoenixSocketManager();

console.log('🚀 Phoenix WebSocket Manager loaded');
