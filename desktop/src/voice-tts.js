/**
 * VOICE TTS (Text-to-Speech) System
 * Enables Phoenix to speak responses out loud using OpenAI TTS
 *
 * Usage:
 *   const tts = new VoiceTTS({ phoenixAPI });
 *   tts.speak("Welcome to Mercury, Josh");
 */

class VoiceTTS {
    constructor(options = {}) {
        this.phoenixAPI = options.phoenixAPI || window.API; // window.API is the global PhoenixAPI instance
        this.enabled = options.enabled !== false; // Default enabled
        this.rate = options.rate || 1.0; // Speed (0.5 to 2.0 for OpenAI)
        this.pitch = options.pitch || 1.0; // Pitch (not used by OpenAI TTS)
        this.volume = options.volume || 1.0; // Volume (0 to 1)
        this.voice = options.voice || 'nova'; // OpenAI voice: alloy, echo, fable, onyx, nova, shimmer

        // State
        this.isSpeaking = false;
        this.speechQueue = [];
        this.currentAudio = null;

        // Callbacks
        this.onStartCallback = null;
        this.onEndCallback = null;
        this.onErrorCallback = null;

        this.init();
    }

    /**
     * Initialize OpenAI TTS
     */
    init() {
        if (!this.phoenixAPI) {
            console.error('❌ phoenixAPI not provided - TTS disabled');
            this.enabled = false;
            return;
        }

        console.log(`✅ Voice TTS initialized (OpenAI ${this.voice} voice)`);
    }

