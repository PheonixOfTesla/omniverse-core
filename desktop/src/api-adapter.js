/**
 * API ADAPTER FOR OMNIVERSE
 *
 * Routes API calls between:
 * - Tauri local backend (when running in desktop app)
 * - Cloud backend (when running in browser or user preference)
 *
 * Exposes same interface as Phoenix api.js
 */

const API_CONFIG = {
    CLOUD_BASE_URL: 'https://pal-backend-production.up.railway.app',
    USE_CLOUD_FALLBACK: true,
    DEBUG: false  // Set to true only for development
};

// Detect if running in Tauri
const isTauri = () => {
    return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
};

// Get stored preference
const getPreferredBackend = () => {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('omniverse_backend_preference') || 'auto';
    }
    return 'auto';
};

// Set backend preference
const setBackendPreference = (preference) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('omniverse_backend_preference', preference);
    }
};

/**
 * Make API request with automatic routing
 */
async function apiRequest(endpoint, options = {}) {
    const preference = getPreferredBackend();
    const useTauri = isTauri() && (preference === 'auto' || preference === 'local');

    if (API_CONFIG.DEBUG) {
        console.log(`[API Adapter] ${endpoint}`, {
            isTauri: isTauri(),
            preference,
            useTauri,
            method: options.method || 'GET'
        });
    }

    try {
        if (useTauri) {
            // Use Tauri invoke for local backend
            return await invokeLocal(endpoint, options);
        } else {
            // Use cloud backend
            return await invokeCloud(endpoint, options);
        }
    } catch (error) {
        console.error(`[API Adapter] Error on ${endpoint}:`, error);

        // Fallback to cloud if local fails
        if (useTauri && API_CONFIG.USE_CLOUD_FALLBACK) {
            console.warn('[API Adapter] Local failed, falling back to cloud');
            return await invokeCloud(endpoint, options);
        }

        throw error;
    }
}

/**
 * Invoke local Tauri backend
 */
async function invokeLocal(endpoint, options) {
    const { invoke } = window.__TAURI__.tauri;

    // Map HTTP-style requests to Tauri commands
    const command = endpointToCommand(endpoint, options.method);
    const params = options.body ? JSON.parse(options.body) : {};

    if (API_CONFIG.DEBUG) {
        console.log(`[Tauri] Invoking: ${command}`, params);
    }

    const result = await invoke(command, params);
    return result;
}

/**
 * Invoke cloud backend via HTTP
 */
async function invokeCloud(endpoint, options) {
    const url = `${API_CONFIG.CLOUD_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add auth token if available
    const token = localStorage.getItem('phoenixToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (API_CONFIG.DEBUG) {
        console.log(`[Cloud] Fetching: ${url}`);
    }

    const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Map REST endpoints to Tauri commands
 */
function endpointToCommand(endpoint, method = 'GET') {
    // Remove leading slash
    endpoint = endpoint.replace(/^\//, '');

    // Map common patterns
    const mappings = {
        'health': 'health',
        'query': 'query',
        'initialize': 'initialize',
        'verify-genesis': 'verify_genesis',
        'export-data': 'export_data',
        'get-genesis-hash': 'get_genesis_hash',

        // Phoenix-specific endpoints
        'ai/query': 'ai_query',
        'ai/stream': 'ai_stream',
        'voice/synthesize': 'tts_synthesize',
        'voice/transcribe': 'stt_transcribe',

        // Health endpoints
        'health/recovery': 'get_recovery',
        'health/sleep': 'get_sleep',
        'health/hrv': 'get_hrv',

        // Calendar endpoints
        'calendar/events': 'get_calendar_events',
        'calendar/sync': 'sync_calendar',

        // Goals endpoints
        'goals/list': 'get_goals',
        'goals/create': 'create_goal',
        'goals/update': 'update_goal',

        // Finance endpoints
        'finance/accounts': 'get_accounts',
        'finance/transactions': 'get_transactions',
        'finance/sync': 'sync_plaid'
    };

    return mappings[endpoint] || endpoint.replace(/\//g, '_');
}

/**
 * PHOENIX API COMPATIBILITY LAYER
 * Exposes same functions as original api.js
 */

// AI Queries
async function askPhoenix(prompt, options = {}) {
    return await apiRequest('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt, ...options })
    });
}

async function streamPhoenix(prompt, onChunk, options = {}) {
    const preference = getPreferredBackend();
    const useTauri = isTauri() && (preference === 'auto' || preference === 'local');

    if (useTauri) {
        // Tauri doesn't support streaming yet, use regular query
        const result = await apiRequest('/ai/query', {
            method: 'POST',
            body: JSON.stringify({ prompt, ...options })
        });
        onChunk(result.response);
        return result;
    } else {
        // Use cloud streaming
        const response = await fetch(`${API_CONFIG.CLOUD_BASE_URL}/ai/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('phoenixToken')}`
            },
            body: JSON.stringify({ prompt, ...options })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            onChunk(chunk);
        }
    }
}

// Voice
async function synthesizeSpeech(text, voice = 'nova') {
    return await apiRequest('/voice/synthesize', {
        method: 'POST',
        body: JSON.stringify({ text, voice })
    });
}

async function transcribeSpeech(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    return await apiRequest('/voice/transcribe', {
        method: 'POST',
        body: formData
    });
}

// Health
async function getRecoveryScore() {
    return await apiRequest('/health/recovery');
}

async function getSleepData() {
    return await apiRequest('/health/sleep');
}

async function getHRVData() {
    return await apiRequest('/health/hrv');
}

// Calendar
async function getCalendarEvents(startDate, endDate) {
    return await apiRequest(`/calendar/events?start=${startDate}&end=${endDate}`);
}

async function syncCalendar() {
    return await apiRequest('/calendar/sync', { method: 'POST' });
}

// Goals
async function getGoals() {
    return await apiRequest('/goals/list');
}

async function createGoal(goalData) {
    return await apiRequest('/goals/create', {
        method: 'POST',
        body: JSON.stringify(goalData)
    });
}

async function updateGoal(goalId, updates) {
    return await apiRequest(`/goals/update`, {
        method: 'PUT',
        body: JSON.stringify({ goalId, ...updates })
    });
}

// Finance
async function getAccounts() {
    return await apiRequest('/finance/accounts');
}

async function getTransactions(accountId, startDate, endDate) {
    return await apiRequest(`/finance/transactions?account=${accountId}&start=${startDate}&end=${endDate}`);
}

async function syncPlaid() {
    return await apiRequest('/finance/sync', { method: 'POST' });
}

// Export API
window.OmniverseAPI = {
    // Config
    config: API_CONFIG,
    setBackendPreference,
    getPreferredBackend,
    isTauri,

    // Core
    request: apiRequest,

    // AI
    askPhoenix,
    streamPhoenix,

    // Voice
    synthesizeSpeech,
    transcribeSpeech,

    // Health
    getRecoveryScore,
    getSleepData,
    getHRVData,

    // Calendar
    getCalendarEvents,
    syncCalendar,

    // Goals
    getGoals,
    createGoal,
    updateGoal,

    // Finance
    getAccounts,
    getTransactions,
    syncPlaid
};

console.log('[API Adapter] Initialized', {
    isTauri: isTauri(),
    preference: getPreferredBackend(),
    cloudURL: API_CONFIG.CLOUD_BASE_URL
});
