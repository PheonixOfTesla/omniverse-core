/**
 * ============================================================================
 * OMNIVERSE AI - SOVEREIGN LOCAL INFERENCE
 * ============================================================================
 *
 * Routes AI queries through local Ollama via Tauri.
 * Cloud is NEVER used silently - explicit user consent required.
 *
 * "Your AI, your device, no cloud required."
 */

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

let initialized = false;
let ollamaStatus = {
    installed: false,
    running: false,
    models: [],
    currentModel: 'llama2'
};

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize the Omniverse AI system
 * Checks Ollama status and sets up local inference
 */
async function initOmniverseAI() {
    if (!window.__TAURI__) {
        console.warn('[OmniverseAI] Not running in Tauri - AI features disabled');
        return false;
    }

    const { invoke } = window.__TAURI__.tauri;

    try {
        // Check Ollama status
        const status = await invoke('check_ollama');
        ollamaStatus.installed = status.installed;
        ollamaStatus.running = status.running;

        if (!status.installed) {
            console.warn('[OmniverseAI] Ollama not installed');
            showInstallPrompt(status.message);
            return false;
        }

        if (!status.running) {
            console.warn('[OmniverseAI] Ollama not running');
            showStartPrompt();
            return false;
        }

        // List available models
        const modelsResult = await invoke('list_models');
        ollamaStatus.models = modelsResult.models;

        if (ollamaStatus.models.length === 0) {
            console.warn('[OmniverseAI] No models installed');
            showModelPrompt();
            return false;
        }

        // Set default model (prefer llama2, qwen2, or first available)
        ollamaStatus.currentModel = ollamaStatus.models.find(m =>
            m.includes('llama2') || m.includes('qwen2') || m.includes('mistral')
        ) || ollamaStatus.models[0];

        // Update config state
        if (window.PhoenixConfig) {
            window.PhoenixConfig.setOllamaAvailable(true);
            window.PhoenixConfig.setOllamaModels(ollamaStatus.models);
            window.PhoenixConfig.setInferenceMode(window.PhoenixConfig.INFERENCE_MODE.LOCAL);
        }

        initialized = true;
        console.log('%c[OmniverseAI] Ready - LOCAL mode', 'color: #00ff00; font-weight: bold');
        console.log('  Model:', ollamaStatus.currentModel);
        console.log('  Available:', ollamaStatus.models.join(', '));

        // Show status indicator
        updateStatusIndicator('local');

        return true;

    } catch (error) {
        console.error('[OmniverseAI] Init failed:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// QUERY - LOCAL INFERENCE
// ═══════════════════════════════════════════════════════════════

/**
 * Query the local AI
 * @param {string} prompt - The user's prompt
 * @param {object} options - Query options
 * @returns {Promise<{response: string, model: string, latency: number}>}
 */
async function query(prompt, options = {}) {
    if (!window.__TAURI__) {
        throw new Error('OmniverseAI requires Tauri runtime');
    }

    // Check if we should use cloud fallback
    if (!ollamaStatus.running && window.PhoenixConfig?.isCloudFallbackEnabled()) {
        console.warn('[OmniverseAI] Using cloud fallback - data leaving device');
        updateStatusIndicator('cloud');
        return queryCloud(prompt, options);
    }

    if (!ollamaStatus.running) {
        throw new Error('Ollama not running. Start it with: ollama serve');
    }

    const { invoke } = window.__TAURI__.tauri;
    const model = options.model || ollamaStatus.currentModel;

    // Prepend system prompt if provided (Ollama accepts this format)
    let fullPrompt = prompt;
    if (options.system) {
        fullPrompt = `[SYSTEM]\n${options.system}\n[/SYSTEM]\n\n[USER]\n${prompt}\n[/USER]`;
    }

    const start = Date.now();

    try {
        const result = await invoke('query', {
            prompt: fullPrompt,
            model: model
        });

        return {
            response: result.response,
            model: result.model,
            latency: result.latency_ms,
            mode: 'local',
            cached: result.cached
        };

    } catch (error) {
        // If local fails and cloud fallback is enabled, try cloud
        if (window.PhoenixConfig?.isCloudFallbackEnabled()) {
            console.warn('[OmniverseAI] Local failed, trying cloud:', error.message);
            updateStatusIndicator('cloud');
            return queryCloud(prompt, options);
        }
        throw error;
    }
}

/**
 * Query cloud API (only when explicitly enabled)
 */
async function queryCloud(prompt, options = {}) {
    updateStatusIndicator('cloud');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Note: API key must be provided by user at runtime
            'Authorization': `Bearer ${options.apiKey || window.OPENROUTER_KEY}`
        },
        body: JSON.stringify({
            model: options.cloudModel || 'moonshotai/kimi-k2',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 4096
        })
    });

    if (!response.ok) {
        throw new Error(`Cloud API error: ${response.status}`);
    }

    const data = await response.json();

    return {
        response: data.choices[0]?.message?.content || '',
        model: data.model,
        latency: 0,
        mode: 'cloud',
        cached: false
    };
}

