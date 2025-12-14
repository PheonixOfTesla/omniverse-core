/**
 * WIDGET SELF-AWARENESS SYSTEM
 * Makes widgets conscious of their constraints, relevance, and lifecycle
 *
 * ELITE LEVEL: Widgets know when they matter, prevent overlaps, auto-cleanup
 */

class WidgetSelfAwareness {
    constructor() {
        this.engagementTrackers = new Map();
        this.constraints = {
            screenMargin: 10,
            minWidth: 300,
            maxWidth: 600,
            minHeight: 120,
            maxHeight: 500,
            maxWidgets: 8,
            spacing: 20
        };
    }

    /**
     * Track widget engagement (viewTime, interactions, hover)
     */
    trackEngagement(widgetId, eventType) {
        if (!this.engagementTrackers.has(widgetId)) {
            this.engagementTrackers.set(widgetId, {
                widgetId,
                viewCount: 0,
                viewTimeMs: 0,
                lastViewedAt: Date.now(),
                interactionCount: 0,
                hoverCount: 0,
                createdAt: Date.now(),
                relevanceScore: 0.5
            });
        }

        const tracker = this.engagementTrackers.get(widgetId);

        switch (eventType) {
            case 'view':
                tracker.viewCount++;
                tracker.lastViewedAt = Date.now();
                break;
            case 'interaction':
                tracker.interactionCount++;
                break;
            case 'hover':
                tracker.hoverCount++;
                break;
            case 'tick':
                tracker.viewTimeMs += 100; // Called every 100ms
                break;
        }

        // Update relevance score
        tracker.relevanceScore = this.calculateRelevance(tracker);

        return tracker;
    }

    /**
     * Calculate widget relevance (0-1)
     * Based on: recency + engagement + context
     */
    calculateRelevance(tracker) {
        const now = Date.now();

        // Recency score (0-1) - decays over time
        const hoursSinceView = (now - tracker.lastViewedAt) / 3600000;
        const recencyScore = Math.exp(-hoursSinceView / 4); // Half-life: 4 hours

        // Engagement score (0-1)
        const engagementScore = Math.min(1, tracker.interactionCount / 10);

        // Age score (newer = better)
        const hoursOld = (now - tracker.createdAt) / 3600000;
        const ageScore = Math.exp(-hoursOld / 8); // Half-life: 8 hours

        // Weighted average
        return (recencyScore * 0.4) + (engagementScore * 0.4) + (ageScore * 0.2);
    }

