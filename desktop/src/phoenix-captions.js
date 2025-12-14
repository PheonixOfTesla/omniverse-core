/**
 * PHOENIX CAPTION-STYLE DIALOGUE SYSTEM
 * Movie subtitle-style text display synced with TTS
 *
 * Shows 3 sentences at a time:
 * - Previous sentence (faded cyan)
 * - Current sentence (bright cyan)
 * - Next sentence (faded cyan)
 *
 * Auto-scrolls and fades as speech progresses
 */

class PhoenixCaptions {
    constructor(options = {}) {
        this.tts = options.tts || null; // VoiceTTS instance
        this.sentences = [];
        this.currentIndex = 0;
        this.container = null;
        this.isVisible = false;
        this.autoHideTimeout = null;

        this.init();
    }

    /**
     * Initialize caption system
     */
    init() {
        this.createCaptionContainer();
        console.log('✅ Phoenix Captions initialized');
    }

    /**
     * Create caption container at bottom center
     */
    createCaptionContainer() {
        // Remove existing if present
        const existing = document.getElementById('phoenix-captions');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'phoenix-captions';
        container.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 800px;
            z-index: 9999;
            text-align: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;

        container.innerHTML = `
            <div id="caption-previous" style="
                font-size: 14px;
                color: rgba(0, 217, 255, 0.3);
                margin-bottom: 8px;
                transition: all 0.5s ease;
                line-height: 1.6;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            "></div>

            <div id="caption-current" style="
                font-size: 18px;
                color: rgba(0, 217, 255, 1);
                font-weight: 500;
                margin-bottom: 8px;
                text-shadow: 0 0 20px rgba(0, 217, 255, 0.6);
                transition: all 0.5s ease;
                line-height: 1.6;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            "></div>

            <div id="caption-next" style="
                font-size: 14px;
                color: rgba(0, 217, 255, 0.3);
                margin-top: 8px;
                transition: all 0.5s ease;
                line-height: 1.6;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            "></div>
        `;

        document.body.appendChild(container);
        this.container = container;
    }

    /**
     * Split text into sentences
     */
    splitIntoSentences(text) {
        if (!text) return [];

        // Split on . ! ? followed by space or end of string
        // Keep the punctuation
        const sentences = text
            .match(/[^.!?]+[.!?]+/g) || [text];

        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    /**
     * Display text as caption with sync
     */
    async display(text, options = {}) {
        if (!text || text.trim() === '') return;

        // Split into sentences
        this.sentences = this.splitIntoSentences(text);
        this.currentIndex = 0;

        // Show caption container
        this.show();

        // If TTS is enabled, sync with audio
        if (options.speak !== false && this.tts && this.tts.enabled) {
            await this.displayWithTTSSync(text, options);
        } else {
            // No TTS, just show all sentences with auto-scroll
            await this.displayWithoutTTS();
        }
    }

    /**
     * Display captions synced with TTS
     */
    async displayWithTTSSync(text, options = {}) {
        // Calculate approximate timing per sentence
        const avgWordsPerMinute = 150; // OpenAI TTS at 1.0x
        const rate = options.rate || this.tts?.rate || 1.25;
        const adjustedWPM = avgWordsPerMinute * rate;

        // Start showing first sentence immediately
        this.updateCaptions();

        // Estimate time per sentence
        const sentenceDurations = this.sentences.map(sentence => {
            const wordCount = sentence.split(/\s+/).length;
            const durationMs = (wordCount / adjustedWPM) * 60 * 1000;
            return durationMs;
        });

        // Advance captions as TTS progresses
        let currentSentenceIndex = 0;

        const advanceCaptions = () => {
            if (currentSentenceIndex < this.sentences.length - 1) {
                currentSentenceIndex++;
                this.currentIndex = currentSentenceIndex;
                this.updateCaptions();

                // Schedule next advance
                if (currentSentenceIndex < this.sentences.length - 1) {
                    setTimeout(advanceCaptions, sentenceDurations[currentSentenceIndex]);
                }
            }
        };

        // Start TTS
        if (this.tts) {
            this.tts.speak(text, options).catch(err => {
                console.error('TTS error:', err);
            });

            // Start advancing captions
            if (sentenceDurations.length > 1) {
                setTimeout(advanceCaptions, sentenceDurations[0]);
            }
        }

        // Auto-hide after TTS completes (with buffer)
        const totalDuration = sentenceDurations.reduce((a, b) => a + b, 0);
        this.autoHideTimeout = setTimeout(() => {
            this.hide();
        }, totalDuration + 2000); // 2s buffer
    }

    /**
     * Display captions without TTS (manual scroll)
     */
    async displayWithoutTTS() {
        // Show first caption
        this.updateCaptions();

        // Auto-advance every 3 seconds
        const intervalId = setInterval(() => {
            if (this.currentIndex < this.sentences.length - 1) {
                this.currentIndex++;
                this.updateCaptions();
            } else {
                clearInterval(intervalId);
                // Auto-hide after last sentence
                setTimeout(() => this.hide(), 3000);
            }
        }, 3000);
    }

    /**
     * Update caption display based on current index
     */
    updateCaptions() {
        const prevEl = document.getElementById('caption-previous');
        const currentEl = document.getElementById('caption-current');
        const nextEl = document.getElementById('caption-next');

        if (!prevEl || !currentEl || !nextEl) return;

        // Previous sentence
        if (this.currentIndex > 0) {
            prevEl.textContent = this.sentences[this.currentIndex - 1];
            prevEl.style.opacity = '1';
        } else {
            prevEl.textContent = '';
            prevEl.style.opacity = '0';
        }

        // Current sentence
        currentEl.textContent = this.sentences[this.currentIndex];
        currentEl.style.opacity = '1';

        // Next sentence
        if (this.currentIndex < this.sentences.length - 1) {
            nextEl.textContent = this.sentences[this.currentIndex + 1];
            nextEl.style.opacity = '1';
        } else {
            nextEl.textContent = '';
            nextEl.style.opacity = '0';
        }
    }

    /**
     * Show caption container
     */
    show() {
        if (this.container) {
            this.container.style.opacity = '1';
            this.isVisible = true;
        }
    }

    /**
     * Hide caption container
     */
    hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            this.isVisible = false;
        }

        // Clear auto-hide timeout
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
    }

    /**
     * Clear captions immediately
     */
    clear() {
        this.sentences = [];
        this.currentIndex = 0;

        const prevEl = document.getElementById('caption-previous');
        const currentEl = document.getElementById('caption-current');
        const nextEl = document.getElementById('caption-next');

        if (prevEl) prevEl.textContent = '';
        if (currentEl) currentEl.textContent = '';
        if (nextEl) nextEl.textContent = '';

        this.hide();
    }

    /**
     * Set TTS instance for sync
     */
    setTTS(tts) {
        this.tts = tts;
    }

    /**
     * Manually advance to next sentence
     */
    next() {
        if (this.currentIndex < this.sentences.length - 1) {
            this.currentIndex++;
            this.updateCaptions();
            return true;
        }
        return false;
    }

    /**
     * Manually go to previous sentence
     */
    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCaptions();
            return true;
        }
        return false;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            isVisible: this.isVisible,
            currentIndex: this.currentIndex,
            totalSentences: this.sentences.length,
            currentSentence: this.sentences[this.currentIndex] || null
        };
    }
}

// Make available globally
window.PhoenixCaptions = PhoenixCaptions;

console.log('✅ Phoenix Captions module loaded');