// ═══════════════════════════════════════════════════════════════
// STREAMING QUERY
// ═══════════════════════════════════════════════════════════════

/**
 * Query with streaming response
 * @param {string} prompt - The user's prompt
 * @param {function} onToken - Callback for each token
 * @param {object} options - Query options
 */
async function queryStream(prompt, onToken, options = {}) {
    if (!window.__TAURI__) {
        throw new Error('OmniverseAI requires Tauri runtime');
    }

    if (!ollamaStatus.running) {
        throw new Error('Ollama not running. Start it with: ollama serve');
    }

    const { invoke } = window.__TAURI__.tauri;
    const { listen } = window.__TAURI__.event;
    const model = options.model || ollamaStatus.currentModel;

    // Listen for streaming tokens
    const unlisten = await listen('ai-token', (event) => {
        onToken(event.payload);
    });

    try {
        const result = await invoke('query', {
            prompt: prompt,
            model: model
        });

        return result;

    } finally {
        unlisten();
    }
}

// ═══════════════════════════════════════════════════════════════
// STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Update the status indicator in the UI
 */
function updateStatusIndicator(mode) {
    let indicator = document.getElementById('omniverse-status-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'omniverse-status-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 12px;
            font-weight: 600;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        indicator.title = 'Click for inference details';
        indicator.onclick = showInferenceDetails;
        document.body.appendChild(indicator);
    }

    if (mode === 'local') {
        indicator.innerHTML = `
            <span style="width: 8px; height: 8px; background: #00ff00; border-radius: 50%;"></span>
            LOCAL
        `;
        indicator.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
        indicator.style.color = '#00ff00';
        indicator.style.border = '1px solid #00ff00';
    } else if (mode === 'cloud') {
        indicator.innerHTML = `
            <span style="width: 8px; height: 8px; background: #ff6600; border-radius: 50%;"></span>
            CLOUD
        `;
        indicator.style.background = 'linear-gradient(135deg, #2e1a1a, #3e2116)';
        indicator.style.color = '#ff6600';
        indicator.style.border = '1px solid #ff6600';
    } else {
        indicator.innerHTML = `
            <span style="width: 8px; height: 8px; background: #888; border-radius: 50%;"></span>
            OFFLINE
        `;
        indicator.style.background = '#222';
        indicator.style.color = '#888';
        indicator.style.border = '1px solid #444';
    }
}

/**
 * Show inference details dialog
 */
