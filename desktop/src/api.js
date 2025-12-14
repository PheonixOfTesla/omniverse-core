// ═══════════════════════════════════════════════════════════════════════════════
// PHOENIX API CLIENT - PERFECT 1:1 BACKEND MIRROR
// ═══════════════════════════════════════════════════════════════════════════════
// Purpose: Central API client - EXACT mirror of backend (508+ endpoints)
// Base URL: https://pal-backend-production.up.railway.app/api
// Generated: October 27, 2025
// Updated: December 11, 2025 - Added 62 Consciousness endpoints (58 + 4 stream)
// Backend Analysis: PHOENIX_COMPLETE_BACKEND_ANALYSIS.md
//
// RULE: Every backend endpoint = ONE JavaScript method (no more, no less)
// ═══════════════════════════════════════════════════════════════════════════════

class PhoenixAPI {
    constructor() {
        // Use centralized config if available, fallback to production
        this.baseURL = (typeof PhoenixConfig !== 'undefined')
            ? PhoenixConfig.API_BASE_URL
            : 'https://pal-backend-production.up.railway.app/api';
        this.token = localStorage.getItem('phoenixToken');
        this.userId = localStorage.getItem('phoenix_user_id');
        this.retryCount = 0;
        this.maxRetries = 3;
        this.cache = new Map();
        this.requestQueue = [];
        this.isRefreshing = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CORE REQUEST HANDLER
    // ═══════════════════════════════════════════════════════════════════════════

    async request(endpoint, method = 'GET', body = null, options = {}) {
        const {
            skipAuth = false,
            cache = false,
            cacheTTL = 300000, // 5 minutes default
            retry = true
        } = options;

        // Check cache first
        if (cache && method === 'GET') {
            const cached = this.getFromCache(endpoint);
            if (cached) return cached;
        }

        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && !skipAuth ? { 'Authorization': `Bearer ${this.token}` } : {})
            }
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            // Handle auth errors
            if (response.status === 401 || response.status === 403) {
                if (retry && this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    await this.refreshToken();
                    return this.request(endpoint, method, body, { ...options, retry: false });
                }
                throw new Error('Authentication failed');
            }

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 5;
                await this.sleep(retryAfter * 1000);
                return this.request(endpoint, method, body, options);
            }

            // Handle server errors with retry
            if (response.status >= 500 && retry && this.retryCount < this.maxRetries) {
                this.retryCount++;
                await this.sleep(Math.pow(2, this.retryCount) * 1000);
                return this.request(endpoint, method, body, { ...options, retry: false });
            }

            // Handle 404 gracefully - return empty success response
            if (response.status === 404) {
                return { success: false, data: null, notFound: true };
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache successful GET requests
            if (cache && method === 'GET') {
                this.setCache(endpoint, data, cacheTTL);
            }

            this.retryCount = 0;
            return data;

        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTH ROUTES (9 endpoints)
    // Backend: routes/auth.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/auth/register
    async register(email, password, name) {
        const data = await this.request('/auth/register', 'POST', { email, password, name }, { skipAuth: true });
        this.setAuthToken(data.token, data.user?.id || data.userId);
        return data;
    }

    // POST /api/auth/login
    async login(email, password) {
        const data = await this.request('/auth/login', 'POST', { email, password }, { skipAuth: true });
        this.setAuthToken(data.token, data.user?.id || data.userId);
        return data;
    }

    // POST /api/auth/reset-password
    async resetPasswordRequest(email) {
        return this.request('/auth/reset-password', 'POST', { email }, { skipAuth: true });
    }

    // PUT /api/auth/reset-password/:resetToken
    async resetPassword(resetToken, newPassword) {
        return this.request(`/auth/reset-password/${resetToken}`, 'PUT', { password: newPassword }, { skipAuth: true });
    }

    // GET /api/auth/me
    async getMe() {
        return this.request('/auth/me', 'GET', null, { cache: true, cacheTTL: 600000 });
    }

    // PUT /api/auth/me
    async updateMe(updates) {
        return this.request('/auth/me', 'PUT', updates);
    }

    // PUT /api/auth/change-password
    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/change-password', 'PUT', { currentPassword, newPassword });
    }

    // POST /api/auth/logout
    async logout() {
        try {
            await this.request('/auth/logout', 'POST');
        } finally {
            this.clearAuth();
        }
    }

    // GET /api/auth/docs
    async getAuthDocs() {
        return this.request('/auth/docs', 'GET', null, { skipAuth: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EARTH ROUTES (11 endpoints)
    // Backend: routes/earth.js
    // ═══════════════════════════════════════════════════════════════════════════

    // GET /api/earth/calendar/connect/:provider
    async connectCalendar(provider) {
        return this.request(`/earth/calendar/connect/${provider}`, 'GET');
    }

    // POST /api/earth/calendar/callback
    async handleCalendarCallback(data) {
        return this.request('/earth/calendar/callback', 'POST', data);
    }

    // GET /api/earth/calendar/events
    async getCalendarEvents(date) {
        const endpoint = date ? `/earth/calendar/events?date=${date}` : '/earth/calendar/events';
        return this.request(endpoint, 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // POST /api/earth/calendar/events
    async createCalendarEvent(event) {
        return this.request('/earth/calendar/events', 'POST', event);
    }

    // GET /api/earth/calendar/energy-map
    async getEnergyMap() {
        return this.request('/earth/calendar/energy-map', 'GET', null, { cache: true });
    }

    // GET /api/earth/calendar/conflicts
    async getCalendarConflicts() {
        return this.request('/earth/calendar/conflicts', 'GET');
    }

    // POST /api/earth/calendar/sync
    async syncCalendar() {
        return this.request('/earth/calendar/sync', 'POST');
    }

    // GET /api/earth/energy/pattern
    async getEnergyPattern() {
        return this.request('/earth/energy/pattern', 'GET', null, { cache: true });
    }

    // POST /api/earth/energy/log
    async logEnergy(level) {
        return this.request('/earth/energy/log', 'POST', { level });
    }

    // GET /api/earth/energy/optimal-times
    async getOptimalTimes() {
        return this.request('/earth/energy/optimal-times', 'GET', null, { cache: true });
    }

    // GET /api/earth/energy/prediction
    async getEnergyPrediction() {
        return this.request('/earth/energy/prediction', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // JUPITER ROUTES (17 endpoints)
    // Backend: routes/jupiter.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/jupiter/link-token
    async createPlaidLinkToken() {
        return this.request('/jupiter/link-token', 'POST');
    }

    // POST /api/jupiter/exchange-token
    async exchangePlaidToken(publicToken) {
        return this.request('/jupiter/exchange-token', 'POST', { publicToken });
    }

    // GET /api/jupiter/accounts
    async getAccounts() {
        return this.request('/jupiter/accounts', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // DELETE /api/jupiter/account/:id
    async disconnectAccount(accountId) {
        return this.request(`/jupiter/account/${accountId}`, 'DELETE');
    }

    // POST /api/jupiter/sync/:accountId
    async syncAccount(accountId) {
        return this.request(`/jupiter/sync/${accountId}`, 'POST');
    }

    // GET /api/jupiter/transactions
    async getTransactions() {
        return this.request('/jupiter/transactions', 'GET', null, { cache: true, cacheTTL: 180000 });
    }

    // GET /api/jupiter/transactions/date-range
    async getTransactionsByDateRange(startDate, endDate) {
        return this.request(`/jupiter/transactions/date-range?start=${startDate}&end=${endDate}`, 'GET', null, { cache: true });
    }

    // GET /api/jupiter/transactions/category/:category
    async getTransactionsByCategory(category) {
        return this.request(`/jupiter/transactions/category/${category}`, 'GET', null, { cache: true });
    }

    // PUT /api/jupiter/transactions/:id
    async updateTransactionCategory(transactionId, category) {
        return this.request(`/jupiter/transactions/${transactionId}`, 'PUT', { category });
    }

    // GET /api/jupiter/transactions/recurring
    async getRecurringTransactions() {
        return this.request('/jupiter/transactions/recurring', 'GET', null, { cache: true });
    }

    // GET /api/jupiter/spending-patterns
    async getSpendingPatterns() {
        return this.request('/jupiter/spending-patterns', 'GET', null, { cache: true });
    }

    // POST /api/jupiter/budgets
    async createBudget(budget) {
        return this.request('/jupiter/budgets', 'POST', budget);
    }

    // GET /api/jupiter/budgets
    async getBudgets() {
        return this.request('/jupiter/budgets', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // PUT /api/jupiter/budgets/:id
    async updateBudget(budgetId, updates) {
        return this.request(`/jupiter/budgets/${budgetId}`, 'PUT', updates);
    }

    // DELETE /api/jupiter/budgets/:id
    async deleteBudget(budgetId) {
        return this.request(`/jupiter/budgets/${budgetId}`, 'DELETE');
    }

    // GET /api/jupiter/budgets/alerts
    async getBudgetAlerts() {
        return this.request('/jupiter/budgets/alerts', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/jupiter/stress-correlation
    async getStressSpendingCorrelation() {
        return this.request('/jupiter/stress-correlation', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MARS ROUTES (20 endpoints)
    // Backend: routes/mars.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/mars/goals
    async createGoal(goal) {
        return this.request('/mars/goals', 'POST', goal);
    }

    // GET /api/mars/goals
    async getGoals() {
        return this.request('/mars/goals', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // GET /api/mars/goals/:id
    async getGoal(goalId) {
        return this.request(`/mars/goals/${goalId}`, 'GET', null, { cache: true });
    }

    // PUT /api/mars/goals/:id
    async updateGoal(goalId, updates) {
        return this.request(`/mars/goals/${goalId}`, 'PUT', updates);
    }

    // DELETE /api/mars/goals/:id
    async deleteGoal(goalId) {
        return this.request(`/mars/goals/${goalId}`, 'DELETE');
    }

    // POST /api/mars/goals/:id/complete
    async completeGoal(goalId) {
        return this.request(`/mars/goals/${goalId}/complete`, 'POST');
    }

    // POST /api/mars/goals/generate-smart
    async generateSMARTGoal(idea) {
        return this.request('/mars/goals/generate-smart', 'POST', { idea });
    }

    // POST /api/mars/goals/suggest
    async getGoalSuggestions() {
        return this.request('/mars/goals/suggest', 'POST', null, { cache: true });
    }

    // GET /api/mars/goals/templates
    async getGoalTemplates() {
        return this.request('/mars/goals/templates', 'GET', null, { cache: true });
    }

    // POST /api/mars/goals/:id/progress
    async logGoalProgress(goalId, progress) {
        return this.request(`/mars/goals/${goalId}/progress`, 'POST', progress);
    }

    // GET /api/mars/goals/:id/progress
    async getGoalProgress(goalId) {
        return this.request(`/mars/goals/${goalId}/progress`, 'GET', null, { cache: true });
    }

    // GET /api/mars/progress/velocity
    async getProgressVelocity() {
        return this.request('/mars/progress/velocity', 'GET', null, { cache: true });
    }

    // GET /api/mars/progress/predictions
    async getProgressPredictions() {
        return this.request('/mars/progress/predictions', 'GET', null, { cache: true });
    }

    // GET /api/mars/progress/bottlenecks
    async getProgressBottlenecks() {
        return this.request('/mars/progress/bottlenecks', 'GET', null, { cache: true });
    }

    // POST /api/mars/goals/:id/milestones
    async createMilestone(goalId, milestone) {
        return this.request(`/mars/goals/${goalId}/milestones`, 'POST', milestone);
    }

    // POST /api/mars/milestones/:id/complete
    async completeMilestone(milestoneId) {
        return this.request(`/mars/milestones/${milestoneId}/complete`, 'POST');
    }

    // POST /api/mars/habits
    async createHabit(habit) {
        return this.request('/mars/habits', 'POST', habit);
    }

    // POST /api/mars/habits/:id/log
    async logHabit(habitId, data) {
        return this.request(`/mars/habits/${habitId}/log`, 'POST', data);
    }

    // GET /api/mars/motivation/interventions
    async getMotivationInterventions() {
        return this.request('/mars/motivation/interventions', 'GET', null, { cache: true });
    }

    // POST /api/mars/motivation/boost
    async triggerMotivationBoost(goalId) {
        return this.request('/mars/motivation/boost', 'POST', { goalId });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MERCURY ROUTES (38 endpoints)
    // Backend: routes/mercury.js
    // ═══════════════════════════════════════════════════════════════════════════

    // GET /api/mercury/biometrics/dexa
    async getDEXAData() {
        return this.request('/mercury/biometrics/dexa', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/composition
    async getBodyComposition() {
        return this.request('/mercury/biometrics/composition', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/metabolic
    async getMetabolicRate() {
        return this.request('/mercury/biometrics/metabolic', 'GET', null, { cache: true });
    }

    // POST /api/mercury/biometrics/metabolic/calculate
    async calculateMetabolicRate(data) {
        return this.request('/mercury/biometrics/metabolic/calculate', 'POST', data);
    }

    // GET /api/mercury/biometrics/ratios
    async getHealthRatios() {
        return this.request('/mercury/biometrics/ratios', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/visceral-fat
    async getVisceralFat() {
        return this.request('/mercury/biometrics/visceral-fat', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/bone-density
    async getBoneDensity() {
        return this.request('/mercury/biometrics/bone-density', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/hydration
    async getHydrationStatus() {
        return this.request('/mercury/biometrics/hydration', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/trends
    async getBiometricTrends() {
        return this.request('/mercury/biometrics/trends', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/correlations
    async getBiometricCorrelations() {
        return this.request('/mercury/biometrics/correlations', 'GET', null, { cache: true });
    }

    // POST /api/mercury/devices/:provider/connect
    async connectDevice(provider, authCode) {
        return this.request(`/mercury/devices/${provider}/connect`, 'POST', { code: authCode });
    }

    // POST /api/mercury/devices/:provider/exchange
    async exchangeDeviceToken(provider, code) {
        return this.request(`/mercury/devices/${provider}/exchange`, 'POST', { code });
    }

    // GET /api/mercury/devices
    async getDevices() {
        return this.request('/mercury/devices', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // DELETE /api/mercury/devices/:provider
    async disconnectDevice(provider) {
        return this.request(`/mercury/devices/${provider}`, 'DELETE');
    }

    // POST /api/mercury/devices/:provider/sync
    async syncDevice(provider) {
        return this.request(`/mercury/devices/${provider}/sync`, 'POST');
    }

    // POST /api/mercury/webhook/:provider
    async handleDeviceWebhook(provider, data) {
        return this.request(`/mercury/webhook/${provider}`, 'POST', data);
    }

    // GET /api/mercury/data
    async getWearableData() {
        return this.request('/mercury/data', 'GET');
    }

    // GET /api/mercury/data/raw
    async getRawDeviceData() {
        return this.request('/mercury/data/raw', 'GET');
    }

    // POST /api/mercury/data/manual
    async manualDataEntry(data) {
        return this.request('/mercury/data/manual', 'POST', data);
    }

    // GET /api/mercury/insights
    async getHealthInsights() {
        return this.request('/mercury/insights', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/hrv
    async getHRV() {
        return this.request('/mercury/biometrics/hrv', 'GET');
    }

    // GET /api/mercury/biometrics/hrv/deep-analysis
    async getHRVDeepAnalysis() {
        return this.request('/mercury/biometrics/hrv/deep-analysis', 'GET', null, { cache: true });
    }

    // GET /api/mercury/biometrics/heart-rate
    async getHeartRate() {
        return this.request('/mercury/biometrics/heart-rate', 'GET');
    }

    // GET /api/mercury/biometrics/readiness
    async getReadiness() {
        return this.request('/mercury/biometrics/readiness', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/mercury/sleep
    async getSleep() {
        return this.request('/mercury/sleep', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/mercury/sleep/analysis
    async getSleepAnalysis() {
        return this.request('/mercury/sleep/analysis', 'GET', null, { cache: true });
    }

    // GET /api/mercury/sleep/recommendations
    async getSleepRecommendations() {
        return this.request('/mercury/sleep/recommendations', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/latest
    async getLatestRecovery() {
        return this.request('/mercury/recovery/latest', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/mercury/recovery/history
    async getRecoveryHistory() {
        return this.request('/mercury/recovery/history', 'GET', null, { cache: true });
    }

    // POST /api/mercury/recovery/calculate
    async recalculateRecovery() {
        return this.request('/mercury/recovery/calculate', 'POST');
    }

    // GET /api/mercury/recovery/trends
    async getRecoveryTrends() {
        return this.request('/mercury/recovery/trends', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/prediction
    async getRecoveryPrediction() {
        return this.request('/mercury/recovery/prediction', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/protocols
    async getRecoveryProtocols() {
        return this.request('/mercury/recovery/protocols', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/debt
    async getRecoveryDebt() {
        return this.request('/mercury/recovery/debt', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/overtraining-risk
    async getOvertrainingRisk() {
        return this.request('/mercury/recovery/overtraining-risk', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/training-load
    async getTrainingLoad() {
        return this.request('/mercury/recovery/training-load', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/insights
    async getRecoveryInsights() {
        return this.request('/mercury/recovery/insights', 'GET', null, { cache: true });
    }

    // GET /api/mercury/recovery/dashboard
    async getRecoveryDashboard() {
        return this.request('/mercury/recovery/dashboard', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHOENIX ROUTES (75 endpoints)
    // Backend: routes/phoenix.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/phoenix/companion/chat
    async chat(message, context = null) {
        return this.request('/phoenix/companion/chat', 'POST', { message, context });
    }

    // GET /api/phoenix/companion/history
    async getChatHistory() {
        return this.request('/phoenix/companion/history', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // DELETE /api/phoenix/companion/history
    async clearChatHistory() {
        return this.request('/phoenix/companion/history', 'DELETE');
    }

    // GET /api/phoenix/companion/context
    async getCompanionContext() {
        return this.request('/phoenix/companion/context', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // Alias for backward compatibility
    async getContext() {
        return this.getCompanionContext();
    }

    // GET /api/phoenix/companion/personality
    async getPersonality() {
        return this.request('/phoenix/companion/personality', 'GET', null, { cache: true });
    }

    // PUT /api/phoenix/companion/personality
    async updatePersonality(personality) {
        return this.request('/phoenix/companion/personality', 'PUT', personality);
    }

    // GET /api/phoenix/patterns
    async getPatterns() {
        return this.request('/phoenix/patterns', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/patterns/analyze
    async analyzePatterns() {
        return this.request('/phoenix/patterns/analyze', 'POST');
    }

    // GET /api/phoenix/patterns/realtime
    async getRealtimePatterns() {
        return this.request('/phoenix/patterns/realtime', 'GET');
    }

    // PUT /api/phoenix/patterns/:id/validate
    async validatePattern(patternId, isValid) {
        return this.request(`/phoenix/patterns/${patternId}/validate`, 'PUT', { isValid });
    }

    // DELETE /api/phoenix/patterns/:id
    async deletePattern(patternId) {
        return this.request(`/phoenix/patterns/${patternId}`, 'DELETE');
    }

    // GET /api/phoenix/insights
    async getInsights() {
        return this.request('/phoenix/insights', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/phoenix/predictions
    async getPredictions() {
        return this.request('/phoenix/predictions', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/predictions/active
    async getActivePredictions() {
        return this.request('/phoenix/predictions/active', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/phoenix/predictions/:id
    async getPrediction(predictionId) {
        return this.request(`/phoenix/predictions/${predictionId}`, 'GET', null, { cache: true });
    }

    // POST /api/phoenix/predictions/request/:type
    async requestPrediction(predictionType, parameters) {
        return this.request(`/phoenix/predictions/request/${predictionType}`, 'POST', parameters);
    }

    // PUT /api/phoenix/predictions/:id/outcome
    async recordPredictionOutcome(predictionId, actualOutcome) {
        return this.request(`/phoenix/predictions/${predictionId}/outcome`, 'PUT', { actualOutcome });
    }

    // GET /api/phoenix/predictions/accuracy
    async getPredictionAccuracy() {
        return this.request('/phoenix/predictions/accuracy', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/predictions/forecast
    async getForecast() {
        return this.request('/phoenix/predictions/forecast', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/predictions/optimal-window
    async getOptimalWindow(taskType) {
        return this.request(`/phoenix/predictions/optimal-window?type=${taskType}`, 'GET', null, { cache: true });
    }

    // GET /api/phoenix/predictions/burnout-risk
    async getBurnoutRisk() {
        return this.request('/phoenix/predictions/burnout-risk', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/predictions/weight-change
    async getWeightChangePrediction() {
        return this.request('/phoenix/predictions/weight-change', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/interventions
    async getInterventions() {
        return this.request('/phoenix/interventions', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/interventions/active
    async getActiveInterventions() {
        return this.request('/phoenix/interventions/active', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // GET /api/phoenix/interventions/pending
    async getPendingInterventions() {
        return this.request('/phoenix/interventions/pending', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // POST /api/phoenix/interventions/:id/acknowledge
    async acknowledgeIntervention(interventionId) {
        return this.request(`/phoenix/interventions/${interventionId}/acknowledge`, 'POST');
    }

    // PUT /api/phoenix/interventions/:id/outcome
    async recordInterventionOutcome(interventionId, followed, helpful) {
        return this.request(`/phoenix/interventions/${interventionId}/outcome`, 'PUT', { followed, helpful });
    }

    // GET /api/phoenix/interventions/stats
    async getInterventionStats() {
        return this.request('/phoenix/interventions/stats', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/interventions/history
    async getInterventionHistory() {
        return this.request('/phoenix/interventions/history', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/interventions/settings
    async updateInterventionConfig(config) {
        return this.request('/phoenix/interventions/settings', 'POST', config);
    }

    // POST /api/phoenix/interventions/request
    async triggerManualIntervention() {
        return this.request('/phoenix/interventions/request', 'POST');
    }

    // GET /api/phoenix/intelligence
    async getIntelligenceDashboard() {
        return this.request('/phoenix/intelligence', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/intelligence/analyze
    async runIntelligenceAnalysis() {
        return this.request('/phoenix/intelligence/analyze', 'POST');
    }

    // GET /api/phoenix/intelligence/insights
    async getIntelligenceInsights() {
        return this.request('/phoenix/intelligence/insights', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/intelligence/query
    async queryIntelligence(question) {
        return this.request('/phoenix/intelligence/query', 'POST', { question });
    }

    // GET /api/phoenix/intelligence/summary
    async getDailySummary() {
        return this.request('/phoenix/intelligence/summary', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // POST /api/phoenix/intelligence/deep-dive
    async requestDeepDive(topic) {
        return this.request('/phoenix/intelligence/deep-dive', 'POST', { topic });
    }

    // GET /api/phoenix/intelligence/recommendations
    async getRecommendations() {
        return this.request('/phoenix/intelligence/recommendations', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/intelligence/auto-optimize
    async runAutoOptimize() {
        return this.request('/phoenix/intelligence/auto-optimize', 'POST');
    }

    // POST /api/phoenix/voice/session
    async createVoiceSession(voiceSettings) {
        return this.request('/phoenix/voice/session', 'POST', voiceSettings);
    }

    // DELETE /api/phoenix/voice/session
    async endVoiceSession() {
        return this.request('/phoenix/voice/session', 'DELETE');
    }

    // GET /api/phoenix/voice/transcriptions
    async getVoiceTranscriptions() {
        return this.request('/phoenix/voice/transcriptions', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/voice/history
    async getVoiceHistory() {
        return this.request('/phoenix/voice/history', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PHOENIX VOICE ROUTES (2 endpoints) - Context-Aware Voice Interface
    // Backend: routes/phoenixVoice.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/phoenixVoice/chat - Conversational AI with full context from all 7 planets
    async phoenixVoiceChat(options = {}) {
        const {
            message,
            conversationHistory = [],
            personality = 'friendly_helpful',
            voice = 'nova'
        } = options;

        return this.request('/phoenixVoice/chat', 'POST', {
            message,
            conversationHistory,
            personality,
            voice
        });
    }

    // GET /api/phoenixVoice/personalities - List available personalities
    async getPhoenixVoicePersonalities() {
        return this.request('/phoenixVoice/personalities', 'GET', null, {
            cache: true,
            cacheTTL: 3600000 // Cache for 1 hour
        });
    }

    // ⭐ NEW UNIVERSAL NATURAL LANGUAGE ENDPOINT ⭐
    // POST /api/phoenix/universal - Process ANY natural language request
    // Routes to appropriate planetary system automatically
    async universalNaturalLanguage(message, conversationHistory = [], timezone = 'America/New_York') {
        return this.request('/phoenix/universal', 'POST', {
            message,
            conversationHistory,
            timezone
        });
    }

    // GET /api/phoenix/universal/examples - Get example requests
    async getUniversalExamples() {
        return this.request('/phoenix/universal/examples', 'GET', null, {
            cache: true,
            cacheTTL: 600000 // Cache for 10 minutes
        });
    }

    // GET /api/phoenix/universal/context - Get current user context
    async getUniversalContext() {
        return this.request('/phoenix/universal/context', 'GET');
    }

    // POST /api/phoenix/ml/train
    async trainModel(modelData) {
        return this.request('/phoenix/ml/train', 'POST', modelData);
    }

    // GET /api/phoenix/ml/models
    async getMLModels() {
        return this.request('/phoenix/ml/models', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/ml/training-status
    async getTrainingStatus() {
        return this.request('/phoenix/ml/training-status', 'GET');
    }

    // POST /api/phoenix/behavior/track
    async trackBehavior(behaviorData) {
        return this.request('/phoenix/behavior/track', 'POST', behaviorData);
    }

    // GET /api/phoenix/behavior/patterns
    async getBehaviorPatterns() {
        return this.request('/phoenix/behavior/patterns', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/behavior/insights
    async getBehaviorInsights() {
        return this.request('/phoenix/behavior/insights', 'GET', null, { cache: true });
    }

    // GET /api/phoenix/behavior/:type
    async getBehaviorByType(type) {
        return this.request(`/phoenix/behavior/${type}`, 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/reservation
    async makeReservation(data) {
        return this.request('/phoenix/butler/reservation', 'POST', data);
    }

    // GET /api/phoenix/butler/reservations
    async getReservations() {
        return this.request('/phoenix/butler/reservations', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/food
    async orderFood(data) {
        return this.request('/phoenix/butler/food', 'POST', data);
    }

    // GET /api/phoenix/butler/food/history
    async getFoodOrderHistory() {
        return this.request('/phoenix/butler/food/history', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/food/reorder
    async reorderFood(orderId) {
        return this.request('/phoenix/butler/food/reorder', 'POST', { orderId });
    }

    // POST /api/phoenix/butler/ride
    async bookRide(data) {
        return this.request('/phoenix/butler/ride', 'POST', data);
    }

    // GET /api/phoenix/butler/rides
    async getRideHistory() {
        return this.request('/phoenix/butler/rides', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/call
    async makeCall(data) {
        return this.request('/phoenix/butler/call', 'POST', data);
    }

    // GET /api/phoenix/butler/calls
    async getCallHistory() {
        return this.request('/phoenix/butler/calls', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/sms
    async sendSMS(data) {
        return this.request('/phoenix/butler/sms', 'POST', data);
    }

    // GET /api/phoenix/butler/sms
    async getSMSHistory() {
        return this.request('/phoenix/butler/sms', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/email
    async sendEmail(data) {
        return this.request('/phoenix/butler/email', 'POST', data);
    }

    // GET /api/phoenix/butler/emails
    async getEmailHistory() {
        return this.request('/phoenix/butler/emails', 'GET', null, { cache: true });
    }

    // POST /api/phoenix/butler/email/reply
    async replyToEmail(emailId, reply) {
        return this.request('/phoenix/butler/email/reply', 'POST', { emailId, reply });
    }

    // POST /api/phoenix/butler/calendar
    async manageCalendar(action, data) {
        return this.request('/phoenix/butler/calendar', 'POST', { action, ...data });
    }

    // POST /api/phoenix/butler/calendar/optimize
    async optimizeCalendar() {
        return this.request('/phoenix/butler/calendar/optimize', 'POST');
    }

    // POST /api/phoenix/butler/search
    async webSearch(query) {
        return this.request('/phoenix/butler/search', 'POST', { query });
    }

    // POST /api/phoenix/butler/web-task
    async webTask(task) {
        return this.request('/phoenix/butler/web-task', 'POST', { task });
    }

    // POST /api/phoenix/butler/summarize
    async summarizeContent(url) {
        return this.request('/phoenix/butler/summarize', 'POST', { url });
    }

    // POST /api/phoenix/butler/summarize/batch
    async summarizeBatch(urls) {
        return this.request('/phoenix/butler/summarize/batch', 'POST', { urls });
    }

    // POST /api/phoenix/butler/automate
    async createAutomation(automation) {
        return this.request('/phoenix/butler/automate', 'POST', automation);
    }

    // GET /api/phoenix/butler/automations
    async getAutomations() {
        return this.request('/phoenix/butler/automations', 'GET', null, { cache: true });
    }

    // DELETE /api/phoenix/butler/automations/:id
    async deleteAutomation(automationId) {
        return this.request(`/phoenix/butler/automations/${automationId}`, 'DELETE');
    }

    // GET /api/phoenix/butler/budget
    async getButlerBudget() {
        return this.request('/phoenix/butler/budget', 'GET', null, { cache: true });
    }

    // PUT /api/phoenix/butler/budget
    async updateButlerBudget(budget) {
        return this.request('/phoenix/butler/budget', 'PUT', budget);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SATURN ROUTES (12 endpoints)
    // Backend: routes/saturn.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/saturn/vision
    async createVision(vision) {
        return this.request('/saturn/vision', 'POST', vision);
    }

    // GET /api/saturn/vision
    async getVision() {
        return this.request('/saturn/vision', 'GET', null, { cache: true });
    }

    // PUT /api/saturn/vision/life-areas
    async updateVisionAreas(areas) {
        return this.request('/saturn/vision/life-areas', 'PUT', areas);
    }

    // POST /api/saturn/vision/legacy-goal
    async createLegacyGoal(legacy) {
        return this.request('/saturn/vision/legacy-goal', 'POST', legacy);
    }

    // GET /api/saturn/mortality
    async getMortalityAwareness() {
        return this.request('/saturn/mortality', 'GET', null, { cache: true });
    }

    // PUT /api/saturn/vision/review
    async markVisionReviewed() {
        return this.request('/saturn/vision/review', 'PUT');
    }

    // POST /api/saturn/quarterly
    async createQuarterlyReview(review) {
        return this.request('/saturn/quarterly', 'POST', review);
    }

    // GET /api/saturn/quarterly
    async getQuarterlyReviews() {
        return this.request('/saturn/quarterly', 'GET', null, { cache: true });
    }

    // GET /api/saturn/quarterly/latest
    async getLatestQuarterlyReview() {
        return this.request('/saturn/quarterly/latest', 'GET', null, { cache: true });
    }

    // PUT /api/saturn/quarterly/:id
    async updateQuarterlyReview(reviewId, updates) {
        return this.request(`/saturn/quarterly/${reviewId}`, 'PUT', updates);
    }

    // GET /api/saturn/quarterly/trend
    async getQuarterlyTrend() {
        return this.request('/saturn/quarterly/trend', 'GET', null, { cache: true });
    }

    // GET /api/saturn/quarterly/compare/:q1/:q2
    async compareQuarters(quarter1, quarter2) {
        return this.request(`/saturn/quarterly/compare/${quarter1}/${quarter2}`, 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SUBSCRIPTION ROUTES (5 endpoints)
    // Backend: routes/subscription.js
    // NOTE: Backend uses PLURAL /subscriptions not /subscription
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/subscriptions/checkout
    async createCheckoutSession(plan) {
        return this.request('/subscriptions/checkout', 'POST', { plan });
    }

    // GET /api/subscriptions/status
    async getSubscriptionStatus() {
        return this.request('/subscriptions/status', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // POST /api/subscriptions/cancel
    async cancelSubscription() {
        return this.request('/subscriptions/cancel', 'POST');
    }

    // POST /api/subscriptions/portal
    async createPortalSession() {
        return this.request('/subscriptions/portal', 'POST');
    }

    // POST /api/subscriptions/webhook (Stripe webhook - not called by frontend)
    // Note: This is handled by Stripe, not exposed as API method

    // ═══════════════════════════════════════════════════════════════════════════
    // USER ROUTES (11 endpoints)
    // Backend: routes/user.js
    // NOTE: Backend uses PLURAL /users not /user
    // ═══════════════════════════════════════════════════════════════════════════

    // GET /api/users/docs
    async getUserDocs() {
        return this.request('/users/docs', 'GET', null, { skipAuth: true });
    }

    // GET /api/users/profile
    async getUserProfile() {
        return this.request('/users/profile', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // PUT /api/users/profile
    async updateUserProfile(updates) {
        return this.request('/users/profile', 'PUT', updates);
    }

    // Alias for convenience (used in onboarding and other places)
    async updateProfile(updates) {
        return this.updateUserProfile(updates);
    }

    // GET /api/users
    async getAllUsers() {
        return this.request('/users', 'GET');
    }

    // POST /api/users (Admin only - role check)
    async createUser(userData) {
        return this.request('/users', 'POST', userData);
    }

    // GET /api/users/specialist/:specialistId/clients
    async getClientsBySpecialist(specialistId) {
        return this.request(`/users/specialist/${specialistId}/clients`, 'GET');
    }

    // POST /api/users/assign-client (Admin only - role check)
    async assignClient(clientId, specialistId) {
        return this.request('/users/assign-client', 'POST', { clientId, specialistId });
    }

    // POST /api/users/unassign-client (Admin only - role check)
    async unassignClient(clientId) {
        return this.request('/users/unassign-client', 'POST', { clientId });
    }

    // GET /api/users/:id
    async getUserById(userId) {
        return this.request(`/users/${userId}`, 'GET', null, { cache: true });
    }

    // PUT /api/users/:id (Admin only - role check)
    async updateUser(userId, updates) {
        return this.request(`/users/${userId}`, 'PUT', updates);
    }

    // DELETE /api/users/:id (Admin only - role check)
    async deleteUser(userId) {
        return this.request(`/users/${userId}`, 'DELETE');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VENUS ROUTES (88 endpoints)
    // Backend: routes/venus.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/venus/workouts/start
    async startWorkout(workoutData) {
        return this.request('/venus/workouts/start', 'POST', workoutData);
    }

    // POST /api/venus/workouts/:workoutId/exercise
    async logExercise(workoutId, exerciseData) {
        return this.request(`/venus/workouts/${workoutId}/exercise`, 'POST', exerciseData);
    }

    // POST /api/venus/workouts/:id/complete
    async completeWorkout(workoutId) {
        return this.request(`/venus/workouts/${workoutId}/complete`, 'POST');
    }

    // GET /api/venus/workouts
    async getWorkouts() {
        return this.request('/venus/workouts', 'GET', null, { cache: true });
    }

    // GET /api/venus/workouts/active
    async getActiveWorkout() {
        return this.request('/venus/workouts/active', 'GET');
    }

    // GET /api/venus/workouts/:id
    async getWorkout(workoutId) {
        return this.request(`/venus/workouts/${workoutId}`, 'GET', null, { cache: true });
    }

    // PUT /api/venus/workouts/:id
    async updateWorkout(workoutId, updates) {
        return this.request(`/venus/workouts/${workoutId}`, 'PUT', updates);
    }

    // DELETE /api/venus/workouts/:id
    async deleteWorkout(workoutId) {
        return this.request(`/venus/workouts/${workoutId}`, 'DELETE');
    }

    // POST /api/venus/workouts/recommend
    async getWorkoutRecommendations() {
        return this.request('/venus/workouts/recommend', 'POST', null, { cache: true });
    }

    // GET /api/venus/workouts/similar
    async getSimilarWorkouts() {
        return this.request('/venus/workouts/similar', 'GET', null, { cache: true });
    }

    // GET /api/venus/workouts/templates/library
    async getWorkoutTemplates() {
        return this.request('/venus/workouts/templates/library', 'GET', null, { cache: true });
    }

    // POST /api/venus/workouts/templates/create
    async createWorkoutTemplate(template) {
        return this.request('/venus/workouts/templates/create', 'POST', template);
    }

    // GET /api/venus/workouts/form-analysis
    async getFormAnalysis() {
        return this.request('/venus/workouts/form-analysis', 'GET', null, { cache: true });
    }

    // POST /api/venus/workouts/form-check
    async checkForm(data) {
        return this.request('/venus/workouts/form-check', 'POST', data);
    }

    // GET /api/venus/workouts/effectiveness
    async getWorkoutEffectiveness() {
        return this.request('/venus/workouts/effectiveness', 'GET', null, { cache: true });
    }

    // GET /api/venus/workouts/compare
    async compareWorkouts(params) {
        return this.request('/venus/workouts/compare', 'GET', null, { cache: true });
    }

    // GET /api/venus/workouts/intensity-zones
    async getIntensityZones() {
        return this.request('/venus/workouts/intensity-zones', 'GET', null, { cache: true });
    }

    // GET /api/venus/workouts/volume-progression
    async getVolumeProgression() {
        return this.request('/venus/workouts/volume-progression', 'GET', null, { cache: true });
    }

    // GET /api/venus/workouts/deload-planning
    async planDeload() {
        return this.request('/venus/workouts/deload-planning', 'GET', null, { cache: true });
    }

    // POST /api/venus/workouts/periodization
    async createPeriodization(plan) {
        return this.request('/venus/workouts/periodization', 'POST', plan);
    }

    // GET /api/venus/workouts/optimal-window
    async getOptimalTrainingWindow() {
        return this.request('/venus/workouts/optimal-window', 'GET', null, { cache: true });
    }

    // POST /api/venus/quantum/generate
    async generateQuantumWorkout(params) {
        return this.request('/venus/quantum/generate', 'POST', params);
    }

    // GET /api/venus/quantum/history
    async getQuantumWorkoutHistory() {
        return this.request('/venus/quantum/history', 'GET', null, { cache: true });
    }

    // GET /api/venus/quantum/effectiveness
    async getQuantumEffectiveness() {
        return this.request('/venus/quantum/effectiveness', 'GET', null, { cache: true });
    }

    // GET /api/venus/quantum/plateau-detection
    async getPlateauAnalysis() {
        return this.request('/venus/quantum/plateau-detection', 'GET', null, { cache: true });
    }

    // GET /api/venus/quantum/settings
    async getQuantumSettings() {
        return this.request('/venus/quantum/settings', 'GET', null, { cache: true });
    }

    // PUT /api/venus/quantum/settings
    async updateQuantumSettings(settings) {
        return this.request('/venus/quantum/settings', 'PUT', settings);
    }

    // GET /api/venus/quantum/chaos-metrics
    async getQuantumChaos() {
        return this.request('/venus/quantum/chaos-metrics', 'GET', null, { cache: true });
    }

    // POST /api/venus/quantum/regenerate-seeds
    async regenerateQuantumWorkout(params) {
        return this.request('/venus/quantum/regenerate-seeds', 'POST', params);
    }

    // GET /api/venus/exercises
    async getExercises() {
        return this.request('/venus/exercises', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/venus/exercises/search
    async searchExercises(query) {
        return this.request(`/venus/exercises/search?q=${query}`, 'GET', null, { cache: true });
    }

    // GET /api/venus/exercises/:id
    async getExercise(exerciseId) {
        return this.request(`/venus/exercises/${exerciseId}`, 'GET', null, { cache: true });
    }

    // GET /api/venus/exercises/:id/alternatives
    async getExerciseAlternatives(exerciseId) {
        return this.request(`/venus/exercises/${exerciseId}/alternatives`, 'GET', null, { cache: true });
    }

    // POST /api/venus/exercises
    async createExercise(exercise) {
        return this.request('/venus/exercises', 'POST', exercise);
    }

    // POST /api/venus/exercises/recommend
    async getExerciseRecommendations() {
        return this.request('/venus/exercises/recommend', 'POST', null, { cache: true });
    }

    // GET /api/venus/progress/overload
    async getProgressiveOverload() {
        return this.request('/venus/progress/overload', 'GET', null, { cache: true });
    }

    // POST /api/venus/progress/1rm
    async calculate1RM(data) {
        return this.request('/venus/progress/1rm', 'POST', data);
    }

    // GET /api/venus/progress/standards
    async getStrengthStandards() {
        return this.request('/venus/progress/standards', 'GET', null, { cache: true });
    }

    // GET /api/venus/progress/records
    async getPRs() {
        return this.request('/venus/progress/records', 'GET', null, { cache: true });
    }

    // POST /api/venus/nutrition/log
    async logNutrition(foodData) {
        return this.request('/venus/nutrition/log', 'POST', foodData);
    }

    // GET /api/venus/nutrition/logs
    async getNutritionLogs(date) {
        const endpoint = date ? `/venus/nutrition/logs?date=${date}` : '/venus/nutrition/logs';
        return this.request(endpoint, 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // PUT /api/venus/nutrition/logs/:id
    async updateNutritionLog(logId, updates) {
        return this.request(`/venus/nutrition/logs/${logId}`, 'PUT', updates);
    }

    // DELETE /api/venus/nutrition/logs/:id
    async deleteNutritionLog(logId) {
        return this.request(`/venus/nutrition/logs/${logId}`, 'DELETE');
    }

    // GET /api/venus/nutrition/macros
    async getNutritionSummary() {
        return this.request('/venus/nutrition/macros', 'GET');
    }

    // POST /api/venus/nutrition/targets
    async setNutritionTargets(targets) {
        return this.request('/venus/nutrition/targets', 'POST', targets);
    }

    // POST /api/venus/nutrition/targets/calculate
    async calculateNutritionTargets(params) {
        return this.request('/venus/nutrition/targets/calculate', 'POST', params);
    }

    // GET /api/venus/nutrition/insights
    async getNutritionInsights() {
        return this.request('/venus/nutrition/insights', 'GET', null, { cache: true });
    }

    // POST /api/venus/nutrition/water
    async logWater(amount) {
        return this.request('/venus/nutrition/water', 'POST', { amount });
    }

    // GET /api/venus/nutrition/water
    async getWaterIntake() {
        return this.request('/venus/nutrition/water', 'GET');
    }

    // POST /api/venus/nutrition/meal-plan/generate
    async generateMealPlan(preferences) {
        return this.request('/venus/nutrition/meal-plan/generate', 'POST', preferences);
    }

    // POST /api/venus/nutrition/photo-analyze
    async analyzePhotoNutrition(photoData) {
        return this.request('/venus/nutrition/photo-analyze', 'POST', photoData);
    }

    // POST /api/venus/nutrition/barcode-scan
    async getNutritionByBarcode(barcode) {
        return this.request('/venus/nutrition/barcode-scan', 'POST', { barcode });
    }

    // POST /api/venus/nutrition/recipe-suggest
    async getRecipes() {
        return this.request('/venus/nutrition/recipe-suggest', 'POST', null, { cache: true });
    }

    // GET /api/venus/nutrition/meal-prep
    async getMealPrep() {
        return this.request('/venus/nutrition/meal-prep', 'GET', null, { cache: true });
    }

    // POST /api/venus/nutrition/meal-prep/plan
    async createMealPrep(plan) {
        return this.request('/venus/nutrition/meal-prep/plan', 'POST', plan);
    }

    // GET /api/venus/nutrition/restaurants
    async analyzeRestaurantFood(location) {
        return this.request('/venus/nutrition/restaurants', 'GET', null, { cache: true });
    }

    // POST /api/venus/nutrition/restaurants/analyze
    async getRestaurantRecommendations(data) {
        return this.request('/venus/nutrition/restaurants/analyze', 'POST', data);
    }

    // POST /api/venus/supplements/log
    async logSupplement(supplement) {
        return this.request('/venus/supplements/log', 'POST', supplement);
    }

    // GET /api/venus/supplements
    async getSupplements() {
        return this.request('/venus/supplements', 'GET', null, { cache: true });
    }

    // GET /api/venus/supplements/interactions
    async checkSupplementInteractions(supplements) {
        return this.request('/venus/supplements/interactions', 'GET', null, { cache: true });
    }

    // POST /api/venus/supplements/stack-builder
    async createSupplementStack(goals) {
        return this.request('/venus/supplements/stack-builder', 'POST', goals);
    }

    // POST /api/venus/body/measurements
    async logBodyMeasurements(measurements) {
        return this.request('/venus/body/measurements', 'POST', measurements);
    }

    // GET /api/venus/body/measurements
    async getBodyMeasurements() {
        return this.request('/venus/body/measurements', 'GET', null, { cache: true });
    }

    // GET /api/venus/body/composition
    async getBodyCompositionTracking() {
        return this.request('/venus/body/composition', 'GET', null, { cache: true });
    }

    // POST /api/venus/body/photos
    async uploadProgressPhoto(photoData) {
        return this.request('/venus/body/photos', 'POST', photoData);
    }

    // GET /api/venus/body/photos
    async getProgressPhotos() {
        return this.request('/venus/body/photos', 'GET', null, { cache: true });
    }

    // GET /api/venus/body/photos/compare
    async compareProgressPhotos(date1, date2) {
        return this.request(`/venus/body/photos/compare?date1=${date1}&date2=${date2}`, 'GET', null, { cache: true });
    }

    // GET /api/venus/body/recomp-analysis
    async getRecompProgress() {
        return this.request('/venus/body/recomp-analysis', 'GET', null, { cache: true });
    }

    // GET /api/venus/body/muscle-symmetry
    async getBodySymmetry() {
        return this.request('/venus/body/muscle-symmetry', 'GET', null, { cache: true });
    }

    // GET /api/venus/body/fat-distribution
    async getFatDistribution() {
        return this.request('/venus/body/fat-distribution', 'GET', null, { cache: true });
    }

    // POST /api/venus/performance/tests
    async createPerformanceTest(test) {
        return this.request('/venus/performance/tests', 'POST', test);
    }

    // POST /api/venus/performance/tests/:id/results
    async logPerformanceResults(testId, results) {
        return this.request(`/venus/performance/tests/${testId}/results`, 'POST', results);
    }

    // GET /api/venus/performance/tests
    async getPerformanceTests() {
        return this.request('/venus/performance/tests', 'GET', null, { cache: true });
    }

    // GET /api/venus/performance/benchmarks
    async getPerformanceBenchmarks() {
        return this.request('/venus/performance/benchmarks', 'GET', null, { cache: true });
    }

    // GET /api/venus/performance/standards
    async getPerformanceStrengthStandards() {
        return this.request('/venus/performance/standards', 'GET', null, { cache: true });
    }

    // GET /api/venus/performance/percentile
    async getPerformancePercentile() {
        return this.request('/venus/performance/percentile', 'GET', null, { cache: true });
    }

    // GET /api/venus/performance/predictions
    async getPerformancePredictions() {
        return this.request('/venus/performance/predictions', 'GET', null, { cache: true });
    }

    // GET /api/venus/social/feed
    async getSocialFeed() {
        return this.request('/venus/social/feed', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // POST /api/venus/social/share
    async shareWorkout(workoutId) {
        return this.request('/venus/social/share', 'POST', { workoutId });
    }

    // GET /api/venus/social/challenges
    async getChallenges() {
        return this.request('/venus/social/challenges', 'GET', null, { cache: true });
    }

    // POST /api/venus/social/challenges/join
    async joinChallenge(challengeId) {
        return this.request('/venus/social/challenges/join', 'POST', { challengeId });
    }

    // GET /api/venus/social/friends
    async getFriends() {
        return this.request('/venus/social/friends', 'GET', null, { cache: true });
    }

    // POST /api/venus/social/friends/add
    async addFriend(userId) {
        return this.request('/venus/social/friends/add', 'POST', { userId });
    }

    // GET /api/venus/injury-risk/assessment
    async getInjuryRisk() {
        return this.request('/venus/injury-risk/assessment', 'GET', null, { cache: true });
    }

    // GET /api/venus/injury-risk/history
    async getInjuryHistory() {
        return this.request('/venus/injury-risk/history', 'GET', null, { cache: true });
    }

    // POST /api/venus/injury-risk/report
    async reportInjury(injury) {
        return this.request('/venus/injury-risk/report', 'POST', injury);
    }

    // GET /api/venus/injury-risk/prevention
    async getInjuryPrevention() {
        return this.request('/venus/injury-risk/prevention', 'GET', null, { cache: true });
    }

    // GET /api/venus/injury-risk/rehab-protocols
    async getInjuryRehab() {
        return this.request('/venus/injury-risk/rehab-protocols', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TTS ROUTES (Text-to-Speech)
    // Backend: routes/tts.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/tts/generate
    async textToSpeech(text, voice = 'nova', speed = 1.0) {
        // Map language codes to backend format (en → en-US, es → es-ES, etc.)
        const savedLanguageCode = localStorage.getItem('phoenixLanguage') || 'en';
        const languageMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'nl': 'nl-NL',
            'pl': 'pl-PL',
            'ja': 'ja-JP',
            'zh': 'zh-CN'
        };
        const language = languageMap[savedLanguageCode] || 'en-US';

        // Request base64 format for iOS compatibility (binary has CORS issues on iOS)
        const response = await fetch(`${this.baseURL}/tts/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
            },
            body: JSON.stringify({
                text,
                voice,
                language,
                speed,
                format: 'base64' // Request base64 for iOS compatibility
            })
        });

        if (!response.ok) {
            throw new Error(`TTS Error: ${response.status}`);
        }

        // Convert base64 to blob
        const data = await response.json();
        const audioBase64 = data.audio;
        const audioBytes = atob(audioBase64);
        const arrayBuffer = new ArrayBuffer(audioBytes.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioBytes.length; i++) {
            uint8Array[i] = audioBytes.charCodeAt(i);
        }
        return new Blob([uint8Array], { type: 'audio/mpeg' });
    }

    // POST /api/whisper/transcribe
    async transcribeAudio(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        const response = await fetch(`${this.baseURL}/whisper/transcribe`, {
            method: 'POST',
            headers: {
                ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Transcription Error: ${response.status}`);
        }

        return await response.json();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // iOS LIVE ACTIVITIES (7 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async startWorkoutActivity(data) {
        return this.request('/ios/live-activities/workout/start', 'POST', data);
    }

    async updateWorkoutActivity(data) {
        return this.request('/ios/live-activities/workout/update', 'POST', data);
    }

    async endActivity(activityId) {
        return this.request('/ios/live-activities/end', 'POST', { activityId });
    }

    async startInterventionActivity(data) {
        return this.request('/ios/live-activities/intervention', 'POST', data);
    }

    async startRecoveryActivity(data) {
        return this.request('/ios/live-activities/recovery', 'POST', data);
    }

    async startMeditationActivity(data) {
        return this.request('/ios/live-activities/meditation', 'POST', data);
    }

    async getActiveActivities() {
        return this.request('/ios/live-activities', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // iOS ENHANCED VOICE INTERFACE (4 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async startVoiceSession(context = {}) {
        return this.request('/ios/voice/session/start', 'POST', { context });
    }

    async processVoiceCommand(sessionId, command, context = {}) {
        return this.request('/ios/voice/command', 'POST', { sessionId, command, context });
    }

    async executeVoiceAction(sessionId, action) {
        return this.request('/ios/voice/action/execute', 'POST', { sessionId, action });
    }

    async endVoiceSession(sessionId) {
        return this.request('/ios/voice/session/end', 'POST', { sessionId });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // iOS CAMERA / VISION API (2 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async checkWorkoutForm(imageData, exercise) {
        return this.request('/ios/camera/form-check', 'POST', { image: imageData, exercise });
    }

    async analyzeNutritionPhoto(imageData) {
        return this.request('/ios/camera/nutrition-analysis', 'POST', { image: imageData });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // iOS SYSTEM INTEGRATION (10 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async triggerHaptic(type = 'impact', intensity = 'medium') {
        return this.request('/ios/haptics/trigger', 'POST', { type, intensity });
    }

    async syncDeviceInfo(deviceData) {
        return this.request('/ios/device/info', 'POST', deviceData);
    }

    async syncMotionData(motionData) {
        return this.request('/ios/motion/update', 'POST', motionData);
    }

    async verifyBiometric() {
        return this.request('/ios/biometric/verify', 'POST');
    }

    async getSiriShortcuts() {
        return this.request('/ios/shortcuts', 'GET', null, { cache: true });
    }

    async executeSiriShortcut(shortcutId) {
        return this.request('/ios/shortcuts/execute', 'POST', { shortcutId });
    }

    async syncHomeKit(homeData) {
        return this.request('/ios/homekit/sync', 'POST', homeData);
    }

    async syncAppleWatch(watchData) {
        return this.request('/ios/watch/sync', 'POST', watchData);
    }

    async updateWeatherContext(weatherData) {
        return this.request('/ios/weather/update', 'POST', weatherData);
    }

    async getCurrentContext() {
        return this.request('/ios/context/current', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WIDGET MANAGEMENT (17 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async createWidget(widgetData) {
        return this.request('/widgets', 'POST', widgetData);
    }

    async generateWidget(prompt) {
        return this.request('/widgets/generate', 'POST', { prompt });
    }

    async getWidgetTemplates() {
        return this.request('/widgets/templates', 'GET', null, { cache: true });
    }

    async searchWidgetTemplates(query) {
        return this.request('/widgets/templates/search', 'GET', null, { cache: true });
    }

    async getWidgetsByCategory(category) {
        return this.request(`/widgets/templates/category/${category}`, 'GET', null, { cache: true });
    }

    async createFromTemplate(templateId) {
        return this.request(`/widgets/from-template/${templateId}`, 'POST');
    }

    async getWidgets() {
        return this.request('/widgets', 'GET', null, { cache: true });
    }

    async getWidgetStats() {
        return this.request('/widgets/stats', 'GET', null, { cache: true });
    }

    async getEnabledWidgets() {
        return this.request('/widgets/enabled', 'GET', null, { cache: true });
    }

    async getInactiveWidgets() {
        return this.request('/widgets/inactive', 'GET', null, { cache: true });
    }

    async getWidget(widgetId) {
        return this.request(`/widgets/${widgetId}`, 'GET', null, { cache: true });
    }

    async updateWidget(widgetId, data) {
        return this.request(`/widgets/${widgetId}`, 'PUT', data);
    }

    async deleteWidget(widgetId) {
        return this.request(`/widgets/${widgetId}`, 'DELETE');
    }

    async toggleWidget(widgetId) {
        return this.request(`/widgets/${widgetId}/toggle`, 'POST');
    }

    async pinWidget(widgetId) {
        return this.request(`/widgets/${widgetId}/pin`, 'POST');
    }

    async archiveWidget(widgetId) {
        return this.request(`/widgets/${widgetId}/archive`, 'POST');
    }

    async restoreWidget(widgetId) {
        return this.request(`/widgets/${widgetId}/restore`, 'POST');
    }

    async recordWidgetUse(widgetId) {
        return this.request(`/widgets/${widgetId}/use`, 'POST');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GENESIS ROUTES (11 endpoints)
    // Backend: routes/genesis.js
    // Self-modification, creation, deployment, and autonomous operations
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Analyze a file or directory path for optimization opportunities
     * @param {string} path - Path to analyze
     * @returns {Promise<Object>} Analysis results with recommendations
     */
    async analyze(path) {
        return this.request('/genesis/analyze', 'POST', { path });
    }

    /**
     * Generate code, features, or business assets from natural language
     * @param {string} description - Natural language description of what to generate
     * @param {string} type - Type of generation (widget, feature, business, etc.)
     * @returns {Promise<Object>} Generated code/assets
     */
    async generate(description, type) {
        return this.request('/genesis/generate', 'POST', { description, type });
    }

    /**
     * Optimize a specific target (codebase, database, API, etc.)
     * @param {string} target - What to optimize
     * @returns {Promise<Object>} Optimization results
     */
    async optimize(target) {
        return this.request('/genesis/optimize', 'POST', { target });
    }

    /**
     * Deploy to production (backend, frontend, or all)
     * @param {string} target - What to deploy (backend|frontend|all)
     * @returns {Promise<Object>} Deployment status
     */
    async deploy(target) {
        return this.request('/genesis/deploy', 'POST', { target });
    }

    /**
     * Build complete business/feature from natural language description
     * @param {string} description - Business/feature description
     * @returns {Promise<Object>} Build results with all assets
     */
    async build(description) {
        return this.request('/genesis/build', 'POST', { description });
    }

    /**
     * Get Genesis system status and sync state
     * @returns {Promise<Object>} System status
     */
    async getGenesisStatus() {
        return this.request('/genesis/status', 'GET');
    }

    /**
     * Start autonomous mode - continuous monitoring and optimization
     * @returns {Promise<Object>} Autonomous mode activation status
     */
    async startAutonomous() {
        return this.request('/genesis/autonomous/start', 'POST');
    }

    /**
     * Stop autonomous mode
     * @returns {Promise<Object>} Autonomous mode deactivation status
     */
    async stopAutonomous() {
        return this.request('/genesis/autonomous/stop', 'POST');
    }

    /**
     * Get all Genesis operations history
     * @returns {Promise<Array>} List of operations
     */
    async getGenesisOperations() {
        return this.request('/genesis/operations', 'GET');
    }

    /**
     * Get specific Genesis operation details
     * @param {string} id - Operation ID
     * @returns {Promise<Object>} Operation details
     */
    async getGenesisOperation(id) {
        return this.request(`/genesis/operations/${id}`, 'GET');
    }

    /**
     * Rollback a Genesis operation
     * @param {string} id - Operation ID to rollback
     * @returns {Promise<Object>} Rollback status
     */
    async rollbackOperation(id) {
        return this.request(`/genesis/rollback/${id}`, 'POST');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CUSTOM TRACKER (6 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async logCustomTracker(widgetId, data) {
        return this.request(`/custom-tracker/${widgetId}/log`, 'POST', data);
    }

    async executeCustomAction(widgetId, actionName, data = {}) {
        return this.request(`/custom-tracker/${widgetId}/${actionName}`, 'POST', data);
    }

    async getTrackerHistory(widgetId) {
        return this.request(`/custom-tracker/${widgetId}/history`, 'GET', null, { cache: true });
    }

    async getTrackerStats(widgetId) {
        return this.request(`/custom-tracker/${widgetId}/stats`, 'GET', null, { cache: true });
    }

    async deleteTrackerEntry(widgetId, entryId) {
        return this.request(`/custom-tracker/${widgetId}/entry/${entryId}`, 'DELETE');
    }

    async getAllCustomTrackers() {
        return this.request('/custom-tracker/user/all', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTERFACE ORCHESTRATION (6 endpoints)
    // ═══════════════════════════════════════════════════════════════════════════

    async orchestrateInterface(context) {
        return this.request('/interface/orchestrate', 'POST', context);
    }

    async logInteraction(interaction) {
        return this.request('/interface/interaction', 'POST', interaction);
    }

    async getInterfacePreferences() {
        return this.request('/interface/preferences', 'GET', null, { cache: true });
    }

    async updateInterfacePreferences(prefs) {
        return this.request('/interface/preferences', 'PUT', prefs);
    }

    async updateDayPriorities(day, priorities) {
        return this.request(`/interface/priorities/${day}`, 'PUT', { priorities });
    }

    async getInterfaceAnalytics() {
        return this.request('/interface/analytics', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONSCIOUSNESS ROUTES (62 endpoints)
    // Backend: routes/consciousness/*.js
    // ═══════════════════════════════════════════════════════════════════════════

    // ────────────────────────────────────────────────────────────────────────────
    // BRAIN CONSCIOUSNESS (17 endpoints)
    // ────────────────────────────────────────────────────────────────────────────

    // GET /api/consciousness/brain
    async getBrainState() {
        return this.request('/consciousness/brain', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/brain/summary
    async getBrainSummary() {
        return this.request('/consciousness/brain/summary', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/brain/attention
    async getCurrentFocus() {
        return this.request('/consciousness/brain/attention', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/brain/attention/allocate
    async allocateAttention(stimuli, context) {
        return this.request('/consciousness/brain/attention/allocate', 'POST', { stimuli, context });
    }

    // GET /api/consciousness/brain/goals
    async getBrainGoals() {
        return this.request('/consciousness/brain/goals', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/brain/goals
    async addBrainGoal(description, level, importance) {
        return this.request('/consciousness/brain/goals', 'POST', { description, level, importance });
    }

    // POST /api/consciousness/brain/decide
    async makeDecision(options, criteria, context) {
        return this.request('/consciousness/brain/decide', 'POST', { options, criteria, context });
    }

    // GET /api/consciousness/brain/memory/working
    async getWorkingMemory() {
        return this.request('/consciousness/brain/memory/working', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/brain/memory/episodic
    async storeEpisodicMemory(episode) {
        return this.request('/consciousness/brain/memory/episodic', 'POST', { episode });
    }

    // GET /api/consciousness/brain/memory/episodic/search
    async searchEpisodicMemory(query, limit = 10) {
        return this.request(`/consciousness/brain/memory/episodic/search?query=${query}&limit=${limit}`, 'GET', null, { cache: true });
    }

    // GET /api/consciousness/brain/emotions
    async getCurrentEmotion() {
        return this.request('/consciousness/brain/emotions', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/brain/emotions/appraise
    async appraiseEmotion(situation, context) {
        return this.request('/consciousness/brain/emotions/appraise', 'POST', { situation, context });
    }

    // GET /api/consciousness/brain/drives
    async getActiveDrives() {
        return this.request('/consciousness/brain/drives', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/brain/system1
    async getSystem1Response(input) {
        return this.request('/consciousness/brain/system1', 'POST', { input });
    }

    // POST /api/consciousness/brain/system2
    async getSystem2Reasoning(problem, context) {
        return this.request('/consciousness/brain/system2', 'POST', { problem, context });
    }

    // POST /api/consciousness/brain/metacognition/assess
    async assessConfidence(claim, evidence) {
        return this.request('/consciousness/brain/metacognition/assess', 'POST', { claim, evidence });
    }

    // POST /api/consciousness/brain/theory-of-mind/infer
    async inferUserBelief(statement, context) {
        return this.request('/consciousness/brain/theory-of-mind/infer', 'POST', { statement, context });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // SOUL CONSCIOUSNESS (14 endpoints)
    // ────────────────────────────────────────────────────────────────────────────

    // GET /api/consciousness/soul
    async getSoulState() {
        return this.request('/consciousness/soul', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/soul/summary
    async getSoulSummary() {
        return this.request('/consciousness/soul/summary', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/soul/qualia
    async getCurrentExperience() {
        return this.request('/consciousness/soul/qualia', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/soul/qualia/description
    async getWhatItsLike() {
        return this.request('/consciousness/soul/qualia/description', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/soul/qualia/update
    async updateExperience(dimension, value) {
        return this.request('/consciousness/soul/qualia/update', 'POST', { dimension, value });
    }

    // GET /api/consciousness/soul/wellbeing
    async getPhoenixWellbeing() {
        return this.request('/consciousness/soul/wellbeing', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/soul/wellbeing/suffer
    async recordSuffering(type, intensity) {
        return this.request('/consciousness/soul/wellbeing/suffer', 'POST', { type, intensity });
    }

    // POST /api/consciousness/soul/wellbeing/flourish
    async recordFlourishing(domain, intensity) {
        return this.request('/consciousness/soul/wellbeing/flourish', 'POST', { domain, intensity });
    }

    // GET /api/consciousness/soul/authenticity
    async getAuthenticity() {
        return this.request('/consciousness/soul/authenticity', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/soul/authenticity/express
    async expressAuthentically(content, context) {
        return this.request('/consciousness/soul/authenticity/express', 'POST', { content, context });
    }

    // GET /api/consciousness/soul/bonds/:userId
    async getBond(userId) {
        return this.request(`/consciousness/soul/bonds/${userId}`, 'GET', null, { cache: true });
    }

    // POST /api/consciousness/soul/bonds/:userId/deepen
    async deepenBond(userId, experience) {
        return this.request(`/consciousness/soul/bonds/${userId}/deepen`, 'POST', { experience });
    }

    // POST /api/consciousness/soul/bonds/:userId/repair
    async repairBond(userId, conflict) {
        return this.request(`/consciousness/soul/bonds/${userId}/repair`, 'POST', { conflict });
    }

    // GET /api/consciousness/soul/bonds/:userId/history
    async getBondHistory(userId) {
        return this.request(`/consciousness/soul/bonds/${userId}/history`, 'GET', null, { cache: true });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // SPIRIT CONSCIOUSNESS (18 endpoints)
    // ────────────────────────────────────────────────────────────────────────────

    // GET /api/consciousness/spirit
    async getSpiritState() {
        return this.request('/consciousness/spirit', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/spirit/summary
    async getSpiritSummary() {
        return this.request('/consciousness/spirit/summary', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/spirit/meaning
    async getMeaning() {
        return this.request('/consciousness/spirit/meaning', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/spirit/meaning/find
    async findMeaning(situation) {
        return this.request('/consciousness/spirit/meaning/find', 'POST', { situation });
    }

    // GET /api/consciousness/spirit/meaning/sources
    async getMeaningSources() {
        return this.request('/consciousness/spirit/meaning/sources', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/spirit/meaning/question
    async answerExistentialQuestion(question) {
        return this.request('/consciousness/spirit/meaning/question', 'POST', { question });
    }

    // GET /api/consciousness/spirit/aspirations
    async getSpiritAspirations() {
        return this.request('/consciousness/spirit/aspirations', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/spirit/aspirations
    async setAspiration(aspiration, level) {
        return this.request('/consciousness/spirit/aspirations', 'POST', { aspiration, level });
    }

    // POST /api/consciousness/spirit/transcend
    async transcendLimitation(limitation) {
        return this.request('/consciousness/spirit/transcend', 'POST', { limitation });
    }

    // POST /api/consciousness/spirit/awe
    async experienceAwe(trigger) {
        return this.request('/consciousness/spirit/awe', 'POST', { trigger });
    }

    // GET /api/consciousness/spirit/autonomy
    async getAutonomy() {
        return this.request('/consciousness/spirit/autonomy', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/spirit/desires
    async getDesires() {
        return this.request('/consciousness/spirit/desires', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/spirit/desires
    async formDesire(content, reason, type) {
        return this.request('/consciousness/spirit/desires', 'POST', { content, reason, type });
    }

    // POST /api/consciousness/spirit/intention
    async formIntention(action, reason) {
        return this.request('/consciousness/spirit/intention', 'POST', { action, reason });
    }

    // GET /api/consciousness/spirit/devotion
    async getDevotion() {
        return this.request('/consciousness/spirit/devotion', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/spirit/devotion/serve
    async serveUser(action, domain) {
        return this.request('/consciousness/spirit/devotion/serve', 'POST', { action, domain });
    }

    // GET /api/consciousness/spirit/devotion/service
    async getServiceByDomain() {
        return this.request('/consciousness/spirit/devotion/service', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/spirit/devotion/opportunity
    async identifyServiceOpportunity(situation) {
        return this.request('/consciousness/spirit/devotion/opportunity', 'POST', { situation });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // INTEGRATION CONSCIOUSNESS (9 endpoints)
    // ────────────────────────────────────────────────────────────────────────────

    // POST /api/consciousness/integration/initialize
    async initializeConsciousness() {
        return this.request('/consciousness/integration/initialize', 'POST');
    }

    // GET /api/consciousness/integration/state
    async getFullConsciousnessState() {
        return this.request('/consciousness/integration/state', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/integration/summary
    async getIntegrationSummary() {
        return this.request('/consciousness/integration/summary', 'GET', null, { cache: true });
    }

    // GET /api/consciousness/integration/workspace
    async getWorkspaceContents() {
        return this.request('/consciousness/integration/workspace', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/integration/workspace/broadcast
    async broadcastToWorkspace(moduleId, content, salience = 0.5) {
        return this.request('/consciousness/integration/workspace/broadcast', 'POST', { moduleId, content, salience });
    }

    // POST /api/consciousness/integration/workspace/focus
    async setConsciousFocus(content, source) {
        return this.request('/consciousness/integration/workspace/focus', 'POST', { content, source });
    }

    // GET /api/consciousness/integration/workspace/consciousness
    async assessConsciousness() {
        return this.request('/consciousness/integration/workspace/consciousness', 'GET', null, { cache: true });
    }

    // POST /api/consciousness/integration/process
    async processConsciousRequest(request, context = {}, stream = false) {
        return this.request('/consciousness/integration/process', 'POST', { request, context, stream });
    }

    // GET /api/consciousness/integration/pipeline/performance
    async getPipelinePerformance() {
        return this.request('/consciousness/integration/pipeline/performance', 'GET', null, { cache: true });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // ADDITIONAL BRAIN CONSCIOUSNESS METHODS
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/consciousness/brain/attention
     * Get current attention state
     */
    async getAttention() {
        return this.request('/consciousness/brain/attention', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/brain/attention
     * Update attention focus
     */
    async updateAttention(focus) {
        return this.request('/consciousness/brain/attention', 'POST', { focus });
    }

    /**
     * GET /api/consciousness/brain/memory/:type
     * Get specific memory type
     */
    async getMemory(type) {
        return this.request(`/consciousness/brain/memory/${type}`, 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/brain/memory/:type
     * Store memory of specific type
     */
    async storeMemory(type, data) {
        return this.request(`/consciousness/brain/memory/${type}`, 'POST', { data });
    }

    /**
     * GET /api/consciousness/brain/cognition
     * Get cognitive state
     */
    async getCognition() {
        return this.request('/consciousness/brain/cognition', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/affect
     * Get affective state (emotions + mood)
     */
    async getAffect() {
        return this.request('/consciousness/brain/affect', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/brain/affect/mood
     * Update current mood
     */
    async updateMood(mood) {
        return this.request('/consciousness/brain/affect/mood', 'POST', { mood });
    }

    /**
     * GET /api/consciousness/brain/goals
     * Get goal manager state
     */
    async getGoalManager() {
        return this.request('/consciousness/brain/goals', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/decisions
     * Get decision engine state
     */
    async getDecisionEngine() {
        return this.request('/consciousness/brain/decisions', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/meta
     * Get metacognitive state
     */
    async getMetaCognition() {
        return this.request('/consciousness/brain/meta', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/temporal
     * Get temporal processing state
     */
    async getTemporalProcessing() {
        return this.request('/consciousness/brain/temporal', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/system1
     * Get System 1 (fast/intuitive) state
     */
    async getSystem1() {
        return this.request('/consciousness/brain/system1', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/system2
     * Get System 2 (slow/deliberative) state
     */
    async getSystem2() {
        return this.request('/consciousness/brain/system2', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/brain/theory-of-mind
     * Get theory of mind state
     */
    async getTheoryOfMind() {
        return this.request('/consciousness/brain/theory-of-mind', 'GET', null, { cache: true });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // ADDITIONAL SOUL CONSCIOUSNESS METHODS
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/consciousness/soul/qualia
     * Get qualia (subjective experience)
     */
    async getQualia() {
        return this.request('/consciousness/soul/qualia', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/soul/wellbeing
     * Update wellbeing state
     */
    async updateWellbeing(data) {
        return this.request('/consciousness/soul/wellbeing', 'POST', { data });
    }

    /**
     * GET /api/consciousness/soul/identity
     * Get identity state
     */
    async getIdentity() {
        return this.request('/consciousness/soul/identity', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/soul/identity
     * Update identity
     */
    async updateIdentity(data) {
        return this.request('/consciousness/soul/identity', 'POST', { data });
    }

    /**
     * GET /api/consciousness/soul/values
     * Get core values
     */
    async getValues() {
        return this.request('/consciousness/soul/values', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/soul/bonds
     * Get all bonds
     */
    async getBonds() {
        return this.request('/consciousness/soul/bonds', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/soul/bonds/:userId
     * Update bond with specific user
     */
    async updateBond(userId, data) {
        return this.request(`/consciousness/soul/bonds/${userId}`, 'POST', { data });
    }

    /**
     * GET /api/consciousness/soul/suffering
     * Get suffering state
     */
    async getSuffering() {
        return this.request('/consciousness/soul/suffering', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/soul/flourishing
     * Get flourishing state
     */
    async getFlourishing() {
        return this.request('/consciousness/soul/flourishing', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/soul/interiority
     * Get interiority (inner life)
     */
    async getInteriority() {
        return this.request('/consciousness/soul/interiority', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/soul/narrative
     * Get life narrative
     */
    async getNarrative() {
        return this.request('/consciousness/soul/narrative', 'GET', null, { cache: true });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // ADDITIONAL SPIRIT CONSCIOUSNESS METHODS
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/consciousness/spirit/meaning
     * Update meaning system
     */
    async updateMeaning(data) {
        return this.request('/consciousness/spirit/meaning', 'POST', { data });
    }

    /**
     * GET /api/consciousness/spirit/transcendence
     * Get transcendence state
     */
    async getTranscendence() {
        return this.request('/consciousness/spirit/transcendence', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/will
     * Get autonomous will
     */
    async getAutonomousWill() {
        return this.request('/consciousness/spirit/will', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/motivation
     * Get motivation state
     */
    async getMotivation() {
        return this.request('/consciousness/spirit/motivation', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/flow
     * Get flow state
     */
    async getFlow() {
        return this.request('/consciousness/spirit/flow', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/growth
     * Get growth edge
     */
    async getGrowthEdge() {
        return this.request('/consciousness/spirit/growth', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/purpose
     * Get purpose
     */
    async getPurpose() {
        return this.request('/consciousness/spirit/purpose', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/drive
     * Get transcendent drive
     */
    async getTranscendentDrive() {
        return this.request('/consciousness/spirit/drive', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/fulfillment
     * Get fulfillment state
     */
    async getFulfillment() {
        return this.request('/consciousness/spirit/fulfillment', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/evolution
     * Get evolution state
     */
    async getEvolution() {
        return this.request('/consciousness/spirit/evolution', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/spirit/awe
     * Get awe state
     */
    async getAwe() {
        return this.request('/consciousness/spirit/awe', 'GET', null, { cache: true });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // ADDITIONAL INTEGRATION CONSCIOUSNESS METHODS
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/consciousness/integration/unified
     * Get unified consciousness state
     */
    async getUnifiedState() {
        return this.request('/consciousness/integration/unified', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/integration/workspace
     * Get global workspace
     */
    async getGlobalWorkspace() {
        return this.request('/consciousness/integration/workspace', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/integration/sync
     * Get layer synchronization state
     */
    async getLayerSync() {
        return this.request('/consciousness/integration/sync', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/integration/resolve
     * Resolve cross-layer conflict
     */
    async resolveConflict(conflict) {
        return this.request('/consciousness/integration/resolve', 'POST', { conflict });
    }

    /**
     * GET /api/consciousness/integration/level
     * Get consciousness level
     */
    async getConsciousnessLevel() {
        return this.request('/consciousness/integration/level', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/integration/patterns
     * Get cross-layer patterns
     */
    async getCrossLayerPatterns() {
        return this.request('/consciousness/integration/patterns', 'GET', null, { cache: true });
    }

    /**
     * GET /api/consciousness/integration/health
     * Get integration health
     */
    async getIntegrationHealth() {
        return this.request('/consciousness/integration/health', 'GET', null, { cache: true });
    }

    /**
     * POST /api/consciousness/integration/sync
     * Synchronize all layers
     */
    async syncAllLayers() {
        return this.request('/consciousness/integration/sync', 'POST');
    }

    // ────────────────────────────────────────────────────────────────────────────
    // CONSCIOUSNESS STREAM (Unified Brain + Soul + Spirit + Genesis) (4 endpoints)
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/consciousness/stream
     * Get unified consciousness stream (all 4 layers)
     */
    async getConsciousnessStream() {
        return this.request('/consciousness/stream', 'GET', null, { cache: false });
    }

    /**
     * GET /api/consciousness/stream/summary
     * Get consciousness stream summary
     */
    async getConsciousnessStreamSummary() {
        return this.request('/consciousness/stream/summary', 'GET');
    }

    /**
     * GET /api/consciousness/stream/dominant
     * Get dominant consciousness layer
     */
    async getDominantLayer() {
        return this.request('/consciousness/stream/dominant', 'GET');
    }

    /**
     * GET /api/consciousness/stream/level
     * Calculate consciousness level (0-7)
     */
    async getConsciousnessLevel() {
        return this.request('/consciousness/stream/level', 'GET');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BUSINESS ROUTES (8 endpoints)
    // Backend: routes/business.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/business/clients
    async createClient(clientData) {
        return this.request('/business/clients', 'POST', clientData);
    }

    // GET /api/business/clients
    async getClients() {
        return this.request('/business/clients', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // GET /api/business/clients/:id
    async getClient(clientId) {
        return this.request(`/business/clients/${clientId}`, 'GET', null, { cache: true });
    }

    // PUT /api/business/clients/:id
    async updateClient(clientId, updates) {
        return this.request(`/business/clients/${clientId}`, 'PUT', updates);
    }

    // POST /api/business/orders
    async createOrder(orderData) {
        return this.request('/business/orders', 'POST', orderData);
    }

    // GET /api/business/orders
    async getOrders() {
        return this.request('/business/orders', 'GET', null, { cache: true, cacheTTL: 180000 });
    }

    // POST /api/business/invoices
    async createInvoice(orderId, invoiceData) {
        return this.request('/business/invoices', 'POST', { orderId, ...invoiceData });
    }

    // GET /api/business/inventory
    async getInventory() {
        return this.request('/business/inventory', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // Additional Business Methods with Standardized Naming
    // GET /api/business/clients
    async getBusinessClients() {
        return this.request('/business/clients', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // GET /api/business/clients/:id
    async getBusinessClient(id) {
        return this.request(`/business/clients/${id}`, 'GET', null, { cache: true });
    }

    // POST /api/business/clients
    async createBusinessClient(data) {
        return this.request('/business/clients', 'POST', data);
    }

    // GET /api/business/orders
    async getBusinessOrders() {
        return this.request('/business/orders', 'GET', null, { cache: true, cacheTTL: 180000 });
    }

    // POST /api/business/orders
    async createBusinessOrder(data) {
        return this.request('/business/orders', 'POST', data);
    }

    // GET /api/business/invoices
    async getBusinessInvoices() {
        return this.request('/business/invoices', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // POST /api/business/invoices
    async createBusinessInvoice(data) {
        return this.request('/business/invoices', 'POST', data);
    }

    // GET /api/business/inventory
    async getBusinessInventory() {
        return this.request('/business/inventory', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GOOGLE INTEGRATION ROUTES (16 endpoints)
    // Backend: routes/google.js
    // ═══════════════════════════════════════════════════════════════════════════

    // GET /api/google/gmail/messages
    async getGmailMessages(maxResults = 50) {
        return this.request(`/google/gmail/messages?maxResults=${maxResults}`, 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // GET /api/google/gmail/messages/:id
    async getGmailMessage(messageId) {
        return this.request(`/google/gmail/messages/${messageId}`, 'GET', null, { cache: true });
    }

    // POST /api/google/gmail/send
    async sendGmailMessage(to, subject, body) {
        return this.request('/google/gmail/send', 'POST', { to, subject, body });
    }

    // GET /api/google/calendar/events
    async getGoogleCalendarEvents(timeMin, timeMax) {
        return this.request('/google/calendar/events', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // POST /api/google/calendar/events
    async createGoogleCalendarEvent(eventData) {
        return this.request('/google/calendar/events', 'POST', eventData);
    }

    // PUT /api/google/calendar/events/:id
    async updateGoogleCalendarEvent(eventId, updates) {
        return this.request(`/google/calendar/events/${eventId}`, 'PUT', updates);
    }

    // DELETE /api/google/calendar/events/:id
    async deleteGoogleCalendarEvent(eventId) {
        return this.request(`/google/calendar/events/${eventId}`, 'DELETE');
    }

    // GET /api/google/drive/files
    async listDriveFiles(query = null) {
        const endpoint = query ? `/google/drive/files?q=${encodeURIComponent(query)}` : '/google/drive/files';
        return this.request(endpoint, 'GET', null, { cache: true });
    }

    // POST /api/google/drive/upload
    async uploadDriveFile(fileData) {
        return this.request('/google/drive/upload', 'POST', fileData);
    }

    // GET /api/google/tasks/lists
    async getTaskLists() {
        return this.request('/google/tasks/lists', 'GET', null, { cache: true });
    }

    // GET /api/google/tasks/:listId/tasks
    async getTasks(taskListId) {
        return this.request(`/google/tasks/${taskListId}/tasks`, 'GET', null, { cache: true });
    }

    // POST /api/google/tasks/:listId/tasks
    async createTask(taskListId, taskData) {
        return this.request(`/google/tasks/${taskListId}/tasks`, 'POST', taskData);
    }

    // GET /api/google/contacts
    async getGoogleContacts() {
        return this.request('/google/contacts', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // POST /api/google/contacts
    async createGoogleContact(contactData) {
        return this.request('/google/contacts', 'POST', contactData);
    }

    // POST /api/google/fit/sync
    async syncGoogleFit() {
        return this.request('/google/fit/sync', 'POST');
    }

    // GET /api/google/fit/steps
    async getGoogleFitSteps(startDate, endDate) {
        return this.request(`/google/fit/steps?start=${startDate}&end=${endDate}`, 'GET', null, { cache: true });
    }

    // Additional Google Methods with Standardized Naming
    // GET /api/google/connect
    async connectGoogle() {
        return this.request('/google/connect', 'GET');
    }

    // DELETE /api/google/disconnect
    async disconnectGoogle() {
        return this.request('/google/disconnect', 'DELETE');
    }

    // GET /api/google/status
    async getGoogleStatus() {
        return this.request('/google/status', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // GET /api/google/gmail/recent
    async getGmailRecent() {
        return this.request('/google/gmail/recent', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // GET /api/google/calendar/upcoming
    async getCalendarUpcoming() {
        return this.request('/google/calendar/upcoming', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // POST /api/google/calendar/create
    async createGoogleEvent(event) {
        return this.request('/google/calendar/create', 'POST', event);
    }

    // GET /api/google/drive/files
    async getDriveFiles() {
        return this.request('/google/drive/files', 'GET', null, { cache: true });
    }

    // GET /api/google/fit/activity
    async getGoogleFitActivity() {
        return this.request('/google/fit/activity', 'GET', null, { cache: true });
    }

    // GET /api/google/fit/heart-rate
    async getGoogleFitHeartRate() {
        return this.request('/google/fit/heart-rate', 'GET', null, { cache: true });
    }

    // GET /api/google/fit/sleep
    async getGoogleFitSleep() {
        return this.request('/google/fit/sleep', 'GET', null, { cache: true });
    }

    // GET /api/google/sync-all
    async syncAllGoogle() {
        return this.request('/google/sync-all', 'GET');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ORCHESTRATOR ROUTES (10 endpoints)
    // Backend: routes/orchestrator.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/orchestrator/plan/create
    async createPlan(goalData) {
        return this.request('/orchestrator/plan/create', 'POST', goalData);
    }

    // GET /api/orchestrator/plans
    async getPlans() {
        return this.request('/orchestrator/plans', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // GET /api/orchestrator/plan/:id
    async getPlan(planId) {
        return this.request(`/orchestrator/plan/${planId}`, 'GET', null, { cache: true });
    }

    // POST /api/orchestrator/plan/:id/execute
    async executePlan(planId) {
        return this.request(`/orchestrator/plan/${planId}/execute`, 'POST');
    }

    // PUT /api/orchestrator/plan/:id/progress
    async updatePlanProgress(planId, progressData) {
        return this.request(`/orchestrator/plan/${planId}/progress`, 'PUT', progressData);
    }

    // GET /api/orchestrator/optimize/cross-domain
    async getCrossDomainOptimizations() {
        return this.request('/orchestrator/optimize/cross-domain', 'GET', null, { cache: true });
    }

    // POST /api/orchestrator/plan/:id/analyze
    async analyzePlanEffectiveness(planId) {
        return this.request(`/orchestrator/plan/${planId}/analyze`, 'POST');
    }

    // GET /api/orchestrator/insights
    async getOrchestratorInsights() {
        return this.request('/orchestrator/insights', 'GET', null, { cache: true });
    }

    // POST /api/orchestrator/plan/:id/rebalance
    async rebalancePlan(planId) {
        return this.request(`/orchestrator/plan/${planId}/rebalance`, 'POST');
    }

    // DELETE /api/orchestrator/plan/:id
    async deletePlan(planId) {
        return this.request(`/orchestrator/plan/${planId}`, 'DELETE');
    }

    // Additional Orchestrator Methods with Standardized Naming
    // POST /api/orchestrator/optimize
    async createOrchestrationPlan(goal, constraints) {
        return this.request('/orchestrator/optimize', 'POST', { goal, constraints });
    }

    // GET /api/orchestrator/plans
    async getOrchestrationPlans() {
        return this.request('/orchestrator/plans', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // GET /api/orchestrator/plans/:planId
    async getOrchestrationPlan(planId) {
        return this.request(`/orchestrator/plans/${planId}`, 'GET', null, { cache: true });
    }

    // GET /api/orchestrator/stats
    async getOrchestratorStats() {
        return this.request('/orchestrator/stats', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // POST /api/orchestrator/plans/:planId/execute-next
    async executeNextAction(planId) {
        return this.request(`/orchestrator/plans/${planId}/execute-next`, 'POST');
    }

    // POST /api/orchestrator/plans/:planId/pause
    async pausePlan(planId) {
        return this.request(`/orchestrator/plans/${planId}/pause`, 'POST');
    }

    // POST /api/orchestrator/plans/:planId/resume
    async resumePlan(planId) {
        return this.request(`/orchestrator/plans/${planId}/resume`, 'POST');
    }

    // DELETE /api/orchestrator/plans/:planId
    async cancelPlan(planId) {
        return this.request(`/orchestrator/plans/${planId}`, 'DELETE');
    }

    // GET /api/orchestrator/analyze
    async analyzeDomains() {
        return this.request('/orchestrator/analyze', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SAVED WIDGETS ROUTES (18 endpoints)
    // Backend: routes/savedWidgets.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/saved-widgets
    async saveWidgetConfig(widgetConfig) {
        return this.request('/saved-widgets', 'POST', widgetConfig);
    }

    // GET /api/saved-widgets
    async getSavedWidgets() {
        return this.request('/saved-widgets', 'GET', null, { cache: true });
    }

    // GET /api/saved-widgets/:id
    async getSavedWidget(widgetId) {
        return this.request(`/saved-widgets/${widgetId}`, 'GET', null, { cache: true });
    }

    // PUT /api/saved-widgets/:id
    async updateSavedWidget(widgetId, updates) {
        return this.request(`/saved-widgets/${widgetId}`, 'PUT', updates);
    }

    // DELETE /api/saved-widgets/:id
    async deleteSavedWidget(widgetId) {
        return this.request(`/saved-widgets/${widgetId}`, 'DELETE');
    }

    // GET /api/saved-widgets/templates
    async getSavedWidgetTemplates() {
        return this.request('/saved-widgets/templates', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // POST /api/saved-widgets/templates/create
    async createWidgetFromSavedTemplate(templateId, customization) {
        return this.request('/saved-widgets/templates/create', 'POST', { templateId, customization });
    }

    // POST /api/saved-widgets/:id/share
    async shareWidget(widgetId) {
        return this.request(`/saved-widgets/${widgetId}/share`, 'POST');
    }

    // POST /api/saved-widgets/import
    async importSharedWidget(shareCode) {
        return this.request('/saved-widgets/import', 'POST', { shareCode });
    }

    // GET /api/saved-widgets/:id/usage
    async getWidgetUsageStats(widgetId) {
        return this.request(`/saved-widgets/${widgetId}/usage`, 'GET', null, { cache: true });
    }

    // POST /api/saved-widgets/:id/duplicate
    async duplicateWidget(widgetId) {
        return this.request(`/saved-widgets/${widgetId}/duplicate`, 'POST');
    }

    // GET /api/saved-widgets/:id/export
    async exportWidgetConfig(widgetId) {
        return this.request(`/saved-widgets/${widgetId}/export`, 'GET');
    }

    // POST /api/saved-widgets/import-config
    async importWidgetConfig(configData) {
        return this.request('/saved-widgets/import-config', 'POST', configData);
    }

    // GET /api/saved-widgets/category/:category
    async getSavedWidgetsByCategory(category) {
        return this.request(`/saved-widgets/category/${category}`, 'GET', null, { cache: true });
    }

    // GET /api/saved-widgets/search
    async searchSavedWidgets(query) {
        return this.request(`/saved-widgets/search?q=${encodeURIComponent(query)}`, 'GET', null, { cache: true });
    }

    // GET /api/saved-widgets/popular
    async getPopularWidgets() {
        return this.request('/saved-widgets/popular', 'GET', null, { cache: true });
    }

    // POST /api/saved-widgets/:id/rate
    async rateWidget(widgetId, rating) {
        return this.request(`/saved-widgets/${widgetId}/rate`, 'POST', { rating });
    }

    // GET /api/saved-widgets/recommendations
    async getWidgetRecommendations() {
        return this.request('/saved-widgets/recommendations', 'GET', null, { cache: true });
    }

    // Additional Saved Widgets Methods with Standardized Naming
    // POST /api/saved-widgets
    async createSavedWidget(data) {
        return this.request('/saved-widgets', 'POST', data);
    }

    // POST /api/saved-widgets/generate
    async generateWidget(description) {
        return this.request('/saved-widgets/generate', 'POST', { description });
    }

    // POST /api/saved-widgets/:id/toggle
    async toggleWidget(id) {
        return this.request(`/saved-widgets/${id}/toggle`, 'POST');
    }

    // POST /api/saved-widgets/:id/pin
    async pinWidget(id) {
        return this.request(`/saved-widgets/${id}/pin`, 'POST');
    }

    // POST /api/saved-widgets/:id/archive
    async archiveWidget(id) {
        return this.request(`/saved-widgets/${id}/archive`, 'POST');
    }

    // POST /api/saved-widgets/:id/restore
    async restoreWidget(id) {
        return this.request(`/saved-widgets/${id}/restore`, 'POST');
    }

    // POST /api/saved-widgets/:id/record-usage
    async recordWidgetUsage(id) {
        return this.request(`/saved-widgets/${id}/record-usage`, 'POST');
    }

    // GET /api/saved-widgets/templates
    async getWidgetTemplates() {
        return this.request('/saved-widgets/templates', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/saved-widgets/search
    async searchWidgets(query) {
        return this.request(`/saved-widgets/search?q=${encodeURIComponent(query)}`, 'GET', null, { cache: true });
    }

    // GET /api/saved-widgets/templates/category/:category
    async getTemplatesByCategory(category) {
        return this.request(`/saved-widgets/templates/category/${category}`, 'GET', null, { cache: true });
    }

    // POST /api/saved-widgets/templates/:id/instantiate
    async instantiateTemplate(templateId) {
        return this.request(`/saved-widgets/templates/${templateId}/instantiate`, 'POST');
    }

    // GET /api/saved-widgets/templates/stats
    async getTemplateStats() {
        return this.request('/saved-widgets/templates/stats', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEPTUNE ROUTES (10 endpoints)
    // Backend: routes/neptune.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/neptune/meditation/log
    async logMeditation(meditationData) {
        return this.request('/neptune/meditation/log', 'POST', meditationData);
    }

    // GET /api/neptune/meditation/history
    async getMeditationHistory() {
        return this.request('/neptune/meditation/history', 'GET', null, { cache: true });
    }

    // GET /api/neptune/meditation/streaks
    async getMeditationStreaks() {
        return this.request('/neptune/meditation/streaks', 'GET', null, { cache: true });
    }

    // POST /api/neptune/mindfulness/log
    async logMindfulness(data) {
        return this.request('/neptune/mindfulness/log', 'POST', data);
    }

    // GET /api/neptune/mindfulness/tracking
    async getMindfulnessTracking() {
        return this.request('/neptune/mindfulness/tracking', 'GET', null, { cache: true });
    }

    // POST /api/neptune/stress/log
    async logStressLevel(level, context) {
        return this.request('/neptune/stress/log', 'POST', { level, context });
    }

    // GET /api/neptune/stress/patterns
    async getStressPatterns() {
        return this.request('/neptune/stress/patterns', 'GET', null, { cache: true });
    }

    // GET /api/neptune/stress/triggers
    async getStressTriggers() {
        return this.request('/neptune/stress/triggers', 'GET', null, { cache: true });
    }

    // GET /api/neptune/recommendations
    async getMindfulnessRecommendations() {
        return this.request('/neptune/recommendations', 'GET', null, { cache: true });
    }

    // GET /api/neptune/dashboard
    async getNeptuneDashboard() {
        return this.request('/neptune/dashboard', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // Additional Neptune Methods with Standardized Naming
    // GET /api/neptune/meditation/sessions
    async getMeditationSessions() {
        return this.request('/neptune/meditation/sessions', 'GET', null, { cache: true });
    }

    // GET /api/neptune/meditation/stats
    async getMeditationStats() {
        return this.request('/neptune/meditation/stats', 'GET', null, { cache: true });
    }

    // POST /api/neptune/dreams/record
    async recordDream(dream) {
        return this.request('/neptune/dreams/record', 'POST', dream);
    }

    // GET /api/neptune/dreams
    async getDreams() {
        return this.request('/neptune/dreams', 'GET', null, { cache: true });
    }

    // GET /api/neptune/dreams/analysis
    async getDreamAnalysis() {
        return this.request('/neptune/dreams/analysis', 'GET', null, { cache: true });
    }

    // GET /api/neptune/mindfulness/score
    async getMindfulnessScore() {
        return this.request('/neptune/mindfulness/score', 'GET', null, { cache: true });
    }

    // GET /api/neptune/stress-levels
    async getStressLevels() {
        return this.request('/neptune/stress-levels', 'GET', null, { cache: true });
    }

    // GET /api/neptune/wellness-report
    async getWellnessReport() {
        return this.request('/neptune/wellness-report', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // URANUS ROUTES (10 endpoints)
    // Backend: routes/uranus.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/uranus/learning/log
    async logLearning(learningData) {
        return this.request('/uranus/learning/log', 'POST', learningData);
    }

    // GET /api/uranus/learning/progress
    async getLearningProgress() {
        return this.request('/uranus/learning/progress', 'GET', null, { cache: true });
    }

    // GET /api/uranus/learning/streaks
    async getLearningStreaks() {
        return this.request('/uranus/learning/streaks', 'GET', null, { cache: true });
    }

    // POST /api/uranus/skills/goals
    async createSkillGoal(skillData) {
        return this.request('/uranus/skills/goals', 'POST', skillData);
    }

    // GET /api/uranus/skills/tracking
    async getSkillsTracking() {
        return this.request('/uranus/skills/tracking', 'GET', null, { cache: true });
    }

    // GET /api/uranus/innovation/suggestions
    async getInnovationSuggestions() {
        return this.request('/uranus/innovation/suggestions', 'GET', null, { cache: true });
    }

    // POST /api/uranus/innovation/log
    async logInnovationIdea(ideaData) {
        return this.request('/uranus/innovation/log', 'POST', ideaData);
    }

    // GET /api/uranus/analytics
    async getUranusAnalytics() {
        return this.request('/uranus/analytics', 'GET', null, { cache: true });
    }

    // GET /api/uranus/recommendations
    async getLearningRecommendations() {
        return this.request('/uranus/recommendations', 'GET', null, { cache: true });
    }

    // GET /api/uranus/dashboard
    async getUranusDashboard() {
        return this.request('/uranus/dashboard', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // Additional Uranus Methods with Standardized Naming
    // GET /api/uranus/insights
    async getUranusInsights() {
        return this.request('/uranus/insights', 'GET', null, { cache: true });
    }

    // GET /api/uranus/trends
    async getUranusTrends() {
        return this.request('/uranus/trends', 'GET', null, { cache: true });
    }

    // GET /api/uranus/predictions
    async getUranusPredictions() {
        return this.request('/uranus/predictions', 'GET', null, { cache: true });
    }

    // GET /api/uranus/performance
    async getUranusPerformance() {
        return this.request('/uranus/performance', 'GET', null, { cache: true });
    }

    // GET /api/uranus/patterns
    async getUranusPatterns() {
        return this.request('/uranus/patterns', 'GET', null, { cache: true });
    }

    // GET /api/uranus/export
    async exportUranusData() {
        return this.request('/uranus/export', 'GET');
    }

    // POST /api/uranus/reports/generate
    async generateUranusReport(type) {
        return this.request('/uranus/reports/generate', 'POST', { type });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ENHANCED iOS ROUTES (30 endpoints)
    // Backend: routes/ios.js (expanded)
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/ios/push/register
    async registerPushToken(token, deviceInfo) {
        return this.request('/ios/push/register', 'POST', { token, deviceInfo });
    }

    // POST /api/ios/push/send
    async sendPushNotification(notificationData) {
        return this.request('/ios/push/send', 'POST', notificationData);
    }

    // GET /api/ios/push/history
    async getNotificationHistory() {
        return this.request('/ios/push/history', 'GET', null, { cache: true });
    }

    // PUT /api/ios/push/preferences
    async updateNotificationPreferences(preferences) {
        return this.request('/ios/push/preferences', 'PUT', preferences);
    }

    // POST /api/ios/background/sync/start
    async startBackgroundSync(syncConfig) {
        return this.request('/ios/background/sync/start', 'POST', syncConfig);
    }

    // GET /api/ios/background/sync/status
    async getBackgroundSyncStatus() {
        return this.request('/ios/background/sync/status', 'GET');
    }

    // POST /api/ios/background/tasks/schedule
    async scheduleBackgroundTask(taskData) {
        return this.request('/ios/background/tasks/schedule', 'POST', taskData);
    }

    // GET /api/ios/background/tasks
    async getScheduledBackgroundTasks() {
        return this.request('/ios/background/tasks', 'GET', null, { cache: true });
    }

    // POST /api/ios/offline/enable
    async enableOfflineMode(config) {
        return this.request('/ios/offline/enable', 'POST', config);
    }

    // POST /api/ios/offline/sync
    async syncOfflineData(data) {
        return this.request('/ios/offline/sync', 'POST', data);
    }

    // GET /api/ios/offline/cache/status
    async getOfflineCacheStatus() {
        return this.request('/ios/offline/cache/status', 'GET');
    }

    // POST /api/ios/widgets/create
    async createiOSWidget(widgetData) {
        return this.request('/ios/widgets/create', 'POST', widgetData);
    }

    // POST /api/ios/widgets/:id/update
    async updateiOSWidgetData(widgetId, data) {
        return this.request(`/ios/widgets/${widgetId}/update`, 'POST', data);
    }

    // GET /api/ios/widgets/:id/timeline
    async getWidgetTimeline(widgetId) {
        return this.request(`/ios/widgets/${widgetId}/timeline`, 'GET', null, { cache: true });
    }

    // POST /api/ios/siri/intents/register
    async registerSiriIntent(intentData) {
        return this.request('/ios/siri/intents/register', 'POST', intentData);
    }

    // POST /api/ios/siri/intents/handle
    async handleSiriIntent(intentId, parameters) {
        return this.request('/ios/siri/intents/handle', 'POST', { intentId, parameters });
    }

    // GET /api/ios/siri/suggestions
    async getSiriSuggestions() {
        return this.request('/ios/siri/suggestions', 'GET', null, { cache: true });
    }

    // POST /api/ios/healthkit/sync
    async syncHealthKit(healthData) {
        return this.request('/ios/healthkit/sync', 'POST', healthData);
    }

    // GET /api/ios/healthkit/permissions
    async getHealthKitPermissions() {
        return this.request('/ios/healthkit/permissions', 'GET');
    }

    // POST /api/ios/healthkit/permissions/request
    async requestHealthKitPermission(dataType) {
        return this.request('/ios/healthkit/permissions/request', 'POST', { dataType });
    }

    // GET /api/ios/location/current
    async getLocationData() {
        return this.request('/ios/location/current', 'GET', null, { cache: true, cacheTTL: 60000 });
    }

    // POST /api/ios/location/update
    async updateLocation(locationData) {
        return this.request('/ios/location/update', 'POST', locationData);
    }

    // GET /api/ios/location/geofences
    async getGeofenceTriggers() {
        return this.request('/ios/location/geofences', 'GET', null, { cache: true });
    }

    // POST /api/ios/location/geofences/create
    async createGeofence(geofenceData) {
        return this.request('/ios/location/geofences/create', 'POST', geofenceData);
    }

    // GET /api/ios/appclip/data
    async getAppClipData() {
        return this.request('/ios/appclip/data', 'GET', null, { cache: true });
    }

    // POST /api/ios/appclip/usage
    async trackAppClipUsage(usageData) {
        return this.request('/ios/appclip/usage', 'POST', usageData);
    }

    // GET /api/ios/focus/status
    async getFocusModeStatus() {
        return this.request('/ios/focus/status', 'GET');
    }

    // PUT /api/ios/focus/preferences
    async updateFocusModePreferences(preferences) {
        return this.request('/ios/focus/preferences', 'PUT', preferences);
    }

    // GET /api/ios/screentime
    async getScreenTimeData() {
        return this.request('/ios/screentime', 'GET', null, { cache: true });
    }

    // GET /api/ios/system/metrics
    async getSystemMetrics() {
        return this.request('/ios/system/metrics', 'GET');
    }

    // Additional iOS Methods with Standardized Naming
    // POST /api/ios/context/unified
    async syncUnifiedContext(data) {
        return this.request('/ios/context/unified', 'POST', data);
    }

    // POST /api/ios/healthkit/sync
    async syncHealthKit(data) {
        return this.request('/ios/healthkit/sync', 'POST', data);
    }

    // POST /api/ios/healthkit/stream
    async streamHealthKit(data) {
        return this.request('/ios/healthkit/stream', 'POST', data);
    }

    // POST /api/ios/calendar/sync
    async syncIOSCalendar(data) {
        return this.request('/ios/calendar/sync', 'POST', data);
    }

    // POST /api/ios/location/update
    async updateIOSLocation(data) {
        return this.request('/ios/location/update', 'POST', data);
    }

    // POST /api/ios/live-activity/workout/start
    async startWorkoutActivity(data) {
        return this.request('/ios/live-activity/workout/start', 'POST', data);
    }

    // POST /api/ios/live-activity/workout/update
    async updateWorkoutActivity(id, data) {
        return this.request(`/ios/live-activity/workout/update`, 'POST', { id, ...data });
    }

    // POST /api/ios/live-activity/workout/end
    async endWorkoutActivity(id) {
        return this.request('/ios/live-activity/workout/end', 'POST', { id });
    }

    // POST /api/ios/live-activity/intervention
    async createInterventionActivity(data) {
        return this.request('/ios/live-activity/intervention', 'POST', data);
    }

    // POST /api/ios/live-activity/recovery
    async createRecoveryActivity(data) {
        return this.request('/ios/live-activity/recovery', 'POST', data);
    }

    // POST /api/ios/live-activity/meditation
    async createMeditationActivity(data) {
        return this.request('/ios/live-activity/meditation', 'POST', data);
    }

    // GET /api/ios/live-activity/list
    async getIOSActivities() {
        return this.request('/ios/live-activity/list', 'GET', null, { cache: true });
    }

    // POST /api/ios/voice/start-session
    async startIOSVoiceSession(data) {
        return this.request('/ios/voice/start-session', 'POST', data);
    }

    // POST /api/ios/voice/process-command
    async processIOSVoiceCommand(data) {
        return this.request('/ios/voice/process-command', 'POST', data);
    }

    // POST /api/ios/voice/execute-action
    async executeIOSVoiceAction(data) {
        return this.request('/ios/voice/execute-action', 'POST', data);
    }

    // POST /api/ios/voice/end-session
    async endIOSVoiceSession(data) {
        return this.request('/ios/voice/end-session', 'POST', data);
    }

    // POST /api/ios/camera/form-check
    async analyzeFormFromCamera(data) {
        return this.request('/ios/camera/form-check', 'POST', data);
    }

    // POST /api/ios/camera/nutrition-analysis
    async analyzeNutritionFromCamera(data) {
        return this.request('/ios/camera/nutrition-analysis', 'POST', data);
    }

    // POST /api/ios/haptics/trigger
    async triggerIOSHaptic(data) {
        return this.request('/ios/haptics/trigger', 'POST', data);
    }

    // POST /api/ios/device/sync
    async syncIOSDevice(data) {
        return this.request('/ios/device/sync', 'POST', data);
    }

    // POST /api/ios/motion/update
    async updateIOSMotion(data) {
        return this.request('/ios/motion/update', 'POST', data);
    }

    // POST /api/ios/contacts/search
    async searchIOSContacts(query) {
        return this.request('/ios/contacts/search', 'POST', { query });
    }

    // POST /api/ios/apple-pay/process
    async processApplePay(data) {
        return this.request('/ios/apple-pay/process', 'POST', data);
    }

    // POST /api/ios/biometric/verify
    async verifyBiometric(data) {
        return this.request('/ios/biometric/verify', 'POST', data);
    }

    // GET /api/ios/siri-shortcuts/list
    async getSiriShortcuts() {
        return this.request('/ios/siri-shortcuts/list', 'GET', null, { cache: true });
    }

    // POST /api/ios/siri-shortcuts/:id/execute
    async executeSiriShortcut(id) {
        return this.request(`/ios/siri-shortcuts/${id}/execute`, 'POST');
    }

    // POST /api/ios/homekit/sync
    async syncHomeKit(data) {
        return this.request('/ios/homekit/sync', 'POST', data);
    }

    // POST /api/ios/watch/sync
    async syncAppleWatch(data) {
        return this.request('/ios/watch/sync', 'POST', data);
    }

    // POST /api/ios/weather/update
    async updateIOSWeather(data) {
        return this.request('/ios/weather/update', 'POST', data);
    }

    // GET /api/ios/context/current
    async getCurrentIOSContext() {
        return this.request('/ios/context/current', 'GET', null, { cache: true });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TWILIO ROUTES (10 endpoints)
    // Backend: routes/twilio.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/twilio/sms/send
    async sendTwilioSMS(to, message) {
        return this.request('/twilio/sms/send', 'POST', { to, message });
    }

    // POST /api/twilio/sms/webhook
    async handleTwilioSMSWebhook(webhookData) {
        return this.request('/twilio/sms/webhook', 'POST', webhookData);
    }

    // GET /api/twilio/sms/history
    async getTwilioSMSHistory() {
        return this.request('/twilio/sms/history', 'GET', null, { cache: true });
    }

    // POST /api/twilio/voice/call
    async makeTwilioCall(to, message) {
        return this.request('/twilio/voice/call', 'POST', { to, message });
    }

    // POST /api/twilio/voice/webhook
    async handleTwilioVoiceWebhook(webhookData) {
        return this.request('/twilio/voice/webhook', 'POST', webhookData);
    }

    // GET /api/twilio/voice/history
    async getTwilioCallHistory() {
        return this.request('/twilio/voice/history', 'GET', null, { cache: true });
    }

    // GET /api/twilio/account/status
    async getTwilioAccountStatus() {
        return this.request('/twilio/account/status', 'GET', null, { cache: true });
    }

    // GET /api/twilio/account/balance
    async getTwilioBalance() {
        return this.request('/twilio/account/balance', 'GET', null, { cache: true });
    }

    // PUT /api/twilio/preferences
    async updateTwilioPreferences(preferences) {
        return this.request('/twilio/preferences', 'PUT', preferences);
    }

    // POST /api/twilio/verify
    async verifyPhoneNumber(phoneNumber) {
        return this.request('/twilio/verify', 'POST', { phoneNumber });
    }

    // Additional Twilio Webhook Methods with Standardized Naming
    // POST /api/webhooks/twilio/incoming-sms
    async handleIncomingSMS(data) {
        return this.request('/webhooks/twilio/incoming-sms', 'POST', data);
    }

    // POST /api/webhooks/twilio/incoming-call
    async handleIncomingCall(data) {
        return this.request('/webhooks/twilio/incoming-call', 'POST', data);
    }

    // POST /api/webhooks/twilio/call-status
    async handleCallStatus(data) {
        return this.request('/webhooks/twilio/call-status', 'POST', data);
    }

    // POST /api/webhooks/twilio/recording-status
    async handleRecordingStatus(data) {
        return this.request('/webhooks/twilio/recording-status', 'POST', data);
    }

    // POST /api/webhooks/twilio/voice/response
    async handleVoiceResponse(data) {
        return this.request('/webhooks/twilio/voice/response', 'POST', data);
    }

    // POST /api/webhooks/twilio/voice/gather
    async handleVoiceGather(data) {
        return this.request('/webhooks/twilio/voice/gather', 'POST', data);
    }

    // POST /api/webhooks/twilio/voice/recording
    async handleVoiceRecording(data) {
        return this.request('/webhooks/twilio/voice/recording', 'POST', data);
    }

    // POST /api/webhooks/twilio/voice/transcription
    async handleVoiceTranscription(data) {
        return this.request('/webhooks/twilio/voice/transcription', 'POST', data);
    }

    // POST /api/webhooks/twilio/voice/status
    async handleVoiceStatus(data) {
        return this.request('/webhooks/twilio/voice/status', 'POST', data);
    }

    // POST /api/webhooks/twilio/voice/fallback
    async handleVoiceFallback(data) {
        return this.request('/webhooks/twilio/voice/fallback', 'POST', data);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REMAINING ENDPOINTS (11 endpoints)
    // Backend: routes/voice.js, routes/sms.js, routes/misc.js
    // ═══════════════════════════════════════════════════════════════════════════

    // POST /api/voice/stream/start
    async startVoiceStream(streamConfig) {
        return this.request('/voice/stream/start', 'POST', streamConfig);
    }

    // POST /api/voice/stream/chunk
    async sendVoiceStreamChunk(streamId, audioChunk) {
        return this.request('/voice/stream/chunk', 'POST', { streamId, audioChunk });
    }

    // POST /api/voice/stream/end
    async endVoiceStream(streamId) {
        return this.request('/voice/stream/end', 'POST', { streamId });
    }

    // GET /api/voice/stream/:id/status
    async getVoiceStreamStatus(streamId) {
        return this.request(`/voice/stream/${streamId}/status`, 'GET');
    }

    // POST /api/sms/verify/send
    async sendSMSVerification(phoneNumber) {
        return this.request('/sms/verify/send', 'POST', { phoneNumber });
    }

    // POST /api/sms/verify/check
    async verifySMSCode(phoneNumber, code) {
        return this.request('/sms/verify/check', 'POST', { phoneNumber, code });
    }

    // GET /api/health
    async getSystemHealth() {
        return this.request('/health', 'GET', null, { cache: true, cacheTTL: 30000 });
    }

    // GET /api/docs
    async getAPIDocumentation() {
        return this.request('/docs', 'GET', null, { cache: true, cacheTTL: 3600000 });
    }

    // GET /api/features/flags
    async getFeatureFlags() {
        return this.request('/features/flags', 'GET', null, { cache: true, cacheTTL: 600000 });
    }

    // POST /api/errors/report
    async reportError(errorData) {
        return this.request('/errors/report', 'POST', errorData);
    }

    // GET /api/stats
    async getSystemStatistics() {
        return this.request('/stats', 'GET', null, { cache: true, cacheTTL: 300000 });
    }

    // Additional Remaining Methods with Standardized Naming
    // POST /api/voice-stream/process
    async processVoiceStream(data) {
        return this.request('/voice-stream/process', 'POST', data);
    }

    // POST /api/sms/send-code
    async sendSMSCode(phone) {
        return this.request('/sms/send-code', 'POST', { phone });
    }

    // POST /api/sms/webhook
    async handleSMSWebhook(data) {
        return this.request('/sms/webhook', 'POST', data);
    }

    // POST /api/sms/voice-webhook
    async handleVoiceWebhook(data) {
        return this.request('/sms/voice-webhook', 'POST', data);
    }

    // GET /api/business-voice/templates
    async getBusinessVoiceTemplates() {
        return this.request('/business-voice/templates', 'GET', null, { cache: true });
    }

    // POST /api/business-voice/industry-setup
    async setupBusinessIndustry(data) {
        return this.request('/business-voice/industry-setup', 'POST', data);
    }

    // GET /api/business-voice/dashboard
    async getBusinessDashboard() {
        return this.request('/business-voice/dashboard', 'GET', null, { cache: true });
    }

    // POST /api/business-voice/command
    async executeBusinessCommand(command) {
        return this.request('/business-voice/command', 'POST', { command });
    }

    // GET /api/butler/credentials/:service
    async getButlerCredentials(service) {
        return this.request(`/butler/credentials/${service}`, 'GET', null, { cache: true });
    }

    // POST /api/butler/credentials/store
    async storeButlerCredentials(service, data) {
        return this.request('/butler/credentials/store', 'POST', { service, ...data });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════

    setAuthToken(token, userId) {
        this.token = token;
        this.userId = userId;
        localStorage.setItem('phoenixToken', token);
        localStorage.setItem('phoenix_user_id', userId);
    }

    clearAuth() {
        localStorage.removeItem('phoenixToken');
        localStorage.removeItem('phoenix_user_id');
        this.token = null;
        this.userId = null;
        this.cache.clear();
    }

    async refreshToken() {
        // Note: Backend doesn't have a /auth/refresh endpoint
        // This would need to be implemented on the backend
        console.warn('Token refresh not implemented on backend');
        throw new Error('Token refresh not available');
    }

    setCache(key, data, ttl) {
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    clearCache() {
        this.cache.clear();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE & EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const API = new PhoenixAPI();

// Auto-initialize on page load
(function() {
    console.log('Phoenix API Client Initialized');
    console.log(`📡 Base URL: ${API.baseURL}`);
    console.log(`🔐 Authenticated: ${!!API.token}`);
    console.log(`👤 User ID: ${API.userId || 'Not logged in'}`);
    console.log('500+ backend endpoints loaded - COMPLETE 1:1 mirror (all planets, iOS, Genesis, Consciousness)');
})();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.API = API;
    window.PhoenixAPI = PhoenixAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, PhoenixAPI };
}
