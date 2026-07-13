/**
 * ============================================================================
 * OMNIVERSE CONFIGURATION - SOVEREIGN LOCAL-FIRST
 * ============================================================================
 *
 * Core principle: LOCAL inference by default. Cloud is opt-in, never silent.
 * When running in Tauri, ALL AI queries route through local Ollama.
 * Cloud fallback requires explicit user consent.
 *
 * "Your AI, your device, no cloud required."
 */

// Detect environment
const isLocalhost = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// Detect Tauri (Omniverse desktop)
const isTauri = window.__TAURI__ !== undefined;
const isOmniverse = isTauri || window.location.protocol === 'tauri:';

// ═══════════════════════════════════════════════════════════════
// INFERENCE MODE - LOCAL FIRST
// ═══════════════════════════════════════════════════════════════

// Inference modes
const INFERENCE_MODE = {
    LOCAL: 'local',      // Ollama on device - no network
    CLOUD: 'cloud',      // OpenRouter API - explicit opt-in
    UNKNOWN: 'unknown'   // Not yet determined
};

// Current inference state (will be updated by status checks)
let currentInferenceMode = isOmniverse ? INFERENCE_MODE.LOCAL : INFERENCE_MODE.UNKNOWN;
let ollamaAvailable = false;
let ollamaModels = [];

// Cloud fallback - DISABLED by default in Omniverse
// User must explicitly enable this in settings
let cloudFallbackEnabled = false;

// ═══════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Cloud API (only used when explicitly enabled)
const CLOUD_API_URL = 'https://pal-backend-production.up.railway.app/api';

// Local API (for non-AI features when needed)
const LOCAL_API_URL = isLocalhost ? 'http://localhost:5000/api' : null;

// In Omniverse mode, we use Tauri invoke() for AI, not HTTP APIs
const API_BASE_URL = isOmniverse ? null : CLOUD_API_URL;

// Frontend URL (for callbacks, redirects, etc.)
const FRONTEND_URL = isLocalhost
    ? 'http://localhost:3000'
    : window.location.origin;

// ═══════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════

const FEATURES = {
    enableVoiceInterface: true,
    enableButler: true,
    enablePushNotifications: false,
    enableOfflineMode: isOmniverse,     // ENABLED in Omniverse
    enableLocalInference: isOmniverse,  // Use Ollama when available
    cloudFallbackEnabled: false,        // Cloud fallback OFF by default
    debugMode: isLocalhost
};

// ═══════════════════════════════════════════════════════════════
// API CONFIG
// ═══════════════════════════════════════════════════════════════

const API_CONFIG = {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheEnabled: true,
    cacheTTL: 300000
};

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

window.PhoenixConfig = {
    // URLs
    API_BASE_URL,
    CLOUD_API_URL,
    LOCAL_API_URL,
    FRONTEND_URL,

    // Environment
    isLocalhost,
    isTauri,
    isOmniverse,
    environment: isOmniverse ? 'omniverse' : (isLocalhost ? 'development' : 'production'),

    // Inference
    INFERENCE_MODE,
    getCurrentInferenceMode: () => currentInferenceMode,
    setInferenceMode: (mode) => { currentInferenceMode = mode; },
    isOllamaAvailable: () => ollamaAvailable,
    setOllamaAvailable: (available) => { ollamaAvailable = available; },
    getOllamaModels: () => ollamaModels,
    setOllamaModels: (models) => { ollamaModels = models; },

    // Cloud fallback
    isCloudFallbackEnabled: () => cloudFallbackEnabled,
    enableCloudFallback: () => {
        console.warn('[Omniverse] Cloud fallback enabled - queries may leave device');
        cloudFallbackEnabled = true;
        currentInferenceMode = INFERENCE_MODE.CLOUD;
    },
    disableCloudFallback: () => {
        console.log('[Omniverse] Cloud fallback disabled - all queries stay local');
        cloudFallbackEnabled = false;
        if (ollamaAvailable) {
            currentInferenceMode = INFERENCE_MODE.LOCAL;
        }
    },

    // Features & Config
    FEATURES,
    API_CONFIG
};

// ═══════════════════════════════════════════════════════════════
// STARTUP LOG
// ═══════════════════════════════════════════════════════════════

if (isOmniverse) {
    console.log('%c[OMNIVERSE] Sovereign Mode Active', 'color: #00ff00; font-weight: bold');
    console.log('  - AI inference: LOCAL (Ollama)');
    console.log('  - Cloud fallback: DISABLED');
    console.log('  - Your data stays on this device.');
} else if (isLocalhost) {
    console.log('[Phoenix] Development mode');
    console.log('  - API:', API_BASE_URL);
}
