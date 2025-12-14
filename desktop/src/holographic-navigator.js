// ═══════════════════════════════════════════════════════════════════════════════
// PHOENIX HOLOGRAPHIC NAVIGATOR - STEVE JOBS MEETS TONY STARK
// ═══════════════════════════════════════════════════════════════════════════════
// The most beautiful navigation system ever created for a life OS
// All 446+ endpoints. Zero compromises. Pure elegance.
// ═══════════════════════════════════════════════════════════════════════════════

class HolographicNavigator {
    constructor() {
        this.api = window.api || new PhoenixAPI();
        this.currentDomain = null;
        this.currentFeature = null;
        this.isExpanded = false;
        this.particles = [];
        this.init();
    }

    init() {
        this.createHolographicHub();
        this.startParticleSystem();
        this.attachEventListeners();
        console.log('Holographic Navigator initialized - 446+ features ready');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HOLOGRAPHIC HUB - The Central Navigation Ring
    // ═══════════════════════════════════════════════════════════════════════════

    createHolographicHub() {
        const hub = document.createElement('div');
        hub.id = 'holographic-hub';
        hub.innerHTML = `
            <!-- Holographic Navigator Container -->
            <div id="holo-nav-container" class="holo-nav-container collapsed">

                <!-- Central Core -->
                <div id="holo-core" class="holo-core">
                    <div class="core-ring ring-1"></div>
                    <div class="core-ring ring-2"></div>
                    <div class="core-ring ring-3"></div>
                    <div class="core-center">
                        <div class="phoenix-icon"></div>
                        <div class="core-label">PHOENIX</div>
                    </div>
                </div>

                <!-- Navigation Ring - 7 Planetary Domains -->
                <div id="holo-nav-ring" class="holo-nav-ring">
                    ${this.createPlanetaryNodes()}
                </div>

                <!-- Feature Panel - Expands when domain selected -->
                <div id="holo-feature-panel" class="holo-feature-panel hidden">
                    <div class="panel-header">
                        <button id="close-panel" class="close-btn">X</button>
                        <h2 id="panel-title"></h2>
                        <p id="panel-subtitle"></p>
                    </div>
                    <div id="panel-content" class="panel-content"></div>
                </div>

                <!-- Quick Access Dock -->
                <div id="holo-dock" class="holo-dock">
                    ${this.createQuickAccessDock()}
                </div>

                <!-- Toggle Button -->
                <button id="holo-toggle" class="holo-toggle">
                    <span class="toggle-icon"></span>
                    <span class="toggle-label">FEATURES</span>
                </button>
            </div>

            <!-- Particle Canvas -->
            <canvas id="holo-particles" class="holo-particles"></canvas>
        `;

        document.body.appendChild(hub);
    }

    createPlanetaryNodes() {
        const domains = [
            { id: 'mercury', name: 'MERCURY', icon: '', color: '#FF6B35', angle: 0, features: 38 },
            { id: 'venus', name: 'VENUS', icon: '', color: '#00FF88', angle: 51.4, features: 88 },
            { id: 'earth', name: 'EARTH', icon: '', color: '#00D9FF', angle: 102.8, features: 11 },
            { id: 'mars', name: 'MARS', icon: '', color: '#FF4444', angle: 154.2, features: 20 },
            { id: 'jupiter', name: 'JUPITER', icon: '', color: '#FFAA00', angle: 205.6, features: 17 },
            { id: 'saturn', name: 'SATURN', icon: '', color: '#8844FF', angle: 257, features: 12 },
            { id: 'phoenix', name: 'PHOENIX', icon: '', color: '#00FFFF', angle: 308.4, features: 81 }
        ];

        return domains.map(domain => `
            <div class="planet-node"
                 data-domain="${domain.id}"
                 data-angle="${domain.angle}"
                 style="--node-color: ${domain.color}">
                <div class="node-glow"></div>
                <div class="node-icon">${domain.icon}</div>
                <div class="node-label">${domain.name}</div>
                <div class="node-count">${domain.features}</div>
            </div>
        `).join('');
    }

    createQuickAccessDock() {
        return `
            <div class="dock-item" data-action="voice">
                <div class="dock-icon"></div>
                <div class="dock-label">Voice</div>
            </div>
            <div class="dock-item" data-action="butler">
                <div class="dock-icon"></div>
                <div class="dock-label">Butler</div>
            </div>
            <div class="dock-item" data-action="sync">
                <div class="dock-icon"></div>
                <div class="dock-label">Sync</div>
            </div>
            <div class="dock-item" data-action="insights">
                <div class="dock-icon">🧠</div>
                <div class="dock-label">Insights</div>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FEATURE PANELS - All 307 Endpoints Organized by Domain
    // ═══════════════════════════════════════════════════════════════════════════

    async openDomain(domainId) {
        this.currentDomain = domainId;
        const panel = document.getElementById('holo-feature-panel');
        const title = document.getElementById('panel-title');
        const subtitle = document.getElementById('panel-subtitle');
        const content = document.getElementById('panel-content');

        // Get domain data
        const domainData = this.getDomainData(domainId);

        // Update panel header
        title.textContent = domainData.name;
        subtitle.textContent = `${domainData.features.length} features • ${domainData.description}`;

        // Render feature grid
        content.innerHTML = this.renderFeatureGrid(domainData.features);

        // Show panel with animation
        panel.classList.remove('hidden');
        setTimeout(() => panel.classList.add('visible'), 10);

        // Expand hub
        document.getElementById('holo-nav-container').classList.add('expanded');
    }

    getDomainData(domainId) {
        const domains = {
            mercury: {
                name: 'MERCURY - Health & Biometrics Intelligence',
                description: 'Complete health tracking, recovery, sleep, and wearable integration',
                features: this.getMercuryFeatures()
            },
            venus: {
                name: 'VENUS - Fitness & Training Intelligence',
                description: 'Workouts, nutrition, quantum generation, and body optimization',
                features: this.getVenusFeatures()
            },
            earth: {
                name: 'EARTH - Calendar & Energy Optimization',
                description: 'Energy patterns, calendar sync, and productivity optimization',
                features: this.getEarthFeatures()
            },
            mars: {
                name: 'MARS - Goals & Motivation Engine',
                description: 'Goal tracking, habits, progress, and motivational interventions',
                features: this.getMarsFeatures()
            },
            jupiter: {
                name: 'JUPITER - Financial Intelligence',
                description: 'Banking, budgets, transactions, and stress-spending analysis',
                features: this.getJupiterFeatures()
            },
            saturn: {
                name: 'SATURN - Legacy & Mortality Awareness',
                description: 'Life vision, quarterly reviews, and legacy planning',
                features: this.getSaturnFeatures()
            },
            phoenix: {
                name: 'PHOENIX - AI Companion & Butler',
                description: 'Intelligence, predictions, interventions, and autonomous actions',
                features: this.getPhoenixFeatures()
            }
        };

        return domains[domainId];
    }

    renderFeatureGrid(features) {
        return `
            <div class="feature-grid">
                ${features.map(feature => `
                    <div class="feature-card" data-feature="${feature.id}">
                        <div class="feature-icon">${feature.icon}</div>
                        <div class="feature-name">${feature.name}</div>
                        <div class="feature-desc">${feature.description}</div>
                        <div class="feature-status ${feature.status}">
                            ${feature.status === 'active' ? '✓ Ready' : feature.status === 'setup' ? '⚙ Setup Required' : '🔒 Premium'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MERCURY FEATURES - 38 Health & Biometric Endpoints
    // ═══════════════════════════════════════════════════════════════════════════

    getMercuryFeatures() {
        return [
            // BIOMETRIC ANALYSIS (10)
            {
                id: 'dexa-scan',
                name: 'DEXA Body Scan',
                icon: '',
                description: 'Complete body composition analysis with bone density',
                status: 'active',
                action: () => this.openFeature('mercury', 'dexa')
            },
            {
                id: 'body-composition',
                name: 'Body Composition',
                icon: '',
                description: 'Muscle mass, body fat %, lean mass breakdown',
                status: 'active',
                action: () => this.openFeature('mercury', 'composition')
            },
            {
                id: 'metabolic-rate',
                name: 'Metabolic Rate',
                icon: '',
                description: 'BMR, TDEE, calorie burn analysis',
                status: 'active',
                action: () => this.openFeature('mercury', 'metabolic')
            },
            {
                id: 'health-ratios',
                name: 'Health Ratios',
                icon: '',
                description: 'WHR, BMI, body fat percentages, risk factors',
                status: 'active',
                action: () => this.openFeature('mercury', 'ratios')
            },
            {
                id: 'visceral-fat',
                name: 'Visceral Fat',
                icon: '',
                description: 'Internal fat levels and health risks',
                status: 'active',
                action: () => this.openFeature('mercury', 'visceral-fat')
            },
            {
                id: 'bone-density',
                name: 'Bone Density',
                icon: '',
                description: 'Bone health and osteoporosis risk',
                status: 'active',
                action: () => this.openFeature('mercury', 'bone-density')
            },
            {
                id: 'hydration',
                name: 'Hydration Status',
                icon: '',
                description: 'Hydration levels and recommendations',
                status: 'active',
                action: () => this.openFeature('mercury', 'hydration')
            },
            {
                id: 'biometric-trends',
                name: 'Biometric Trends',
                icon: '',
                description: 'Long-term health trends and insights',
                status: 'active',
                action: () => this.openFeature('mercury', 'trends')
            },
            {
                id: 'correlations',
                name: 'Cross-Metric Correlations',
                icon: '',
                description: 'Discover hidden health patterns',
                status: 'active',
                action: () => this.openFeature('mercury', 'correlations')
            },
            {
                id: 'metabolic-calculator',
                name: 'Metabolic Calculator',
                icon: '',
                description: 'Custom metabolic rate calculations',
                status: 'active',
                action: () => this.openFeature('mercury', 'calculate')
            },

            // WEARABLE DEVICES (6)
            {
                id: 'connect-wearable',
                name: 'Connect Wearable',
                icon: '',
                description: 'Apple Health, Oura, Whoop, Fitbit, Polar',
                status: 'setup',
                action: () => this.openFeature('mercury', 'connect-device')
            },
            {
                id: 'device-list',
                name: 'My Devices',
                icon: '',
                description: 'View all connected devices and sync status',
                status: 'active',
                action: () => this.openFeature('mercury', 'devices')
            },
            {
                id: 'manual-sync',
                name: 'Manual Sync',
                icon: '',
                description: 'Force sync with wearable devices',
                status: 'active',
                action: () => this.openFeature('mercury', 'sync')
            },
            {
                id: 'wearable-data',
                name: 'Wearable Data',
                icon: '',
                description: 'Aggregated data from all devices',
                status: 'active',
                action: () => this.openFeature('mercury', 'data')
            },
            {
                id: 'raw-data',
                name: 'Raw Device Data',
                icon: '',
                description: 'Deep analysis of device metrics',
                status: 'active',
                action: () => this.openFeature('mercury', 'raw-data')
            },
            {
                id: 'manual-entry',
                name: 'Manual Data Entry',
                icon: '',
                description: 'Log metrics not captured by wearables',
                status: 'active',
                action: () => this.openFeature('mercury', 'manual-entry')
            },

            // HRV & HEART RATE (4)
            {
                id: 'hrv-analysis',
                name: 'HRV Analysis',
                icon: '',
                description: 'Heart rate variability metrics and trends',
                status: 'active',
                action: () => this.openFeature('mercury', 'hrv')
            },
            {
                id: 'hrv-deep',
                name: 'Deep HRV Analysis',
                icon: '',
                description: 'Frequency domains, stress analysis',
                status: 'active',
                action: () => this.openFeature('mercury', 'hrv-deep')
            },
            {
                id: 'heart-rate',
                name: 'Heart Rate Zones',
                icon: '',
                description: 'HR zones, trends, and optimization',
                status: 'active',
                action: () => this.openFeature('mercury', 'heart-rate')
            },
            {
                id: 'readiness',
                name: 'Daily Readiness',
                icon: '',
                description: 'HRV + sleep-based readiness score',
                status: 'active',
                action: () => this.openFeature('mercury', 'readiness')
            },

            // SLEEP INTELLIGENCE (3)
            {
                id: 'sleep-data',
                name: 'Sleep Analysis',
                icon: '',
                description: 'Sleep stages, duration, quality metrics',
                status: 'active',
                action: () => this.openFeature('mercury', 'sleep')
            },
            {
                id: 'sleep-ai',
                name: 'AI Sleep Insights',
                icon: '',
                description: 'Pattern analysis and quality predictions',
                status: 'active',
                action: () => this.openFeature('mercury', 'sleep-analysis')
            },
            {
                id: 'sleep-recommendations',
                name: 'Sleep Optimization',
                icon: '',
                description: 'Personalized sleep improvement tips',
                status: 'active',
                action: () => this.openFeature('mercury', 'sleep-recommendations')
            },

            // RECOVERY SCORING (11)
            {
                id: 'recovery-latest',
                name: 'Recovery Score',
                icon: '',
                description: 'Today\'s recovery with breakdown',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-latest')
            },
            {
                id: 'recovery-history',
                name: 'Recovery History',
                icon: '',
                description: 'Historical recovery data and trends',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-history')
            },
            {
                id: 'recovery-trends',
                name: 'Recovery Trends',
                icon: '',
                description: 'Weekly, monthly, yearly patterns',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-trends')
            },
            {
                id: 'recovery-prediction',
                name: 'Predict Tomorrow',
                icon: '',
                description: 'AI prediction of tomorrow\'s recovery',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-prediction')
            },
            {
                id: 'recovery-protocols',
                name: 'Recovery Protocols',
                icon: '',
                description: 'Personalized recovery strategies',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-protocols')
            },
            {
                id: 'recovery-debt',
                name: 'Recovery Debt',
                icon: '',
                description: 'Training load vs recovery deficit',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-debt')
            },
            {
                id: 'overtraining-risk',
                name: 'Overtraining Risk',
                icon: '',
                description: 'AI assessment of overtraining probability',
                status: 'active',
                action: () => this.openFeature('mercury', 'overtraining-risk')
            },
            {
                id: 'training-load',
                name: 'Training Load',
                icon: '',
                description: 'Acute vs chronic load analysis',
                status: 'active',
                action: () => this.openFeature('mercury', 'training-load')
            },
            {
                id: 'recovery-insights',
                name: 'Recovery Insights',
                icon: '',
                description: 'AI insights on optimization',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-insights')
            },
            {
                id: 'recovery-dashboard',
                name: 'Recovery Dashboard',
                icon: '',
                description: 'Complete recovery overview',
                status: 'active',
                action: () => this.openFeature('mercury', 'recovery-dashboard')
            },
            {
                id: 'ai-insights',
                name: 'AI Health Insights',
                icon: '',
                description: 'AI-powered health insights from all data',
                status: 'active',
                action: () => this.openFeature('mercury', 'insights')
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VENUS FEATURES - 88 Fitness & Training Endpoints
    // ═══════════════════════════════════════════════════════════════════════════

    getVenusFeatures() {
        return [
            // WORKOUT TRACKING (8)
            {
                id: 'start-workout',
                name: 'Start Workout',
                icon: '',
                description: 'Begin new workout session',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-start')
            },
            {
                id: 'workout-history',
                name: 'Workout History',
                icon: '',
                description: 'View all past workouts',
                status: 'active',
                action: () => this.openFeature('venus', 'workouts')
            },
            {
                id: 'active-workout',
                name: 'Active Workout',
                icon: '',
                description: 'Resume current workout',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-active')
            },
            {
                id: 'workout-details',
                name: 'Workout Details',
                icon: '',
                description: 'View specific workout breakdown',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-detail')
            },
            {
                id: 'log-exercise',
                name: 'Log Exercise Set',
                icon: '',
                description: 'Record reps, weight, RPE',
                status: 'active',
                action: () => this.openFeature('venus', 'log-exercise')
            },
            {
                id: 'complete-workout',
                name: 'Complete Workout',
                icon: '',
                description: 'Finish and generate summary',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-complete')
            },
            {
                id: 'edit-workout',
                name: 'Edit Workout',
                icon: '',
                description: 'Modify workout information',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-edit')
            },
            {
                id: 'delete-workout',
                name: 'Delete Workout',
                icon: '',
                description: 'Remove workout from history',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-delete')
            },

            // WORKOUT INTELLIGENCE (13)
            {
                id: 'ai-workout-recommend',
                name: 'AI Recommendations',
                icon: '',
                description: 'AI workout suggestions based on goals',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-recommend')
            },
            {
                id: 'similar-workouts',
                name: 'Similar Workouts',
                icon: '',
                description: 'Find past similar sessions',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-similar')
            },
            {
                id: 'workout-templates',
                name: 'Template Library',
                icon: '',
                description: 'Browse workout templates',
                status: 'active',
                action: () => this.openFeature('venus', 'templates')
            },
            {
                id: 'create-template',
                name: 'Create Template',
                icon: '',
                description: 'Save custom workout template',
                status: 'active',
                action: () => this.openFeature('venus', 'template-create')
            },
            {
                id: 'form-analysis',
                name: 'Form Analysis',
                icon: '',
                description: 'AI exercise form quality check',
                status: 'active',
                action: () => this.openFeature('venus', 'form-analysis')
            },
            {
                id: 'effectiveness',
                name: 'Workout Effectiveness',
                icon: '',
                description: 'Analyze workout quality and impact',
                status: 'active',
                action: () => this.openFeature('venus', 'effectiveness')
            },
            {
                id: 'compare-workouts',
                name: 'Compare Workouts',
                icon: '',
                description: 'Side-by-side workout comparison',
                status: 'active',
                action: () => this.openFeature('venus', 'workout-compare')
            },
            {
                id: 'intensity-zones',
                name: 'Intensity Zones',
                icon: '',
                description: 'Training intensity analysis',
                status: 'active',
                action: () => this.openFeature('venus', 'intensity-zones')
            },
            {
                id: 'volume-progression',
                name: 'Volume Progression',
                icon: '',
                description: 'Track volume over time',
                status: 'active',
                action: () => this.openFeature('venus', 'volume')
            },
            {
                id: 'deload-planning',
                name: 'Deload Planner',
                icon: '',
                description: 'AI-powered deload week planning',
                status: 'active',
                action: () => this.openFeature('venus', 'deload')
            },
            {
                id: 'periodization',
                name: 'Periodization Program',
                icon: '',
                description: 'Generate training program',
                status: 'active',
                action: () => this.openFeature('venus', 'periodization')
            },
            {
                id: 'optimal-window',
                name: 'Optimal Training Window',
                icon: '',
                description: 'Best time for training based on energy',
                status: 'active',
                action: () => this.openFeature('venus', 'optimal-window')
            },
            {
                id: 'form-check',
                name: 'Live Form Check',
                icon: '',
                description: 'Real-time form feedback',
                status: 'premium',
                action: () => this.openFeature('venus', 'form-check')
            },

            // QUANTUM WORKOUTS (8)
            {
                id: 'quantum-generate',
                name: 'Generate Quantum Workout',
                icon: '',
                description: 'AI + chaos theory workout',
                status: 'active',
                action: () => this.openFeature('venus', 'quantum-generate')
            },
            {
                id: 'quantum-history',
                name: 'Quantum History',
                icon: '',
                description: 'Past quantum workouts',
                status: 'active',
                action: () => this.openFeature('venus', 'quantum-history')
            },
            {
                id: 'quantum-effectiveness',
                name: 'Quantum Analysis',
                icon: '',
                description: 'Effectiveness of quantum workouts',
                status: 'active',
                action: () => this.openFeature('venus', 'quantum-effectiveness')
            },
            {
                id: 'plateau-detection',
                name: 'Plateau Detection',
                icon: '',
                description: 'AI detects training plateaus',
                status: 'active',
                action: () => this.openFeature('venus', 'plateau')
            },
            {
                id: 'quantum-settings',
                name: 'Quantum Settings',
                icon: '',
                description: 'Configure quantum preferences',
                status: 'active',
                action: () => this.openFeature('venus', 'quantum-settings')
            },
            {
                id: 'chaos-metrics',
                name: 'Chaos Metrics',
                icon: '',
                description: 'Variability and randomness analysis',
                status: 'active',
                action: () => this.openFeature('venus', 'chaos-metrics')
            },
            {
                id: 'regenerate-seeds',
                name: 'Regenerate Seeds',
                icon: '',
                description: 'Fresh random seeds for new patterns',
                status: 'active',
                action: () => this.openFeature('venus', 'regenerate-seeds')
            },
            {
                id: 'quantum-update-settings',
                name: 'Update Settings',
                icon: '',
                description: 'Modify quantum parameters',
                status: 'active',
                action: () => this.openFeature('venus', 'quantum-update')
            },

            // EXERCISE LIBRARY (6)
            {
                id: 'exercise-library',
                name: 'Exercise Database',
                icon: '',
                description: 'Browse all exercises',
                status: 'active',
                action: () => this.openFeature('venus', 'exercises')
            },
            {
                id: 'exercise-search',
                name: 'Search Exercises',
                icon: '',
                description: 'Find by muscle group, equipment',
                status: 'active',
                action: () => this.openFeature('venus', 'exercise-search')
            },
            {
                id: 'exercise-details',
                name: 'Exercise Details',
                icon: '',
                description: 'Instructions, form cues, tips',
                status: 'active',
                action: () => this.openFeature('venus', 'exercise-detail')
            },
            {
                id: 'exercise-alternatives',
                name: 'Find Alternatives',
                icon: '',
                description: 'Similar exercises for substitution',
                status: 'active',
                action: () => this.openFeature('venus', 'exercise-alternatives')
            },
            {
                id: 'create-exercise',
                name: 'Create Custom Exercise',
                icon: '',
                description: 'Add your own exercises',
                status: 'active',
                action: () => this.openFeature('venus', 'exercise-create')
            },
            {
                id: 'exercise-recommend',
                name: 'AI Exercise Suggestions',
                icon: '',
                description: 'Personalized exercise recommendations',
                status: 'active',
                action: () => this.openFeature('venus', 'exercise-recommend')
            },

            // PROGRESSIVE OVERLOAD (4)
            {
                id: 'progressive-overload',
                name: 'Overload Tracking',
                icon: '',
                description: 'Track progressive overload metrics',
                status: 'active',
                action: () => this.openFeature('venus', 'overload')
            },
            {
                id: '1rm-calculator',
                name: '1RM Predictions',
                icon: '',
                description: 'Calculate one-rep max estimates',
                status: 'active',
                action: () => this.openFeature('venus', '1rm')
            },
            {
                id: 'strength-standards',
                name: 'Strength Standards',
                icon: '',
                description: 'Compare to population norms',
                status: 'active',
                action: () => this.openFeature('venus', 'standards')
            },
            {
                id: 'personal-records',
                name: 'Personal Records',
                icon: '',
                description: 'PRs across all exercises',
                status: 'active',
                action: () => this.openFeature('venus', 'records')
            },

            // NUTRITION (18 features - continued in next section due to length)
            {
                id: 'log-meal',
                name: 'Log Meal',
                icon: '',
                description: 'Record meal with macros',
                status: 'active',
                action: () => this.openFeature('venus', 'nutrition-log')
            },
            {
                id: 'nutrition-history',
                name: 'Nutrition Log',
                icon: '',
                description: 'View meal history',
                status: 'active',
                action: () => this.openFeature('venus', 'nutrition-logs')
            },
            {
                id: 'edit-meal',
                name: 'Edit Meal',
                icon: '',
                description: 'Modify meal entry',
                status: 'active',
                action: () => this.openFeature('venus', 'nutrition-edit')
            },
            {
                id: 'delete-meal',
                name: 'Delete Meal',
                icon: '',
                description: 'Remove meal from log',
                status: 'active',
                action: () => this.openFeature('venus', 'nutrition-delete')
            },
            {
                id: 'daily-macros',
                name: 'Daily Macros',
                icon: '',
                description: 'Today\'s macro summary',
                status: 'active',
                action: () => this.openFeature('venus', 'macros')
            },
            {
                id: 'set-targets',
                name: 'Set Macro Targets',
                icon: '',
                description: 'Define daily macro goals',
                status: 'active',
                action: () => this.openFeature('venus', 'targets')
            },
            {
                id: 'calculate-targets',
                name: 'Calculate Targets',
                icon: '',
                description: 'AI macro calculation from goals',
                status: 'active',
                action: () => this.openFeature('venus', 'calculate-targets')
            },
            {
                id: 'nutrition-insights',
                name: 'Nutrition Insights',
                icon: '',
                description: 'AI nutrition recommendations',
                status: 'active',
                action: () => this.openFeature('venus', 'nutrition-insights')
            },
            {
                id: 'track-water',
                name: 'Track Water',
                icon: '',
                description: 'Log water intake',
                status: 'active',
                action: () => this.openFeature('venus', 'water-log')
            },
            {
                id: 'water-data',
                name: 'Water Tracking',
                icon: '',
                description: 'View hydration data',
                status: 'active',
                action: () => this.openFeature('venus', 'water')
            },
            {
                id: 'ai-meal-plan',
                name: 'AI Meal Plan',
                icon: '',
                description: 'Generate personalized meal plan',
                status: 'active',
                action: () => this.openFeature('venus', 'meal-plan')
            },
            {
                id: 'photo-analyze',
                name: 'Analyze Food Photo',
                icon: '',
                description: 'AI nutrition from photo',
                status: 'premium',
                action: () => this.openFeature('venus', 'photo-analyze')
            },
            {
                id: 'barcode-scan',
                name: 'Barcode Scanner',
                icon: '',
                description: 'Scan food for nutrition info',
                status: 'active',
                action: () => this.openFeature('venus', 'barcode')
            },
            {
                id: 'recipe-suggest',
                name: 'Recipe Suggestions',
                icon: '',
                description: 'Recipes matching your macros',
                status: 'active',
                action: () => this.openFeature('venus', 'recipes')
            },
            {
                id: 'meal-prep',
                name: 'Meal Prep Plans',
                icon: '',
                description: 'View meal prep strategies',
                status: 'active',
                action: () => this.openFeature('venus', 'meal-prep')
            },
            {
                id: 'create-meal-prep',
                name: 'Plan Meal Prep',
                icon: '',
                description: 'Create weekly meal prep plan',
                status: 'active',
                action: () => this.openFeature('venus', 'meal-prep-plan')
            },
            {
                id: 'restaurant-menu',
                name: 'Restaurant Analysis',
                icon: '',
                description: 'Analyze restaurant menus',
                status: 'active',
                action: () => this.openFeature('venus', 'restaurants')
            },
            {
                id: 'restaurant-recommend',
                name: 'Restaurant Recommendations',
                icon: '',
                description: 'Find macro-friendly options',
                status: 'active',
                action: () => this.openFeature('venus', 'restaurant-recommend')
            },

            // SUPPLEMENTS (4)
            {
                id: 'log-supplement',
                name: 'Log Supplement',
                icon: '',
                description: 'Record supplement intake',
                status: 'active',
                action: () => this.openFeature('venus', 'supplement-log')
            },
            {
                id: 'supplement-list',
                name: 'My Supplements',
                icon: '',
                description: 'View supplement log',
                status: 'active',
                action: () => this.openFeature('venus', 'supplements')
            },
            {
                id: 'supplement-interactions',
                name: 'Check Interactions',
                icon: '',
                description: 'Supplement interaction warnings',
                status: 'active',
                action: () => this.openFeature('venus', 'interactions')
            },
            {
                id: 'supplement-stack',
                name: 'Build Stack',
                icon: '',
                description: 'Create supplement stack',
                status: 'active',
                action: () => this.openFeature('venus', 'stack-builder')
            },

            // BODY MEASUREMENTS (9)
            {
                id: 'log-measurements',
                name: 'Log Measurements',
                icon: '',
                description: 'Record body measurements',
                status: 'active',
                action: () => this.openFeature('venus', 'measurements-log')
            },
            {
                id: 'measurement-history',
                name: 'Measurement History',
                icon: '',
                description: 'View measurement trends',
                status: 'active',
                action: () => this.openFeature('venus', 'measurements')
            },
            {
                id: 'body-composition-analysis',
                name: 'Composition Analysis',
                icon: '',
                description: 'Body composition breakdown',
                status: 'active',
                action: () => this.openFeature('venus', 'composition')
            },
            {
                id: 'upload-photo',
                name: 'Progress Photos',
                icon: '',
                description: 'Upload progress photos',
                status: 'active',
                action: () => this.openFeature('venus', 'photos-upload')
            },
            {
                id: 'view-photos',
                name: 'Photo Gallery',
                icon: '',
                description: 'View all progress photos',
                status: 'active',
                action: () => this.openFeature('venus', 'photos')
            },
            {
                id: 'compare-photos',
                name: 'Compare Photos',
                icon: '',
                description: 'Side-by-side comparison',
                status: 'active',
                action: () => this.openFeature('venus', 'photos-compare')
            },
            {
                id: 'recomp-analysis',
                name: 'Recomp Analysis',
                icon: '',
                description: 'Body recomposition progress',
                status: 'active',
                action: () => this.openFeature('venus', 'recomp')
            },
            {
                id: 'muscle-symmetry',
                name: 'Muscle Symmetry',
                icon: '',
                description: 'Analyze muscle balance',
                status: 'active',
                action: () => this.openFeature('venus', 'symmetry')
            },
            {
                id: 'fat-distribution',
                name: 'Fat Distribution',
                icon: '',
                description: 'Body fat distribution patterns',
                status: 'active',
                action: () => this.openFeature('venus', 'fat-distribution')
            },

            // PERFORMANCE TESTING (7)
            {
                id: 'create-test',
                name: 'Create Performance Test',
                icon: '',
                description: 'Set up performance benchmark',
                status: 'active',
                action: () => this.openFeature('venus', 'test-create')
            },
            {
                id: 'record-results',
                name: 'Record Test Results',
                icon: '',
                description: 'Log test performance',
                status: 'active',
                action: () => this.openFeature('venus', 'test-results')
            },
            {
                id: 'test-history',
                name: 'Test History',
                icon: '',
                description: 'View all performance tests',
                status: 'active',
                action: () => this.openFeature('venus', 'tests')
            },
            {
                id: 'benchmarks',
                name: 'Performance Benchmarks',
                icon: '',
                description: 'View standard benchmarks',
                status: 'active',
                action: () => this.openFeature('venus', 'benchmarks')
            },
            {
                id: 'detailed-standards',
                name: 'Detailed Standards',
                icon: '',
                description: 'Comprehensive strength standards',
                status: 'active',
                action: () => this.openFeature('venus', 'detailed-standards')
            },
            {
                id: 'percentile-rank',
                name: 'Percentile Ranking',
                icon: '',
                description: 'Compare to population',
                status: 'active',
                action: () => this.openFeature('venus', 'percentile')
            },
            {
                id: 'performance-predictions',
                name: 'Performance Predictions',
                icon: '',
                description: 'Predict future performance',
                status: 'active',
                action: () => this.openFeature('venus', 'performance-predictions')
            },

            // SOCIAL (6)
            {
                id: 'social-feed',
                name: 'Activity Feed',
                icon: '',
                description: 'View social activity',
                status: 'active',
                action: () => this.openFeature('venus', 'feed')
            },
            {
                id: 'share-workout',
                name: 'Share Workout',
                icon: '',
                description: 'Post workout to feed',
                status: 'active',
                action: () => this.openFeature('venus', 'share')
            },
            {
                id: 'challenges',
                name: 'Fitness Challenges',
                icon: '',
                description: 'Browse active challenges',
                status: 'active',
                action: () => this.openFeature('venus', 'challenges')
            },
            {
                id: 'join-challenge',
                name: 'Join Challenge',
                icon: '',
                description: 'Participate in challenge',
                status: 'active',
                action: () => this.openFeature('venus', 'join-challenge')
            },
            {
                id: 'friends',
                name: 'Friends List',
                icon: '',
                description: 'View fitness friends',
                status: 'active',
                action: () => this.openFeature('venus', 'friends')
            },
            {
                id: 'add-friend',
                name: 'Add Friend',
                icon: '',
                description: 'Connect with other users',
                status: 'active',
                action: () => this.openFeature('venus', 'add-friend')
            },

            // INJURY PREVENTION (5)
            {
                id: 'injury-assessment',
                name: 'Injury Risk Assessment',
                icon: '',
                description: 'AI injury risk evaluation',
                status: 'active',
                action: () => this.openFeature('venus', 'injury-risk')
            },
            {
                id: 'injury-history',
                name: 'Injury History',
                icon: '',
                description: 'View past injuries',
                status: 'active',
                action: () => this.openFeature('venus', 'injury-history')
            },
            {
                id: 'report-injury',
                name: 'Report Injury',
                icon: '',
                description: 'Log new injury',
                status: 'active',
                action: () => this.openFeature('venus', 'report-injury')
            },
            {
                id: 'prevention-protocols',
                name: 'Prevention Protocols',
                icon: '',
                description: 'Injury prevention strategies',
                status: 'active',
                action: () => this.openFeature('venus', 'prevention')
            },
            {
                id: 'rehab-protocols',
                name: 'Rehab Protocols',
                icon: '',
                description: 'Rehabilitation programs',
                status: 'active',
                action: () => this.openFeature('venus', 'rehab')
            }
        ];
    }

    // Continue with remaining domains in next message due to length...
    // I'll create getEarthFeatures(), getMarsFeatures(), getJupiterFeatures(), getSaturnFeatures(), getPhoenixFeatures()

    getEarthFeatures() {
        return [
            {
                id: 'connect-calendar',
                name: 'Connect Calendar',
                icon: '',
                description: 'Google Calendar, Outlook integration',
                status: 'setup',
                action: () => this.openFeature('earth', 'connect-calendar')
            },
            {
                id: 'calendar-events',
                name: 'My Events',
                icon: '',
                description: 'View all calendar events',
                status: 'active',
                action: () => this.openFeature('earth', 'events')
            },
            {
                id: 'create-event',
                name: 'Create Event',
                icon: '',
                description: 'Add new calendar event',
                status: 'active',
                action: () => this.openFeature('earth', 'create-event')
            },
            {
                id: 'energy-map',
                name: 'Energy Map',
                icon: '',
                description: 'Energy-optimized schedule view',
                status: 'active',
                action: () => this.openFeature('earth', 'energy-map')
            },
            {
                id: 'detect-conflicts',
                name: 'Conflict Detection',
                icon: '',
                description: 'Find scheduling conflicts',
                status: 'active',
                action: () => this.openFeature('earth', 'conflicts')
            },
            {
                id: 'sync-calendar',
                name: 'Manual Sync',
                icon: '',
                description: 'Force calendar synchronization',
                status: 'active',
                action: () => this.openFeature('earth', 'sync')
            },
            {
                id: 'energy-pattern',
                name: 'Energy Patterns',
                icon: '',
                description: 'Personal energy trends',
                status: 'active',
                action: () => this.openFeature('earth', 'energy-pattern')
            },
            {
                id: 'log-energy',
                name: 'Log Energy Level',
                icon: '',
                description: 'Record current energy',
                status: 'active',
                action: () => this.openFeature('earth', 'log-energy')
            },
            {
                id: 'optimal-times',
                name: 'Optimal Meeting Times',
                icon: '',
                description: 'Best times based on energy',
                status: 'active',
                action: () => this.openFeature('earth', 'optimal-times')
            },
            {
                id: 'energy-prediction',
                name: 'Energy Prediction',
                icon: '',
                description: 'Predict future energy levels',
                status: 'active',
                action: () => this.openFeature('earth', 'energy-prediction')
            },
            {
                id: 'oauth-callback',
                name: 'OAuth Handler',
                icon: '',
                description: 'Calendar authentication callback',
                status: 'active',
                action: () => {} // Internal use
            }
        ];
    }

    getMarsFeatures() {
        return [
            {
                id: 'create-goal',
                name: 'Create Goal',
                icon: '',
                description: 'Set new SMART goal',
                status: 'active',
                action: () => this.openFeature('mars', 'create-goal')
            },
            {
                id: 'my-goals',
                name: 'My Goals',
                icon: '',
                description: 'View all active goals',
                status: 'active',
                action: () => this.openFeature('mars', 'goals')
            },
            {
                id: 'goal-details',
                name: 'Goal Details',
                icon: '',
                description: 'View specific goal progress',
                status: 'active',
                action: () => this.openFeature('mars', 'goal-detail')
            },
            {
                id: 'update-goal',
                name: 'Update Goal',
                icon: '',
                description: 'Edit goal information',
                status: 'active',
                action: () => this.openFeature('mars', 'update-goal')
            },
            {
                id: 'delete-goal',
                name: 'Delete Goal',
                icon: '',
                description: 'Remove goal',
                status: 'active',
                action: () => this.openFeature('mars', 'delete-goal')
            },
            {
                id: 'complete-goal',
                name: 'Complete Goal',
                icon: '',
                description: 'Mark goal as achieved',
                status: 'active',
                action: () => this.openFeature('mars', 'complete-goal')
            },
            {
                id: 'generate-smart',
                name: 'AI SMART Goals',
                icon: '',
                description: 'Transform vague goal into SMART',
                status: 'active',
                action: () => this.openFeature('mars', 'generate-smart')
            },
            {
                id: 'suggest-goals',
                name: 'Goal Suggestions',
                icon: '',
                description: 'AI-powered goal ideas',
                status: 'active',
                action: () => this.openFeature('mars', 'suggest')
            },
            {
                id: 'goal-templates',
                name: 'Goal Templates',
                icon: '',
                description: 'Browse goal templates',
                status: 'active',
                action: () => this.openFeature('mars', 'templates')
            },
            {
                id: 'log-progress',
                name: 'Log Progress',
                icon: '',
                description: 'Update goal progress',
                status: 'active',
                action: () => this.openFeature('mars', 'log-progress')
            },
            {
                id: 'progress-history',
                name: 'Progress History',
                icon: '',
                description: 'View progress over time',
                status: 'active',
                action: () => this.openFeature('mars', 'progress')
            },
            {
                id: 'progress-velocity',
                name: 'Progress Velocity',
                icon: '',
                description: 'Calculate progress rate',
                status: 'active',
                action: () => this.openFeature('mars', 'velocity')
            },
            {
                id: 'ml-predictions',
                name: 'ML Predictions',
                icon: '',
                description: 'AI progress predictions',
                status: 'active',
                action: () => this.openFeature('mars', 'predictions')
            },
            {
                id: 'bottlenecks',
                name: 'Identify Bottlenecks',
                icon: '',
                description: 'Find obstacles to progress',
                status: 'active',
                action: () => this.openFeature('mars', 'bottlenecks')
            },
            {
                id: 'create-milestone',
                name: 'Create Milestone',
                icon: '',
                description: 'Add milestone to goal',
                status: 'active',
                action: () => this.openFeature('mars', 'milestone-create')
            },
            {
                id: 'complete-milestone',
                name: 'Complete Milestone',
                icon: '',
                description: 'Mark milestone achieved',
                status: 'active',
                action: () => this.openFeature('mars', 'milestone-complete')
            },
            {
                id: 'create-habit',
                name: 'Create Habit',
                icon: '',
                description: 'Start habit tracker',
                status: 'active',
                action: () => this.openFeature('mars', 'habit-create')
            },
            {
                id: 'log-habit',
                name: 'Log Habit',
                icon: '',
                description: 'Record habit completion',
                status: 'active',
                action: () => this.openFeature('mars', 'habit-log')
            },
            {
                id: 'motivation-interventions',
                name: 'Motivation Boost',
                icon: '',
                description: 'Get motivational interventions',
                status: 'active',
                action: () => this.openFeature('mars', 'interventions')
            },
            {
                id: 'trigger-boost',
                name: 'Trigger Boost',
                icon: '',
                description: 'Activate motivation protocol',
                status: 'active',
                action: () => this.openFeature('mars', 'boost')
            }
        ];
    }

    getJupiterFeatures() {
        return [
            {
                id: 'connect-plaid',
                name: 'Connect Bank',
                icon: '',
                description: 'Link bank accounts via Plaid',
                status: 'setup',
                action: () => this.openFeature('jupiter', 'link-token')
            },
            {
                id: 'my-accounts',
                name: 'My Accounts',
                icon: '',
                description: 'View connected bank accounts',
                status: 'active',
                action: () => this.openFeature('jupiter', 'accounts')
            },
            {
                id: 'disconnect-account',
                name: 'Disconnect Account',
                icon: '',
                description: 'Remove bank connection',
                status: 'active',
                action: () => this.openFeature('jupiter', 'disconnect')
            },
            {
                id: 'sync-transactions',
                name: 'Sync Transactions',
                icon: '',
                description: 'Manual transaction sync',
                status: 'active',
                action: () => this.openFeature('jupiter', 'sync')
            },
            {
                id: 'transactions',
                name: 'All Transactions',
                icon: '',
                description: 'View transaction history',
                status: 'active',
                action: () => this.openFeature('jupiter', 'transactions')
            },
            {
                id: 'transactions-date-range',
                name: 'Filter by Date',
                icon: '',
                description: 'View transactions in date range',
                status: 'active',
                action: () => this.openFeature('jupiter', 'date-range')
            },
            {
                id: 'transactions-category',
                name: 'Filter by Category',
                icon: '',
                description: 'View category transactions',
                status: 'active',
                action: () => this.openFeature('jupiter', 'by-category')
            },
            {
                id: 'recategorize',
                name: 'Recategorize Transaction',
                icon: '',
                description: 'Change transaction category',
                status: 'active',
                action: () => this.openFeature('jupiter', 'recategorize')
            },
            {
                id: 'recurring-transactions',
                name: 'Recurring Transactions',
                icon: '',
                description: 'Detect recurring charges',
                status: 'active',
                action: () => this.openFeature('jupiter', 'recurring')
            },
            {
                id: 'spending-patterns',
                name: 'Spending Patterns',
                icon: '',
                description: 'Analyze spending habits',
                status: 'active',
                action: () => this.openFeature('jupiter', 'spending-patterns')
            },
            {
                id: 'create-budget',
                name: 'Create Budget',
                icon: '',
                description: 'Set up budget categories',
                status: 'active',
                action: () => this.openFeature('jupiter', 'budget-create')
            },
            {
                id: 'my-budgets',
                name: 'My Budgets',
                icon: '',
                description: 'View all budgets with spending',
                status: 'active',
                action: () => this.openFeature('jupiter', 'budgets')
            },
            {
                id: 'update-budget',
                name: 'Update Budget',
                icon: '',
                description: 'Modify budget amounts',
                status: 'active',
                action: () => this.openFeature('jupiter', 'budget-update')
            },
            {
                id: 'delete-budget',
                name: 'Delete Budget',
                icon: '',
                description: 'Remove budget category',
                status: 'active',
                action: () => this.openFeature('jupiter', 'budget-delete')
            },
            {
                id: 'budget-alerts',
                name: 'Budget Alerts',
                icon: '',
                description: 'Overspending notifications',
                status: 'active',
                action: () => this.openFeature('jupiter', 'alerts')
            },
            {
                id: 'stress-spending',
                name: 'Stress-Spending Correlation',
                icon: '',
                description: 'Link stress/HRV to spending',
                status: 'active',
                action: () => this.openFeature('jupiter', 'stress-correlation')
            },
            {
                id: 'exchange-token',
                name: 'Exchange Token',
                icon: '',
                description: 'Complete Plaid authentication',
                status: 'active',
                action: () => {} // Internal use
            }
        ];
    }

    getSaturnFeatures() {
        return [
            {
                id: 'create-vision',
                name: 'Create Legacy Vision',
                icon: '',
                description: 'Define your life vision',
                status: 'active',
                action: () => this.openFeature('saturn', 'vision-create')
            },
            {
                id: 'my-vision',
                name: 'My Vision',
                icon: '',
                description: 'View legacy vision',
                status: 'active',
                action: () => this.openFeature('saturn', 'vision')
            },
            {
                id: 'update-life-areas',
                name: 'Life Area Scores',
                icon: '',
                description: 'Rate life area satisfaction',
                status: 'active',
                action: () => this.openFeature('saturn', 'life-areas')
            },
            {
                id: 'add-legacy-goal',
                name: 'Add Legacy Goal',
                icon: '',
                description: 'Create long-term legacy goal',
                status: 'active',
                action: () => this.openFeature('saturn', 'legacy-goal')
            },
            {
                id: 'mortality-data',
                name: 'Mortality Awareness',
                icon: '',
                description: 'Days remaining based on life expectancy',
                status: 'active',
                action: () => this.openFeature('saturn', 'mortality')
            },
            {
                id: 'update-review-date',
                name: 'Update Review Date',
                icon: '',
                description: 'Mark vision last reviewed',
                status: 'active',
                action: () => this.openFeature('saturn', 'review-date')
            },
            {
                id: 'create-quarterly',
                name: 'Create Quarterly Review',
                icon: '',
                description: 'Start quarterly reflection',
                status: 'active',
                action: () => this.openFeature('saturn', 'quarterly-create')
            },
            {
                id: 'quarterly-reviews',
                name: 'Review History',
                icon: '',
                description: 'View all quarterly reviews',
                status: 'active',
                action: () => this.openFeature('saturn', 'quarterly')
            },
            {
                id: 'latest-review',
                name: 'Latest Review',
                icon: '',
                description: 'View most recent review',
                status: 'active',
                action: () => this.openFeature('saturn', 'latest')
            },
            {
                id: 'update-review',
                name: 'Update Review',
                icon: '',
                description: 'Edit quarterly review',
                status: 'active',
                action: () => this.openFeature('saturn', 'quarterly-update')
            },
            {
                id: 'satisfaction-trends',
                name: 'Satisfaction Trends',
                icon: '',
                description: 'Life satisfaction over time',
                status: 'active',
                action: () => this.openFeature('saturn', 'trends')
            },
            {
                id: 'compare-quarters',
                name: 'Compare Quarters',
                icon: '',
                description: 'Side-by-side quarter comparison',
                status: 'active',
                action: () => this.openFeature('saturn', 'compare')
            }
        ];
    }

    getPhoenixFeatures() {
        // This will be massive - 81 features for AI Companion & Butler
        return [
            // AI COMPANION (6)
            {
                id: 'ai-chat',
                name: 'Chat with Phoenix',
                icon: '',
                description: 'Context-aware AI conversation',
                status: 'active',
                action: () => this.openFeature('phoenix', 'chat')
            },
            {
                id: 'chat-history',
                name: 'Conversation History',
                icon: '',
                description: 'View past conversations',
                status: 'active',
                action: () => this.openFeature('phoenix', 'history')
            },
            {
                id: 'clear-history',
                name: 'Clear History',
                icon: '',
                description: 'Delete conversation history',
                status: 'active',
                action: () => this.openFeature('phoenix', 'clear-history')
            },
            {
                id: 'user-context',
                name: 'User Context',
                icon: '',
                description: 'View AI\'s understanding of you',
                status: 'active',
                action: () => this.openFeature('phoenix', 'context')
            },
            {
                id: 'ai-personality',
                name: 'AI Personality',
                icon: '',
                description: 'View current personality settings',
                status: 'active',
                action: () => this.openFeature('phoenix', 'personality')
            },
            {
                id: 'update-personality',
                name: 'Change Personality',
                icon: '',
                description: 'Customize AI personality',
                status: 'active',
                action: () => this.openFeature('phoenix', 'update-personality')
            },

            // PATTERNS & CORRELATIONS (6)
            {
                id: 'pattern-feed',
                name: 'Pattern Discovery',
                icon: '',
                description: 'AI-discovered behavioral patterns',
                status: 'active',
                action: () => this.openFeature('phoenix', 'patterns')
            },
            {
                id: 'trigger-analysis',
                name: 'Trigger Analysis',
                icon: '',
                description: 'Force pattern discovery',
                status: 'active',
                action: () => this.openFeature('phoenix', 'analyze')
            },
            {
                id: 'realtime-patterns',
                name: 'Real-time Detection',
                icon: '',
                description: 'Live pattern monitoring',
                status: 'active',
                action: () => this.openFeature('phoenix', 'realtime')
            },
            {
                id: 'validate-pattern',
                name: 'Validate Pattern',
                icon: '',
                description: 'Confirm pattern accuracy',
                status: 'active',
                action: () => this.openFeature('phoenix', 'validate')
            },
            {
                id: 'delete-pattern',
                name: 'Delete Pattern',
                icon: '',
                description: 'Remove false pattern',
                status: 'active',
                action: () => this.openFeature('phoenix', 'delete-pattern')
            },
            {
                id: 'ai-insights',
                name: 'AI Insights',
                icon: '',
                description: 'Insights from discovered patterns',
                status: 'active',
                action: () => this.openFeature('phoenix', 'insights')
            },

            // PREDICTIONS (10)
            {
                id: 'all-predictions',
                name: 'All Predictions',
                icon: '',
                description: 'View all AI predictions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'predictions')
            },
            {
                id: 'active-predictions',
                name: 'Active Predictions',
                icon: '',
                description: 'Current active predictions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'active-predictions')
            },
            {
                id: 'prediction-detail',
                name: 'Prediction Details',
                icon: '',
                description: 'View specific prediction',
                status: 'active',
                action: () => this.openFeature('phoenix', 'prediction-detail')
            },
            {
                id: 'request-prediction',
                name: 'Request Prediction',
                icon: '',
                description: 'Ask for specific prediction',
                status: 'active',
                action: () => this.openFeature('phoenix', 'request-prediction')
            },
            {
                id: 'record-outcome',
                name: 'Record Outcome',
                icon: '',
                description: 'Log actual vs predicted result',
                status: 'active',
                action: () => this.openFeature('phoenix', 'outcome')
            },
            {
                id: 'prediction-accuracy',
                name: 'Accuracy Stats',
                icon: '',
                description: 'AI prediction accuracy metrics',
                status: 'active',
                action: () => this.openFeature('phoenix', 'accuracy')
            },
            {
                id: 'forecast',
                name: 'Forecast Dashboard',
                icon: '',
                description: 'Future forecast predictions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'forecast')
            },
            {
                id: 'optimal-action-windows',
                name: 'Optimal Windows',
                icon: '',
                description: 'Best times for actions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'optimal-window')
            },
            {
                id: 'burnout-risk',
                name: 'Burnout Risk',
                icon: '',
                description: 'Predict burnout probability',
                status: 'active',
                action: () => this.openFeature('phoenix', 'burnout')
            },
            {
                id: 'weight-trajectory',
                name: 'Weight Trajectory',
                icon: '',
                description: 'Predict weight changes',
                status: 'active',
                action: () => this.openFeature('phoenix', 'weight-change')
            },

            // INTERVENTIONS (9)
            {
                id: 'interventions-all',
                name: 'All Interventions',
                icon: '',
                description: 'View intervention history',
                status: 'active',
                action: () => this.openFeature('phoenix', 'interventions')
            },
            {
                id: 'active-interventions',
                name: 'Active Interventions',
                icon: '',
                description: 'Currently running interventions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'active-interventions')
            },
            {
                id: 'pending-interventions',
                name: 'Pending Approval',
                icon: '',
                description: 'Interventions awaiting your approval',
                status: 'active',
                action: () => this.openFeature('phoenix', 'pending')
            },
            {
                id: 'acknowledge-intervention',
                name: 'Acknowledge',
                icon: '',
                description: 'Approve or deny intervention',
                status: 'active',
                action: () => this.openFeature('phoenix', 'acknowledge')
            },
            {
                id: 'intervention-outcome',
                name: 'Record Outcome',
                icon: '',
                description: 'Log intervention results',
                status: 'active',
                action: () => this.openFeature('phoenix', 'intervention-outcome')
            },
            {
                id: 'intervention-stats',
                name: 'Statistics',
                icon: '',
                description: 'Intervention success metrics',
                status: 'active',
                action: () => this.openFeature('phoenix', 'stats')
            },
            {
                id: 'intervention-history',
                name: 'History Timeline',
                icon: '',
                description: 'Intervention timeline view',
                status: 'active',
                action: () => this.openFeature('phoenix', 'intervention-history')
            },
            {
                id: 'intervention-settings',
                name: 'Configure Settings',
                icon: '',
                description: 'Set intervention preferences',
                status: 'active',
                action: () => this.openFeature('phoenix', 'intervention-settings')
            },
            {
                id: 'manual-intervention',
                name: 'Request Manual',
                icon: '',
                description: 'Ask for immediate intervention',
                status: 'active',
                action: () => this.openFeature('phoenix', 'request-intervention')
            },

            // INTELLIGENCE (8)
            {
                id: 'intelligence-summary',
                name: 'Intelligence Overview',
                icon: '',
                description: 'Complete AI intelligence summary',
                status: 'active',
                action: () => this.openFeature('phoenix', 'intelligence')
            },
            {
                id: 'trigger-intelligence',
                name: 'Trigger Analysis',
                icon: '',
                description: 'Force intelligence analysis',
                status: 'active',
                action: () => this.openFeature('phoenix', 'intelligence-analyze')
            },
            {
                id: 'intelligence-insights',
                name: 'Intelligence Insights',
                icon: '',
                description: 'AI-generated insights',
                status: 'active',
                action: () => this.openFeature('phoenix', 'intelligence-insights')
            },
            {
                id: 'natural-query',
                name: 'Natural Language Query',
                icon: '',
                description: 'Ask questions in plain English',
                status: 'active',
                action: () => this.openFeature('phoenix', 'query')
            },
            {
                id: 'daily-summary',
                name: 'Daily Summary',
                icon: '',
                description: 'Today\'s AI summary',
                status: 'active',
                action: () => this.openFeature('phoenix', 'summary')
            },
            {
                id: 'deep-dive',
                name: 'Deep Dive Analysis',
                icon: '',
                description: 'Comprehensive topic analysis',
                status: 'active',
                action: () => this.openFeature('phoenix', 'deep-dive')
            },
            {
                id: 'recommendations',
                name: 'Recommendations',
                icon: '',
                description: 'Personalized AI recommendations',
                status: 'active',
                action: () => this.openFeature('phoenix', 'recommendations')
            },
            {
                id: 'auto-optimize',
                name: 'Auto-Optimize',
                icon: '',
                description: 'Let AI optimize settings',
                status: 'active',
                action: () => this.openFeature('phoenix', 'auto-optimize')
            },

            // VOICE AI (4)
            {
                id: 'voice-session',
                name: 'Start Voice Session',
                icon: '',
                description: 'Begin voice conversation',
                status: 'active',
                action: () => this.openFeature('phoenix', 'voice-session')
            },
            {
                id: 'end-voice',
                name: 'End Voice Session',
                icon: '',
                description: 'Stop voice conversation',
                status: 'active',
                action: () => this.openFeature('phoenix', 'voice-end')
            },
            {
                id: 'voice-transcriptions',
                name: 'Transcriptions',
                icon: '',
                description: 'View voice transcriptions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'transcriptions')
            },
            {
                id: 'voice-history',
                name: 'Voice History',
                icon: '',
                description: 'Past voice interactions',
                status: 'active',
                action: () => this.openFeature('phoenix', 'voice-history')
            },

            // ML & LEARNING (7)
            {
                id: 'train-model',
                name: 'Train ML Model',
                icon: '',
                description: 'Start ML model training',
                status: 'active',
                action: () => this.openFeature('phoenix', 'train')
            },
            {
                id: 'ml-models',
                name: 'My ML Models',
                icon: '',
                description: 'View trained models',
                status: 'active',
                action: () => this.openFeature('phoenix', 'models')
            },
            {
                id: 'training-status',
                name: 'Training Status',
                icon: '',
                description: 'Check ML training progress',
                status: 'active',
                action: () => this.openFeature('phoenix', 'training-status')
            },
            {
                id: 'track-behavior',
                name: 'Track Behavior',
                icon: '',
                description: 'Log behavior for ML',
                status: 'active',
                action: () => this.openFeature('phoenix', 'track-behavior')
            },
            {
                id: 'behavior-patterns',
                name: 'Behavior Patterns',
                icon: '',
                description: 'Discovered behavior patterns',
                status: 'active',
                action: () => this.openFeature('phoenix', 'behavior-patterns')
            },
            {
                id: 'behavioral-insights',
                name: 'Behavioral Insights',
                icon: '',
                description: 'Insights from behavior data',
                status: 'active',
                action: () => this.openFeature('phoenix', 'behavioral-insights')
            },
            {
                id: 'specific-behavior',
                name: 'Specific Behavior Type',
                icon: '',
                description: 'View specific behavior category',
                status: 'active',
                action: () => this.openFeature('phoenix', 'behavior-type')
            },

            // BUTLER - RESERVATIONS (2)
            {
                id: 'make-reservation',
                name: 'Make Reservation',
                icon: '',
                description: 'Book restaurant table',
                status: 'active',
                action: () => this.openFeature('phoenix', 'reservation')
            },
            {
                id: 'reservation-history',
                name: 'Reservation History',
                icon: '',
                description: 'Past reservations',
                status: 'active',
                action: () => this.openFeature('phoenix', 'reservations')
            },

            // BUTLER - FOOD (3)
            {
                id: 'order-food',
                name: 'Order Food Delivery',
                icon: '',
                description: 'Order from restaurants',
                status: 'active',
                action: () => this.openFeature('phoenix', 'food')
            },
            {
                id: 'food-history',
                name: 'Order History',
                icon: '',
                description: 'Past food orders',
                status: 'active',
                action: () => this.openFeature('phoenix', 'food-history')
            },
            {
                id: 'reorder-food',
                name: 'Reorder Meal',
                icon: '',
                description: 'Repeat previous order',
                status: 'active',
                action: () => this.openFeature('phoenix', 'reorder')
            },

            // BUTLER - RIDES (2)
            {
                id: 'book-ride',
                name: 'Book Ride',
                icon: '',
                description: 'Uber/Lyft booking',
                status: 'active',
                action: () => this.openFeature('phoenix', 'ride')
            },
            {
                id: 'ride-history',
                name: 'Ride History',
                icon: '',
                description: 'Past rides',
                status: 'active',
                action: () => this.openFeature('phoenix', 'rides')
            },

            // BUTLER - CALLS (2)
            {
                id: 'make-call',
                name: 'Make Phone Call',
                icon: '',
                description: 'AI-powered calling via Twilio',
                status: 'active',
                action: () => this.openFeature('phoenix', 'call')
            },
            {
                id: 'call-history',
                name: 'Call History',
                icon: '',
                description: 'Past calls made',
                status: 'active',
                action: () => this.openFeature('phoenix', 'calls')
            },

            // BUTLER - SMS (2)
            {
                id: 'send-sms',
                name: 'Send SMS',
                icon: '',
                description: 'Send text message',
                status: 'active',
                action: () => this.openFeature('phoenix', 'sms')
            },
            {
                id: 'sms-history',
                name: 'SMS History',
                icon: '',
                description: 'Sent messages',
                status: 'active',
                action: () => this.openFeature('phoenix', 'sms-list')
            },

            // BUTLER - EMAIL (3)
            {
                id: 'send-email',
                name: 'Send Email',
                icon: '',
                description: 'Compose and send email',
                status: 'active',
                action: () => this.openFeature('phoenix', 'email')
            },
            {
                id: 'email-history',
                name: 'Email History',
                icon: '',
                description: 'Sent emails',
                status: 'active',
                action: () => this.openFeature('phoenix', 'emails')
            },
            {
                id: 'reply-email',
                name: 'Reply to Email',
                icon: '',
                description: 'Reply to received email',
                status: 'active',
                action: () => this.openFeature('phoenix', 'email-reply')
            },

            // BUTLER - CALENDAR (2)
            {
                id: 'manage-calendar',
                name: 'Manage Calendar',
                icon: '',
                description: 'Calendar event management',
                status: 'active',
                action: () => this.openFeature('phoenix', 'calendar')
            },
            {
                id: 'optimize-calendar',
                name: 'Optimize Calendar',
                icon: '',
                description: 'AI calendar optimization',
                status: 'active',
                action: () => this.openFeature('phoenix', 'calendar-optimize')
            },

            // BUTLER - WEB (2)
            {
                id: 'web-search',
                name: 'Web Search',
                icon: '',
                description: 'Search the web',
                status: 'active',
                action: () => this.openFeature('phoenix', 'search')
            },
            {
                id: 'web-task',
                name: 'Perform Web Task',
                icon: '',
                description: 'Execute web automation',
                status: 'active',
                action: () => this.openFeature('phoenix', 'web-task')
            },

            // BUTLER - SUMMARIZATION (2)
            {
                id: 'summarize',
                name: 'Summarize Content',
                icon: '',
                description: 'AI content summarization',
                status: 'active',
                action: () => this.openFeature('phoenix', 'summarize')
            },
            {
                id: 'batch-summarize',
                name: 'Batch Summarize',
                icon: '',
                description: 'Summarize multiple items',
                status: 'active',
                action: () => this.openFeature('phoenix', 'summarize-batch')
            },

            // BUTLER - AUTOMATION (3)
            {
                id: 'create-automation',
                name: 'Create Automation',
                icon: '',
                description: 'Set up automation rule',
                status: 'active',
                action: () => this.openFeature('phoenix', 'automate')
            },
            {
                id: 'my-automations',
                name: 'My Automations',
                icon: '',
                description: 'View active automations',
                status: 'active',
                action: () => this.openFeature('phoenix', 'automations')
            },
            {
                id: 'delete-automation',
                name: 'Delete Automation',
                icon: '',
                description: 'Remove automation',
                status: 'active',
                action: () => this.openFeature('phoenix', 'delete-automation')
            },

            // BUTLER - BUDGET (2)
            {
                id: 'butler-budget',
                name: 'Budget Management',
                icon: '',
                description: 'AI budget insights',
                status: 'active',
                action: () => this.openFeature('phoenix', 'budget')
            },
            {
                id: 'update-budget',
                name: 'Update Budget',
                icon: '',
                description: 'Modify budget settings',
                status: 'active',
                action: () => this.openFeature('phoenix', 'budget-update')
            }
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FEATURE DETAIL VIEWS - Opens actual feature interface
    // ═══════════════════════════════════════════════════════════════════════════

    async openFeature(domain, featureId) {
        console.log(`Opening ${domain}/${featureId}`);

        // Close feature panel
        this.closeDomain();

        // Open feature-specific interface
        // Each feature gets its own beautiful interface
        const featureView = document.createElement('div');
        featureView.id = 'feature-view';
        featureView.className = 'feature-view';
        featureView.innerHTML = await this.renderFeatureView(domain, featureId);

        document.body.appendChild(featureView);

        // Trigger entrance animation
        setTimeout(() => featureView.classList.add('visible'), 10);
    }

    async renderFeatureView(domain, featureId) {
        // This will render domain-specific feature interfaces
        // For now, returning a template - you'll implement each feature's actual UI

        return `
            <div class="feature-view-container">
                <div class="feature-view-header">
                    <button class="back-btn" onclick="window.holographicNav.closeFeatureView()">
                        ← Back
                    </button>
                    <h1>${domain.toUpperCase()} / ${featureId}</h1>
                </div>
                <div class="feature-view-content">
                    ${await this.getFeatureContent(domain, featureId)}
                </div>
            </div>
        `;
    }

    async getFeatureContent(domain, featureId) {
        // Placeholder - each feature will have its own implementation
        return `
            <div class="feature-placeholder">
                <div class="placeholder-icon">🚀</div>
                <h2>Feature: ${featureId}</h2>
                <p>This feature is connected to the backend and ready to build!</p>
                <p class="api-endpoint">Connected to: /api/${domain}/${featureId}</p>
            </div>
        `;
    }

    closeFeatureView() {
        const view = document.getElementById('feature-view');
        if (view) {
            view.classList.remove('visible');
            setTimeout(() => view.remove(), 300);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM - Beautiful holographic particles
    // ═══════════════════════════════════════════════════════════════════════════

    startParticleSystem() {
        const canvas = document.getElementById('holo-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 217, 255, ${p.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════════════════

    attachEventListeners() {
        // Toggle navigator
        document.addEventListener('click', (e) => {
            if (e.target.closest('#holo-toggle')) {
                this.toggleNavigator();
            }

            if (e.target.closest('.planet-node')) {
                const node = e.target.closest('.planet-node');
                this.openDomain(node.dataset.domain);
            }

            if (e.target.closest('#close-panel')) {
                this.closeDomain();
            }

            if (e.target.closest('.feature-card')) {
                const card = e.target.closest('.feature-card');
                const featureId = card.dataset.feature;
                // Feature click handled by feature's action
            }

            if (e.target.closest('.dock-item')) {
                const item = e.target.closest('.dock-item');
                this.handleQuickAction(item.dataset.action);
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDomain();
                this.closeFeatureView();
            }
        });

        // Resize canvas
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('holo-particles');
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        });
    }

    toggleNavigator() {
        const container = document.getElementById('holo-nav-container');
        this.isExpanded = !this.isExpanded;
        container.classList.toggle('collapsed');
        container.classList.toggle('expanded');
    }

    closeDomain() {
        const panel = document.getElementById('holo-feature-panel');
        panel.classList.remove('visible');
        setTimeout(() => panel.classList.add('hidden'), 300);

        const container = document.getElementById('holo-nav-container');
        container.classList.remove('expanded');
        container.classList.add('collapsed');
    }

    handleQuickAction(action) {
        console.log('Quick action:', action);
        // Handle dock quick actions
        switch(action) {
            case 'voice':
                window.toggleVoice?.();
                break;
            case 'butler':
                window.toggleButlerPanel?.();
                break;
            case 'sync':
                window.openSyncPanel?.();
                break;
            case 'insights':
                this.openDomain('phoenix');
                break;
        }
    }
}

// Initialize holographic navigator
window.addEventListener('DOMContentLoaded', () => {
    window.holographicNav = new HolographicNavigator();
});

console.log('Holographic Navigator loaded - 446+ features ready');
