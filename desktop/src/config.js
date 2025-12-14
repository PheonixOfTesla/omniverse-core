/**
 * ============================================================================
 * PHOENIX CONFIGURATION - CENTRALIZED ENVIRONMENT DETECTION
 * ============================================================================
 *
 * Single source of truth for all environment-specific configuration.
 * Automatically detects localhost vs production.
 *
 * Usage:
 *   import { API_BASE_URL } from './config.js';
 *   // or in HTML:
 *   <script src="./src/config.js"></script>
 *   <script>
 *     console.log(PhoenixConfig.API_BASE_URL);
 *   </script>
 */

// Detect environment
const isLocalhost = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// API Base URL - FORCE Railway for testing (even on localhost)
const API_BASE_URL = 'https://pal-backend-production.up.railway.app/api';
// const API_BASE_URL = isLocalhost
//     ? 'http://localhost:5000/api'
//     : 'https://pal-backend-production.up.railway.app/api';

// Frontend URL (for callbacks, redirects, etc.)
const FRONTEND_URL = isLocalhost
    ? 'http://localhost:3000'
    : window.location.origin;

// Feature Flags
const FEATURES = {
    enableVoiceInterface: true,
    enableButler: true,
    enablePushNotifications: false, // Not yet implemented
    enableOfflineMode: false,        // Future feature
    debugMode: isLocalhost            // Auto-enable debug in local dev
};

// API Configuration
const API_CONFIG = {
    timeout: 30000,           // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000,         // 1 second
    cacheEnabled: true,
    cacheTTL: 300000          // 5 minutes
};

// Export for global window usage (for HTML script tags)
window.PhoenixConfig = {
    API_BASE_URL,
    FRONTEND_URL,
    FEATURES,
    API_CONFIG,
    isLocalhost,
    environment: isLocalhost ? 'development' : 'production'
};

// Log configuration in development
if (isLocalhost) {
    console.log('Phoenix Configuration Loaded:', {
        environment: 'development',
        API_BASE_URL,
        FRONTEND_URL,
        features: FEATURES
    });
}
