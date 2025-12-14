/**
 * GENESIS CONTROLLER
 * Main orchestrator for Genesis Mode
 * Wires parser → blueprint → builder → display
 */

class GenesisController {
    constructor() {
        this.parser = new GenesisParser();
        this.blueprintGen = new GenesisBlueprint();
        this.widgetBuilder = new GenesisWidgetBuilder();
        this.isActive = false;
        this.currentBlueprint = null;

        // Cache DOM elements
        this.domCache = {};

        // Debug mode (set to false in production)
        this.DEBUG = true;

        this.init();
    }

    /**
     * Initialize Genesis Mode
     */
    init() {
        this.log('🧬 Genesis Controller initializing...');
        try {
            this.createGenesisPanel();
            this.createBlueprintModal();
            this.createBuildingModal();
            this.attachEventListeners();
            this.log('✅ Genesis Controller ready');
        } catch (error) {
            this.error('Failed to initialize Genesis Controller:', error);
        }
    }

    /**
     * Debug logging (only in DEBUG mode)
     */
    log(...args) {
        if (this.DEBUG) console.log(...args);
    }

    /**
     * Error logging (always on)
     */
    error(...args) {
        console.error(...args);
    }

    /**
     * Get cached DOM element
     */
    getElement(id) {
        if (!this.domCache[id]) {
            this.domCache[id] = document.getElementById(id);
        }
        return this.domCache[id];
    }

