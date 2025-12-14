/**
 * HOLISTIC ORCHESTRATOR UI
 * Production-ready interface for Phoenix-powered cross-domain optimization
 * Displays plans, executes actions, shows real-time progress
 * Version: 1.0.1 - PRODUCTION READY
 */

class HolisticOrchestratorUI {
    constructor() {
        this.activePlan = null;
        this.allPlans = [];
        this.isLoading = false;
        this.autoRefresh = null;
        this.initRetryCount = 0;
        this.maxInitRetries = 20;

        console.log('[Holistic Orchestrator UI] Initializing...');
    }

    /**
     * SVG Icon Helper Methods
     */
    getTargetIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
        </svg>`;
    }

    getSparkleIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"></path>
        </svg>`;
    }

    getListIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>`;
    }

    getSearchIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>`;
    }

    getCheckIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
    }

    getXIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;
    }

    getClockIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>`;
    }

    getPlayIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>`;
    }

    getCircleIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
        </svg>`;
    }

    /**
     * Initialize the UI - called on dashboard load
     * Waits for authentication before loading
     */
    async initialize() {
        try {
            // Wait for auth token to be available (check multiple possible keys)
            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');

            if (!token) {
                this.initRetryCount++;

                if (this.initRetryCount <= this.maxInitRetries) {
                    console.log(`[Holistic Orchestrator UI] Waiting for auth... (${this.initRetryCount}/${this.maxInitRetries})`);
                    setTimeout(() => this.initialize(), 500);
                    return;
                } else {
                    console.log('[Holistic Orchestrator UI] Auth timeout - rendering button only');
                    this.renderNavigationButton();
                    return;
                }
            }

            console.log('[Holistic Orchestrator UI] Auth detected, loading active plans...');

            // Fetch active plans
            await this.loadActivePlans();

            // Render navigation button (always visible)
            this.renderNavigationButton();

            // Render dashboard widget if plan exists
            if (this.activePlan) {
                this.renderDashboardWidget();
            }

            // Setup auto-refresh every 30 seconds
            this.autoRefresh = setInterval(() => this.loadActivePlans(), 30000);

            console.log('[Holistic Orchestrator UI] ✅ Initialized successfully');
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Initialization error:', error);
        }
    }

    /**
     * Render floating navigation button
     */
    renderNavigationButton() {
        let navBtn = document.getElementById('holistic-nav-btn');

        if (!navBtn) {
            navBtn = document.createElement('div');
            navBtn.id = 'holistic-nav-btn';
            navBtn.className = 'holistic-nav-btn';
            navBtn.innerHTML = `
                <button class="nav-btn-main" onclick="window.holisticOrchestrator.toggleMenu()" title="Holistic Orchestrator">
                    ${this.getTargetIcon()}
                </button>
                <div class="nav-menu" id="holistic-nav-menu">
                    <button onclick="window.holisticOrchestrator.showCreatePlanUI()">
                        <span class="menu-icon">${this.getSparkleIcon()}</span>
                        <span class="menu-text">Create New Plan</span>
                    </button>
                    <button onclick="window.holisticOrchestrator.showAllPlans()">
                        <span class="menu-icon">${this.getListIcon()}</span>
                        <span class="menu-text">View All Plans</span>
                    </button>
                    ${this.activePlan ? `
                    <button onclick="window.holisticOrchestrator.showDetailedView('${this.activePlan.planId}')">
                        <span class="menu-icon">${this.getSearchIcon()}</span>
                        <span class="menu-text">View Active Plan</span>
                    </button>
                    ` : ''}
                </div>
            `;
            document.body.appendChild(navBtn);
        }
    }

    /**
     * Toggle navigation menu
     */
    toggleMenu() {
        const menu = document.getElementById('holistic-nav-menu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }

    /**
     * Show create plan UI
     */
    showCreatePlanUI() {
        // Close menu
        const menu = document.getElementById('holistic-nav-menu');
        if (menu) menu.classList.remove('show');

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'create-plan-modal';
        modal.className = 'holistic-plan-modal active';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.holisticOrchestrator.closeCreatePlanUI()"></div>
            <div class="modal-content" style="max-width: 600px; margin: auto; top: 50%; transform: translateY(-50%);">
                <div class="modal-header">
                    <div>
                        <h1>Create Holistic Plan</h1>
                        <p>Phoenix will analyze your life and create a comprehensive optimization plan</p>
                    </div>
                    <button class="modal-close" onclick="window.holisticOrchestrator.closeCreatePlanUI()">${this.getXIcon()}</button>
                </div>

                <div class="modal-body">
                    <form id="create-plan-form" onsubmit="window.holisticOrchestrator.submitCreatePlan(event)">
                        <div class="form-group">
                            <label for="plan-goal">What do you want to optimize?</label>
                            <textarea
                                id="plan-goal"
                                name="goal"
                                placeholder="E.g., 'Increase my energy and productivity', 'Lose 15 pounds for my wedding', 'Build a sustainable exercise routine'"
                                rows="3"
                                required
                            ></textarea>
                            <small>Be specific - Phoenix will create a detailed plan across all life domains</small>
                        </div>

                        <div class="form-group">
                            <label for="plan-timeframe">Timeframe</label>
                            <select id="plan-timeframe" name="timeframe">
                                <option value="1 week">1 Week</option>
                                <option value="2 weeks" selected>2 Weeks</option>
                                <option value="1 month">1 Month</option>
                                <option value="3 months">3 Months</option>
                                <option value="6 months">6 Months</option>
                            </select>
                        </div>

                        <div class="form-group checkbox">
                            <label>
                                <input type="checkbox" id="auto-execute" name="autoExecute" checked>
                                <span>Auto-execute actions when ready</span>
                            </label>
                            <small>Phoenix will automatically start executing compatible actions</small>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.holisticOrchestrator.closeCreatePlanUI()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                Create Plan with Phoenix
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Close create plan UI
     */
    closeCreatePlanUI() {
        const modal = document.getElementById('create-plan-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Submit create plan form
     */
    async submitCreatePlan(event) {
        event.preventDefault();

        const form = event.target;
        const goal = form.goal.value.trim();
        const timeframe = form.timeframe.value;
        const autoExecute = form.autoExecute.checked;

        if (!goal) {
            this.showError('Please enter a goal');
            return;
        }

        // Close form
        this.closeCreatePlanUI();

        // Create plan
        try {
            await this.createPlan(goal, timeframe, autoExecute);
        } catch (error) {
            // Error already handled in createPlan
        }
    }

    /**
     * Show all plans view
     */
    async showAllPlans() {
        // Close menu
        const menu = document.getElementById('holistic-nav-menu');
        if (menu) menu.classList.remove('show');

        try {
            // Load all plans (not just active)
            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/orchestrator/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            const plans = data.success ? data.data : [];

            // Create modal
            const modal = document.createElement('div');
            modal.id = 'all-plans-modal';
            modal.className = 'holistic-plan-modal active';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="window.holisticOrchestrator.closeAllPlansView()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <div>
                            <h1>All Holistic Plans</h1>
                            <p>${plans.length} total plans</p>
                        </div>
                        <button class="modal-close" onclick="window.holisticOrchestrator.closeAllPlansView()">${this.getXIcon()}</button>
                    </div>

                    <div class="modal-body">
                        ${plans.length > 0 ? `
                            <div class="plans-grid">
                                ${plans.map(plan => `
                                    <div class="plan-card-compact ${plan.status}" onclick="window.holisticOrchestrator.showDetailedView('${plan.planId}')">
                                        <div class="plan-card-header">
                                            <div class="plan-card-goal">${plan.goal}</div>
                                            <div class="plan-card-status status-${plan.status}">${plan.status}</div>
                                        </div>
                                        <div class="plan-card-meta">
                                            ${plan.timeframe} • ${plan.execution.completedActions}/${plan.execution.totalActions} actions
                                        </div>
                                        <div class="plan-card-progress">
                                            <div class="progress-bar-mini">
                                                <div class="progress-fill-mini" style="width: ${plan.progress}%"></div>
                                            </div>
                                            <span class="progress-text">${plan.progress}%</span>
                                        </div>
                                        <div class="plan-card-score">Score: ${plan.optimizationScore}/100</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <div class="empty-icon">${this.getListIcon()}</div>
                                <div class="empty-title">No Plans Yet</div>
                                <div class="empty-description">Create your first holistic optimization plan to get started</div>
                                <button class="btn-primary" onclick="window.holisticOrchestrator.closeAllPlansView(); window.holisticOrchestrator.showCreatePlanUI();">
                                    Create Your First Plan
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Show all plans error:', error);
            this.showError('Failed to load plans');
        }
    }

    /**
     * Close all plans view
     */
    closeAllPlansView() {
        const modal = document.getElementById('all-plans-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Load active plans from API
     */
    async loadActivePlans() {
        try {
            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');

            if (!token) {
                console.log('[Holistic Orchestrator UI] No auth token');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/orchestrator/plans?status=active`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                this.allPlans = data.data;
                this.activePlan = data.data[0]; // Primary active plan

                console.log(`[Holistic Orchestrator UI] Loaded ${data.data.length} active plans`);
                console.log('[Holistic Orchestrator UI] Primary plan:', this.activePlan.goal);

                // Update widget if rendered
                if (document.getElementById('holistic-plan-widget')) {
                    this.renderDashboardWidget();
                }
            } else {
                this.activePlan = null;
                this.allPlans = [];
            }
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Load plans error:', error);
        }
    }

    /**
     * Create new holistic plan
     */
    async createPlan(goal, timeframe = '1 week', autoExecute = false) {
        try {
            this.isLoading = true;
            console.log(`[Holistic Orchestrator UI] Creating plan: "${goal}"`);

            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');

            if (!token) {
                throw new Error('Not authenticated');
            }

            // Show creating UI
            this.showCreatingPlanUI(goal);

            const response = await fetch(`${API_BASE_URL}/orchestrator/optimize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ goal, timeframe, autoExecute })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log('[Holistic Orchestrator UI] ✅ Plan created:', data.data.plan.planId);

                this.activePlan = data.data.plan;
                this.allPlans.unshift(this.activePlan);

                // Hide creating UI, show success
                this.hideCreatingPlanUI();
                this.renderDashboardWidget();
                this.showPlanCreatedNotification(this.activePlan);

                return this.activePlan;
            } else {
                throw new Error(data.message || 'Failed to create plan');
            }
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Create plan error:', error);
            this.hideCreatingPlanUI();
            this.showError('Failed to create plan: ' + error.message);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Execute next action in plan
     */
    async executeNextAction(planId) {
        try {
            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');

            const response = await fetch(`${API_BASE_URL}/orchestrator/plans/${planId}/execute-next`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                console.log('[Holistic Orchestrator UI] ✅ Action executed:', data.data.action.description);

                // Reload plan to get updated status
                await this.loadActivePlans();

                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Execute action error:', error);
            this.showError('Failed to execute action');
            throw error;
        }
    }

    /**
     * Pause plan
     */
    async pausePlan(planId) {
        try {
            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');

            const response = await fetch(`${API_BASE_URL}/orchestrator/plans/${planId}/pause`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                await this.loadActivePlans();
                console.log('[Holistic Orchestrator UI] ✅ Plan paused');
            }
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Pause error:', error);
        }
    }

    /**
     * Resume plan
     */
    async resumePlan(planId) {
        try {
            const token = localStorage.getItem('token') ||
                         localStorage.getItem('phoenixToken') ||
                         localStorage.getItem('authToken');

            const response = await fetch(`${API_BASE_URL}/orchestrator/plans/${planId}/resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                await this.loadActivePlans();
                console.log('[Holistic Orchestrator UI] ✅ Plan resumed');
            }
        } catch (error) {
            console.error('[Holistic Orchestrator UI] Resume error:', error);
        }
    }

    /**
     * Render dashboard widget (compact view)
     */
    renderDashboardWidget() {
        if (!this.activePlan) return;

        const plan = this.activePlan;
        const nextAction = this.getNextAction(plan);
        const domainStatus = this.getDomainStatus(plan);

        // Check if widget container exists
        let container = document.getElementById('holistic-plan-widget');

        if (!container) {
            // Create container if it doesn't exist
            container = document.createElement('div');
            container.id = 'holistic-plan-widget';
            container.className = 'holistic-plan-widget';

            // Insert at top of dashboard (after loading screen)
            const dashboard = document.body;
            const firstChild = dashboard.children[0];
            dashboard.insertBefore(container, firstChild);
        }

        container.innerHTML = `
            <div class="holistic-plan-card">
                <!-- Header -->
                <div class="plan-header">
                    <div class="plan-title">
                        <div class="plan-icon">${this.getTargetIcon()}</div>
                        <div>
                            <div class="plan-goal">${plan.goal}</div>
                            <div class="plan-meta">${plan.timeframe} • ${plan.execution.totalActions} actions</div>
                        </div>
                    </div>
                    <div class="plan-score" data-score="${plan.optimizationScore}">
                        <div class="score-value">${plan.optimizationScore}</div>
                        <div class="score-label">Score</div>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Overall Progress</span>
                        <span class="progress-value">${plan.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${plan.progress}%"></div>
                    </div>
                </div>

                <!-- Next Action -->
                ${nextAction ? `
                <div class="next-action">
                    <div class="action-label">NEXT ACTION</div>
                    <div class="action-content">
                        <div class="action-domain">${this.getDomainIcon(nextAction.domain)} ${this.getDomainName(nextAction.domain)}</div>
                        <div class="action-description">${nextAction.description}</div>
                        <button class="action-execute-btn" onclick="window.holisticOrchestrator.executeNextAction('${plan.planId}')">
                            Execute Now
                        </button>
                    </div>
                </div>
                ` : `
                <div class="plan-complete">
                    <div class="complete-icon">${this.getCheckIcon()}</div>
                    <div class="complete-text">All actions completed!</div>
                </div>
                `}

                <!-- Domain Status -->
                <div class="domain-status-grid">
                    ${this.renderDomainStatusIcons(domainStatus)}
                </div>

                <!-- Actions -->
                <div class="plan-actions">
                    <button class="plan-action-btn" onclick="window.holisticOrchestrator.showDetailedView('${plan.planId}')">
                        View Full Plan
                    </button>
                    ${plan.status === 'active' ? `
                    <button class="plan-action-btn secondary" onclick="window.holisticOrchestrator.pausePlan('${plan.planId}')">
                        Pause
                    </button>
                    ` : `
                    <button class="plan-action-btn secondary" onclick="window.holisticOrchestrator.resumePlan('${plan.planId}')">
                        Resume
                    </button>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Show detailed plan view (full screen modal)
     */
    showDetailedView(planId) {
        const plan = this.allPlans.find(p => p.planId === planId) || this.activePlan;
        if (!plan) return;

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'holistic-plan-modal';
        modal.className = 'holistic-plan-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.holisticOrchestrator.closeDetailedView()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h1>${plan.goal}</h1>
                        <p>${plan.timeframe} • Created ${new Date(plan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button class="modal-close" onclick="window.holisticOrchestrator.closeDetailedView()">${this.getXIcon()}</button>
                </div>

                <div class="modal-body">
                    <!-- Stats -->
                    <div class="plan-stats">
                        <div class="stat-card">
                            <div class="stat-value">${plan.optimizationScore}/100</div>
                            <div class="stat-label">Optimization Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${plan.progress}%</div>
                            <div class="stat-label">Progress</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${plan.execution.completedActions}/${plan.execution.totalActions}</div>
                            <div class="stat-label">Actions Complete</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${plan.execution.pendingActions}</div>
                            <div class="stat-label">Actions Pending</div>
                        </div>
                    </div>

                    <!-- Domain Actions -->
                    <div class="domain-actions-container">
                        ${this.renderDomainActions(plan)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Close detailed view
     */
    closeDetailedView() {
        const modal = document.getElementById('holistic-plan-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Render domain actions breakdown
     */
    renderDomainActions(plan) {
        const domains = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];

        return domains.map(domain => {
            const actions = plan.domainActions[domain] || [];
            if (actions.length === 0) return '';

            const completed = actions.filter(a => a.status === 'completed').length;
            const pending = actions.filter(a => a.status === 'pending').length;
            const failed = actions.filter(a => a.status === 'failed').length;

            return `
                <div class="domain-section">
                    <div class="domain-header">
                        <div class="domain-title">
                            <span class="domain-icon">${this.getDomainIcon(domain)}</span>
                            <span class="domain-name">${this.getDomainName(domain)}</span>
                        </div>
                        <div class="domain-progress">
                            <span class="completed">${completed}</span> /
                            <span class="total">${actions.length}</span>
                        </div>
                    </div>
                    <div class="actions-list">
                        ${actions.map(action => this.renderActionItem(action, domain, plan.planId)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render single action item
     */
    renderActionItem(action, domain, planId) {
        const statusIcon = {
            'pending': this.getClockIcon(),
            'in_progress': this.getPlayIcon(),
            'completed': this.getCheckIcon(),
            'failed': this.getXIcon()
        }[action.status] || this.getCircleIcon();

        return `
            <div class="action-item status-${action.status}">
                <div class="action-item-header">
                    <span class="action-status-icon">${statusIcon}</span>
                    <span class="action-description">${action.description}</span>
                    <span class="action-priority priority-${action.priority >= 90 ? 'high' : action.priority >= 70 ? 'medium' : 'low'}">
                        P${action.priority}
                    </span>
                </div>
                ${action.scheduledFor ? `
                <div class="action-schedule">
                    ${new Date(action.scheduledFor).toLocaleDateString()}
                </div>
                ` : ''}
                ${action.error ? `
                <div class="action-error">${action.error}</div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render domain status icons
     */
    renderDomainStatusIcons(domainStatus) {
        return Object.entries(domainStatus).map(([domain, status]) => {
            if (status.total === 0) return '';

            const progress = status.total > 0 ? (status.completed / status.total) * 100 : 0;

            return `
                <div class="domain-status-icon" title="${this.getDomainName(domain)}: ${status.completed}/${status.total} complete">
                    <div class="domain-icon-circle" style="--progress: ${progress}%">
                        ${this.getDomainIcon(domain)}
                    </div>
                    <div class="domain-status-label">${this.getDomainName(domain)}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get next pending action
     */
    getNextAction(plan) {
        const domains = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];

        let nextAction = null;
        let highestPriority = -1;

        for (const domain of domains) {
            const actions = plan.domainActions[domain] || [];
            for (const action of actions) {
                if (action.status === 'pending' && action.priority > highestPriority) {
                    highestPriority = action.priority;
                    nextAction = { ...action, domain };
                }
            }
        }

        return nextAction;
    }

    /**
     * Get domain status summary
     */
    getDomainStatus(plan) {
        const domains = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn'];
        const status = {};

        for (const domain of domains) {
            const actions = plan.domainActions[domain] || [];
            status[domain] = {
                total: actions.length,
                completed: actions.filter(a => a.status === 'completed').length,
                pending: actions.filter(a => a.status === 'pending').length,
                failed: actions.filter(a => a.status === 'failed').length,
                progress: actions.length > 0 ? (actions.filter(a => a.status === 'completed').length / actions.length) * 100 : 0
            };
        }

        return status;
    }

    /**
     * Get domain icon
     */
    getDomainIcon(domain) {
        const icons = {
            mercury: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="6"></circle>
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4"></path>
            </svg>`,
            venus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="5"></circle>
                <path d="M12 13v8m-4 0h8"></path>
            </svg>`,
            earth: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
            </svg>`,
            mars: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="10" cy="14" r="6"></circle>
                <path d="M16 8l5-5m0 0h-4m4 0v4"></path>
            </svg>`,
            jupiter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M6 12h12M9 8h6"></path>
            </svg>`,
            saturn: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="6"></circle>
                <ellipse cx="12" cy="12" rx="11" ry="4"></ellipse>
            </svg>`
        };
        return icons[domain] || this.getTargetIcon();
    }

    /**
     * Get domain name
     */
    getDomainName(domain) {
        const names = {
            mercury: 'Health',
            venus: 'Fitness',
            earth: 'Calendar',
            mars: 'Goals',
            jupiter: 'Finance',
            saturn: 'Legacy'
        };
        return names[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    /**
     * Show creating plan UI
     */
    showCreatingPlanUI(goal) {
        const overlay = document.createElement('div');
        overlay.id = 'creating-plan-overlay';
        overlay.className = 'creating-plan-overlay';
        overlay.innerHTML = `
            <div class="creating-plan-content">
                <div class="creating-icon">${this.getTargetIcon()}</div>
                <div class="creating-title">Phoenix is analyzing...</div>
                <div class="creating-description">Creating holistic optimization plan for:<br>"${goal}"</div>
                <div class="creating-loader"></div>
                <div class="creating-hint">This may take 3-5 seconds</div>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);
    }

    /**
     * Hide creating plan UI
     */
    hideCreatingPlanUI() {
        const overlay = document.getElementById('creating-plan-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    /**
     * Show plan created notification
     */
    showPlanCreatedNotification(plan) {
        const notification = document.createElement('div');
        notification.className = 'plan-notification success';
        notification.innerHTML = `
            <div class="notification-icon">${this.getCheckIcon()}</div>
            <div class="notification-content">
                <div class="notification-title">Plan Created Successfully!</div>
                <div class="notification-message">"${plan.goal}" • ${plan.execution.totalActions} actions • Score: ${plan.optimizationScore}/100</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'plan-notification error';
        notification.innerHTML = `
            <div class="notification-icon">${this.getXIcon()}</div>
            <div class="notification-content">
                <div class="notification-title">Error</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.autoRefresh) {
            clearInterval(this.autoRefresh);
        }
    }
}

// Initialize global instance
window.holisticOrchestrator = new HolisticOrchestratorUI();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.holisticOrchestrator.initialize();
    });
} else {
    window.holisticOrchestrator.initialize();
}

console.log('[Holistic Orchestrator UI] Module loaded');
