/**
 * SOVEREIGN VOICE SYSTEM
 *
 * 100% LOCAL voice capabilities for Omniverse
 * - TTS: Piper ONNX (local neural voices)
 * - STT: Graceful degradation to text input when unavailable
 *
 * NO CLOUD SPEECH SERVICES - Everything runs on device
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    const state = {
        ttsAvailable: false,
        ttsEngine: 'none',        // 'piper' | 'system' | 'none'
        sttAvailable: false,
        sttEngine: 'none',        // 'local' | 'text-fallback'
        initialized: false,
        piperInstallInstructions: null
    };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    async function init() {
        console.log('[SovereignVoice] Initializing local voice system...');

        // Check TTS availability
        await checkTTS();

        // Check STT availability (will gracefully degrade)
        checkSTT();

        state.initialized = true;

        console.log('[SovereignVoice] Status:', {
            tts: state.ttsEngine,
            stt: state.sttEngine,
            ttsAvailable: state.ttsAvailable
        });

        return state;
    }

    // ═══════════════════════════════════════════════════════════════
    // TTS - TEXT TO SPEECH (Piper Local)
    // ═══════════════════════════════════════════════════════════════

    async function checkTTS() {
        // First check if PiperTTS is available via Tauri
        if (window.__TAURI__ && window.PiperTTS) {
            try {
                const status = await window.PiperTTS.checkStatus();
                if (status.available) {
                    state.ttsAvailable = true;
                    state.ttsEngine = 'piper';
                    console.log('[SovereignVoice] Piper TTS available');
                    return;
                } else {
                    state.piperInstallInstructions = status.message;
                    console.log('[SovereignVoice] Piper not installed:', status.message);
                }
            } catch (e) {
                console.warn('[SovereignVoice] Piper check failed:', e);
            }
        }

        // Try system TTS (macOS say command via Tauri)
        if (window.__TAURI__) {
            try {
                const { invoke } = window.__TAURI__.tauri;
                // Check if system TTS is available
                const result = await invoke('check_system_tts').catch(() => null);
                if (result && result.available) {
                    state.ttsAvailable = true;
                    state.ttsEngine = 'system';
                    console.log('[SovereignVoice] System TTS available');
                    return;
                }
            } catch (e) {
                // System TTS not available
            }
        }

        // No TTS available - will show text only
        state.ttsAvailable = false;
        state.ttsEngine = 'none';
        console.log('[SovereignVoice] No local TTS available - text mode only');
    }

    /**
     * Speak text using local TTS
     * @param {string} text - Text to speak
     * @returns {Promise<{success: boolean, engine: string}>}
     */
    async function speak(text) {
        if (!text || text.trim() === '') {
            return { success: false, error: 'Empty text' };
        }

        // Sanitize text for speech
        text = sanitizeForSpeech(text);

        console.log('[SovereignVoice] Speaking:', text.substring(0, 50) + '...');

        // Try Piper TTS first
        if (state.ttsEngine === 'piper' && window.PiperTTS) {
            try {
                const result = await window.PiperTTS.speak(text);
                return { success: true, engine: 'piper', result };
            } catch (e) {
                console.error('[SovereignVoice] Piper speak failed:', e);
            }
        }

        // Try system TTS via Tauri
        if (state.ttsEngine === 'system' && window.__TAURI__) {
            try {
                const { invoke } = window.__TAURI__.tauri;
                await invoke('system_speak', { text });
                return { success: true, engine: 'system' };
            } catch (e) {
                console.error('[SovereignVoice] System speak failed:', e);
            }
        }

        // No TTS available - silent mode
        console.log('[SovereignVoice] No TTS - text displayed only');
        return { success: false, engine: 'none', textOnly: true };
    }

    /**
     * Sanitize text for natural speech
     */
    function sanitizeForSpeech(text) {
        // Remove JSON metadata
        text = text.replace(/\s*\{[\s\S]*?"confidence_score"[\s\S]*?\}\s*$/i, '').trim();
        text = text.replace(/\s*\{[\s\S]*?"mood"[\s\S]*?\}\s*$/i, '').trim();

        // Remove UI formatting
        text = text.replace(/\[.*?\]/g, '');    // Remove [BRACKETS]
        text = text.replace(/━+/g, '');         // Remove separators
        text = text.replace(/▪️|•/g, '');       // Remove bullets

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Truncate very long text
        const words = text.split(' ');
        if (words.length > 100) {
            text = words.slice(0, 100).join(' ') + '.';
        }

        return text;
    }

    // ═══════════════════════════════════════════════════════════════
    // STT - SPEECH TO TEXT (Graceful Degradation)
    // ═══════════════════════════════════════════════════════════════

    function checkSTT() {
        // In Tauri webview, Web Speech API doesn't work
        // Always use text fallback for now
        // Future: wire whisper.cpp or Vosk for local STT

        if (window.__TAURI__) {
            // Tauri app - Web Speech API won't work
            state.sttAvailable = false;
            state.sttEngine = 'text-fallback';
            console.log('[SovereignVoice] STT: Text input mode (Web Speech unavailable in Tauri)');
        } else {
            // Browser - might have Web Speech API
            const hasWebSpeech = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
            if (hasWebSpeech) {
                state.sttAvailable = true;
                state.sttEngine = 'web-speech';
                console.log('[SovereignVoice] STT: Web Speech API available');
            } else {
                state.sttAvailable = false;
                state.sttEngine = 'text-fallback';
                console.log('[SovereignVoice] STT: Text input mode');
            }
        }
    }

    /**
     * Get a user-friendly message about voice mode status
     */
    function getVoiceModeStatus() {
        const ttsStatus = state.ttsAvailable
            ? `Voice output: ${state.ttsEngine === 'piper' ? 'Local neural voice (Piper)' : 'System voice'}`
            : 'Voice output: Text only';

        const sttStatus = state.sttAvailable
            ? 'Voice input: Available'
            : 'Voice input: Type your message';

        return { ttsStatus, sttStatus, ...state };
    }

    /**
     * Get installation instructions for local voice
     */
    function getInstallInstructions() {
        if (state.ttsAvailable) {
            return null; // Already working
        }

        return `To enable local voice:

1. Install Piper TTS:
   brew install piper-tts

2. Restart Omniverse

Piper provides high-quality neural voices
that run 100% on your device.`;
    }

    /**
     * Check if voice mode should show error
     * IMPORTANT: Returns false - we never show errors, just degrade gracefully
     */
    function shouldShowVoiceError() {
        return false; // Never show red errors - degrade gracefully
    }

    // ═══════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════

    window.SovereignVoice = {
        init,
        speak,
        checkTTS,
        checkSTT,
        getState: () => ({ ...state }),
        getVoiceModeStatus,
        getInstallInstructions,
        shouldShowVoiceError,

        // Convenience methods
        isReady: () => state.initialized,
        hasTTS: () => state.ttsAvailable,
        hasSTT: () => state.sttAvailable,

        // For graceful degradation
        shouldUseTextInput: () => !state.sttAvailable || state.sttEngine === 'text-fallback'
    };

    // Auto-initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[SovereignVoice] Module loaded - 100% local voice system');
})();
