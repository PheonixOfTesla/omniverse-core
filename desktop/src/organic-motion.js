/* ============================================
   PHOENIX ORGANIC MOTION SYSTEM
   Breathing animations, emotional mirroring, flow transitions
   Everything moves like a living organism
   ============================================ */

class OrganicMotion {
    constructor() {
        this.currentEmotion = 'neutral';
        this.breathingRate = 0.4; // Hz (breaths per second)
        this.biometrics = {};
        this.urgencyLevel = 'low'; // low, medium, high
        this.currentColor = '#00d9ff'; // Default cyan

        console.log('[OrganicMotion] Initialized');
    }

    /* ============================================
       URGENCY COLOR STATES - Red/Amber/Green orb
       ============================================ */
    setUrgencyState(level, element) {
        if (!element) {
            element = document.getElementById('orb');
        }
        if (!element) return;

        this.urgencyLevel = level;

        const urgencyColors = {
            high: {
                color: '#ff3366',
                glow: 'rgba(255, 51, 102, 0.6)',
                breathRate: 0.7, // Faster breathing
                name: 'RED - HIGH URGENCY'
            },
            medium: {
                color: '#ffaa33',
                glow: 'rgba(255, 170, 51, 0.6)',
                breathRate: 0.5, // Medium breathing
                name: 'AMBER - MODERATE'
            },
            low: {
                color: '#33ffaa',
                glow: 'rgba(51, 255, 170, 0.6)',
                breathRate: 0.3, // Slow breathing
                name: 'GREEN - CALM'
            },
            neutral: {
                color: '#00d9ff',
                glow: 'rgba(0, 217, 255, 0.6)',
                breathRate: 0.4, // Default breathing
                name: 'CYAN - NEUTRAL'
            }
        };

        const config = urgencyColors[level] || urgencyColors.neutral;
        this.currentColor = config.color;
        this.breathingRate = config.breathRate;

        // Apply color with smooth transition
        element.style.transition = 'all 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        element.style.background = `radial-gradient(circle at center, ${config.color} 0%, rgba(0,10,20,0.8) 100%)`;
        element.style.boxShadow = `0 0 60px ${config.glow}, 0 0 120px ${config.glow}, inset 0 0 40px ${config.glow}`;

        // Update breathing rate
        this.breathe(element, { rate: config.breathRate, type: 'glow' });

        console.log(`[OrganicMotion] Urgency state: ${config.name}`);
        return config;
    }

    /* ============================================
       BREATHING ANIMATION - Pulse with HRV rhythm
       ============================================ */
    breathe(element, options = {}) {
        if (!element) return;

        const {
            rate = this.breathingRate,
            intensity = 1.0,
            type = 'scale' // 'scale', 'glow', 'opacity'
        } = options;

        const period = 1 / rate; // seconds per breath
        const animation = type === 'scale' ? 'breathe-scale' :
                         type === 'glow' ? 'breathe-glow' :
                         'breathe-opacity';

        element.style.animation = `${animation} ${period}s ease-in-out infinite`;
        element.style.setProperty('--breathe-intensity', intensity);

        console.log(`[OrganicMotion] Breathing applied: ${type} at ${rate}Hz`);
    }

    /* ============================================
       FLOW TRANSITION - Emotional state changes
       ============================================ */
    flow(element, targetState, options = {}) {
        if (!element) return;

        const {
            duration = 1000,
            emotion = 'neutral'
        } = options;

        // Get transition curve based on emotion
        const curve = this.getEmotionalCurve(emotion);

        // Apply transition
        element.style.transition = `all ${duration}ms ${curve}`;

        // Apply target state
        Object.entries(targetState).forEach(([property, value]) => {
            element.style[property] = value;
        });

        console.log(`[OrganicMotion] Flow transition: ${emotion}`);
    }

    getEmotionalCurve(emotion) {
        const curves = {
            excited: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
            calm: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Smooth
            stressed: 'cubic-bezier(0.85, 0, 0.15, 1)', // Quick
            tired: 'cubic-bezier(0.33, 1, 0.68, 1)', // Slow ease-out
            neutral: 'cubic-bezier(0.4, 0.0, 0.6, 1)' // Standard material
        };

        return curves[emotion] || curves.neutral;
    }

    /* ============================================
       ANTICIPATORY ANIMATION - Pre-animate before command
       ============================================ */
    anticipate(element, nextState) {
        if (!element) return;

        // Subtle hint of what's coming
        element.style.transition = 'transform 200ms ease-out';
        element.style.transform = 'scale(0.98)';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);

