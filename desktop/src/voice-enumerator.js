/**
 * VOICE ENUMERATOR - Discover ALL iOS Native Voices
 *
 * This script enumerates all available voices on the device
 * iOS has 150+ voices across 37+ languages (FREE)
 *
 * Usage:
 *   const enumerator = new VoiceEnumerator();
 *   const voices = await enumerator.getAllVoices();
 *   const languages = enumerator.getLanguages();
 *   const personalities = enumerator.groupByPersonality();
 */

class VoiceEnumerator {
    constructor() {
        this.voices = [];
        this.languages = [];
        this.loaded = false;

        console.log('🎭 Voice Enumerator initialized');
    }

    /**
     * Get all available voices on the device
     */
    async getAllVoices() {
        return new Promise((resolve) => {
            // Check if voices are already loaded
            let voices = speechSynthesis.getVoices();

            if (voices.length > 0) {
                this.voices = voices;
                this.loaded = true;
                this.extractLanguages();
                console.log(`✅ Found ${voices.length} voices`);
                resolve(voices);
            } else {
                // Wait for voices to load (iOS needs this)
                speechSynthesis.addEventListener('voiceschanged', () => {
                    voices = speechSynthesis.getVoices();
                    this.voices = voices;
                    this.loaded = true;
                    this.extractLanguages();
                    console.log(`✅ Found ${voices.length} voices`);
                    resolve(voices);
                }, { once: true });
            }
        });
    }

    /**
     * Extract all unique languages from available voices
     */
    extractLanguages() {
        const langSet = new Set();

        this.voices.forEach(voice => {
            // Extract language code (e.g., "en-US" -> "en")
            const langCode = voice.lang.split('-')[0];
            langSet.add(voice.lang); // Full code with region
        });

        this.languages = Array.from(langSet).sort();
        console.log(`🌍 Found ${this.languages.length} languages`);
    }

    /**
     * Get all unique languages
     */
    getLanguages() {
        return this.languages;
    }

    /**
     * Get voices for a specific language
     */
    getVoicesForLanguage(languageCode) {
        return this.voices.filter(voice =>
            voice.lang.startsWith(languageCode)
        );
    }

    /**
     * Group voices by personality type (male/female, quality)
     */
    groupByPersonality() {
        const personalities = {
            premium: [], // Enhanced/Premium quality
            natural: [], // High-quality natural voices
            standard: [], // Standard quality
            novelty: []  // Character/novelty voices
        };

        this.voices.forEach(voice => {
            const name = voice.name.toLowerCase();

            // Premium voices (Siri, Enhanced, Premium)
            if (name.includes('premium') ||
                name.includes('enhanced') ||
                name.includes('siri')) {
                personalities.premium.push(voice);
            }
            // Natural voices (Samantha, Alex, Karen, etc.)
            else if (name.includes('samantha') ||
                     name.includes('alex') ||
                     name.includes('karen') ||
                     name.includes('daniel') ||
                     name.includes('moira') ||
                     name.includes('tessa') ||
                     name.includes('victoria') ||
                     name.includes('allison')) {
                personalities.natural.push(voice);
            }
            // Novelty voices (Fred, Bells, Whisper, etc.)
            else if (name.includes('fred') ||
                     name.includes('bells') ||
                     name.includes('whisper') ||
                     name.includes('zarvox') ||
                     name.includes('trinoids')) {
                personalities.novelty.push(voice);
            }
            // Standard voices
            else {
                personalities.standard.push(voice);
            }
        });

        return personalities;
    }

