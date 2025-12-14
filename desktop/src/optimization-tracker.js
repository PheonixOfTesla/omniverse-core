/**
 * ============================================================================
 * PHOENIX OPTIMIZATION TRACKER
 * ============================================================================
 *
 * Tracks user's system integration completeness and calculates "Optimization Score"
 * Unlocks AI personality modes based on optimization level
 * Guides users to connect all services for maximum Phoenix capability
 *
 * Goal: Get users from 0% → 100% "PHOENIX OPTIMIZED" status
 */

class PhoenixOptimizationTracker {
    constructor() {
        this.integrations = {
            // Financial Intelligence (15 points)
            plaid: {
                name: 'Plaid Banking',
                icon: '🏦',
                points: 15,
                category: 'financial',
                connected: false,
                benefits: [
                    'AI budget optimization',
                    'Spending-stress correlation analysis',
                    'Automatic expense categorization',
                    'Financial goal tracking',
                    'Investment recommendations',
                    'Real-time net worth tracking'
                ],
                examples: [
                    '"Phoenix, can I afford this?" → "Yes, you have $847 discretionary this month."',
                    '"Am I overspending?" → "You spent 23% more on weekends. I\'ve adjusted your budget."'
                ]
            },

            // Health & Biometrics (15 points)
            wearables: {
                name: 'Wearable Devices',
                icon: '⌚',
                points: 15,
                category: 'health',
                connected: false,
                devices: ['Fitbit', 'Polar', 'Apple Watch', 'Whoop', 'Oura Ring'],
                benefits: [
                    'Automatic sleep & recovery tracking',
                    'Real-time HRV monitoring',
                    'Workout auto-logging',
                    'Readiness score predictions',
                    'Optimal training time suggestions',
                    'Injury prevention alerts'
                ],
                examples: [
                    '"Should I work out today?" → "Your recovery is only 62%. Rest recommended."',
                    '"Why am I tired?" → "Your HRV dropped 18% due to poor sleep quality."'
                ]
            },

            // Calendar & Energy (10 points)
            calendar: {
                name: 'Calendar Integration',
                icon: '📅',
                points: 10,
                category: 'productivity',
                connected: false,
                providers: ['Google Calendar', 'Outlook', 'iCal'],
                benefits: [
                    'Energy-optimized scheduling',
                    'Automatic meeting conflict resolution',
                    'Peak performance time detection',
                    'Smart break insertion',
                    'Travel time calculation',
                    'Event preparation reminders'
                ],
                examples: [
                    '"When should I schedule this meeting?" → "Your peak energy is 10am Tuesday."',
                    '"I have 3 conflicts" → "I\'ve found optimal times and sent reschedule requests."'
                ]
            },

            // Email Intelligence (10 points)
            email: {
                name: 'Email Integration',
                icon: '📧',
                points: 10,
                category: 'productivity',
                connected: false,
                providers: ['Gmail', 'Outlook'],
                benefits: [
                    'AI email drafting & sending',
                    'Inbox zero automation',
                    'Priority email detection',
                    'Auto-response suggestions',
                    'Email scheduling optimization',
                    'Follow-up reminders'
                ],
                examples: [
                    '"Send a follow-up to John" → "Done. Email sent with meeting recap."',
                    '"Summarize my inbox" → "12 emails. 3 urgent, 7 can wait, 2 auto-archived."'
                ]
            },

            // Communication (10 points)
            phone: {
                name: 'Phone & SMS',
                icon: '📱',
                points: 10,
                category: 'communication',
                connected: false,
                provider: 'Twilio',
                benefits: [
                    'Voice call automation',
                    'Smart SMS sending',
                    'Appointment confirmations',
                    'Reminder notifications',
                    'Communication pattern analysis',
                    'Auto-replies'
                ],
                examples: [
                    '"Text mom I\'ll be late" → "Message sent: \'Running 15 min late, see you soon!\'"',
                    '"Call my doctor" → "Calling Dr. Smith now. Line connected."'
                ]
            },

            // Food Services (10 points)
            food: {
                name: 'Food Delivery',
                icon: '🍔',
                points: 10,
                category: 'lifestyle',
                connected: false,
                providers: ['DoorDash', 'UberEats', 'Grubhub'],
                benefits: [
                    'One-command food ordering',
                    'Macro-optimized meal suggestions',
                    'Budget-aware ordering',
                    'Favorite meal memory',
                    'Nutrition tracking integration',
                    'Optimal order timing'
                ],
                examples: [
                    '"Order lunch" → "Ordered your usual: grilled chicken bowl, 45g protein. ETA 25 min."',
                    '"I want pizza but..." → "Pizza would exceed your calorie budget. Suggest healthier alternative?"'
                ]
            },

            // Transportation (10 points)
            rides: {
                name: 'Ride Services',
                icon: '🚗',
                points: 10,
                category: 'lifestyle',
                connected: false,
                providers: ['Uber', 'Lyft'],
                benefits: [
                    'One-command ride booking',
                    'Automatic pickup location',
                    'Smart departure time calc',
                    'Cost optimization (Uber vs Lyft)',
                    'Calendar integration for events',
                    'Traffic-aware scheduling'
                ],
                examples: [
                    '"Get me an Uber" → "Uber arriving in 4 minutes to your location."',
                    '"I have a meeting at 3pm" → "I\'ve booked an Uber for 2:35pm to arrive on time."'
                ]
            },

            // Dining Reservations (10 points)
            reservations: {
                name: 'Reservations',
                icon: '🍽️',
                points: 10,
                category: 'lifestyle',
                connected: false,
                provider: 'OpenTable',
                benefits: [
                    'Voice-command reservations',
                    'Preference-based suggestions',
                    'Auto-booking for events',
                    'Calendar integration',
                    'Dietary restriction awareness',
                    'Review-based recommendations'
                ],
                examples: [
                    '"Book dinner for 2 tonight" → "Reserved 7pm at Italian place you liked last month."',
                    '"Find a vegan restaurant" → "3 options found. Booked the highest-rated for 6:30pm."'
                ]
            },

            // Goals & Habits (5 points)
            goals: {
                name: 'Goals Setup',
                icon: '🎯',
                points: 5,
                category: 'personal-growth',
                connected: false,
                system: 'Mars',
                benefits: [
                    'SMART goal tracking',
                    'Milestone celebrations',
                    'Habit streak monitoring',
                    'Progress predictions',
                    'Motivation interventions',
                    'Goal achievement analytics'
                ],
                examples: [
                    '"How\'s my fitness goal?" → "67% complete. On track to finish in 12 days."',
                    '"I want to quit" → "You\'ve maintained this habit for 47 days. Don\'t break the streak!"'
                ]
            },

            // Fitness Tracking (5 points)
            workouts: {
                name: 'Workout Logging',
                icon: '💪',
                points: 5,
                category: 'fitness',
                connected: false,
                system: 'Venus',
                benefits: [
                    'Exercise performance tracking',
                    'Personal record detection',
                    'Quantum workout AI generation',
                    'Recovery-based programming',
                    'Form analysis & corrections',
                    'Progressive overload planning'
                ],
                examples: [
                    '"Log workout" → "Logged. You beat your squat PR by 10 lbs! +300 XP"',
                    '"What should I train?" → "Based on recovery, upper body. Here\'s your quantum workout."'
                ]
            }
        };

        this.optimizationTiers = {
            novice: {
                min: 0,
                max: 33,
                name: 'Basic Phoenix',
                personality: 'friendly',
                voice: 'nova',
                color: '#888888',
                description: 'Phoenix is learning about you. Connect more services to unlock advanced features.',
                unlocks: ['Basic chat', 'Manual data entry', 'Simple responses']
            },
            jarvis: {
                min: 34,
                max: 66,
                name: 'JARVIS Mode',
                personality: 'analytical',
                voice: 'echo',
                color: '#00aaff',
                description: 'Analytical AI with pattern recognition and predictive capabilities.',
                unlocks: ['Pattern analysis', 'Predictive insights', 'Data correlations', 'Optimization suggestions']
            },
            butler: {
                min: 67,
                max: 99,
                name: 'Butler Mode',
                personality: 'proactive',
                voice: 'onyx',
                color: '#9966ff',
                description: 'Proactive AI that takes autonomous actions on your behalf.',
                unlocks: ['Autonomous actions', 'Proactive interventions', 'Service automation', 'Butler commands']
            },
            optimized: {
                min: 100,
                max: 100,
                name: 'PHOENIX OPTIMIZED',
                personality: 'master',
                voice: 'custom',
                color: '#00d9ff',
                description: 'Full system mastery. Phoenix knows you better than you know yourself.',
                unlocks: ['EVERYTHING', 'Full autonomy', 'Predictive mastery', 'All voices', 'VIP features', 'Priority support']
            }
        };

        this.loadOptimizationState();
    }