    /**
     * Create Genesis Panel HTML
     */
    createGenesisPanel() {
        const panel = document.createElement('div');
        panel.id = 'genesis-panel';
        panel.innerHTML = `
            <div class="genesis-header">
                <div class="genesis-title">GENESIS</div>
                <div class="genesis-subtitle">Create Anything - Embed Any Website, Player, or Custom Widget</div>
            </div>

            <div class="genesis-input-container">
                <textarea
                    id="genesis-input"
                    class="genesis-input"
                    placeholder="Describe any interface element you want to create...

Examples:
• spotify music player with green theme
• youtube video player with red accents
• weather widget showing forecast
• quick notes panel with purple accents
• custom timer with blue theme
• news feed widget with orange borders
• maps widget showing location
• browser panel for any website
• motivational quote display with gold styling

Genesis embeds ANYTHING - YouTube, Spotify, websites, or custom widgets."></textarea>

                <button id="genesis-submit" class="genesis-submit-btn">
                    ⚡ Generate Blueprint
                </button>
            </div>

            <div class="genesis-quick-widgets">
                <div class="genesis-quick-widgets-title">Quick Add Widgets</div>
                <div class="genesis-widget-icons">
                    <button class="genesis-widget-icon" data-widget-type="email" title="Add Gmail">
                        <i class="fa-solid fa-envelope"></i>
                        <span class="label">Gmail</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="spotify" title="Add Spotify">
                        <i class="fa-solid fa-music"></i>
                        <span class="label">Spotify</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="youtube" title="Add YouTube">
                        <i class="fa-solid fa-video"></i>
                        <span class="label">YouTube</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="weather" title="Add Weather">
                        <i class="fa-solid fa-cloud-sun"></i>
                        <span class="label">Weather</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="news" title="Add News">
                        <i class="fa-solid fa-newspaper"></i>
                        <span class="label">News</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="notes" title="Add Notes">
                        <i class="fa-solid fa-note-sticky"></i>
                        <span class="label">Notes</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="timer" title="Add Timer">
                        <i class="fa-solid fa-stopwatch"></i>
                        <span class="label">Timer</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="maps" title="Add Maps">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <span class="label">Maps</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="todo" title="Add Todo">
                        <i class="fa-solid fa-list-check"></i>
                        <span class="label">Todo</span>
                    </button>
                    <button class="genesis-widget-icon" data-widget-type="browser" title="Add Browser">
                        <i class="fa-solid fa-globe"></i>
                        <span class="label">Browser</span>
                    </button>
                </div>
            </div>

            <div class="genesis-divider">
                <span>or describe custom widget</span>
            </div>

            <div class="genesis-examples">
                <div class="genesis-examples-title">Custom Examples</div>
                <div class="genesis-example" data-example="social media dashboard with gold borders">
                    📱 Social Dashboard
                </div>
                <div class="genesis-example" data-example="motivational quote display with purple theme">
                    💭 Daily Quotes
                </div>
                <div class="genesis-example" data-example="personal metrics dashboard cyan theme">
                    📊 Metrics Panel
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    /**
     * Create Blueprint Preview Modal
     */
    createBlueprintModal() {
        const modal = document.createElement('div');
        modal.id = 'genesis-blueprint-modal';
        modal.innerHTML = `
            <div class="blueprint-container">
                <div class="blueprint-title">📋 Widget Blueprint</div>
                <div id="blueprint-preview-content"></div>
                <div class="blueprint-actions">
                    <button class="blueprint-btn blueprint-btn-confirm" id="blueprint-confirm">
                        ✓ Confirm & Build
                    </button>
                    <button class="blueprint-btn blueprint-btn-edit" id="blueprint-edit">
                        ✏️ Edit
                    </button>
                    <button class="blueprint-btn blueprint-btn-cancel" id="blueprint-cancel">
                        ✕ Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Create Building Animation Modal
     */
    createBuildingModal() {
        const modal = document.createElement('div');
        modal.id = 'genesis-building-modal';
        modal.innerHTML = `
            <div class="building-spinner">
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#FFD700" stroke-width="4" opacity="0.3"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#00d9ff" stroke-width="4"
                            stroke-dasharray="251" stroke-dashoffset="50"
                            style="animation: spin 1.5s linear infinite"/>
                </svg>
            </div>
            <div class="building-text">Building your widget...</div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Submit button
        const submitBtn = this.getElement('genesis-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleGenerate());
        }

        // Input enter key
        const input = this.getElement('genesis-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.handleGenerate();
                }
            });
        }

        // Example clicks
        document.querySelectorAll('.genesis-example').forEach(example => {
            example.addEventListener('click', () => {
                const exampleText = example.getAttribute('data-example');
                const input = this.getElement('genesis-input');
                if (input) input.value = exampleText;
            });
        });

        // Quick widget icon clicks
        document.querySelectorAll('.genesis-widget-icon').forEach(button => {
            button.addEventListener('click', () => {
                const widgetType = button.getAttribute('data-widget-type');
                this.handleQuickWidget(widgetType);
            });
        });

        // Blueprint modal buttons
        const confirmBtn = this.getElement('blueprint-confirm');
        const editBtn = this.getElement('blueprint-edit');
        const cancelBtn = this.getElement('blueprint-cancel');

        if (confirmBtn) confirmBtn.addEventListener('click', () => this.handleConfirm());
        if (editBtn) editBtn.addEventListener('click', () => this.handleEdit());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleCancel());
    }

    /**
     * Handle generate button click
     * Uses GPT-5.2 for apex-level widget creation
     */
    async handleGenerate() {
        const inputEl = this.getElement('genesis-input');
        if (!inputEl) {
            this.error('Genesis input element not found');
            return;
        }

        const input = inputEl.value.trim();

        if (!input) {
            this.phoenixSpeak('Please describe what you want to build');
            return;
        }

        try {
            // Phoenix announces what she's doing
            this.phoenixSpeak(`Analyzing your request with apex intelligence...`);

            // Parse user input (local, fast)
            const parsed = this.parser.parse(input);
            this.log('📝 Parsed request:', parsed);

            // Phoenix speaks the interpretation
            this.phoenixSpeak(`Creating ${parsed.widgetType.replace(/-/g, ' ')} with ${parsed.styling.accentColor} theme...`);

            // Call backend GPT-5.2 for enhanced blueprint generation
            const enhancedBlueprint = await this.generateWithGPT52(input, parsed);

            if (enhancedBlueprint) {
                // Use GPT-5.2 enhanced blueprint
                this.currentBlueprint = enhancedBlueprint;
                this.log('🎯 GPT-5.2 Enhanced Blueprint:', this.currentBlueprint);
            } else {
                // Fallback to local generation
                this.currentBlueprint = this.blueprintGen.generate(parsed);
                this.log('📋 Local Blueprint (fallback):', this.currentBlueprint);
            }

            // Phoenix announces blueprint is ready
            this.phoenixSpeak('Blueprint generated. Review and confirm to build.');

            // Show blueprint preview
            this.showBlueprintPreview(this.currentBlueprint);

        } catch (error) {
            this.error('❌ Error generating blueprint:', error);
            this.phoenixSpeak('I encountered an issue. Please try again.');
        }
    }

    /**
     * Handle quick widget button click
     * Instantly creates predefined widgets without user input
     */
    async handleQuickWidget(widgetType) {
        const widgetPrompts = {
            'email': 'gmail email client with inbox view',
            'spotify': 'spotify music player with green theme',
            'youtube': 'youtube video player with red accents',
            'weather': 'weather widget showing forecast with blue sky theme',
            'news': 'news feed widget with orange borders',
            'notes': 'quick notes panel with purple accents',
            'timer': 'custom timer with blue theme',
            'maps': 'maps widget showing location',
            'todo': 'todo list widget with checkboxes',
            'browser': 'browser panel for websites'
        };

        const prompt = widgetPrompts[widgetType];
        if (!prompt) {
            this.error(`Unknown widget type: ${widgetType}`);
            return;
        }

        try {
            this.phoenixSpeak(`Adding ${widgetType} widget...`);

            // Parse the prompt
            const parsed = this.parser.parse(prompt);
            this.log('📝 Quick widget parsed:', parsed);

            // Generate blueprint (try GPT-5.2 first, then local fallback)
            const enhancedBlueprint = await this.generateWithGPT52(prompt, parsed);

            if (enhancedBlueprint) {
                this.currentBlueprint = enhancedBlueprint;
                this.log('🎯 GPT-5.2 Enhanced Blueprint:', this.currentBlueprint);
            } else {
                this.currentBlueprint = this.blueprintGen.generate(parsed);
                this.log('📋 Local Blueprint (fallback):', this.currentBlueprint);
            }

            // Auto-confirm for quick widgets (skip preview)
            this.handleConfirm();

        } catch (error) {
            this.error('❌ Error creating quick widget:', error);
            this.phoenixSpeak('I encountered an issue. Please try again.');
        }
    }

    /**
     * Generate blueprint with GPT-5.2 apex intelligence
     */
    async generateWithGPT52(userInput, parsedData) {
        try {
            const token = localStorage.getItem('phoenixToken');
            if (!token) {
                this.log('⚠️ No token, using local blueprint generation');
                return null;
            }

            const response = await fetch('/api/genesis/generate-blueprint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userInput: userInput,
                    parsedData: parsedData
                }),
                timeout: 10000 // 10 second timeout
            });

            if (!response.ok) {
                this.log('⚠️ GPT-5.2 unavailable, using local generation');
                return null;
            }

            const data = await response.json();
            return data?.blueprint || null;

        } catch (error) {
            this.log('⚠️ GPT-5.2 error, using local generation:', error.message);
            return null;
        }
    }

    /**
     * Phoenix speaks (TTS)
     */
    phoenixSpeak(message) {
        this.log(`🗣️ Phoenix: ${message}`);

        // Try to use global TTS if available
        if (window.voiceTTS && typeof window.voiceTTS.speak === 'function') {
            try {
                window.voiceTTS.speak(message);
            } catch (error) {
                this.error('TTS error:', error);
            }
        }
        // Try phoenix voice commands
        else if (window.phoenixVoiceCommands && typeof window.phoenixVoiceCommands.speak === 'function') {
            try {
                window.phoenixVoiceCommands.speak(message);
            } catch (error) {
                this.error('Phoenix voice error:', error);
            }
        }
        // Fallback to console
        else {
            this.log('💬 Phoenix (silent):', message);
        }
    }

    /**
     * Show blueprint preview modal
     */
    showBlueprintPreview(blueprint) {
        const content = this.getElement('blueprint-preview-content');
        const modal = this.getElement('genesis-blueprint-modal');

        if (!content || !modal) {
            this.error('Blueprint modal elements not found');
            return;
        }

        content.innerHTML = `
            <div style="margin-bottom: 20px; text-align: center;">
                <h3 style="color: #FFD700; margin-bottom: 10px;">${blueprint.name}</h3>
                <p style="opacity: 0.7; font-size: 14px;">${blueprint.type}</p>
            </div>
            ${this.blueprintGen.toPreviewHTML(blueprint)}
        `;

        modal.classList.add('active');
    }

    /**
     * Handle confirm & build
     */
    handleConfirm() {
        if (!this.currentBlueprint) {
            this.error('No blueprint to build');
            return;
        }

        // Hide blueprint modal
        const blueprintModal = this.getElement('genesis-blueprint-modal');
        if (blueprintModal) {
            blueprintModal.classList.remove('active');
        }

        // Phoenix announces building
        this.phoenixSpeak(`Building your ${this.currentBlueprint.name}...`);

        // Show building animation
        const buildingModal = this.getElement('genesis-building-modal');
        if (buildingModal) {
            buildingModal.classList.add('active');
        }

        // Build widget after delay (simulate building)
        setTimeout(() => {
            this.buildWidget(this.currentBlueprint);

            // Hide building modal
            if (buildingModal) {
                buildingModal.classList.remove('active');
            }

            // Clear input
            const input = this.getElement('genesis-input');
            if (input) {
                input.value = '';
            }

        }, 2500); // 2.5 second build time
    }

    /**
     * Handle edit button
     */
    handleEdit() {
        const blueprintModal = this.getElement('genesis-blueprint-modal');
        if (blueprintModal) {
            blueprintModal.classList.remove('active');
        }

        // Focus back on input for editing
        const input = this.getElement('genesis-input');
        if (input) {
            input.focus();
        }
    }

    /**
     * Handle cancel button
     */
    handleCancel() {
        const blueprintModal = this.getElement('genesis-blueprint-modal');
        if (blueprintModal) {
            blueprintModal.classList.remove('active');
        }
        this.currentBlueprint = null;
    }

    /**
     * Build and display widget
     * Adds to dock instead of showing directly
     */
    buildWidget(blueprint) {
        if (!blueprint) {
            this.error('No blueprint provided to buildWidget');
            return;
        }

        try {
            // Build widget DOM element
            const widget = this.widgetBuilder.build(blueprint);

            if (!widget) {
                throw new Error('Widget builder failed to create widget');
            }

            // Add to page (hidden initially - will be shown via dock)
            document.body.appendChild(widget);

            // Add to Genesis Dock
            if (window.genesisDock) {
                window.genesisDock.addWidget(widget, blueprint);
            } else {
                this.log('Genesis Dock not available, showing widget directly');
                // Fallback: show widget directly if dock not available
                setTimeout(() => {
                    widget.classList.add('active');
                    widget.classList.add('appearing');
                }, 50);
            }

            // Save to localStorage
            if (window.genesisWidgetManager) {
                window.genesisWidgetManager.saveWidget(blueprint.id, {
                    blueprint: blueprint,
                    position: {
                        x: parseInt(widget.style.left) || 0,
                        y: parseInt(widget.style.top) || 0
                    },
                    created: new Date().toISOString()
                });
            }

            this.log('✅ Widget created:', blueprint.id);

            // Show success notification
            if (typeof showModeNotification === 'function') {
                showModeNotification('Widget Created!', blueprint.name);
            }

        } catch (error) {
            this.error('❌ Error building widget:', error);
            this.phoenixSpeak('Error building widget. Please try again.');
        }
    }

    /**
     * Activate Genesis Mode
     */
    activate() {
        this.isActive = true;
        this.log('⚡ Genesis Mode activated');
    }

    /**
     * Deactivate Genesis Mode
     */
    deactivate() {
        this.isActive = false;
        this.log('⚡ Genesis Mode deactivated');
    }

    /**
     * Load saved widgets on startup
     */
    loadSavedWidgets() {
        if (!window.genesisWidgetManager) {
            this.log('Widget manager not available');
            return;
        }

        try {
            const savedWidgets = window.genesisWidgetManager.getAllWidgets();
            this.log(`📦 Loading ${savedWidgets.length} saved widgets...`);

            savedWidgets.forEach((widgetData, index) => {
                try {
                    const widget = this.widgetBuilder.build(widgetData.blueprint);

                    if (!widget) {
                        this.error(`Failed to build saved widget at index ${index}`);
                        return;
                    }

                    // Restore position
                    if (widgetData.position) {
                        widget.style.left = `${widgetData.position.x}px`;
                        widget.style.top = `${widgetData.position.y}px`;
                    }

                    document.body.appendChild(widget);

                    setTimeout(() => {
                        widget.classList.add('active');
                    }, 100);
                } catch (error) {
                    this.error(`Error loading saved widget at index ${index}:`, error);
                }
            });
        } catch (error) {
            this.error('Error loading saved widgets:', error);
        }
    }
}

// Initialize Genesis Controller when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        try {
            window.genesisController = new GenesisController();

            // Load saved widgets if not in Genesis mode initially
            const currentMode = document.body?.getAttribute('data-mode');
            if (currentMode !== 'genesis') {
                window.genesisController.loadSavedWidgets();
            }
        } catch (error) {
            console.error('Failed to initialize Genesis Controller:', error);
        }
    });
}

if (window.genesisController?.DEBUG) {
    console.log('✅ Genesis Controller loaded');
}