    /**
     * Get recommended voice for a personality type
     */
    getVoiceForPersonality(personality) {
        const voiceMap = {
            'friendly_helpful': ['Samantha', 'Karen', 'Moira'],
            'professional_serious': ['Alex', 'Daniel', 'Oliver'],
            'british_refined': ['Oliver', 'Daniel', 'Kate'],
            'whimsical_storyteller': ['Moira', 'Tessa', 'Fiona'],
            'gentle_nurturing': ['Samantha', 'Victoria', 'Allison'],
            'neutral_efficient': ['Alex', 'Samantha', 'Google'],
            'motivational_coach': ['Daniel', 'Nathan', 'Fred'],
            'zen_master': ['Moira', 'Tessa', 'Kathy'],
            'tech_genius': ['Alex', 'Ralph', 'Zarvox'],
            'comedian': ['Fred', 'Bells', 'Trinoids'],
            'therapist': ['Samantha', 'Victoria', 'Kathy'],
            'commander': ['Daniel', 'Oliver', 'Ralph']
        };

        const preferredNames = voiceMap[personality] || ['Samantha'];

        // Try to find a preferred voice
        for (const name of preferredNames) {
            const voice = this.voices.find(v =>
                v.name.includes(name) && v.lang.startsWith('en')
            );
            if (voice) return voice;
        }

        // Fallback to first English voice
        return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    }