    /**
     * Enforce screen boundaries
     * Prevents widgets from going off-screen
     */
    enforceScreenBoundaries(element) {
        const rect = element.getBoundingClientRect();
        const margin = this.constraints.screenMargin;

        let x = parseFloat(element.style.left) || rect.left;
        let y = parseFloat(element.style.top) || rect.top;

        // Constrain to viewport
        x = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));
        y = Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin));

        element.style.left = x + 'px';
        element.style.top = y + 'px';

        return { x, y, constrained: (x !== rect.left || y !== rect.top) };
    }

    /**
     * Detect collisions between widgets
     */
    detectCollisions(widgets) {
        const collisions = [];
        const widgetArray = Array.from(widgets.values());

        for (let i = 0; i < widgetArray.length; i++) {
            for (let j = i + 1; j < widgetArray.length; j++) {
                if (this.widgetsOverlap(widgetArray[i], widgetArray[j])) {
                    collisions.push({
                        widget1: widgetArray[i].id,
                        widget2: widgetArray[j].id
                    });
                }
            }
        }

        return collisions;
    }

    /**
     * Check if two widgets overlap
     */
    widgetsOverlap(widget1, widget2) {
        const r1 = widget1.getBoundingClientRect();
        const r2 = widget2.getBoundingClientRect();

        return !(r1.right < r2.left ||
                 r1.left > r2.right ||
                 r1.bottom < r2.top ||
                 r1.top > r2.bottom);
    }

    /**
     * Auto-cleanup stale widgets
     * Removes widgets with relevance < 0.1
     */
    cleanupStaleWidgets(widgetManager) {
        const toRemove = [];

        this.engagementTrackers.forEach((tracker, widgetId) => {
            if (tracker.relevanceScore < 0.1) {
                console.log(`[WidgetSelfAwareness] 🗑️ Removing stale widget: ${widgetId} (relevance: ${tracker.relevanceScore.toFixed(2)})`);
                toRemove.push(widgetId);
            }
        });

        toRemove.forEach(id => {
            widgetManager.removeWidget(id);
            this.engagementTrackers.delete(id);
        });

        return toRemove.length;
    }

    /**
     * Get context-aware visibility rules
     * Returns relevance multiplier based on time/context
     */
    getContextualRelevance(widgetType) {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

        const rules = {
            'health-recovery': timeOfDay === 'morning' ? 1.5 : 0.5,
            'workout-plan': (hour >= 6 && hour < 12) ? 1.8 : 0.3,
            'finance-spending': timeOfDay === 'evening' ? 1.5 : 0.6,
            'sleep-quality': (hour >= 21 || hour < 6) ? 1.9 : 0.2,
            'calendar-today': timeOfDay === 'morning' ? 1.7 : 0.8
        };

        return rules[widgetType] || 1.0;
    }

    /**
     * Apply time-decay to all widgets
     * Called every minute
     */
    applyTimeDecay() {
        let decayed = 0;

        this.engagementTrackers.forEach((tracker, id) => {
            const oldScore = tracker.relevanceScore;
            tracker.relevanceScore = this.calculateRelevance(tracker);

            if (tracker.relevanceScore < oldScore) {
                decayed++;
            }
        });

        return decayed;
    }

    /**
     * Get widget lifecycle recommendation
     */
    getLifecycleAction(widgetId) {
        const tracker = this.engagementTrackers.get(widgetId);
        if (!tracker) return 'unknown';

        const score = tracker.relevanceScore;
        const age = (Date.now() - tracker.createdAt) / 3600000; // hours

        if (score < 0.1) return 'remove';
        if (score < 0.3 && age > 4) return 'fade';
        if (score > 0.8) return 'promote';
        if (score > 0.5) return 'maintain';
        return 'demote';
    }

    /**
     * Find optimal position for new widget
     * Avoids overlaps, respects boundaries
     */
    findOptimalPosition(existingWidgets, widgetSize) {
        const positions = [];
        const gridSize = 50; // 50px grid

        // Generate candidate positions
        for (let x = this.constraints.screenMargin; x < window.innerWidth - widgetSize.width; x += gridSize) {
            for (let y = this.constraints.screenMargin; y < window.innerHeight - widgetSize.height; y += gridSize) {
                positions.push({ x, y });
            }
        }

        // Filter out positions that would cause overlaps
        const validPositions = positions.filter(pos => {
            const testRect = {
                left: pos.x,
                top: pos.y,
                right: pos.x + widgetSize.width,
                bottom: pos.y + widgetSize.height
            };

            return !Array.from(existingWidgets.values()).some(widget => {
                const rect = widget.getBoundingClientRect();
                return !(testRect.right < rect.left ||
                         testRect.left > rect.right ||
                         testRect.bottom < rect.top ||
                         testRect.top > rect.bottom);
            });
        });

        // Return position closest to top-left (priority area)
        if (validPositions.length === 0) return null;

        return validPositions.reduce((best, pos) => {
            const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
            const bestDistance = Math.sqrt(best.x * best.x + best.y * best.y);
            return distance < bestDistance ? pos : best;
        });
    }

    /**
     * Get engagement summary
     */
    getSummary() {
        const trackers = Array.from(this.engagementTrackers.values());

        return {
            totalWidgets: trackers.length,
            avgRelevance: trackers.reduce((sum, t) => sum + t.relevanceScore, 0) / trackers.length || 0,
            highRelevance: trackers.filter(t => t.relevanceScore > 0.7).length,
            lowRelevance: trackers.filter(t => t.relevanceScore < 0.3).length,
            totalInteractions: trackers.reduce((sum, t) => sum + t.interactionCount, 0)
        };
    }
}

// Create global instance
window.widgetSelfAwareness = new WidgetSelfAwareness();

// Start engagement tracking loop
setInterval(() => {
    if (window.widgetManager && window.widgetManager.activeWidgets) {
        window.widgetManager.activeWidgets.forEach((widget, id) => {
            if (widget.classList.contains('show')) {
                window.widgetSelfAwareness.trackEngagement(id, 'tick');
            }
        });
    }
}, 100);

// Start time-decay loop (every minute)
setInterval(() => {
    const decayed = window.widgetSelfAwareness.applyTimeDecay();
    if (decayed > 0) {
        console.log(`[WidgetSelfAwareness] ⏰ Applied time-decay to ${decayed} widgets`);
    }
}, 60000);

// Start cleanup loop (every 5 minutes)
setInterval(() => {
    if (window.widgetManager) {
        const removed = window.widgetSelfAwareness.cleanupStaleWidgets(window.widgetManager);
        if (removed > 0) {
            console.log(`[WidgetSelfAwareness] 🗑️ Cleaned up ${removed} stale widgets`);
        }
    }
}, 300000);

console.log('[WidgetSelfAwareness] ✅ Self-awareness system initialized');
