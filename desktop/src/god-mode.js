/* ============================================
   PHOENIX GOD MODE - "Optimize My Life"
   Screen darkening, orb explosion, priority constellation
   The flagship consciousness feature
   ============================================ */

class GodMode {
    constructor() {
        this.isActive = false;
        this.isAnimating = false;

        console.log('[GodMode] Initialized');
    }

    /* ============================================
       EXECUTE GOD MODE - Main entry point
       ============================================ */
    async execute() {
        if (this.isAnimating) {
            console.log('[GodMode] Already animating, skipping');
            return;
        }

        this.isAnimating = true;
        this.isActive = true;

        console.log('[GodMode] 🌟 OPTIMIZE MY LIFE - INITIATED');

        try {
            // Phase 1: Screen darkening
            await this.darkenScreen();

            // Phase 2: Orb center + pulse
            await this.centerOrb();

            // Phase 3: "Give me 10 seconds..."
            await this.showCountdown();

            // Phase 4: Domain scan
            await this.domainScan();

            // Phase 5: Orb explosion
            await this.explodeOrb();

            // Phase 6: Widget constellation
            await this.createConstellation();

            this.isAnimating = false;
        } catch (error) {
            console.error('[GodMode] Error:', error);
            this.isAnimating = false;
            await this.cleanup();
        }
    }

    /* ============================================
       PHASE 1: Screen Darkening
       ============================================ */
    async darkenScreen() {
        console.log('[GodMode] Phase 1: Darkening screen...');

        // Create dark overlay
        let overlay = document.getElementById('god-mode-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'god-mode-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0);
                z-index: 9998;
                pointer-events: none;
                transition: background 2s cubic-bezier(0.4, 0.0, 0.2, 1);
            `;
            document.body.appendChild(overlay);
        }

        // Fade in dark overlay
        requestAnimationFrame(() => {
            overlay.style.background = 'rgba(0, 0, 0, 0.95)';
        });

        // Hide widgets gently
        if (window.widgetManager) {
            const widgets = document.querySelectorAll('.phoenix-widget');
            widgets.forEach(widget => {
                widget.style.transition = 'opacity 1.5s, transform 1.5s';
                widget.style.opacity = '0';
                widget.style.transform = 'scale(0.8)';
            });
        }

        await this.sleep(2000);
    }

    /* ============================================
       PHASE 2: Center Orb
       ============================================ */
    async centerOrb() {
        console.log('[GodMode] Phase 2: Centering orb...');

        const orb = document.getElementById('orb');
        if (!orb) return;

        // Add god mode class
        orb.classList.add('god-mode-active');

        // Animate to center with pulsing
        orb.style.transition = 'all 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        orb.style.position = 'fixed';
        orb.style.top = '50%';
        orb.style.left = '50%';
        orb.style.transform = 'translate(-50%, -50%) scale(1.5)';

        // Set to high urgency state (red pulsing)
        if (window.organicMotion) {
            window.organicMotion.setUrgencyState('high', orb);
        }

        await this.sleep(2000);
    }

    /* ============================================
       PHASE 3: Countdown Message
       ============================================ */
    async showCountdown() {
        console.log('[GodMode] Phase 3: Showing countdown...');

        // Create countdown container
        const countdownEl = document.createElement('div');
        countdownEl.id = 'god-mode-countdown';
        countdownEl.style.cssText = `
            position: fixed;
            top: 60%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            color: #00ff88;
            text-align: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 1s;
            font-weight: 300;
            letter-spacing: 3px;
            text-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
        `;
        countdownEl.innerHTML = 'Give me 10 seconds...';
        document.body.appendChild(countdownEl);

        // Fade in
        requestAnimationFrame(() => {
            countdownEl.style.opacity = '1';
        });

        // Speak the message
        if (window.phoenixVoice) {
            window.phoenixVoice.speak('Give me 10 seconds to analyze your entire life.');
        }

        await this.sleep(3000);

        // Fade out countdown
        countdownEl.style.opacity = '0';
        await this.sleep(1000);
        countdownEl.remove();
    }

    /* ============================================
       PHASE 4: Domain Scan
       ============================================ */
    async domainScan() {
        console.log('[GodMode] Phase 4: Domain scan...');

        const domains = [
            { name: 'Mercury', icon: '⚕️', dataPoints: Math.floor(Math.random() * 500) + 200 },
            { name: 'Venus', icon: '💪', dataPoints: Math.floor(Math.random() * 300) + 150 },
            { name: 'Earth', icon: '📅', dataPoints: Math.floor(Math.random() * 400) + 100 },
            { name: 'Mars', icon: '🎯', dataPoints: Math.floor(Math.random() * 200) + 50 },
            { name: 'Jupiter', icon: '💰', dataPoints: Math.floor(Math.random() * 600) + 300 },
            { name: 'Saturn', icon: '🤝', dataPoints: Math.floor(Math.random() * 250) + 100 },
            { name: 'Uranus', icon: '📚', dataPoints: Math.floor(Math.random() * 180) + 80 },
            { name: 'Neptune', icon: '🧘', dataPoints: Math.floor(Math.random() * 150) + 50 }
        ];

        const scanContainer = document.createElement('div');
        scanContainer.id = 'god-mode-scan';
        scanContainer.style.cssText = `
            position: fixed;
            top: 65%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            width: 400px;
            max-width: 90%;
        `;
        document.body.appendChild(scanContainer);

        // Scan each domain sequentially with animation
        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            const scanLine = document.createElement('div');
            scanLine.style.cssText = `
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                color: rgba(0, 255, 136, 0.8);
                font-size: 14px;
                opacity: 0;
                transform: translateX(-20px);
                transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
            `;
            scanLine.innerHTML = `
                <span>${domain.icon} ${domain.name}</span>
                <span style="font-family: monospace; color: rgba(0, 217, 255, 0.6);">${domain.dataPoints} data points</span>
            `;
            scanContainer.appendChild(scanLine);

            // Animate in
            await this.sleep(100);
            requestAnimationFrame(() => {
                scanLine.style.opacity = '1';
                scanLine.style.transform = 'translateX(0)';
            });

            await this.sleep(300);
        }

        await this.sleep(2000);

        // Fade out scan
        scanContainer.style.transition = 'opacity 1s';
        scanContainer.style.opacity = '0';
        await this.sleep(1000);
        scanContainer.remove();
    }

    /* ============================================
       PHASE 5: Orb Explosion
       ============================================ */
    async explodeOrb() {
        console.log('[GodMode] Phase 5: Orb explosion...');

        const orb = document.getElementById('orb');
        if (!orb) return;

        // Create explosion particles
        const particleCount = 50;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'god-mode-particle';
            particle.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                background: radial-gradient(circle, #00ff88 0%, #00d9ff 100%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                box-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
            `;
            document.body.appendChild(particle);
            particles.push(particle);
        }

