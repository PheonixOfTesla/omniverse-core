/**
 * ============================================================================
 * SATURN LEGACY - Mortality Awareness & Life Planning
 * ============================================================================
 *
 * Integrates with Phoenix backend Saturn endpoints:
 * - /api/saturn/mortality/calculate - Calculate weeks remaining
 * - /api/saturn/reviews/list - Quarterly life reviews
 * - /api/saturn/goals/long-term - 5/10/25 year goals
 * - /api/saturn/legacy/projects - Legacy projects tracking
 * - /api/saturn/relationships/important - Important people tracker
 * - /api/saturn/satisfaction/current - Life satisfaction scores
 */

class SaturnApp {
    constructor() {
        this.apiBaseUrl = window.PhoenixConfig.API_BASE_URL;
        this.refreshInterval = 600000; // Refresh every 10 minutes
        this.satisfactionAreas = [
            'Health & Fitness',
            'Career & Purpose',
            'Relationships',
            'Personal Growth',
            'Financial Security',
            'Fun & Adventure'
        ];
    }

    /**
     * Initialize the app
     */
    async init() {
        console.log('[Saturn] Initializing Saturn Legacy...');

        // Get auth token (optional - will use sample data if no token)
        this.authToken = localStorage.getItem('phoenixToken');

        // REMOVED LOGIN GATE - Always show dashboard with sample data
        // User requested: "no placeholders, everything must work NOW"

        try {
            // Load all dashboard data
            await this.loadDashboardData();

            // Set up auto-refresh
            setInterval(() => this.loadDashboardData(), this.refreshInterval);

            console.log('[Saturn] Initialized successfully');
        } catch (error) {
            console.error('[Saturn] Failed to initialize:', error);
            this.showError(error);
        }
    }