    /**
     * Calculate current optimization score (0-100%)
     */
    calculateScore() {
        let totalPoints = 0;
        let earnedPoints = 0;

        for (const [key, integration] of Object.entries(this.integrations)) {
            totalPoints += integration.points;
            if (integration.connected) {
                earnedPoints += integration.points;
            }
        }

        return Math.round((earnedPoints / totalPoints) * 100);
    }

    /**
     * Get current optimization tier based on score
     */
    getCurrentTier() {
        const score = this.calculateScore();

        for (const [key, tier] of Object.entries(this.optimizationTiers)) {
            if (score >= tier.min && score <= tier.max) {
                return { ...tier, key, score };
            }
        }

        return this.optimizationTiers.novice;
    }

    /**
     * Get next tier to unlock
     */
    getNextTier() {
        const current = this.getCurrentTier();
        const tiers = ['novice', 'jarvis', 'butler', 'optimized'];
        const currentIndex = tiers.indexOf(current.key);

        if (currentIndex < tiers.length - 1) {
            return this.optimizationTiers[tiers[currentIndex + 1]];
        }

        return null; // Already at max
    }

    /**
     * Get missing integrations
     */
    getMissingIntegrations() {
        return Object.entries(this.integrations)
            .filter(([key, integration]) => !integration.connected)
            .map(([key, integration]) => ({ key, ...integration }));
    }

