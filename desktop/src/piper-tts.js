/**
 * PIPER TTS FRONTEND INTEGRATION
 *
 * Connects to local Piper TTS via Tauri backend
 * Provides sovereign text-to-speech without cloud dependencies
 */

(function() {
    'use strict';

    const DEBUG_MODE = false;
    const log = (...args) => DEBUG_MODE && console.log('[PiperTTS]', ...args);

    // Check if running in Tauri
    const isTauri = () => window.__TAURI__ !== undefined;

    // TTS State
    const state = {
        available: false,
        currentVoice: null,
        currentGender: 'female',
        installedVoices: [],
        initialized: false
    };

    /**
     * Initialize Piper TTS
     */
    async function init() {
        if (!isTauri()) {
            log('Not in Tauri environment - Piper TTS disabled');
            return false;
        }

        try {
            const { invoke } = window.__TAURI__.tauri;
            const status = await invoke('check_tts');

            state.available = status.available;
            state.currentVoice = status.current_voice;
            state.currentGender = status.current_gender;
            state.installedVoices = status.installed_voices;
            state.initialized = true;

            log('Piper TTS initialized:', status);

            // Download default voices if not installed
            if (state.available && state.installedVoices.length === 0) {
                log('Downloading default voices...');
                await downloadVoices();
            }

            return state.available;
        } catch (error) {
            console.error('[PiperTTS] Init error:', error);
            return false;
        }
    }

    /**
     * Check if Piper TTS is available
     */
    async function checkStatus() {
        if (!isTauri()) return { available: false, message: 'Not in Tauri' };

        try {
            const { invoke } = window.__TAURI__.tauri;
            return await invoke('check_tts');
        } catch (error) {
            return { available: false, message: error.toString() };
        }
    }

    /**
     * List available voices
     */
    async function listVoices() {
        if (!isTauri()) return [];

        try {
            const { invoke } = window.__TAURI__.tauri;
            return await invoke('list_voices');
        } catch (error) {
            console.error('[PiperTTS] List voices error:', error);
            return [];
        }
    }

    /**
     * Set voice by gender (male/female)
     */
    async function setVoiceByGender(gender) {
        if (!isTauri()) return false;

        try {
            const { invoke } = window.__TAURI__.tauri;
            const result = await invoke('set_tts_voice', { gender });
            state.currentGender = gender;
            log('Voice set:', result);
            return true;
        } catch (error) {
            console.error('[PiperTTS] Set voice error:', error);
            return false;
        }
    }

    /**
     * Set voice by ID
     */
    async function setVoiceById(voiceId) {
        if (!isTauri()) return false;

        try {
            const { invoke } = window.__TAURI__.tauri;
            const result = await invoke('set_tts_voice_by_id', { voice_id: voiceId });
            log('Voice set by ID:', result);
            return true;
        } catch (error) {
            console.error('[PiperTTS] Set voice by ID error:', error);
            return false;
        }
    }

    /**
     * Speak text (plays audio locally)
     */
    async function speak(text) {
        if (!isTauri()) {
            console.warn('[PiperTTS] Not in Tauri - using fallback');
            return fallbackSpeak(text);
        }

        if (!state.available) {
            console.warn('[PiperTTS] Piper not available - using fallback');
            return fallbackSpeak(text);
        }

        try {
            const { invoke } = window.__TAURI__.tauri;
            const result = await invoke('speak', { text });
            log('Speaking:', result);
            return result;
        } catch (error) {
            console.error('[PiperTTS] Speak error:', error);
            return fallbackSpeak(text);
        }
    }

    /**
     * Synthesize text to audio (returns base64 WAV)
     */
    async function synthesize(text) {
        if (!isTauri()) return null;

        try {
            const { invoke } = window.__TAURI__.tauri;
            return await invoke('synthesize', { text });
        } catch (error) {
            console.error('[PiperTTS] Synthesize error:', error);
            return null;
        }
    }

    /**
     * Download default voices
     */
    async function downloadVoices() {
        if (!isTauri()) return false;

        try {
            const { invoke } = window.__TAURI__.tauri;
            const result = await invoke('download_voices');
            log('Voices downloaded:', result);

            // Refresh status
            await init();
            return true;
        } catch (error) {
            console.error('[PiperTTS] Download voices error:', error);
            return false;
        }
    }

    /**
     * Fallback to Web Speech API when Piper unavailable
     */
    function fallbackSpeak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to find a good voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Samantha') ||
                v.name.includes('Karen') ||
                v.lang.startsWith('en')
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            speechSynthesis.speak(utterance);
            return { success: true, fallback: true };
        }
        return { success: false, error: 'No TTS available' };
    }

    /**
     * Play base64 WAV audio
     */
    function playBase64Audio(base64Data) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
            audio.onended = () => resolve();
            audio.onerror = (e) => reject(e);
            audio.play();
        });
    }

    /**
     * Get current state
     */
    function getState() {
        return { ...state };
    }

    // Export API
    window.PiperTTS = {
        init,
        checkStatus,
        listVoices,
        setVoiceByGender,
        setVoiceById,
        speak,
        synthesize,
        downloadVoices,
        playBase64Audio,
        getState,
        isTauri,

        // Convenience aliases
        sayMale: async (text) => {
            await setVoiceByGender('male');
            return speak(text);
        },
        sayFemale: async (text) => {
            await setVoiceByGender('female');
            return speak(text);
        }
    };

    // Auto-initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    log('Piper TTS module loaded');
})();