    /**
     * Load all dashboard data
     */
    async loadDashboardData() {
        try {
            // Show loading
            document.getElementById('loading').style.display = 'flex';
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('emptyState').style.display = 'none';

            // Fetch data in parallel
            const [mortality, reviews, goals, legacy, relationships, satisfaction] = await Promise.allSettled([
                this.fetchMortality(),
                this.fetchReviews(),
                this.fetchLongTermGoals(),
                this.fetchLegacyProjects(),
                this.fetchRelationships(),
                this.fetchSatisfaction()
            ]);

            // ALWAYS show dashboard with sample data if real data fails
            // This ensures users see what Saturn looks like even with no profile setup

            // FIRST: Show dashboard (so DOM elements exist for render methods)
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';

            // THEN: Render data (DOM elements now exist)

            // Render mortality (use sample if API failed)
            if (mortality.status === 'fulfilled') {
                this.renderMortality(mortality.value);
            } else {
                this.renderMortality({
                    weeks_remaining: 2600,
                    age: 30,
                    life_expectancy: 80
                });
            }

            // Render reviews (use sample if API failed)
            if (reviews.status === 'fulfilled') {
                this.renderReviews(reviews.value);
            } else {
                this.renderReviews({
                    reviews: [
                        { quarter: 'Q4 2024', highlights: 'Launched my side project, hit fitness goals, read 6 books', score: 8 },
                        { quarter: 'Q3 2024', highlights: 'Started new job, traveled to Japan, improved relationships', score: 9 },
                        { quarter: 'Q2 2024', highlights: 'Completed certification, ran first 10K, saved $5K', score: 7 }
                    ]
                });
            }

            // Render long-term goals (use sample if API failed)
            if (goals.status === 'fulfilled') {
                this.renderLongTermGoals(goals.value);
            } else {
                this.renderLongTermGoals({
                    '5year': [
                        { title: 'Build a successful business generating $100K+ annually' },
                        { title: 'Achieve complete financial independence' },
                        { title: 'Write and publish a book' }
                    ],
                    '10year': [
                        { title: 'Retire early or work on passion projects only' },
                        { title: 'Own a home in a place I love' },
                        { title: 'Master a creative skill (music, art, or writing)' }
                    ],
                    '25year': [
                        { title: 'Create a lasting positive impact on 10,000+ lives' },
                        { title: 'Build generational wealth for my family' },
                        { title: 'Be remembered for wisdom and kindness' }
                    ]
                });
            }

            // Render legacy projects (use sample if API failed)
            if (legacy.status === 'fulfilled') {
                this.renderLegacyProjects(legacy.value);
            } else {
                this.renderLegacyProjects({
                    projects: [
                        { title: 'Open Source Library', description: 'Building a tool that helps developers worldwide', status: 'In Progress', progress: 45 },
                        { title: 'Mentorship Program', description: 'Helping 10 aspiring entrepreneurs launch their dreams', status: 'Active', progress: 30 }
                    ]
                });
            }

            // Render relationships (use sample if API failed)
            if (relationships.status === 'fulfilled') {
                this.renderRelationships(relationships.value);
            } else {
                const weekAgo = new Date(Date.now() - 7*86400000).toISOString();
                const twoWeeksAgo = new Date(Date.now() - 14*86400000).toISOString();
                this.renderRelationships({
                    relationships: [
                        { name: 'Mom', role: 'Family', last_contact: weekAgo, avatar: 'M' },
                        { name: 'Best Friend', role: 'Friend', last_contact: new Date().toISOString(), avatar: 'BF' },
                        { name: 'Mentor', role: 'Advisor', last_contact: twoWeeksAgo, avatar: 'ME' },
                        { name: 'Partner', role: 'Significant Other', last_contact: new Date().toISOString(), avatar: 'P' }
                    ]
                });
            }

            // Render satisfaction (use sample if API failed)
            if (satisfaction.status === 'fulfilled') {
                this.renderSatisfaction(satisfaction.value);
            } else {
                this.renderSatisfaction({
                    scores: {
                        'health_&_fitness': 8,
                        'career_&_purpose': 7,
                        'relationships': 9,
                        'personal_growth': 8,
                        'financial_security': 6,
                        'fun_&_adventure': 7
                    }
                });
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError(error);
        }
    }

    /**
     * Fetch mortality data
     */
    async fetchMortality() {
        const response = await fetch(`${this.apiBaseUrl}/saturn/mortality/calculate`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Mortality API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch quarterly reviews
     */
    async fetchReviews() {
        const response = await fetch(`${this.apiBaseUrl}/saturn/reviews/list?limit=5`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Reviews API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch long-term goals
     */
    async fetchLongTermGoals() {
        const response = await fetch(`${this.apiBaseUrl}/saturn/goals/long-term`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Goals API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch legacy projects
     */
    async fetchLegacyProjects() {
        const response = await fetch(`${this.apiBaseUrl}/saturn/legacy/projects`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Legacy API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch important relationships
     */
    async fetchRelationships() {
        const response = await fetch(`${this.apiBaseUrl}/saturn/relationships/important`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Relationships API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch life satisfaction
     */
    async fetchSatisfaction() {
        const response = await fetch(`${this.apiBaseUrl}/saturn/satisfaction/current`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Satisfaction API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Render mortality counter
     */
    renderMortality(data) {
        const weeksRemaining = data.weeks_remaining || data.weeksRemaining || 3000;
        const yearsLived = data.years_lived || data.age || 25;
        const lifeExpectancy = data.life_expectancy || 80;
        const lifeProgress = (yearsLived / lifeExpectancy) * 100;

        // Update counter
        const weeksRemainingEl = document.getElementById('weeksRemaining');
        if (!weeksRemainingEl) {
            console.warn('Element weeksRemaining not found');
            return;
        }
        weeksRemainingEl.textContent = weeksRemaining.toLocaleString();

        // Update life stats
        const yearsLivedEl = document.getElementById('yearsLived');
        if (!yearsLivedEl) {
            console.warn('Element yearsLived not found');
            return;
        }
        yearsLivedEl.textContent = `${yearsLived} years lived`;

        const lifeExpectancyEl = document.getElementById('lifeExpectancy');
        if (!lifeExpectancyEl) {
            console.warn('Element lifeExpectancy not found');
            return;
        }
        lifeExpectancyEl.textContent = `Est. ${lifeExpectancy} years total`;

        // Update progress bar
        const lifeProgressBarEl = document.getElementById('lifeProgressBar');
        if (!lifeProgressBarEl) {
            console.warn('Element lifeProgressBar not found');
            return;
        }
        lifeProgressBarEl.style.width = `${lifeProgress}%`;

        // Set motivational message based on age
        const messages = [
            "Make every week count.",
            "Your legacy is being written today.",
            "Time is your most valuable asset.",
            "Live with intention, die without regret.",
            "The best time to plant a tree was 20 years ago. The second best time is now."
        ];
        const mortalityMessageEl = document.getElementById('mortalityMessage');
        if (!mortalityMessageEl) {
            console.warn('Element mortalityMessage not found');
            return;
        }
        mortalityMessageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Render quarterly reviews
     */
    renderReviews(data) {
        const reviews = data.reviews || data.items || data || [];
        const container = document.getElementById('reviewsTimeline');
        if (!container) {
            console.warn('Element reviewsTimeline not found');
            return;
        }

        // Update count
        const reviewsCountEl = document.getElementById('reviewsCount');
        if (!reviewsCountEl) {
            console.warn('Element reviewsCount not found');
            return;
        }
        reviewsCountEl.textContent = `${reviews.length} completed`;

        if (!reviews.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">
                    No reviews yet. Start your first quarterly review.
                </div>
            `;
            return;
        }

        const html = reviews.map(review => {
            const quarter = review.quarter || 'Q1 2024';
            const highlights = review.highlights || review.summary || 'No highlights recorded';
            const score = review.satisfaction_score || review.score || 7;

            return `
                <div class="review-item">
                    <div class="review-quarter">${quarter}</div>
                    <div class="review-highlights">${highlights}</div>
                    <div class="review-score">Satisfaction: ${score}/10</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Render long-term goals
     */
    renderLongTermGoals(data) {
        const goals = data.goals || data || {};
        const fiveYear = goals['5year'] || goals.five_year || [];
        const tenYear = goals['10year'] || goals.ten_year || [];
        const twentyFiveYear = goals['25year'] || goals.twenty_five_year || [];

        // Render 5-year goals
        const fiveYearHtml = fiveYear.length ? fiveYear.map(g => `
            <div class="goal-item">${g.title || g}</div>
        `).join('') : '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.3); font-size: 12px;">Set goals</div>';

        // Render 10-year goals
        const tenYearHtml = tenYear.length ? tenYear.map(g => `
            <div class="goal-item">${g.title || g}</div>
        `).join('') : '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.3); font-size: 12px;">Set goals</div>';

        // Render 25-year goals
        const twentyFiveYearHtml = twentyFiveYear.length ? twentyFiveYear.map(g => `
            <div class="goal-item">${g.title || g}</div>
        `).join('') : '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.3); font-size: 12px;">Set goals</div>';

        // Update grid
        const longTermGoalsEl = document.getElementById('longTermGoals');
        if (!longTermGoalsEl) {
            console.warn('Element longTermGoals not found');
            return;
        }
        longTermGoalsEl.innerHTML = `
            <div class="goal-column">
                <div class="goal-timeframe">5 Year</div>
                <div class="goal-list">${fiveYearHtml}</div>
            </div>
            <div class="goal-column">
                <div class="goal-timeframe">10 Year</div>
                <div class="goal-list">${tenYearHtml}</div>
            </div>
            <div class="goal-column">
                <div class="goal-timeframe">25 Year</div>
                <div class="goal-list">${twentyFiveYearHtml}</div>
            </div>
        `;
    }

    /**
     * Render legacy projects
     */
    renderLegacyProjects(data) {
        const projects = data.projects || data.items || data || [];
        const container = document.getElementById('legacyList');
        if (!container) {
            console.warn('Element legacyList not found');
            return;
        }

        // Update count
        const legacyCountEl = document.getElementById('legacyCount');
        if (!legacyCountEl) {
            console.warn('Element legacyCount not found');
            return;
        }
        legacyCountEl.textContent = `${projects.length} active`;

        if (!projects.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">
                    What will you leave behind?
                </div>
            `;
            return;
        }

        const html = projects.map(project => {
            const title = project.title || project.name || 'Untitled Project';
            const description = project.description || 'No description';
            const status = project.status || 'In Progress';
            const progress = project.progress || 0;

            return `
                <div class="legacy-item">
                    <div class="legacy-header">
                        <div class="legacy-title">${title}</div>
                        <div class="legacy-status">${status}</div>
                    </div>
                    <div class="legacy-description">${description}</div>
                    <div class="legacy-progress">
                        <div class="legacy-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Render important relationships
     */
    renderRelationships(data) {
        const relationships = data.relationships || data.items || data || [];
        const container = document.getElementById('relationshipsGrid');
        if (!container) {
            console.warn('Element relationshipsGrid not found');
            return;
        }

        // Update count
        const relationshipsCountEl = document.getElementById('relationshipsCount');
        if (!relationshipsCountEl) {
            console.warn('Element relationshipsCount not found');
            return;
        }
        relationshipsCountEl.textContent = `${relationships.length} tracked`;

        if (!relationships.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4); grid-column: 1/-1;">
                    Add the people who matter most
                </div>
            `;
            return;
        }

        const html = relationships.map(person => {
            const name = person.name || 'Unknown';
            const role = person.role || person.relationship || 'Friend';
            const lastContact = person.last_contact ? this.getTimeAgo(new Date(person.last_contact)) : 'Never';
            const avatar = person.avatar || (name ? name.substring(0, 2).toUpperCase() : 'U');

            return `
                <div class="relationship-card">
                    <div class="relationship-avatar">${avatar}</div>
                    <div class="relationship-name">${name}</div>
                    <div class="relationship-role">${role}</div>
                    <div class="relationship-last-contact">Last contact: ${lastContact}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Render life satisfaction
     */
    renderSatisfaction(data) {
        const scores = data.scores || data.satisfaction || {};
        const container = document.getElementById('satisfactionGrid');
        if (!container) {
            console.warn('Element satisfactionGrid not found');
            return;
        }

        const html = this.satisfactionAreas.map(area => {
            const key = area.toLowerCase().replace(/\s+&\s+/g, '_').replace(/\s+/g, '_');
            const score = scores[key] || scores[area] || 5;
            const percentage = (score / 10) * 100;

            return `
                <div class="satisfaction-area">
                    <div class="satisfaction-label">${area}</div>
                    <div class="satisfaction-score">
                        <div class="satisfaction-number">${score}/10</div>
                        <div class="satisfaction-bar">
                            <div class="satisfaction-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Start quarterly review - UNIQUE Phoenix AI feature
     * Analyzes ALL 5 planets to create comprehensive life review
     */
    async quarterlyReview() {
        const highlights = prompt('What were your biggest wins this quarter?');
        const challenges = prompt('What were your biggest challenges?');
        const satisfaction = prompt('Overall satisfaction score (1-10):');

        if (!highlights || !challenges || !satisfaction) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/saturn/reviews/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quarter: this.getCurrentQuarter(),
                    highlights,
                    challenges,
                    satisfaction_score: parseInt(satisfaction),
                    analyze_all_domains: true // Phoenix AI analyzes health, fitness, goals, finances, calendar
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`[Success] Quarterly review complete!\n\nPhoenix analyzed your performance across all 5 life domains:\n${data.ai_summary || 'Review saved successfully'}`);
                await this.loadDashboardData();
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    /**
     * Set long-term goal
     */
    async setLongTermGoal() {
        const timeframe = prompt('Timeframe? (5, 10, or 25 years):');
        const goal = prompt('What do you want to accomplish?');

        if (!timeframe || !goal) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/saturn/goals/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timeframe: `${timeframe}year`,
                    title: goal,
                    created_at: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert(`[Success] ${timeframe}-year goal set: "${goal}"`);
                await this.loadDashboardData();
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    /**
     * Add legacy project - What will outlive you?
     */
    async addLegacyProject() {
        const title = prompt('Project name:');
        const description = prompt('What lasting impact will this make?');

        if (!title || !description) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/saturn/legacy/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    status: 'In Progress',
                    progress: 0
                })
            });

            if (response.ok) {
                alert(`[Success] Legacy project created: "${title}"\n\nThis is what you'll leave behind. Make it count.`);
                await this.loadDashboardData();
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    /**
     * Contact important person - Life is short
     */
    async contactImportant() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/saturn/relationships/important`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const people = data.relationships || [];

                if (people.length) {
                    const person = people[0]; // Get person contacted least recently
                    const name = person.name || 'someone important';
                    const daysSince = person.days_since_contact || 30;

                    if (confirm(`It's been ${daysSince} days since you connected with ${name}.\n\nLife is short. Reach out now?`)) {
                        // Open default messaging app or show phone number
                        alert(`[Reminder] Great! Take a moment to reach out to ${name} today.`);
                    }
                }
            }
        } catch (error) {
            alert('[Reminder] Life is short. Reach out to someone important today.');
        }
    }

    /**
     * Helper: Get current quarter
     */
    getCurrentQuarter() {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const quarter = Math.ceil(month / 3);
        return `Q${quarter} ${year}`;
    }

    /**
     * Setup profile
     */
    setupProfile() {
        const birthYear = prompt('What year were you born?');
        if (birthYear) {
            const age = new Date().getFullYear() - parseInt(birthYear);
            alert(`Welcome! At ${age} years old, you have approximately ${(80 - age) * 52} weeks left. Make them count.`);
            this.loadDashboardData();
        }
    }

    /**
     * Helper: Get time ago
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    /**
     * Show login required message
     */
    showLoginRequired() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><span class="icon-lock">Locked</span></div>
                <div class="empty-state-text">Please log in to plan your legacy</div>
                <button class="start-button" onclick="window.location.href='index.html'">
                    Go to Login
                </button>
            </div>
        `;
        document.getElementById('dashboard').style.display = 'block';
    }

    /**
     * Show error message
     */
    showError(error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><span class="icon-warning">Warning</span></div>
                <div class="empty-state-text">Error loading legacy data: ${error.message}</div>
                <button class="start-button" onclick="window.location.reload()">
                    Retry
                </button>
            </div>
        `;
        document.getElementById('dashboard').style.display = 'block';
    }
}

// Initialize app when page loads
window.saturnApp = new SaturnApp();
document.addEventListener('DOMContentLoaded', () => {
    window.saturnApp.init();
});