    /**
     * Speak text out loud using OpenAI TTS
     */
    async speak(text, options = {}) {
        if (!this.enabled) {
            console.log('🔇 TTS disabled, skipping speech');
            return Promise.resolve();
        }

        if (!text || text.trim() === '') {
            console.warn('⚠️  Empty text, skipping speech');
            return Promise.resolve();
        }

        // Queue if already speaking
        if (this.isSpeaking && options.queue !== false) {
            console.log('⏳ Queueing speech...');
            return new Promise((resolve, reject) => {
                this.speechQueue.push({ text, options, resolve, reject });
            });
        }

        try {
            this.isSpeaking = true;
            console.log(`🗣️  Speaking: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

            // Call onStart callback
            if (this.onStartCallback) {
                this.onStartCallback(text);
            }

            // Get audio from OpenAI TTS API
            const voice = options.voice || this.voice;
            const speed = Math.max(0.5, Math.min(2.0, options.rate || this.rate)); // OpenAI supports 0.5-2.0

            console.log(`🎤 Requesting TTS: voice=${voice}, speed=${speed}, text length=${text.length}`);
            const audioBlob = await this.phoenixAPI.textToSpeech(text, voice, speed);
            console.log(`🎵 Received audio blob: ${audioBlob.size} bytes, type=${audioBlob.type}`);

            // Create audio element and play
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.volume = options.volume || this.volume;

            this.currentAudio = audio;

            console.log(`🔊 Created audio element: url=${audioUrl}, duration will be known after load`);

            // Set up audio event handlers
            return new Promise((resolve, reject) => {
                audio.onloadedmetadata = () => {
                    console.log(`📊 Audio metadata loaded: duration=${audio.duration}s`);
                };

                audio.onended = () => {
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    URL.revokeObjectURL(audioUrl);
                    console.log('✅ Finished speaking');

                    if (this.onEndCallback) {
                        this.onEndCallback(text);
                    }

                    // Process queue
                    this.processQueue();
                    resolve();
                };

                audio.onerror = (event) => {
                    console.error('❌ TTS audio error:', event);
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    URL.revokeObjectURL(audioUrl);

                    if (this.onErrorCallback) {
                        this.onErrorCallback('Audio playback error');
                    }

                    reject(new Error('Audio playback error'));
                };

                // Start playing
                console.log('▶️  Attempting to play audio...');
                audio.play()
                    .then(() => {
                        console.log('✅ Audio playback started successfully');
                    })
                    .catch(error => {
                        console.error('❌ Failed to play audio:', error);
                        console.error('   Error name:', error.name);
                        console.error('   Error message:', error.message);
                        this.isSpeaking = false;
                        this.currentAudio = null;
                        URL.revokeObjectURL(audioUrl);

                        if (this.onErrorCallback) {
                            this.onErrorCallback(error.message);
                        }

                        reject(error);
                    });
            });

        } catch (error) {
            console.error('❌ TTS API error:', error);
            this.isSpeaking = false;
            this.currentAudio = null;

            if (this.onErrorCallback) {
                this.onErrorCallback(error.message);
            }

            throw error;
        }
    }

    /**
     * Process speech queue
     */
    processQueue() {
        if (this.speechQueue.length > 0 && !this.isSpeaking) {
            const next = this.speechQueue.shift();
            this.speak(next.text, next.options).then(next.resolve).catch(next.reject);
        }
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.isSpeaking && this.currentAudio) {
            console.log('⏹️  Stopping speech');
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isSpeaking = false;
            this.currentAudio = null;
        }
    }

    /**
     * Clear speech queue
     */
    clearQueue() {
        this.speechQueue = [];
        console.log('🗑️  Speech queue cleared');
    }

    /**
     * Pause speech
     */
    pause() {
        if (this.isSpeaking && this.currentAudio) {
            this.currentAudio.pause();
            console.log('⏸️  Speech paused');
        }
    }

    /**
     * Resume speech
     */
    resume() {
        if (this.currentAudio && this.currentAudio.paused) {
            this.currentAudio.play();
            console.log('▶️  Speech resumed');
        }
    }

    /**
     * Enable TTS
     */
    enable() {
        this.enabled = true;
        console.log('🔊 TTS enabled');
    }

    /**
     * Disable TTS
     */
    disable() {
        this.enabled = false;
        this.stop();
        console.log('🔇 TTS disabled');
    }

    /**
     * Toggle TTS
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`🔊 TTS ${this.enabled ? 'enabled' : 'disabled'}`);
        return this.enabled;
    }

    /**
     * Set OpenAI voice (alloy, echo, fable, onyx, nova, shimmer)
     */
    setVoice(voiceName) {
        const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

        if (validVoices.includes(voiceName.toLowerCase())) {
            this.voice = voiceName.toLowerCase();
            console.log(`🎤 Voice changed to: ${this.voice}`);
            return true;
        } else {
            console.error(`❌ Invalid voice: ${voiceName}. Valid voices: ${validVoices.join(', ')}`);
            return false;
        }
    }

    /**
     * Get available OpenAI voices
     */
    getVoices() {
        return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    }

    /**
     * Set speech rate (OpenAI supports 0.5-2.0)
     */
    setRate(rate) {
        this.rate = Math.max(0.5, Math.min(2.0, rate));
        console.log(`🏃 Speech rate set to: ${this.rate}`);
    }

    /**
     * Set speech pitch
     */
    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
        console.log(`🎵 Speech pitch set to: ${this.pitch}`);
    }

    /**
     * Set speech volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Speech volume set to: ${this.volume}`);
    }

    /**
     * Register callbacks
     */
    onStart(callback) {
        this.onStartCallback = callback;
    }

    onEnd(callback) {
        this.onEndCallback = callback;
    }

    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Check if currently speaking
     */
    isSpeakingNow() {
        return this.isSpeaking;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            enabled: this.enabled,
            isSpeaking: this.isSpeaking,
            queueLength: this.speechQueue.length,
            voice: this.voice,
            rate: this.rate,
            volume: this.volume
        };
    }

    /**
     * Check if OpenAI TTS is supported (requires phoenixAPI)
     */
    static isSupported() {
        return typeof window.API !== 'undefined' && typeof window.API.textToSpeech === 'function';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceTTS;
}

// Make available globally
window.VoiceTTS = VoiceTTS;

console.log('✅ Voice TTS module loaded');
