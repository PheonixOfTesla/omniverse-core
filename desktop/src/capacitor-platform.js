/**
 * CAPACITOR PLATFORM DETECTION & SPEECH RECOGNITION WRAPPER
 *
 * Provides unified speech recognition interface that works on:
 * - iOS native (via Capacitor SFSpeechRecognizer) - FREE
 * - Web browser (via Web Speech API) - FREE
 *
 * Automatically detects platform and uses appropriate API
 */

class PlatformSpeechRecognition {
    constructor() {
        this.isCapacitor = this.detectCapacitor();
        this.isNativeIOS = this.detectNativeIOS();
        this.recognizer = null;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onEndCallback = null;
        this.isListening = false;

        console.log(`[Platform] Capacitor: ${this.isCapacitor}, Native iOS: ${this.isNativeIOS}`);
    }

    /**
     * Detect if running as Capacitor native app
     */
    detectCapacitor() {
        return typeof window !== 'undefined' &&
               window.Capacitor !== undefined;
    }

    /**
     * Detect if running on native iOS
     */
    detectNativeIOS() {
        if (!this.isCapacitor) return false;

        const platform = window.Capacitor?.getPlatform?.();
        return platform === 'ios';
    }

    /**
     * Initialize speech recognition (platform-specific)
     */
    async initialize(options = {}) {
        const {
            language = 'en-US',
            interimResults = true,
            maxAlternatives = 3,
            continuous = false
        } = options;

        try {
            if (this.isCapacitor && this.isNativeIOS) {
                // Use Capacitor Speech Recognition Plugin
                console.log('[Platform] Initializing Capacitor Speech Recognition for iOS');
                console.log('[Platform] Capacitor:', this.isCapacitor);
                console.log('[Platform] Native iOS:', this.isNativeIOS);

                // Use Capacitor's plugin system instead of ES6 import
                console.log('[Platform] Accessing SpeechRecognition via Capacitor.Plugins...');
                const { SpeechRecognition } = window.Capacitor.Plugins;

                if (!SpeechRecognition) {
                    throw new Error('SpeechRecognition plugin not found in Capacitor.Plugins');
                }

                const permission = await SpeechRecognition.requestPermissions();
                if (permission.speechRecognition !== 'granted') {
                    throw new Error('Speech recognition permission denied');
                }

                console.log('[Platform] iOS SFSpeechRecognizer ready (FREE)');
                this.recognizer = SpeechRecognition;
                return { success: true, platform: 'ios-native' };

            } else {
                // Use Web Speech API (browser fallback)
                console.log('[Platform] Initializing Web Speech API (browser)');

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                if (!SpeechRecognition) {
                    throw new Error('Speech recognition not supported in this browser');
                }

                this.recognizer = new SpeechRecognition();
                this.recognizer.continuous = continuous;
                this.recognizer.interimResults = interimResults;
                this.recognizer.lang = language;
                this.recognizer.maxAlternatives = maxAlternatives;

                // Set up event handlers for Web Speech API
                this.recognizer.onresult = (event) => {
                    if (this.onResultCallback) {
                        const result = event.results[event.results.length - 1];
                        const transcript = result[0].transcript;
                        const isFinal = result.isFinal;

                        this.onResultCallback({
                            transcript,
                            isFinal,
                            confidence: result[0].confidence
                        });
                    }
                };

                this.recognizer.onerror = (event) => {
                    console.error('[Platform] Web Speech API error:', event.error);
                    if (this.onErrorCallback) {
                        // Create platform-specific error message
                        let errorMessage = event.error;
                        if (event.error === 'not-allowed') {
                            errorMessage = 'Microphone permission denied. Please allow microphone access in Safari Settings → Privacy & Security → Microphone.';
                        } else if (event.error === 'no-speech') {
                            errorMessage = 'No speech detected. Please try again.';
                        } else if (event.error === 'audio-capture') {
                            errorMessage = 'Microphone not available. Please check your device settings.';
                        }
                        this.onErrorCallback({ platform: 'web', error: event.error, message: errorMessage });
                    }
                };

                this.recognizer.onend = () => {
                    this.isListening = false;
                    if (this.onEndCallback) {
                        this.onEndCallback();
                    }
                };

                console.log('[Platform] Web Speech API ready (FREE)');
                return { success: true, platform: 'web-browser' };
            }
        } catch (error) {
            console.error('[Platform] Failed to initialize speech recognition:', error);
            throw error;
        }
    }

