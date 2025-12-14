/**
 * VOICE ONBOARDING COMPONENT
 *
 * Beautiful UI for selecting Phoenix personality and language
 * Integrates with iOS native voices (150+ voices, 37+ languages)
 *
 * Usage in onboarding:
 *   const voiceOnboarding = new VoiceOnboarding();
 *   voiceOnboarding.render(containerElement);
 */

class VoiceOnboarding {
    constructor() {
        this.selectedPersonality = 'friendly_helpful';
        this.selectedLanguage = 'en-US';
        this.selectedVoice = null;
        this.enumerator = null;
        this.availableVoices = [];

        // 12 Personality types with descriptions
        this.personalities = [
            {
                id: 'friendly_helpful',
                name: 'Friendly Helper',
                icon: '😊',
                description: 'Warm, encouraging, supportive companion',
                color: '#667eea',
                voiceStyle: ['Samantha', 'Karen', 'Moira']
            },
            {
                id: 'professional_serious',
                name: 'Professional Expert',
                icon: '💼',
                description: 'Direct, authoritative, analytical',
                color: '#764ba2',
                voiceStyle: ['Alex', 'Daniel', 'Oliver']
            },
            {
                id: 'british_refined',
                name: 'British Butler',
                icon: '🎩',
                description: 'Sophisticated, elegant, Alfred Pennyworth-style',
                color: '#f093fb',
                voiceStyle: ['Oliver', 'Daniel', 'Kate']
            },
            {
                id: 'whimsical_storyteller',
                name: 'Creative Storyteller',
                icon: '📚',
                description: 'Imaginative, metaphorical, engaging',
                color: '#4facfe',
                voiceStyle: ['Moira', 'Tessa', 'Fiona']
            },
            {
                id: 'gentle_nurturing',
                name: 'Gentle Nurturer',
                icon: '🌸',
                description: 'Caring, empathetic, soothing',
                color: '#43e97b',
                voiceStyle: ['Samantha', 'Victoria', 'Allison']
            },
            {
                id: 'neutral_efficient',
                name: 'Efficient Assistant',
                icon: '⚡',
                description: 'Brief, clear, to-the-point',
                color: '#fa709a',
                voiceStyle: ['Alex', 'Samantha', 'Google']
            },
            {
                id: 'motivational_coach',
                name: 'Motivational Coach',
                icon: '🔥',
                description: 'Energetic, inspiring, Tony Robbins-style',
                color: '#ff6b6b',
                voiceStyle: ['Daniel', 'Nathan', 'Fred']
            },
            {
                id: 'zen_master',
                name: 'Zen Master',
                icon: '🧘',
                description: 'Calm, mindful, wisdom-focused',
                color: '#4ecdc4',
                voiceStyle: ['Moira', 'Tessa', 'Kathy']
            },
            {
                id: 'tech_genius',
                name: 'Tech Genius',
                icon: '🤖',
                description: 'Nerdy, technical, precise',
                color: '#95e1d3',
                voiceStyle: ['Alex', 'Ralph', 'Zarvox']
            },
            {
                id: 'comedian',
                name: 'Comedian',
                icon: '🎭',
                description: 'Witty, sarcastic, fun',
                color: '#f38181',
                voiceStyle: ['Fred', 'Bells', 'Trinoids']
            },
            {
                id: 'therapist',
                name: 'Therapist',
                icon: '💭',
                description: 'Reflective, CBT-trained, supportive',
                color: '#aa96da',
                voiceStyle: ['Samantha', 'Victoria', 'Kathy']
            },
            {
                id: 'commander',
                name: 'Commander',
                icon: '⚔️',
                description: 'Disciplined, action-oriented, military-style',
                color: '#fcbad3',
                voiceStyle: ['Daniel', 'Oliver', 'Ralph']
            }
        ];

        console.log('🎭 Voice Onboarding initialized');
    }

    /**
     * Initialize voice enumerator
     */
    async init() {
        this.enumerator = new VoiceEnumerator();
        this.availableVoices = await this.enumerator.getAllVoices();
        console.log(`✅ Loaded ${this.availableVoices.length} voices`);
    }