    /**
     * Get connected integrations
     */
    getConnectedIntegrations() {
        return Object.entries(this.integrations)
            .filter(([key, integration]) => integration.connected)
            .map(([key, integration]) => ({ key, ...integration }));
    }

    /**
     * Mark integration as connected
     */
    connectIntegration(integrationKey) {
        if (this.integrations[integrationKey]) {
            const wasConnected = this.integrations[integrationKey].connected;
            this.integrations[integrationKey].connected = true;
            this.saveOptimizationState();

            // Check if this connection unlocked a new tier
            const currentTier = this.getCurrentTier();
            const previousScore = this.calculateScore() - this.integrations[integrationKey].points;

            if (!wasConnected) {
                this.triggerConnectionEvent(integrationKey, currentTier);
            }

            return true;
        }
        return false;
    }

    /**
     * Disconnect integration
     */
    disconnectIntegration(integrationKey) {
        if (this.integrations[integrationKey]) {
            this.integrations[integrationKey].connected = false;
            this.saveOptimizationState();
            return true;
        }
        return false;
    }

    /**
     * Save optimization state to localStorage
     */
    saveOptimizationState() {
        const state = {};
        for (const [key, integration] of Object.entries(this.integrations)) {
            state[key] = integration.connected;
        }
        localStorage.setItem('phoenixOptimizationState', JSON.stringify(state));
        localStorage.setItem('phoenixOptimizationScore', this.calculateScore());
    }

    /**
     * Load optimization state from localStorage
     */
    loadOptimizationState() {
        try {
            const state = JSON.parse(localStorage.getItem('phoenixOptimizationState') || '{}');
            for (const [key, connected] of Object.entries(state)) {
                if (this.integrations[key]) {
                    this.integrations[key].connected = connected;
                }
            }
        } catch (error) {
            console.error('Error loading optimization state:', error);
        }
    }

    /**
     * Get points remaining to next tier
     */
    getPointsToNextTier() {
        const currentTier = this.getCurrentTier();
        const nextTier = this.getNextTier();

        if (!nextTier) {
            return 0; // Already optimized
        }

        return nextTier.min - currentTier.score;
    }

    /**
     * Get recommended next integration to connect
     */
    getRecommendedNextIntegration() {
        const missing = this.getMissingIntegrations();

        // Sort by points (highest first)
        missing.sort((a, b) => b.points - a.points);

        return missing[0] || null;
    }

    /**
     * Trigger connection event (for celebrations)
     */
    triggerConnectionEvent(integrationKey, newTier) {
        const integration = this.integrations[integrationKey];

        // Dispatch custom event for UI to catch
        const event = new CustomEvent('phoenixIntegrationConnected', {
            detail: {
                integration: integrationKey,
                name: integration.name,
                points: integration.points,
                newScore: this.calculateScore(),
                tier: newTier
            }
        });
        window.dispatchEvent(event);

        // Check if new tier unlocked
        if (this.getPointsToNextTier() === 0) {
            this.triggerTierUnlock(newTier);
        }
    }

    /**
     * Trigger tier unlock event
     */
    triggerTierUnlock(tier) {
        const event = new CustomEvent('phoenixTierUnlocked', {
            detail: tier
        });
        window.dispatchEvent(event);

        // If Phoenix Optimized, trigger special achievement
        if (tier.key === 'optimized') {
            this.triggerPhoenixOptimized();
        }
    }

    /**
     * Trigger Phoenix Optimized achievement
     */
    triggerPhoenixOptimized() {
        const event = new CustomEvent('phoenixFullyOptimized', {
            detail: {
                achievement: 'PHOENIX OPTIMIZED',
                xp: 5000,
                unlocks: this.optimizationTiers.optimized.unlocks
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get optimization summary for dashboard
     */
    getOptimizationSummary() {
        const score = this.calculateScore();
        const tier = this.getCurrentTier();
        const nextTier = this.getNextTier();
        const missing = this.getMissingIntegrations();
        const connected = this.getConnectedIntegrations();

        return {
            score,
            tier,
            nextTier,
            missing,
            connected,
            pointsToNext: this.getPointsToNextTier(),
            recommended: this.getRecommendedNextIntegration(),
            isOptimized: score === 100
        };
    }
}

// Initialize global optimization tracker
window.OptimizationTracker = new PhoenixOptimizationTracker();

// Log initialization
console.log('Phoenix Optimization Tracker initialized:', window.OptimizationTracker.getOptimizationSummary());