    /**
     * Start listening (unified interface)
     * RETRIES iOS native on every attempt for superior performance
     */
    async startListening(options = {}) {
        // ALWAYS retry iOS native initialization on every start
        // This ensures we use superior iOS native instead of Web Speech fallback
        if (this.isCapacitor && this.isNativeIOS) {
            try {
                console.log('[Platform] Attempting iOS native speech (retry on every start)...');
                await this.initialize(options);
            } catch (error) {
                console.error('[Platform] iOS native failed, will use Web Speech:', error);
            }
        } else if (!this.recognizer) {
            await this.initialize(options);
        }

        try {
            if (this.isCapacitor && this.isNativeIOS && this.recognizer) {
                // Capacitor Speech Recognition
                const { SpeechRecognition } = window.Capacitor.Plugins;

                await SpeechRecognition.start({
                    language: options.language || 'en-US',
                    maxResults: options.maxAlternatives || 5,
                    prompt: 'Say something to Phoenix',
                    partialResults: options.interimResults !== false,
                    popup: false
                });

                // Set up listener for results
                SpeechRecognition.addListener('partialResults', (data) => {
                    if (this.onResultCallback && data.matches && data.matches.length > 0) {
                        this.onResultCallback({
                            transcript: data.matches[0],
                            isFinal: false,
                            confidence: 1.0
                        });
                    }
                });

                SpeechRecognition.addListener('listeningState', (state) => {
                    if (!state.listening && this.onEndCallback) {
                        this.onEndCallback();
                    }
                });

                this.isListening = true;
                console.log('[Platform] iOS listening started');

            } else {
                // Web Speech API
                this.recognizer.start();
                this.isListening = true;
                console.log('[Platform] Web Speech API listening started');
            }
        } catch (error) {
            console.error('[Platform] Failed to start listening:', error);
            throw error;
        }
    }

    /**
     * Stop listening (unified interface)
     */
    async stopListening() {
        if (!this.isListening) return;

        try {
            if (this.isCapacitor && this.isNativeIOS && this.recognizer) {
                const { SpeechRecognition } = window.Capacitor.Plugins;
                if (SpeechRecognition) {
                    await SpeechRecognition.stop();
                    console.log('[Platform] iOS listening stopped');
                }
            } else if (this.recognizer) {
                this.recognizer.stop();
                console.log('[Platform] Web Speech API listening stopped');
            }

            this.isListening = false;
        } catch (error) {
            console.error('[Platform] Failed to stop listening:', error);
        }
    }

    /**
     * Set result callback
     */
    onResult(callback) {
        this.onResultCallback = callback;
    }

    /**
     * Set error callback
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Set end callback
     */
    onEnd(callback) {
        this.onEndCallback = callback;
    }

    /**
     * Check if currently listening
     */
    getIsListening() {
        return this.isListening;
    }

    /**
     * Get platform info
     */
    getPlatformInfo() {
        return {
            isCapacitor: this.isCapacitor,
            isNativeIOS: this.isNativeIOS,
            platform: this.isNativeIOS ? 'ios-native' : 'web-browser',
            speechAPI: this.isNativeIOS ? 'SFSpeechRecognizer (Apple)' : 'Web Speech API',
            cost: 'FREE'
        };
    }
}

// Export for use in other modules
window.PlatformSpeechRecognition = PlatformSpeechRecognition;

// Create global instance for phoenix-voice-commands.js
window.capacitorPlatform = new PlatformSpeechRecognition();
