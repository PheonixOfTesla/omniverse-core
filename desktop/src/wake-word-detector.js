/**
 * WAKE WORD DETECTOR - "Hey Phoenix" Continuous Listening
 * Enables hands-free activation of Phoenix AI assistant
 *
 * Usage:
 *   const detector = new WakeWordDetector();
 *   detector.onWakeWord(() => {
 *       // Phoenix activated!
 *   });
 *   detector.start();
 */

class WakeWordDetector {
    constructor(options = {}) {
        this.wakeWords = options.wakeWords || ['phoenix', 'hey phoenix', 'ok phoenix'];
        this.sleepWords = options.sleepWords || ['sleep phoenix', 'stop listening', 'go to sleep', 'goodnight phoenix'];
        this.isListening = false;
        this.recognition = null;
        this.onWakeWordCallback = null;
        this.onSleepWordCallback = null;
        this.onErrorCallback = null;

        // Performance settings
        this.confidenceThreshold = options.confidenceThreshold || 0.6;
        this.interimResults = true;
        this.continuous = true;

        // State
        this.isActive = false;
        this.isSleeping = false;
        this.lastDetection = null;
        this.detectionCount = 0;

        this.init();
    }

    /**
     * Initialize Speech Recognition
     */
    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('❌ Wake Word Detection not supported in this browser');
            if (this.onErrorCallback) {
                this.onErrorCallback('Speech recognition not supported');
            }
            return;
        }

        // Use webkit prefix for Chrome/Edge
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // Configure for continuous wake word detection
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;

        // Event handlers
        this.recognition.onresult = (event) => this.handleResult(event);
        this.recognition.onerror = (event) => this.handleError(event);
        this.recognition.onend = () => this.handleEnd();
        this.recognition.onstart = () => {
            console.log('🎤 Wake word detector listening...');
            this.isListening = true;
        };

        console.log('✅ Wake Word Detector initialized');
        console.log('🎯 Wake words:', this.wakeWords.join(', '));
        console.log('💤 Sleep words:', this.sleepWords.join(', '));
    }

    /**
     * Handle speech recognition results
     */
    handleResult(event) {
        if (!this.isActive) return;

        // Get all transcripts (including alternatives)
        const results = Array.from(event.results);

        for (let i = event.resultIndex; i < results.length; i++) {
            const result = results[i];
            const alternatives = Array.from(result).slice(0, 3); // Check top 3 alternatives

            for (const alternative of alternatives) {
                const transcript = alternative.transcript.toLowerCase().trim();
                const confidence = alternative.confidence;

                // Check if any sleep word is detected
                const sleepWordDetected = this.sleepWords.some(word => {
                    return transcript.includes(word);
                });

                if (sleepWordDetected && confidence >= this.confidenceThreshold) {
                    // Sleep word detected!
                    console.log(`💤 SLEEP WORD DETECTED: "${transcript}" (${Math.round(confidence * 100)}%)`);

                    this.isSleeping = true;
                    this.lastDetection = Date.now();

                    // Trigger sleep callback
                    if (this.onSleepWordCallback) {
                        this.onSleepWordCallback({
                            transcript,
                            confidence,
                            timestamp: this.lastDetection
                        });
                    }

                    // Stop detection
                    this.stop();
                    return;
                }

                // Check if any wake word is detected (only if not sleeping)
                if (!this.isSleeping) {
                    const wakeWordDetected = this.wakeWords.some(word => {
                        return transcript.includes(word);
                    });

                    if (wakeWordDetected && confidence >= this.confidenceThreshold) {
                        // Wake word detected!
                        console.log(`🔥 WAKE WORD DETECTED: "${transcript}" (${Math.round(confidence * 100)}%)`);

                        this.lastDetection = Date.now();
                        this.detectionCount++;

                        // Trigger callback
                        if (this.onWakeWordCallback) {
                            this.onWakeWordCallback({
                                transcript,
                                confidence,
                                timestamp: this.lastDetection
                            });
                        }

                        // Pause detection briefly to avoid re-triggering
                        this.pauseDetection(1000);
                        return;
                    }
                }
            }
        }
    }

    /**
     * Handle speech recognition errors
     */
    handleError(event) {
        // Don't spam errors for no-speech (common when nothing is said)
        if (event.error === 'no-speech') {
            return;
        }

        // "aborted" is normal when switching from wake word to command listening
        if (event.error === 'aborted') {
            console.log('🔄 Wake word detection aborted (switching modes) - this is normal');
            return;
        }

        console.error('❌ Wake word detection error:', event.error);

        if (event.error === 'not-allowed') {
            console.error('⚠️  Microphone access denied. Please allow microphone access.');
            this.stop();
        }

        if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
        }
    }

    /**
     * Handle recognition ending
     */
    handleEnd() {
        this.isListening = false;

        // Auto-restart if still active
        if (this.isActive) {
            console.log('🔄 Restarting wake word detection...');
            setTimeout(() => {
                if (this.isActive) {
                    this.recognition.start();
                }
            }, 100);
        }
    }

    /**
     * Pause detection temporarily (to avoid re-triggering)
     */
    pauseDetection(duration = 1000) {
        this.isActive = false;
        setTimeout(() => {
            this.isActive = true;
        }, duration);
    }

    /**
     * Start wake word detection
     */
    start() {
        if (!this.recognition) {
            console.error('❌ Speech recognition not initialized');
            return;
        }

        if (this.isActive) {
            console.log('⚠️  Wake word detector already running');
            return;
        }

        console.log('🚀 Starting wake word detection...');
        console.log('🎤 Say "Hey Phoenix" to activate');

        this.isActive = true;

        try {
            this.recognition.start();
        } catch (error) {
            console.error('❌ Failed to start wake word detection:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback(error.message);
            }
        }
    }

    /**
     * Stop wake word detection
     */
    stop() {
        if (!this.isActive) {
            return;
        }

        console.log('⏹️  Stopping wake word detection');
        this.isActive = false;

        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
        }

        this.isListening = false;
    }

    /**
     * Restart detection
     */
    restart() {
        this.stop();
        setTimeout(() => this.start(), 500);
    }

    /**
     * Register wake word callback
     */
    onWakeWord(callback) {
        this.onWakeWordCallback = callback;
    }

    /**
     * Register sleep word callback
     */
    onSleepWord(callback) {
        this.onSleepWordCallback = callback;
    }

    /**
     * Wake from sleep mode
     */
    wake() {
        console.log('⏰ Waking from sleep mode...');
        this.isSleeping = false;
        this.start();
    }

    /**
     * Register error callback
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Get detection statistics
     */
    getStats() {
        return {
            isActive: this.isActive,
            isListening: this.isListening,
            detectionCount: this.detectionCount,
            lastDetection: this.lastDetection,
            uptime: this.lastDetection ? Date.now() - this.lastDetection : null
        };
    }

    /**
     * Check if detector is supported
     */
    static isSupported() {
        return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WakeWordDetector;
}

// Make available globally
window.WakeWordDetector = WakeWordDetector;

console.log('✅ Wake Word Detector module loaded');