function showInferenceDetails() {
    const mode = window.PhoenixConfig?.getCurrentInferenceMode() || 'unknown';

    let details = `OMNIVERSE INFERENCE STATUS\n\n`;
    details += `Mode: ${mode.toUpperCase()}\n`;
    details += `Ollama Installed: ${ollamaStatus.installed ? 'Yes' : 'No'}\n`;
    details += `Ollama Running: ${ollamaStatus.running ? 'Yes' : 'No'}\n`;

    if (ollamaStatus.models.length > 0) {
        details += `\nAvailable Models:\n`;
        ollamaStatus.models.forEach(m => {
            details += `  - ${m}${m === ollamaStatus.currentModel ? ' (active)' : ''}\n`;
        });
    }

    details += `\nCloud Fallback: ${window.PhoenixConfig?.isCloudFallbackEnabled() ? 'ENABLED' : 'DISABLED'}`;

    alert(details);
}

// ═══════════════════════════════════════════════════════════════
// PROMPTS
// ═══════════════════════════════════════════════════════════════

function showInstallPrompt(message) {
    const div = document.createElement('div');
    div.id = 'ollama-install-prompt';
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a2e;
        border: 1px solid #00ff00;
        border-radius: 12px;
        padding: 32px;
        max-width: 500px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: #fff;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    div.innerHTML = `
        <h2 style="margin: 0 0 16px; color: #00ff00;">Ollama Required</h2>
        <p style="margin: 0 0 24px; color: #ccc; white-space: pre-wrap;">${message}</p>
        <p style="margin: 0 0 24px; color: #888; font-size: 14px;">
            Omniverse requires Ollama for sovereign local AI inference.
            Your data never leaves your device.
        </p>
        <button onclick="this.parentElement.remove()" style="
            background: #00ff00;
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
        ">Got it</button>
    `;
    document.body.appendChild(div);
    updateStatusIndicator('offline');
}

function showStartPrompt() {
    const div = document.createElement('div');
    div.id = 'ollama-start-prompt';
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a2e;
        border: 1px solid #00ff00;
        border-radius: 12px;
        padding: 32px;
        max-width: 400px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: #fff;
    `;
    div.innerHTML = `
        <h2 style="margin: 0 0 16px; color: #00ff00;">Start Ollama</h2>
        <p style="margin: 0 0 24px; color: #ccc;">
            Ollama is installed but not running.
        </p>
        <code style="
            display: block;
            background: #000;
            padding: 12px;
            border-radius: 6px;
            margin: 0 0 24px;
            color: #00ff00;
        ">ollama serve</code>
        <button onclick="this.parentElement.remove(); initOmniverseAI();" style="
            background: #00ff00;
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
        ">Retry</button>
    `;
    document.body.appendChild(div);
    updateStatusIndicator('offline');
}

function showModelPrompt() {
    const div = document.createElement('div');
    div.id = 'ollama-model-prompt';
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a2e;
        border: 1px solid #00ff00;
        border-radius: 12px;
        padding: 32px;
        max-width: 400px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: #fff;
    `;
    div.innerHTML = `
        <h2 style="margin: 0 0 16px; color: #00ff00;">Pull a Model</h2>
        <p style="margin: 0 0 24px; color: #ccc;">
            Ollama is running but no models are installed.
        </p>
        <code style="
            display: block;
            background: #000;
            padding: 12px;
            border-radius: 6px;
            margin: 0 0 24px;
            color: #00ff00;
        ">ollama pull llama2</code>
        <button onclick="this.parentElement.remove(); initOmniverseAI();" style="
            background: #00ff00;
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
        ">Retry</button>
    `;
    document.body.appendChild(div);
    updateStatusIndicator('offline');
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

window.OmniverseAI = {
    init: initOmniverseAI,
    query,
    queryStream,
    getStatus: () => ollamaStatus,
    isReady: () => initialized && ollamaStatus.running,
    setModel: (model) => {
        if (ollamaStatus.models.includes(model)) {
            ollamaStatus.currentModel = model;
            return true;
        }
        return false;
    },
    updateStatusIndicator
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOmniverseAI);
} else {
    initOmniverseAI();
}
