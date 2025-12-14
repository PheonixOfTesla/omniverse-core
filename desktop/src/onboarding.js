// public/src/onboarding.js - Complete Cinematic Onboarding Engine
// Phase 0: Voice & Language Selection → Phase 1-9: Cinematic Experience

import API from './api.js';

class OnboardingEngine {
    constructor() {
        this.currentPhase = 0; // Start at Phase 0 (voice/language selection)
        this.totalPhases = 9;
        this.userData = {
            name: '',
            age: null,
            height: null,
            weight: null,
            goals: []
        };
        this.locationData = null;
        this.liveMetrics = null;
        this.selectedIntegrations = [];
        this.selectedLanguage = 'en';
        this.selectedVoice = 'nova';
        this.dialogueQueue = [];
        this.voicePlaying = false;
        this.previewAudio = null;
        
        // Language options
        this.languages = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'zh', name: '中文', flag: '🇨🇳' }
        ];
        
        // Voice options (OpenAI TTS)
        this.voices = [
            { 
                id: 'nova', 
                name: 'Nova', 
                description: 'Warm, Professional, Balanced',
                personality: 'Friendly and approachable',
                gender: 'Female',
                icon: '👩‍💼',
                previewText: 'Hello. I\'m Phoenix, your AI companion. Ready to optimize your life?'
            },
            { 
                id: 'alloy', 
                name: 'Alloy', 
                description: 'Neutral, Clear, Versatile',
                personality: 'Professional and clear',
                gender: 'Neutral',
                icon: '🎭',
                previewText: 'Good evening. I\'m Phoenix. Let me show you what I can do.'
            },
            { 
                id: 'echo', 
                name: 'Echo', 
                description: 'Calm, Soothing, Gentle',
                personality: 'Calm and reassuring',
                gender: 'Male',
                icon: '🧘‍♂️',
                previewText: 'Welcome. I\'m Phoenix, your personal AI strategist.'
            },
            { 
                id: 'fable', 
                name: 'Fable', 
                description: 'Expressive, Dynamic, Engaging',
                personality: 'Expressive and engaging',
                gender: 'Male',
                icon: '🎪',
                previewText: 'Hey there! I\'m Phoenix. Let\'s make some magic happen.'
            },
            { 
                id: 'onyx', 
                name: 'Onyx', 
                description: 'Deep, Authoritative, Commanding',
                personality: 'Authoritative and powerful',
                gender: 'Male',
                icon: '👔',
                previewText: 'I am Phoenix. Your AI chief of staff. Let\'s begin.'
            },
            { 
                id: 'shimmer', 
                name: 'Shimmer', 
                description: 'Bright, Energetic, Uplifting',
                personality: 'Energetic and uplifting',
                gender: 'Female',
                icon: '✨',
                previewText: 'Hi! I\'m Phoenix, and I\'m so excited to work with you!'
            }
        ];
        
        // Dialogue scripts for Phase 2-9 (Phase 1 is silent)
        this.dialogues = {
            phase2: {
                greeting: (name) => `Good evening, ${name}.`,
                intro1: "I'm Phoenix. Your personal AI companion and chief of staff.",
                intro2: "I've already started learning about you.",
                closing: "I know you're busy. That's why I'm here."
            },
            phase3: {
                title: "Think of me as Alfred meets JARVIS.",
                alfred: "Like Alfred, I handle your daily life. Making restaurant reservations. Ordering food. Booking rides. Sending messages.",
                jarvis: "But like JARVIS, I'm intelligent. I analyze patterns. Predict problems before they happen. Optimize everything automatically.",
                merge: "I'm both. Your butler and your AI strategist."
            },
            phase4: {
                intro: "Here's what a typical day with me looks like:",
                breakfast: "7:00 AM - You think: 'I want breakfast.' I order your usual from Uber Eats before you even ask. It arrives exactly when you want it.",
                meeting: "9:30 AM - I notice your morning meeting is back-to-back with three others. I automatically reschedule the 2 PM call to Thursday when your energy is higher.",
                workout: "11:00 AM - Your HRV is low today. I cancel your high-intensity workout and generate a recovery session instead. No debate. I'm protecting you from yourself.",
                uber: "5:30 PM - Dinner reservation at 7:00 PM. I book your Uber for 6:35 PM - exactly when you need to leave based on real-time traffic.",
                dentist: "8:00 PM - Your dentist keeps calling. I answer, handle the rescheduling, and add it to your calendar. You never touched your phone.",
                closing: "I'm not just an app you open. I'm running in the background, constantly working for you."
            },
            phase5: {
                title: "Any app can track data. I predict the future.",
                illness: "Illness Prediction: Based on your HRV trend, sleep quality, and training load, there's a 73% chance you'll feel run down in 5 days. I've already adjusted your workout schedule and ordered vitamin C.",
                burnout: "Burnout Forecast: Your meeting density next week is 4x normal. I've blocked two 'focus time' sessions and moved 3 non-urgent calls. I'm protecting your mental health.",
                performance: "Performance Windows: Tomorrow you'll peak between 10 AM and 12 PM. I've moved your important presentation to 10:30 AM and scheduled emails to send then.",
                closing: "This is what I do. I think ahead so you don't have to."
            },
            phase6: {
                title: "Humans can track one thing at a time. I track everything, all at once.",
                sleep: "Sleep ↔ Workout Performance: When you sleep less than 7 hours, your training performance drops 23%. I automatically scale your workouts on low-sleep days.",
                stress: "Stress ↔ Spending: On days when your HRV indicates high stress, your spending increases 47%. Last Tuesday, you were stressed—I blocked impulse purchases on Amazon. Saved you $127.",
                calendar: "Calendar ↔ Energy: You have 31% less energy on days with 4+ meetings. I now schedule heavy meeting days only when your recovery score is above 75.",
                nutrition: "Nutrition ↔ Sleep: Eating carbs after 8 PM reduces your sleep quality by 18%. I now schedule your last meal for 7:30 PM and suggest protein-rich options.",
                closing: "These correlations took me 47 days to discover. A human would take years—if they even noticed at all. This is the difference between tracking and intelligence."
            },
            phase7: {
                title: "You have goals. I make sure you hit them.",
                intro: "Let's say you want to lose 15 pounds by June. Here's what I do:",
                closing: "I don't just help you reach goals. I make sure you never lose them."
            },
            phase8: {
                title: "I'm only as smart as the data you give me.",
                intro: "Right now, I'm working with limited information. But if you connect me to your life...",
                power: "The more I know, the smarter I become. The smarter I become, the more I can do for you.",
                control: "But here's the critical part: You're always in control.",
                permission: "Every action I take requires your permission—until you trust me enough to let me work autonomously.",
                closing: "That's the end goal. You focus on what matters. I handle everything else."
            },
            phase9: {
                ready: "So... are you ready?",
                shown: "I've shown you what I can do. Now let's make it real.",
                promise1: "Give me 30 days, and I'll save you 10 hours a week.",
                promise2: "Give me 90 days, and I'll help you achieve a goal you've been putting off for years.",
                promise3: "Give me a year, and I'll fundamentally change how you operate as a human being.",
                question: "So... what do you say?"
            }
        };
    }

    // ========================================
    // 🚀 INITIALIZATION
    // ========================================

    async init() {
        console.log('🎬 Initializing Onboarding Engine...');
        
        try {
            // Check if onboarding already completed
            const completed = localStorage.getItem('phoenixOnboardingComplete');
            if (completed === 'true') {
                console.log('Onboarding already completed, redirecting...');
                window.location.href = 'index.html';
                return;
            }
            
            // Start at Phase 0 (Voice & Language Selection)
            this.renderPhase0();
            
            // Setup global handlers
            this.setupSkipButton();
            this.setupPhaseNavigation();
            
            console.log('Onboarding Engine initialized');
        } catch (error) {
            console.error('❌ Onboarding init error:', error);
        }
    }

    // ========================================
    // 📱 PHASE 0: VOICE & LANGUAGE SELECTION
    // ========================================

    renderPhase0() {
        console.log('Rendering Phase 0: Voice & Language Selection');
        
        const container = document.getElementById('phase-0');
        if (!container) {
            console.error('Phase 0 container not found');
            return;
        }

        container.innerHTML = `
            <div class="setup-container">
                <!-- HEADER -->
                <div class="setup-header">
                    <div class="phoenix-logo-large">PHOENIX</div>
                    <div class="setup-subtitle">Personalize Your Experience</div>
                    <div class="setup-description">
                        Choose your language and voice before we begin your journey.
                    </div>
                </div>

                <!-- LANGUAGE SELECTION -->
                <div class="setup-section">
                    <h3 class="section-title">🌍 Select Your Language</h3>
                    <div class="language-grid" id="language-grid">
                        ${this.renderLanguageCards()}
                    </div>
                </div>

                <!-- VOICE SELECTION -->
                <div class="setup-section">
                    <h3 class="section-title">🎙️ Select Phoenix Voice</h3>
                    <div class="voice-grid" id="voice-grid">
                        ${this.renderVoiceCards()}
                    </div>
                </div>

                <!-- CONTINUE BUTTON -->
                <div class="setup-actions">
                    <button id="setup-continue" class="btn btn-primary" disabled>
                        <span>SELECT LANGUAGE & VOICE TO CONTINUE</span>
                    </button>
                </div>

                <!-- PROGRESS INDICATOR -->
                <div class="setup-progress">
                    <div class="progress-step active">1. Setup</div>
                    <div class="progress-step">2. Introduction</div>
                    <div class="progress-step">3. Capabilities</div>
                    <div class="progress-step">4. Activation</div>
                </div>
            </div>
        `;

        // Make Phase 0 visible
        container.classList.add('active');
        container.style.display = 'flex';

        // Setup event handlers
        this.setupPhase0Handlers();
    }

    renderLanguageCards() {
        return this.languages.map(lang => `
            <div class="language-card" data-language="${lang.code}">
                <div class="language-flag">${lang.flag}</div>
                <div class="language-name">${lang.name}</div>
                <div class="language-checkmark">✓</div>
            </div>
        `).join('');
    }

    renderVoiceCards() {
        return this.voices.map(voice => `
            <div class="voice-card" data-voice="${voice.id}">
                <div class="voice-header">
                    <div class="voice-icon">${voice.icon}</div>
                    <div class="voice-name">${voice.name}</div>
                    <div class="voice-gender">${voice.gender}</div>
                </div>
                <div class="voice-description">${voice.description}</div>
                <div class="voice-personality">${voice.personality}</div>
                <button class="voice-preview-btn" data-voice="${voice.id}">
                    <span class="preview-icon">▶</span>
                    <span class="preview-text">Preview</span>
                </button>
                <div class="voice-checkmark">✓</div>
            </div>
        `).join('');
    }

    setupPhase0Handlers() {
        // Language card selection
        document.querySelectorAll('.language-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectLanguage(card.dataset.language);
            });
        });

        // Voice card selection
        document.querySelectorAll('.voice-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking preview button
                if (e.target.closest('.voice-preview-btn')) return;
                this.selectVoice(card.dataset.voice);
            });
        });

        // Voice preview buttons
        document.querySelectorAll('.voice-preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.previewVoice(btn.dataset.voice);
            });
        });

        // Continue button
        const continueBtn = document.getElementById('setup-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.completePhase0();
            });
        }
    }

    selectLanguage(code) {
        console.log('Language selected:', code);
        this.selectedLanguage = code;

        // Update UI
        document.querySelectorAll('.language-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-language="${code}"]`).classList.add('selected');

        // Enable continue button if both selected
        this.updateContinueButton();
    }

    selectVoice(voiceId) {
        console.log('Voice selected:', voiceId);
        this.selectedVoice = voiceId;

        // Update UI
        document.querySelectorAll('.voice-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-voice="${voiceId}"]`).classList.add('selected');

        // Enable continue button if both selected
        this.updateContinueButton();
    }

    async previewVoice(voiceId) {
        console.log('🔊 Previewing voice:', voiceId);

        const btn = document.querySelector(`[data-voice="${voiceId}"] .voice-preview-btn`);
        const voice = this.voices.find(v => v.id === voiceId);

        if (!voice) return;

        try {
            // Stop any currently playing preview
            if (this.previewAudio) {
                this.previewAudio.pause();
                this.previewAudio = null;
            }

            // Update button state
            btn.innerHTML = '<span class="preview-icon">⏸</span><span class="preview-text">Playing...</span>';
            btn.disabled = true;

            // Get audio from API
            const audioBlob = await API.textToSpeech(voice.previewText, voiceId, 1.0);
            const audioUrl = URL.createObjectURL(audioBlob);
            
            this.previewAudio = new Audio(audioUrl);
            
            this.previewAudio.onended = () => {
                btn.innerHTML = '<span class="preview-icon">▶</span><span class="preview-text">Preview</span>';
                btn.disabled = false;
                URL.revokeObjectURL(audioUrl);
                this.previewAudio = null;
            };

            this.previewAudio.onerror = () => {
                console.error('Preview playback error');
                btn.innerHTML = '<span class="preview-icon">▶</span><span class="preview-text">Preview</span>';
                btn.disabled = false;
                URL.revokeObjectURL(audioUrl);
                this.previewAudio = null;
            };

            await this.previewAudio.play();
            
        } catch (error) {
            console.error('Preview error:', error);
            btn.innerHTML = '<span class="preview-icon">▶</span><span class="preview-text">Error</span>';
            setTimeout(() => {
                btn.innerHTML = '<span class="preview-icon">▶</span><span class="preview-text">Preview</span>';
                btn.disabled = false;
            }, 2000);
        }
    }

    updateContinueButton() {
        const continueBtn = document.getElementById('setup-continue');
        if (!continueBtn) return;

        if (this.selectedLanguage && this.selectedVoice) {
            continueBtn.disabled = false;
            continueBtn.innerHTML = '<span>CONTINUE TO PHOENIX →</span>';
            continueBtn.classList.add('enabled');
        } else {
            continueBtn.disabled = true;
            continueBtn.innerHTML = '<span>SELECT LANGUAGE & VOICE TO CONTINUE</span>';
            continueBtn.classList.remove('enabled');
        }
    }

    async completePhase0() {
        console.log('Phase 0 complete:', {
            language: this.selectedLanguage,
            voice: this.selectedVoice
        });

        // Save to localStorage
        localStorage.setItem('phoenixLanguage', this.selectedLanguage);
        localStorage.setItem('phoenixVoice', this.selectedVoice);

        // Update voice interface with selected voice
        if (window.voiceInterface) {
            window.voiceInterface.selectedVoice = this.selectedVoice;
            window.voiceInterface.saveSettings();
        }

        // Proceed to Phase 0.5 (User Profile Collection)
        this.renderPhase05();
    }

    // ========================================
    // 👤 PHASE 0.5: USER PROFILE COLLECTION
    // ========================================

    renderPhase05() {
        console.log('Rendering Phase 0.5: User Profile Collection');

        // Hide Phase 0
        const phase0 = document.getElementById('phase-0');
        if (phase0) {
            phase0.classList.remove('active');
            phase0.style.display = 'none';
        }

        // Create or get Phase 0.5 container
        let container = document.getElementById('phase-05');
        if (!container) {
            container = document.createElement('div');
            container.id = 'phase-05';
            container.className = 'phase-container';
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <div class="setup-container">
                <!-- HEADER -->
                <div class="setup-header">
                    <div class="phoenix-logo-large">PHOENIX</div>
                    <div class="setup-subtitle">Let's Get to Know You</div>
                    <div class="setup-description">
                        Tell me about yourself so I can personalize your experience.
                    </div>
                </div>

                <!-- USER PROFILE FORM -->
                <div class="setup-section">
                    <div class="profile-form">
                        <!-- NAME -->
                        <div class="form-group">
                            <label class="form-label">What's your name?</label>
                            <input type="text" id="user-name" class="form-input" placeholder="Enter your full name" />
                        </div>

                        <!-- AGE -->
                        <div class="form-group">
                            <label class="form-label">How old are you?</label>
                            <input type="number" id="user-age" class="form-input" placeholder="Age" min="13" max="120" />
                        </div>

                        <!-- HEIGHT -->
                        <div class="form-group">
                            <label class="form-label">What's your height?</label>
                            <div class="form-row">
                                <input type="number" id="user-height-ft" class="form-input form-input-small" placeholder="Feet" min="3" max="8" />
                                <input type="number" id="user-height-in" class="form-input form-input-small" placeholder="Inches" min="0" max="11" />
                                <span style="margin: 0 10px; color: rgba(255,255,255,0.5);">or</span>
                                <input type="number" id="user-height-cm" class="form-input" placeholder="Centimeters" min="90" max="250" />
                            </div>
                        </div>

                        <!-- WEIGHT -->
                        <div class="form-group">
                            <label class="form-label">What's your weight?</label>
                            <div class="form-row">
                                <input type="number" id="user-weight-lbs" class="form-input" placeholder="Pounds" min="50" max="500" />
                                <span style="margin: 0 10px; color: rgba(255,255,255,0.5);">or</span>
                                <input type="number" id="user-weight-kg" class="form-input" placeholder="Kilograms" min="20" max="250" />
                            </div>
                        </div>

                        <!-- GOALS -->
                        <div class="form-group">
                            <label class="form-label">What are your primary goals? (Select all that apply)</label>
                            <div class="goals-grid">
                                <div class="goal-card" data-goal="weight_loss">
                                    <div class="goal-icon">⚖️</div>
                                    <div class="goal-name">Lose Weight</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="muscle_gain">
                                    <div class="goal-icon">💪</div>
                                    <div class="goal-name">Build Muscle</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="fitness">
                                    <div class="goal-icon">🏃</div>
                                    <div class="goal-name">Improve Fitness</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="sleep">
                                    <div class="goal-icon">😴</div>
                                    <div class="goal-name">Better Sleep</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="productivity">
                                    <div class="goal-icon">📈</div>
                                    <div class="goal-name">Boost Productivity</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="stress">
                                    <div class="goal-icon">🧘</div>
                                    <div class="goal-name">Reduce Stress</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="health">
                                    <div class="goal-icon">❤️</div>
                                    <div class="goal-name">General Health</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                                <div class="goal-card" data-goal="performance">
                                    <div class="goal-icon">🎯</div>
                                    <div class="goal-name">Peak Performance</div>
                                    <div class="goal-checkmark">✓</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CONTINUE BUTTON -->
                <div class="setup-actions">
                    <button id="profile-continue" class="btn btn-primary">
                        <span>CONTINUE →</span>
                    </button>
                </div>

                <!-- PROGRESS INDICATOR -->
                <div class="setup-progress">
                    <div class="progress-step completed">1. Setup</div>
                    <div class="progress-step active">2. Profile</div>
                    <div class="progress-step">3. Introduction</div>
                    <div class="progress-step">4. Activation</div>
                </div>
            </div>
        `;

        // Make Phase 0.5 visible
        container.classList.add('active');
        container.style.display = 'flex';

        // Setup event handlers
        this.setupPhase05Handlers();
    }

    setupPhase05Handlers() {
        // Goal card selection
        document.querySelectorAll('.goal-card').forEach(card => {
            card.addEventListener('click', () => {
                const goal = card.dataset.goal;
                if (this.userData.goals.includes(goal)) {
                    // Remove
                    this.userData.goals = this.userData.goals.filter(g => g !== goal);
                    card.classList.remove('selected');
                } else {
                    // Add
                    this.userData.goals.push(goal);
                    card.classList.add('selected');
                }
                console.log('Selected goals:', this.userData.goals);
            });
        });

        // Height field auto-switching (if user enters feet/inches, clear cm and vice versa)
        const heightFt = document.getElementById('user-height-ft');
        const heightIn = document.getElementById('user-height-in');
        const heightCm = document.getElementById('user-height-cm');

        [heightFt, heightIn].forEach(input => {
            input?.addEventListener('input', () => {
                if (input.value) {
                    heightCm.value = '';
                }
            });
        });

        heightCm?.addEventListener('input', () => {
            if (heightCm.value) {
                heightFt.value = '';
                heightIn.value = '';
            }
        });

        // Weight field auto-switching
        const weightLbs = document.getElementById('user-weight-lbs');
        const weightKg = document.getElementById('user-weight-kg');

        weightLbs?.addEventListener('input', () => {
            if (weightLbs.value) {
                weightKg.value = '';
            }
        });

        weightKg?.addEventListener('input', () => {
            if (weightKg.value) {
                weightLbs.value = '';
            }
        });

        // Continue button
        const continueBtn = document.getElementById('profile-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.completePhase05();
            });
        }
    }

    async completePhase05() {
        console.log('Phase 0.5: Collecting user profile data...');

        // Collect name
        const nameInput = document.getElementById('user-name');
        this.userData.name = nameInput?.value?.trim() || '';

        // Collect age
        const ageInput = document.getElementById('user-age');
        this.userData.age = ageInput?.value ? parseInt(ageInput.value) : null;

        // Collect height (convert to cm for backend)
        const heightFt = document.getElementById('user-height-ft');
        const heightIn = document.getElementById('user-height-in');
        const heightCm = document.getElementById('user-height-cm');

        if (heightCm?.value) {
            this.userData.height = parseInt(heightCm.value);
        } else if (heightFt?.value || heightIn?.value) {
            const ft = parseInt(heightFt?.value || 0);
            const inches = parseInt(heightIn?.value || 0);
            const totalInches = (ft * 12) + inches;
            this.userData.height = Math.round(totalInches * 2.54); // Convert to cm
        }

        // Collect weight (convert to kg for backend)
        const weightLbs = document.getElementById('user-weight-lbs');
        const weightKg = document.getElementById('user-weight-kg');

        if (weightKg?.value) {
            this.userData.weight = parseFloat(weightKg.value);
        } else if (weightLbs?.value) {
            this.userData.weight = Math.round(parseFloat(weightLbs.value) * 0.453592 * 10) / 10; // Convert to kg
        }

        console.log('User profile collected:', this.userData);

        // Validate - at least name is required
        if (!this.userData.name) {
            alert('Please enter your name to continue.');
            return;
        }

        // Save user profile to backend
        try {
            await API.updateProfile({
                name: this.userData.name,
                age: this.userData.age,
                height: this.userData.height,
                weight: this.userData.weight,
                goals: this.userData.goals,
                preferences: {
                    language: this.selectedLanguage,
                    voice: this.selectedVoice
                }
            });
            console.log('✅ User profile saved to backend');
        } catch (error) {
            console.error('❌ Failed to save user profile:', error);
            // Continue anyway - they can update later
        }

        // Hide Phase 0.5
        const container = document.getElementById('phase-05');
        if (container) {
            container.classList.remove('active');
            container.style.display = 'none';
        }

        // Proceed to Phase 1 (Awakening)
        this.goToPhase(1);
    }

    // ========================================
    // 🌟 PHASE NAVIGATION
    // ========================================

    setupPhaseNavigation() {
        const nav = document.getElementById('phase-nav');
        if (!nav) return;

        // Clear existing dots
        nav.innerHTML = '';

        // Create dots for phases 1-9 (Phase 0 is setup, not in nav)
        for (let i = 1; i <= this.totalPhases; i++) {
            const dot = document.createElement('div');
            dot.className = 'phase-dot';
            if (i === 1) dot.classList.add('active');
            dot.dataset.phase = i;
            nav.appendChild(dot);
        }
    }

    goToPhase(phase) {
        if (phase < 0 || phase > this.totalPhases) return;
        
        console.log(`📍 Moving to Phase ${phase}`);
        
        // Hide current phase
        document.querySelector('.phase-container.active')?.classList.remove('active');
        
        // Show new phase
        const newPhase = document.getElementById(`phase-${phase}`);
        if (newPhase) {
            newPhase.classList.add('active');
            newPhase.style.display = 'flex';
            this.currentPhase = phase;
            
            // Update navigation dots (only for phases 1-9)
            if (phase >= 1) {
                document.querySelectorAll('.phase-dot').forEach((dot, index) => {
                    dot.classList.remove('active');
                    if (index + 1 === phase) {
                        dot.classList.add('active');
                    }
                });
            }
            
            // Trigger phase-specific actions
            this.onPhaseEnter(phase);
        }
    }

    onPhaseEnter(phase) {
        console.log(`🎬 Entering Phase ${phase}`);

        switch(phase) {
            case 1:
                // Auto-advance to Phase 2 after 4 seconds
                setTimeout(() => {
                    this.goToPhase(2);
                }, 4000);
                break;

            case 2:
                // Fetch user data and location
                this.fetchUserData();
                this.fetchLocationData();
                break;

            case 5:
                // Generate live prediction
                setTimeout(() => {
                    this.generateLivePrediction();
                }, 2000);
                break;

            case 6:
                // Generate correlation web
                setTimeout(() => {
                    this.generateCorrelationWeb();
                }, 500);
                break;

            case 8:
                // Animate trust meter
                setTimeout(() => {
                    this.animateTrustMeter();
                }, 1000);
                break;
        }
    }

    // ========================================
    // 📊 DATA FETCHING & PERSONALIZATION
    // ========================================

    async fetchUserData() {
        try {
            const response = await API.getMe();
            if (response.success && response.user) {
                this.userData = response.user;
                console.log('User data loaded:', this.userData.name);
                this.updateGreeting();
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Use fallback
            this.userData = { name: 'Friend' };
            this.updateGreeting();
        }
    }

    async fetchLocationData() {
        try {
            // Use ipapi.co for free geolocation
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            this.locationData = {
                city: data.city,
                region: data.region,
                country: data.country_name,
                lat: data.latitude,
                lon: data.longitude,
                timezone: data.timezone
            };
            
            console.log('Location data loaded:', this.locationData.city);
            
            // Fetch weather
            await this.fetchWeatherData();
            
            // Update location display
            this.updateLocationDisplay();
        } catch (error) {
            console.error('Failed to fetch location:', error);
            // Fallback
            this.locationData = {
                city: 'Your Location',
                region: '',
                country: ''
            };
            this.updateLocationDisplay();
        }
    }

    async fetchWeatherData() {
        if (!this.locationData) return;
        
        try {
            // Use Open-Meteo (free, no API key needed)
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.locationData.lat}&longitude=${this.locationData.lon}&current_weather=true`;
            const response = await fetch(url);
            const data = await response.json();
            
            this.locationData.weather = {
                temp: Math.round(data.current_weather.temperature * 9/5 + 32), // Convert to Fahrenheit
                condition: this.getWeatherCondition(data.current_weather.weathercode)
            };
            
            console.log('Weather data loaded:', this.locationData.weather);
            this.updateLocationDisplay();
        } catch (error) {
            console.error('Failed to fetch weather:', error);
        }
    }

    getWeatherCondition(code) {
        // Weather code mapping (Open-Meteo)
        if (code === 0) return 'Clear';
        if (code <= 3) return 'Partly cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        if (code <= 82) return 'Showers';
        return 'Stormy';
    }

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        
        const name = this.userData?.name?.split(' ')[0] || 'Friend';
        
        const titleEl = document.getElementById('greeting-title');
        if (titleEl) {
            titleEl.textContent = `${greeting}, ${name}`;
        }

        // Update dialogue
        if (this.dialogues.phase2) {
            this.dialogues.phase2.greeting = (userName) => `${greeting}, ${userName}.`;
        }
    }

    updateLocationDisplay() {
        const container = document.getElementById('location-info');
        if (!container) return;
        
        if (!this.locationData) {
            container.innerHTML = '<div class="loading-spinner"></div>';
            return;
        }
        
        const weatherTemp = this.locationData.weather?.temp || '--';
        const weatherCondition = this.locationData.weather?.condition || 'Loading';
        
        container.innerHTML = `
            <div class="info-item">
                <div class="info-icon">📍</div>
                <div>You're in ${this.locationData.city}, ${this.locationData.region}</div>
            </div>
            <div class="info-item">
                <div class="info-icon">🌡️</div>
                <div>It's ${weatherTemp}°F and ${weatherCondition.toLowerCase()}</div>
            </div>
            <div class="info-item">
                <div class="info-icon">🌙</div>
                <div>I'm here to make your life easier</div>
            </div>
        `;
    }

    async generateLivePrediction() {
        const textEl = document.getElementById('live-prediction-text');
        if (!textEl) return;
        
        try {
            // Fetch recovery data
            const response = await API.getRecoveryScore();
            
            if (response.success && response.data) {
                const recovery = response.data.recoveryScore || 0;
                const hrv = response.data.hrv || 0;
                
                let recommendation = '';
                if (recovery >= 80) {
                    recommendation = 'Your recovery is excellent. You\'re cleared for high-intensity training.';
                } else if (recovery >= 60) {
                    recommendation = 'Your recovery is good. Moderate intensity recommended.';
                } else if (recovery >= 40) {
                    recommendation = 'Your recovery is fair. I recommend low-intensity work today.';
                } else {
                    recommendation = 'Your recovery is low. Rest day recommended. I\'ll handle your schedule.';
                }
                
                textEl.innerHTML = `
                    Your recovery score is <strong>${Math.round(recovery)}%</strong>. 
                    Your HRV is <strong>${Math.round(hrv)}ms</strong>.
                    <br><br>
                    ${recommendation}
                `;

                // Speak via voice if enabled
                if (window.voiceInterface) {
                    window.voiceInterface.speak(recommendation, 'normal');
                }
            } else {
                textEl.innerHTML = 'Connect your wearable to see real-time predictions based on your data.';
            }
        } catch (error) {
            console.error('Failed to generate prediction:', error);
            textEl.innerHTML = 'Connect your wearable to unlock personalized predictions.';
        }
    }

    generateCorrelationWeb() {
        const container = document.getElementById('correlation-web');
        if (!container) return;

        container.innerHTML = '';
        
        const nodes = [
            { label: '💤 Sleep', x: '20%', y: '30%' },
            { label: '🏋️ Workouts', x: '80%', y: '30%' },
            { label: '💳 Spending', x: '20%', y: '70%' },
            { label: '😰 Stress', x: '80%', y: '70%' },
            { label: '📅 Calendar', x: '50%', y: '15%' },
            { label: '🔋 Energy', x: '50%', y: '85%' }
        ];
        
        // Draw nodes
        nodes.forEach((node, index) => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'correlation-node';
            nodeEl.textContent = node.label;
            nodeEl.style.left = node.x;
            nodeEl.style.top = node.y;
            nodeEl.style.animationDelay = `${index * 0.2}s`;
            container.appendChild(nodeEl);
        });
        
        // Draw lines (simplified - would need canvas/SVG for accurate lines)
        const lines = [
            { from: 0, to: 1 },
            { from: 2, to: 3 },
            { from: 4, to: 5 },
            { from: 0, to: 5 },
            { from: 1, to: 3 }
        ];
        
        lines.forEach((line, index) => {
            setTimeout(() => {
                const from = nodes[line.from];
                const to = nodes[line.to];
                
                const lineEl = document.createElement('div');
                lineEl.className = 'correlation-line';
                
                const fromX = parseFloat(from.x);
                const fromY = parseFloat(from.y);
                const toX = parseFloat(to.x);
                const toY = parseFloat(to.y);
                
                const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
                const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
                
                lineEl.style.width = `${length}%`;
                lineEl.style.left = `${fromX}%`;
                lineEl.style.top = `${fromY}%`;
                lineEl.style.transform = `rotate(${angle}deg)`;
                
                container.appendChild(lineEl);
            }, index * 300);
        });
    }

    animateTrustMeter() {
        const trustFill = document.querySelector('.trust-fill');
        if (trustFill) {
            trustFill.style.setProperty('--trust-level', '75%');
        }
    }

    // ========================================
    // 🎯 INTEGRATION SELECTION (Phase 8)
    // ========================================

    setupIntegrationHandlers() {
        document.querySelectorAll('.integration-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', () => {
                const integration = checkbox.dataset.integration;
                this.toggleIntegration(integration, checkbox);
            });
        });
    }

    toggleIntegration(integration, checkbox) {
        const index = this.selectedIntegrations.indexOf(integration);
        
        if (index > -1) {
            // Remove
            this.selectedIntegrations.splice(index, 1);
            checkbox.style.background = 'transparent';
            checkbox.innerHTML = '';
        } else {
            // Add
            this.selectedIntegrations.push(integration);
            checkbox.style.background = 'rgba(0, 217, 255, 0.3)';
            checkbox.innerHTML = '✓';
        }
        
        console.log('Selected integrations:', this.selectedIntegrations);
    }

    // ========================================
    // 🚀 FINAL ACTIVATION (Phase 9)
    // ========================================

    async selectOption(option) {
        console.log('User selected:', option);
        
        // Save selection
        localStorage.setItem('phoenixOnboardingChoice', option);
        localStorage.setItem('phoenixOnboardingComplete', 'true');
        
        // Save to backend
        try {
            await this.saveOnboardingToBackend(option, this.selectedIntegrations);
        } catch (error) {
            console.error('Failed to save onboarding:', error);
        }
        
        // Show loading
        const container = document.querySelector('#phase-9 .content-container');
        if (container) {
            container.innerHTML = `
                <div class="phoenix-orb" style="margin: 80px auto;">
                    <div class="orb-ring"></div>
                    <div class="orb-ring"></div>
                    <div class="orb-ring"></div>
                    <div class="orb-core"></div>
                </div>
                <div class="content-title">Initializing Phoenix...</div>
                <div class="content-subtitle">
                    ${option === 'all-in' ? 'Connecting all systems. This will take a moment...' : 
                      option === 'simple' ? 'Setting up your first connection...' : 
                      'Preparing your dashboard...'}
                </div>
                <div class="loading-spinner" style="margin: 60px auto;"></div>
            `;
        }
        
        // Voice announcement
        if (window.voiceInterface) {
            let message = '';
            if (option === 'all-in') {
                message = 'Excellent choice. Connecting all systems now. This is where the magic happens.';
            } else if (option === 'simple') {
                message = 'Smart choice. Let\'s start with your wearable and build from there.';
            } else {
                message = 'Take your time. I\'ll be here when you\'re ready to unlock my full potential.';
            }
            window.voiceInterface.speak(message, 'normal');
        }
        
        // Redirect based on choice
        setTimeout(() => {
            if (option === 'explore') {
                window.location.href = 'index.html';
            } else if (option === 'simple') {
                // Open wearable connection
                window.location.href = 'index.html?connect=wearable';
            } else if (option === 'all-in') {
                // Open full setup
                window.location.href = 'index.html?connect=all';
            }
        }, 3000);
    }

    async saveOnboardingToBackend(choice, integrations) {
        try {
            await API.updateProfile({
                name: this.userData.name,
                age: this.userData.age,
                height: this.userData.height,
                weight: this.userData.weight,
                goals: this.userData.goals,
                onboarding: {
                    completed: true,
                    completedAt: new Date().toISOString(),
                    choice: choice,
                    selectedIntegrations: integrations,
                    language: this.selectedLanguage,
                    voice: this.selectedVoice
                },
                preferences: {
                    language: this.selectedLanguage,
                    voice: this.selectedVoice
                }
            });
            console.log('✅ Onboarding and user profile saved to backend');
        } catch (error) {
            console.error('❌ Failed to save onboarding:', error);
            throw error;
        }
    }

    // ========================================
    // 🎨 BUTTON HANDLERS
    // ========================================

    setupButtonHandlers() {
        // Phase 2
        const introBtn = document.getElementById('intro-continue');
        if (introBtn) {
            introBtn.addEventListener('click', () => this.goToPhase(3));
        }
        
        // Phase 3
        const phase3Back = document.getElementById('phase3-back');
        const phase3Next = document.getElementById('phase3-next');
        if (phase3Back) phase3Back.addEventListener('click', () => this.goToPhase(2));
        if (phase3Next) phase3Next.addEventListener('click', () => this.goToPhase(4));
        
        // Phase 4
        const phase4Back = document.getElementById('phase4-back');
        const phase4Next = document.getElementById('phase4-next');
        if (phase4Back) phase4Back.addEventListener('click', () => this.goToPhase(3));
        if (phase4Next) phase4Next.addEventListener('click', () => this.goToPhase(5));
        
        // Phase 5
        const phase5Back = document.getElementById('phase5-back');
        const phase5Next = document.getElementById('phase5-next');
        if (phase5Back) phase5Back.addEventListener('click', () => this.goToPhase(4));
        if (phase5Next) phase5Next.addEventListener('click', () => this.goToPhase(6));
        
        // Phase 6
        const phase6Back = document.getElementById('phase6-back');
        const phase6Next = document.getElementById('phase6-next');
        if (phase6Back) phase6Back.addEventListener('click', () => this.goToPhase(5));
        if (phase6Next) phase6Next.addEventListener('click', () => this.goToPhase(7));
        
        // Phase 7
        const phase7Back = document.getElementById('phase7-back');
        const phase7Next = document.getElementById('phase7-next');
        if (phase7Back) phase7Back.addEventListener('click', () => this.goToPhase(6));
        if (phase7Next) phase7Next.addEventListener('click', () => this.goToPhase(8));
        
        // Phase 8
        const phase8Back = document.getElementById('phase8-back');
        const phase8Next = document.getElementById('phase8-next');
        if (phase8Back) phase8Back.addEventListener('click', () => this.goToPhase(7));
        if (phase8Next) phase8Next.addEventListener('click', () => this.goToPhase(9));
        
        // Setup integration checkboxes
        this.setupIntegrationHandlers();
        
        // Phase 9 - Selection buttons are handled inline in HTML via onclick
        // Expose selectOption to global scope
        window.selectOption = (option) => this.selectOption(option);
    }

    setupSkipButton() {
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipOnboarding());
        }
    }

    skipOnboarding() {
        if (confirm('Skip onboarding? You can always view it later from Settings.')) {
            localStorage.setItem('phoenixOnboardingComplete', 'true');
            localStorage.setItem('phoenixOnboardingChoice', 'skipped');
            window.location.href = 'index.html';
        }
    }

    // ========================================
    // 🧹 CLEANUP
    // ========================================

    destroy() {
        if (this.previewAudio) {
            this.previewAudio.pause();
            this.previewAudio = null;
        }
    }
}

// ========================================
// 🚀 INITIALIZE AND EXPOSE GLOBALLY
// ========================================

const onboardingEngine = new OnboardingEngine();
window.onboardingEngine = onboardingEngine;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        onboardingEngine.init();
        // Setup button handlers after DOM is fully loaded
        setTimeout(() => {
            onboardingEngine.setupButtonHandlers();
        }, 100);
    });
} else {
    onboardingEngine.init();
    setTimeout(() => {
        onboardingEngine.setupButtonHandlers();
    }, 100);
}

console.log('Onboarding Engine loaded');

export default onboardingEngine;