        // Explode orb
        orb.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        orb.style.transform = 'translate(-50%, -50%) scale(3)';
        orb.style.opacity = '0';

        // Animate particles outward
        particles.forEach((particle, index) => {
            const angle = (index / particleCount) * Math.PI * 2;
            const distance = 300 + Math.random() * 200;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.transition = `all ${1 + Math.random() * 0.5}s cubic-bezier(0.4, 0.0, 0.2, 1)`;

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${tx}px, ${ty}px)`;
                particle.style.opacity = '0';
            });
        });

        await this.sleep(1500);

        // Clean up particles
        particles.forEach(p => p.remove());
    }

    /* ============================================
       PHASE 6: Widget Constellation
       ============================================ */
    async createConstellation() {
        console.log('[GodMode] Phase 6: Creating priority constellation...');

        if (window.phoenixVoice) {
            window.phoenixVoice.speak('Here is your optimized life plan, prioritized by impact.');
        }

        // Fetch comprehensive optimization from backend
        let widgets = [];
        try {
            const token = localStorage.getItem('phoenixToken');
            if (token && window.PhoenixConfig) {
                const response = await fetch(`${window.PhoenixConfig.API_BASE_URL}/interface/god-mode`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        trigger: 'god_mode',
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    widgets = data.widgets || [];
                }
            }
        } catch (error) {
            console.error('[GodMode] Backend fetch error:', error);
        }

        // Fallback: Generate sample constellation if backend unavailable
        if (widgets.length === 0) {
            widgets = this.generateSampleConstellation();
        }

        // Display constellation using widget manager
        if (window.widgetManager) {
            // Sort by priority (highest first)
            widgets.sort((a, b) => (b.priority || 0) - (a.priority || 0));

            // Create widgets in orbital positions with size based on priority
            const positions = ['top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left'];

            for (let i = 0; i < Math.min(widgets.length, 8); i++) {
                const widget = widgets[i];
                const position = positions[i];

                // Scale size by priority (1-10 scale)
                const priorityScale = (widget.priority || 5) / 10;
                const size = priorityScale > 0.7 ? 'large' : priorityScale > 0.4 ? 'medium' : 'small';

                // Create widget with priority-based urgency
                const urgency = priorityScale > 0.7 ? 'high' : priorityScale > 0.4 ? 'medium' : 'low';

                await window.widgetManager.createWidgetWithPriority({
                    id: widget.id || `god-mode-${i}`,
                    data: widget.data || {},
                    position: position,
                    size: size,
                    urgency: urgency,
                    priority: widget.priority || 5
                });

                // Stagger animation
                await this.sleep(200);
            }
        }

        // Restore orb to normal
        await this.sleep(1000);
        await this.restoreOrb();

        // Remove overlay
        const overlay = document.getElementById('god-mode-overlay');
        if (overlay) {
            overlay.style.background = 'rgba(0, 0, 0, 0)';
            await this.sleep(2000);
            overlay.remove();
        }

        this.isActive = false;
        console.log('[GodMode] ✨ Constellation complete');
    }

    /* ============================================
       SAMPLE CONSTELLATION - Fallback if backend unavailable
       ============================================ */
    generateSampleConstellation() {
        return [
            {
                id: 'recovery-boost',
                priority: 10,
                data: {
                    title: 'Recovery Boost Needed',
                    content: 'HRV down 15%. Recommend 20min meditation + early sleep tonight.',
                    icon: '⚕️'
                }
            },
            {
                id: 'financial-optimization',
                priority: 9,
                data: {
                    title: '$847 Savings Opportunity',
                    content: 'Cancel unused subscriptions: Netflix, Gym (unused 3 months).',
                    icon: '💰'
                }
            },
            {
                id: 'calendar-conflict',
                priority: 8,
                data: {
                    title: 'Schedule Conflict Detected',
                    content: '3 meetings overlap tomorrow 2pm. Suggest reschedule Marketing call.',
                    icon: '📅'
                }
            },
            {
                id: 'goal-acceleration',
                priority: 7,
                data: {
                    title: 'Goal: Lose 10lbs',
                    content: '67% complete. On track. Add 1 extra cardio session/week to finish by target date.',
                    icon: '🎯'
                }
            },
            {
                id: 'nutrition-gap',
                priority: 6,
                data: {
                    title: 'Protein Deficient',
                    content: 'Avg 85g/day. Need 120g. Add: Greek yogurt breakfast, chicken lunch.',
                    icon: '💪'
                }
            },
            {
                id: 'social-connection',
                priority: 5,
                data: {
                    title: 'Low Social Engagement',
                    content: 'No friend contact in 8 days. Suggest: Text Sarah, schedule coffee.',
                    icon: '🤝'
                }
            }
        ];
    }

    /* ============================================
       RESTORE ORB - Return to normal state
       ============================================ */
    async restoreOrb() {
        const orb = document.getElementById('orb');
        if (!orb) return;

        orb.classList.remove('god-mode-active');
        orb.style.transition = 'all 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        orb.style.position = '';
        orb.style.top = '';
        orb.style.left = '';
        orb.style.transform = '';
        orb.style.opacity = '1';

        // Return to neutral state
        if (window.organicMotion) {
            window.organicMotion.setUrgencyState('neutral', orb);
        }
    }

    /* ============================================
       CLEANUP - Emergency cleanup
       ============================================ */
    async cleanup() {
        const overlay = document.getElementById('god-mode-overlay');
        const countdown = document.getElementById('god-mode-countdown');
        const scan = document.getElementById('god-mode-scan');
        const particles = document.querySelectorAll('.god-mode-particle');

        if (overlay) overlay.remove();
        if (countdown) countdown.remove();
        if (scan) scan.remove();
        particles.forEach(p => p.remove());

        await this.restoreOrb();

        this.isActive = false;
        this.isAnimating = false;
    }

    /* ============================================
       UTILITIES
       ============================================ */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize God Mode globally
window.godMode = new GodMode();
console.log('[GodMode] Ready for "Optimize my life" command');