    /**
     * Render the onboarding UI
     */
    async render(container) {
        await this.init();

        const html = `
            <div class="voice-onboarding">
                <div class="onboarding-section">
                    <h2 class="section-title">🎭 Choose Your Phoenix Personality</h2>
                    <p class="section-subtitle">How should Phoenix sound and communicate with you?</p>

                    <div class="personality-grid">
                        ${this.personalities.map(p => this.renderPersonalityCard(p)).join('')}
                    </div>
                </div>

                <div class="onboarding-section">
                    <h2 class="section-title">🌍 Select Your Language</h2>
                    <p class="section-subtitle">Phoenix speaks ${this.enumerator.getLanguages().length}+ languages natively</p>

                    <div class="language-selector">
                        ${this.renderLanguageSelector()}
                    </div>
                </div>

                <div class="onboarding-section">
                    <h2 class="section-title">🎤 Choose Your Voice</h2>
                    <p class="section-subtitle">Pick from ${this.availableVoices.length} FREE iOS voices</p>

                    <div class="voice-selector" id="voice-list">
                        ${this.renderVoiceSelector()}
                    </div>
                </div>

                <div class="onboarding-actions">
                    <button class="test-voice-btn" onclick="voiceOnboarding.testCurrentSelection()">
                        🎧 Test Voice
                    </button>
                    <button class="save-btn" onclick="voiceOnboarding.saveAndContinue()">
                        Save & Continue →
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    }

    /**
     * Render personality card
     */
    renderPersonalityCard(personality) {
        const isSelected = this.selectedPersonality === personality.id;

        return `
            <div class="personality-card ${isSelected ? 'selected' : ''}"
                 data-personality="${personality.id}"
                 onclick="voiceOnboarding.selectPersonality('${personality.id}')"
                 style="--personality-color: ${personality.color}">
                <div class="personality-icon">${personality.icon}</div>
                <div class="personality-name">${personality.name}</div>
                <div class="personality-description">${personality.description}</div>
                ${isSelected ? '<div class="selected-badge">✓</div>' : ''}
            </div>
        `;
    }

    /**
     * Render language selector
     */
    renderLanguageSelector() {
        const languages = this.enumerator.generateLanguageOptions();

        return `
            <select class="language-dropdown" id="language-select" onchange="voiceOnboarding.onLanguageChange(this.value)">
                ${languages.map(lang => `
                    <option value="${lang.code}" ${lang.code === this.selectedLanguage ? 'selected' : ''}>
                        ${lang.flag} ${lang.name} (${lang.voiceCount} voices)
                    </option>
                `).join('')}
            </select>
        `;
    }

    /**
     * Render voice selector for current language
     */
    renderVoiceSelector() {
        const voices = this.enumerator.getVoicesForLanguage(this.selectedLanguage);

        if (voices.length === 0) {
            return '<p class="no-voices">No voices available for this language</p>';
        }

        return `
            <div class="voice-grid">
                ${voices.map(voice => {
                    const isSelected = this.selectedVoice?.name === voice.name;
                    return `
                        <div class="voice-card ${isSelected ? 'selected' : ''}"
                             data-voice="${voice.name}"
                             onclick="voiceOnboarding.selectVoice('${voice.name}')">
                            <div class="voice-name">${voice.name}</div>
                            <div class="voice-badges">
                                ${voice.localService ?
                                    '<span class="badge badge-local">Downloaded</span>' :
                                    '<span class="badge badge-cloud">Cloud</span>'}
                                ${voice.name.toLowerCase().includes('premium') ?
                                    '<span class="badge badge-premium">Premium</span>' : ''}
                            </div>
                            ${isSelected ? '<div class="selected-badge">✓</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Select personality
     */
    selectPersonality(personalityId) {
        this.selectedPersonality = personalityId;

        // Update UI
        document.querySelectorAll('.personality-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-personality="${personalityId}"]`)?.classList.add('selected');

        // Auto-select recommended voice for personality
        const personality = this.personalities.find(p => p.id === personalityId);
        if (personality) {
            const recommendedVoice = this.enumerator.getVoiceForPersonality(personalityId);
            if (recommendedVoice) {
                this.selectVoice(recommendedVoice.name);
            }
        }

        console.log(`🎭 Personality selected: ${personalityId}`);
    }

    /**
     * Handle language change
     */
    onLanguageChange(languageCode) {
        this.selectedLanguage = languageCode;

        // Re-render voice selector
        const voiceList = document.getElementById('voice-list');
        if (voiceList) {
            voiceList.innerHTML = this.renderVoiceSelector();
        }

        // Auto-select first voice for language
        const voices = this.enumerator.getVoicesForLanguage(languageCode);
        if (voices.length > 0) {
            this.selectVoice(voices[0].name);
        }

        console.log(`🌍 Language changed: ${languageCode}`);
    }

    /**
     * Select voice
     */
    selectVoice(voiceName) {
        this.selectedVoice = this.availableVoices.find(v => v.name === voiceName);

        // Update UI
        document.querySelectorAll('.voice-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-voice="${voiceName}"]`)?.classList.add('selected');

        console.log(`🎤 Voice selected: ${voiceName}`);
    }

    /**
     * Test current selection
     */
    testCurrentSelection() {
        if (!this.selectedVoice) {
            alert('Please select a voice first');
            return;
        }

        const personality = this.personalities.find(p => p.id === this.selectedPersonality);
        const testMessages = {
            'friendly_helpful': 'Hi there! I\'m Phoenix, your friendly AI companion. I\'m here to help you optimize your health and performance.',
            'professional_serious': 'Good day. I\'m Phoenix, your performance optimization system. I analyze your data with precision.',
            'british_refined': 'Good evening. I am Phoenix, your personal butler for health and performance optimization.',
            'whimsical_storyteller': 'Welcome, dear friend! I\'m Phoenix, weaving the story of your health journey together.',
            'gentle_nurturing': 'Hello, dear one. I\'m Phoenix, here to support you with care and compassion.',
            'neutral_efficient': 'Phoenix online. Ready to optimize your performance metrics.',
            'motivational_coach': 'Let\'s GO! I\'m Phoenix, and I\'m here to CRUSH your goals together!',
            'zen_master': 'Peace, my friend. I am Phoenix, your guide to mindful optimization.',
            'tech_genius': 'Greetings. Phoenix AI system initialized. All metrics nominal.',
            'comedian': 'Hey there! Phoenix here, ready to make health optimization actually FUN.',
            'therapist': 'Hello. I\'m Phoenix, here to support your journey with reflection and understanding.',
            'commander': 'Attention! Phoenix here. Time to take ACTION and dominate your goals.'
        };

        const message = testMessages[this.selectedPersonality] || testMessages['friendly_helpful'];

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = this.selectedVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        speechSynthesis.speak(utterance);

        console.log(`🎧 Testing: ${this.selectedPersonality} with ${this.selectedVoice.name}`);
    }

    /**
     * Save and continue
     */
    saveAndContinue() {
        if (!this.selectedVoice) {
            alert('Please select a voice');
            return;
        }

        // Save to localStorage
        const voiceSettings = {
            personality: this.selectedPersonality,
            language: this.selectedLanguage,
            voiceName: this.selectedVoice.name,
            voiceURI: this.selectedVoice.voiceURI
        };

        localStorage.setItem('phoenixVoiceSettings', JSON.stringify(voiceSettings));

        console.log('✅ Voice settings saved:', voiceSettings);

        // Dispatch event for parent
        window.dispatchEvent(new CustomEvent('phoenixVoiceConfigured', { detail: voiceSettings }));

        // Alert user
        alert(`✅ Voice configured!\n\nPersonality: ${this.personalities.find(p => p.id === this.selectedPersonality).name}\nLanguage: ${this.selectedLanguage}\nVoice: ${this.selectedVoice.name}`);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Personality cards are handled by onclick
        // Language selector handled by onchange
        // Voice cards handled by onclick
    }

    /**
     * Get saved settings
     */
    static getSavedSettings() {
        const saved = localStorage.getItem('phoenixVoiceSettings');
        return saved ? JSON.parse(saved) : null;
    }

    /**
     * Apply saved settings
     */
    static async applySavedSettings(tts) {
        const settings = VoiceOnboarding.getSavedSettings();

        if (!settings) {
            console.log('⚠️ No saved voice settings');
            return false;
        }

        // Set voice by name
        tts.setVoice(settings.voiceName);

        console.log('✅ Applied saved voice settings:', settings);
        return true;
    }
}

// Export
window.VoiceOnboarding = VoiceOnboarding;

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .voice-onboarding {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }

    .onboarding-section {
        margin-bottom: 60px;
    }

    .section-title {
        font-size: 2em;
        margin-bottom: 10px;
        text-align: center;
    }

    .section-subtitle {
        text-align: center;
        color: #aaa;
        margin-bottom: 30px;
    }

    .personality-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .personality-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }

    .personality-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--personality-color);
        transform: translateY(-4px);
    }

    .personality-card.selected {
        background: linear-gradient(135deg, var(--personality-color) 0%, rgba(255, 255, 255, 0.1) 100%);
        border-color: var(--personality-color);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .personality-icon {
        font-size: 3em;
        margin-bottom: 15px;
    }

    .personality-name {
        font-size: 1.3em;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .personality-description {
        color: #aaa;
        font-size: 0.9em;
    }

    .selected-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: #2ed573;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        font-weight: bold;
    }

    .language-selector {
        max-width: 600px;
        margin: 0 auto;
    }

    .language-dropdown {
        width: 100%;
        padding: 15px;
        font-size: 1.1em;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: white;
        cursor: pointer;
    }

    .language-dropdown option {
        background: #1a1a2e;
        color: white;
    }

    .voice-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
    }

    .voice-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }

    .voice-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: #667eea;
    }

    .voice-card.selected {
        background: linear-gradient(135deg, #667eea 0%, rgba(255, 255, 255, 0.1) 100%);
        border-color: #667eea;
    }

    .voice-name {
        font-weight: bold;
        margin-bottom: 10px;
    }

    .voice-badges {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
    }

    .badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.75em;
    }

    .badge-local {
        background: rgba(46, 213, 115, 0.2);
        color: #2ed573;
    }

    .badge-cloud {
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
    }

    .badge-premium {
        background: rgba(255, 215, 0, 0.2);
        color: #ffd700;
    }

    .onboarding-actions {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 60px;
    }

    .test-voice-btn, .save-btn {
        padding: 15px 40px;
        font-size: 1.1em;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .test-voice-btn {
        background: rgba(102, 126, 234, 0.2);
        border: 2px solid #667eea;
        color: #667eea;
    }

    .test-voice-btn:hover {
        background: rgba(102, 126, 234, 0.3);
        transform: scale(1.05);
    }

    .save-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .save-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
    }

    .no-voices {
        text-align: center;
        color: #aaa;
        padding: 40px;
    }
`;
document.head.appendChild(style);

console.log('✅ Voice Onboarding module loaded');