        console.log('[OrganicMotion] Anticipation cue');
    }

    /* ============================================
       EMOTIONAL MIRRORING - Match user state
       ============================================ */
    mirror(element, emotionalState, biometrics = {}) {
        if (!element) return;

        this.currentEmotion = emotionalState;
        this.biometrics = biometrics;

        switch (emotionalState) {
            case 'stressed':
                // Low HRV - slow, calming animations
                this.breathingRate = 0.25; // 4 seconds per breath
                element.style.setProperty('--primary-color', '#6B7FD7'); // Calming blue-purple
                element.style.filter = 'brightness(0.7)';
                break;

            case 'excited':
                // High energy - faster, brighter
                this.breathingRate = 0.6; // 1.67 seconds per breath
                element.style.setProperty('--primary-color', '#00FFFF'); // Bright cyan
                element.style.filter = 'brightness(1.2)';
                break;

            case 'tired':
                // Low energy - minimal movement
                this.breathingRate = 0.1; // 10 seconds per breath
                element.style.setProperty('--primary-color', '#FFB84D'); // Warm amber
                element.style.filter = 'brightness(0.6)';
                break;

            case 'focused':
                // Work mode - clean, minimal
                this.breathingRate = 0.3;
                element.style.setProperty('--primary-color', '#00FFAA'); // Mint green
                element.style.filter = 'brightness(0.9)';
                break;

            default: // neutral
                this.breathingRate = 0.4;
                element.style.setProperty('--primary-color', '#00FFFF');
                element.style.filter = 'brightness(1.0)';
        }

        // Re-apply breathing with new rate
        this.breathe(element, { rate: this.breathingRate });

        console.log(`[OrganicMotion] Mirroring emotion: ${emotionalState}`);
    }

    /* ============================================
       PULSE - Sync with biometric data
       ============================================ */
    pulseWithHRV(element, hrv) {
        if (!element || !hrv) return;

        // Convert HRV to breathing rate
        // Low HRV (< 40ms) = stressed = slow breathing (0.25 Hz)
        // Normal HRV (40-60ms) = normal = medium breathing (0.4 Hz)
        // High HRV (> 60ms) = recovered = faster breathing (0.5 Hz)

        let rate;
        if (hrv < 40) {
            rate = 0.25;
        } else if (hrv < 60) {
            rate = 0.4;
        } else {
            rate = 0.5;
        }

        this.breathingRate = rate;
        this.breathe(element, { rate });

        console.log(`[OrganicMotion] Pulse synced with HRV: ${hrv}ms → ${rate}Hz`);
    }

    /* ============================================
       WIDGET ENTRANCE - Organic appearance
       ============================================ */
    enterWidget(element, priority = 'medium') {
        if (!element) return;

        const delays = {
            high: 0,
            medium: 100,
            low: 200
        };

        const delay = delays[priority] || 100;

        element.style.opacity = '0';
        element.style.transform = 'translateY(20px) scale(0.95)';

        requestAnimationFrame(() => {
            setTimeout(() => {
                element.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) scale(1)';
            }, delay);
        });

        console.log(`[OrganicMotion] Widget entering with ${priority} priority`);
    }

    /* ============================================
       WIDGET EXIT - Organic disappearance
       ============================================ */
    exitWidget(element) {
        if (!element) return;

        element.style.transition = 'opacity 400ms ease-in, transform 400ms ease-in';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px) scale(0.95)';

        setTimeout(() => {
            element.style.display = 'none';
        }, 400);

        console.log('[OrganicMotion] Widget exiting');
    }

    /* ============================================
       URGENCY INDICATOR - Subtle attention guidance
       ============================================ */
    indicateUrgency(element, urgency = 'medium') {
        if (!element) return;

        switch (urgency) {
            case 'high':
                // Strong glow, faster pulse
                element.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.8), 0 0 60px rgba(0, 217, 255, 0.4)';
                element.style.animation = 'urgency-pulse 1s ease-in-out infinite';
                break;

            case 'medium':
                // Gentle glow
                element.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.5)';
                element.style.animation = 'urgency-pulse 2s ease-in-out infinite';
                break;

            case 'low':
                // Very subtle
                element.style.boxShadow = '0 0 10px rgba(0, 217, 255, 0.3)';
                element.style.animation = 'urgency-pulse 3s ease-in-out infinite';
                break;

            default:
                element.style.boxShadow = '';
                element.style.animation = '';
        }

        console.log(`[OrganicMotion] Urgency: ${urgency}`);
    }

    /* ============================================
       SMOOTH SCROLL - Organic page movement
       ============================================ */
    smoothScrollTo(element) {
        if (!element) return;

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        console.log('[OrganicMotion] Smooth scroll');
    }

    /* ============================================
       STOP ALL - Reset animations
       ============================================ */
    stop(element) {
        if (!element) return;

        element.style.animation = '';
        element.style.transition = '';
        element.style.transform = '';

        console.log('[OrganicMotion] Stopped');
    }
}

// CSS Animations (inject into document)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes breathe-scale {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(calc(1 + 0.05 * var(--breathe-intensity, 1)));
        }
    }

    @keyframes breathe-glow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(0, 217, 255, calc(0.6 * var(--breathe-intensity, 1)));
        }
    }

    @keyframes breathe-opacity {
        0%, 100% {
            opacity: 0.9;
        }
        50% {
            opacity: calc(1 * var(--breathe-intensity, 1));
        }
    }

    @keyframes urgency-pulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: inherit;
        }
        50% {
            transform: scale(1.02);
            filter: brightness(1.1);
        }
    }
`;
document.head.appendChild(styleSheet);

// Initialize organic motion system
let organicMotion;

document.addEventListener('DOMContentLoaded', () => {
    organicMotion = new OrganicMotion();
    window.organicMotion = organicMotion;

    console.log('[OrganicMotion] Ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrganicMotion;
}