    /**
     * Get voice by name
     */
    getVoiceByName(name) {
        return this.voices.find(v =>
            v.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    /**
     * Get detailed voice info
     */
    getVoiceInfo(voice) {
        return {
            name: voice.name,
            lang: voice.lang,
            langCode: voice.lang.split('-')[0],
            region: voice.lang.split('-')[1] || '',
            localService: voice.localService, // true if downloaded
            voiceURI: voice.voiceURI,
            default: voice.default
        };
    }

    /**
     * Export all voices for documentation
     */
    exportVoiceList() {
        const grouped = {};

        this.voices.forEach(voice => {
            const langCode = voice.lang.split('-')[0];

            if (!grouped[langCode]) {
                grouped[langCode] = [];
            }

            grouped[langCode].push({
                name: voice.name,
                lang: voice.lang,
                local: voice.localService
            });
        });

        console.log('📋 Voice Export:', JSON.stringify(grouped, null, 2));
        return grouped;
    }

    /**
     * Get languages grouped by region
     */
    getLanguagesByRegion() {
        const regions = {
            'Americas': [],
            'Europe': [],
            'Asia': [],
            'Middle East': [],
            'Africa': []
        };

        const regionMap = {
            'en-US': 'Americas', 'en-CA': 'Americas', 'es-MX': 'Americas', 'pt-BR': 'Americas', 'fr-CA': 'Americas',
            'en-GB': 'Europe', 'en-IE': 'Europe', 'en-AU': 'Europe', 'en-ZA': 'Europe',
            'es-ES': 'Europe', 'fr-FR': 'Europe', 'de-DE': 'Europe', 'it-IT': 'Europe', 'nl-NL': 'Europe',
            'pt-PT': 'Europe', 'pl-PL': 'Europe', 'ro-RO': 'Europe', 'sv-SE': 'Europe', 'da-DK': 'Europe',
            'nb-NO': 'Europe', 'fi-FI': 'Europe', 'el-GR': 'Europe', 'cs-CZ': 'Europe', 'hu-HU': 'Europe',
            'ru-RU': 'Europe', 'tr-TR': 'Europe', 'uk-UA': 'Europe',
            'ja-JP': 'Asia', 'ko-KR': 'Asia', 'zh-CN': 'Asia', 'zh-TW': 'Asia', 'zh-HK': 'Asia',
            'th-TH': 'Asia', 'vi-VN': 'Asia', 'id-ID': 'Asia', 'ms-MY': 'Asia', 'fil-PH': 'Asia',
            'hi-IN': 'Asia', 'ta-IN': 'Asia', 'te-IN': 'Asia', 'bn-IN': 'Asia',
            'ar-SA': 'Middle East', 'he-IL': 'Middle East', 'fa-IR': 'Middle East',
            'af-ZA': 'Africa', 'sw-KE': 'Africa'
        };

        this.languages.forEach(lang => {
            const region = regionMap[lang] || 'Other';
            if (regions[region]) {
                regions[region].push(lang);
            }
        });

        return regions;
    }

    /**
     * Generate onboarding language options
     */
    generateLanguageOptions() {
        const options = this.languages.map(lang => {
            const voiceCount = this.getVoicesForLanguage(lang).length;
            const langName = this.getLanguageName(lang);

            return {
                code: lang,
                name: langName,
                voiceCount: voiceCount,
                flag: this.getLanguageFlag(lang)
            };
        });

        return options.sort((a, b) => b.voiceCount - a.voiceCount);
    }

    /**
     * Get human-readable language name
     */
    getLanguageName(langCode) {
        const names = {
            'en-US': 'English (US)', 'en-GB': 'English (UK)', 'en-AU': 'English (Australia)',
            'es-ES': 'Spanish (Spain)', 'es-MX': 'Spanish (Mexico)', 'fr-FR': 'French (France)',
            'de-DE': 'German', 'it-IT': 'Italian', 'pt-BR': 'Portuguese (Brazil)', 'pt-PT': 'Portuguese (Portugal)',
            'ja-JP': 'Japanese', 'ko-KR': 'Korean', 'zh-CN': 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
            'hi-IN': 'Hindi', 'ar-SA': 'Arabic', 'ru-RU': 'Russian', 'tr-TR': 'Turkish',
            'nl-NL': 'Dutch', 'pl-PL': 'Polish', 'sv-SE': 'Swedish', 'da-DK': 'Danish',
            'nb-NO': 'Norwegian', 'fi-FI': 'Finnish', 'el-GR': 'Greek', 'he-IL': 'Hebrew',
            'th-TH': 'Thai', 'vi-VN': 'Vietnamese', 'id-ID': 'Indonesian', 'fil-PH': 'Filipino',
            'cs-CZ': 'Czech', 'hu-HU': 'Hungarian', 'ro-RO': 'Romanian', 'uk-UA': 'Ukrainian'
        };

        return names[langCode] || langCode;
    }

    /**
     * Get flag emoji for language
     */
    getLanguageFlag(langCode) {
        const flags = {
            'en-US': '🇺🇸', 'en-GB': '🇬🇧', 'en-AU': '🇦🇺', 'en-CA': '🇨🇦', 'en-IE': '🇮🇪', 'en-ZA': '🇿🇦',
            'es-ES': '🇪🇸', 'es-MX': '🇲🇽', 'fr-FR': '🇫🇷', 'fr-CA': '🇨🇦',
            'de-DE': '🇩🇪', 'it-IT': '🇮🇹', 'pt-BR': '🇧🇷', 'pt-PT': '🇵🇹',
            'ja-JP': '🇯🇵', 'ko-KR': '🇰🇷', 'zh-CN': '🇨🇳', 'zh-TW': '🇹🇼', 'zh-HK': '🇭🇰',
            'hi-IN': '🇮🇳', 'ar-SA': '🇸🇦', 'ru-RU': '🇷🇺', 'tr-TR': '🇹🇷',
            'nl-NL': '🇳🇱', 'pl-PL': '🇵🇱', 'sv-SE': '🇸🇪', 'da-DK': '🇩🇰',
            'nb-NO': '🇳🇴', 'fi-FI': '🇫🇮', 'el-GR': '🇬🇷', 'he-IL': '🇮🇱',
            'th-TH': '🇹🇭', 'vi-VN': '🇻🇳', 'id-ID': '🇮🇩', 'fil-PH': '🇵🇭',
            'cs-CZ': '🇨🇿', 'hu-HU': '🇭🇺', 'ro-RO': '🇷🇴', 'uk-UA': '🇺🇦'
        };

        return flags[langCode] || '🌐';
    }
}

// Export
window.VoiceEnumerator = VoiceEnumerator;

console.log('✅ Voice Enumerator module loaded');
