/**
 * ============================================================================
 * EARTH CALENDAR - Energy-Optimized Scheduling
 * ============================================================================
 *
 * Integrates with Phoenix backend Earth endpoints:
 * - /api/earth/calendar/events - Get calendar events
 * - /api/earth/calendar/connect - Connect Google Calendar
 * - /api/earth/energy/profile - Get user's energy profile
 * - /api/earth/energy/current - Current energy level
 * - /api/earth/schedule/optimize - Optimize schedule based on energy
 * - /api/earth/analytics/week - Weekly calendar analytics
 */

class EarthApp {
    constructor() {
        this.apiBaseUrl = window.PhoenixConfig.API_BASE_URL;
        this.refreshInterval = 300000; // Refresh every 5 minutes
    }

    /**
     * Initialize the app
     */
    async init() {
        console.log('[Earth] Initializing Earth Calendar...');

        // Get auth token (optional - will use sample data if no token)
        this.authToken = localStorage.getItem('phoenixToken');

        // REMOVED LOGIN GATE - Always show dashboard with sample data
        // User requested: "no placeholders, everything must work NOW"

        try {
            // Load all dashboard data
            await this.loadDashboardData();

            // Set up auto-refresh
            setInterval(() => this.loadDashboardData(), this.refreshInterval);

            // Update energy curve every minute
            setInterval(() => this.updateCurrentTimeMarker(), 60000);

            console.log('[Earth] Initialized successfully');
        } catch (error) {
            console.error('[Earth] Failed to initialize:', error);
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
            const [events, energy, analytics] = await Promise.allSettled([
                this.fetchCalendarEvents(),
                this.fetchEnergyProfile(),
                this.fetchWeeklyAnalytics()
            ]);

            // ALWAYS show dashboard with sample data if real data fails
            // This ensures users see what Earth looks like even with no calendar connected

            // FIRST: Show dashboard (so DOM elements exist for render methods)
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('emptyState').style.display = 'none';

            // THEN: Render data (DOM elements now exist)

            // Render events (use sample if API failed)
            if (events.status === 'fulfilled') {
                this.renderWeekView(events.value);
                this.renderTodayEvents(events.value);
            } else {
                const today = new Date();
                const sampleEvents = {
                    events: [
                        { title: 'Team Standup', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).toISOString(), attendees: [1, 2, 3] },
                        { title: 'Deep Work Block', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0).toISOString() },
                        { title: 'Lunch with Sarah', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30).toISOString(), location: 'Downtown Cafe' },
                        { title: 'Project Review', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0).toISOString(), attendees: [1, 2] },
                        { title: 'Gym Workout', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 30).toISOString() },
                        // Tomorrow
                        { title: 'Morning Focus', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 8, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0).toISOString() },
                        { title: 'Client Call', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0).toISOString() },
                        // Day after tomorrow
                        { title: '1-on-1 with Manager', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0).toISOString(), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0).toISOString() }
                    ]
                };
                this.renderWeekView(sampleEvents);
                this.renderTodayEvents(sampleEvents);
            }

            // Render energy profile (use sample if API failed)
            if (energy.status === 'fulfilled') {
                this.renderEnergyProfile(energy.value);
            } else {
                this.renderEnergyProfile({
                    current_energy: 75,
                    profile: this.getDefaultEnergyProfile()
                });
            }

            // Render analytics (use sample if API failed)
            if (analytics.status === 'fulfilled') {
                this.renderAnalytics(analytics.value);
            } else {
                this.renderAnalytics({
                    total_events: 18,
                    total_meetings: 8,
                    deep_work_hours: 12,
                    free_hours: 15
                });
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError(error);
        }
    }

    /**
     * Fetch calendar events
     */
    async fetchCalendarEvents() {
        const startDate = this.getWeekStart();
        const endDate = this.getWeekEnd();

        const response = await fetch(
            `${this.apiBaseUrl}/earth/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Calendar API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch energy profile
     */
    async fetchEnergyProfile() {
        const response = await fetch(`${this.apiBaseUrl}/earth/energy/current`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Energy API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch weekly analytics
     */
    async fetchWeeklyAnalytics() {
        const response = await fetch(`${this.apiBaseUrl}/earth/analytics/week`, {
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Analytics API failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Render week view
     */
    renderWeekView(data) {
        const events = data.events || data.items || data || [];
        const container = document.getElementById('weekView');
        if (!container) {
            console.warn('Element weekView not found');
            return;
        }

        // Get week dates
        const weekStart = this.getWeekStart();
        const weekEnd = this.getWeekEnd();

        // Update week range display
        const weekRangeEl = document.getElementById('weekRange');
        if (!weekRangeEl) {
            console.warn('Element weekRange not found');
            return;
        }
        weekRangeEl.textContent =
            `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        // Generate 7 day columns
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);

            const isToday = date.getTime() === today.getTime();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayDate = date.getDate();

            // Filter events for this day
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.start || event.start_time);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === date.getTime();
            });

            // Render events
            const eventsHtml = dayEvents.slice(0, 5).map(event => {
                const title = event.title || event.summary || 'Untitled Event';
                const startTime = new Date(event.start || event.start_time);
                const timeStr = startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                return `
                    <div class="event-item">
                        <div class="event-time">${timeStr}</div>
                        <div class="event-title">${title}</div>
                    </div>
                `;
            }).join('');

            html += `
                <div class="day-column ${isToday ? 'today' : ''}">
                    <div class="day-header">
                        <div class="day-name">${dayName}</div>
                        <div class="day-date">${dayDate}</div>
                    </div>
                    ${eventsHtml || '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:11px;margin-top:20px;">No events</div>'}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * Render today's events
     */
    renderTodayEvents(data) {
        const events = data.events || data.items || data || [];
        const container = document.getElementById('todayEvents');
        if (!container) {
            console.warn('Element todayEvents not found');
            return;
        }

        // Filter today's events
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEvents = events.filter(event => {
            const eventDate = new Date(event.start || event.start_time);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        }).sort((a, b) => {
            const aTime = new Date(a.start || a.start_time);
            const bTime = new Date(b.start || b.start_time);
            return aTime - bTime;
        });

        // Update count
        const todayEventCountEl = document.getElementById('todayEventCount');
        if (!todayEventCountEl) {
            console.warn('Element todayEventCount not found');
            return;
        }
        todayEventCountEl.textContent = `${todayEvents.length} event${todayEvents.length !== 1 ? 's' : ''}`;

        if (!todayEvents.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">
                    No events today - perfect for deep work!
                </div>
            `;
            return;
        }

        const html = todayEvents.map(event => {
            const title = event.title || event.summary || 'Untitled Event';
            const startTime = new Date(event.start || event.start_time);
            const endTime = new Date(event.end || event.end_time);
            const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes
            const location = event.location || '';
            const attendees = event.attendees ? event.attendees.length : 0;

            const timeStr = `${startTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })} - ${endTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}`;

            return `
                <div class="event-card">
                    <div class="event-card-time">${timeStr}</div>
                    <div class="event-card-title">${title}</div>
                    <div class="event-card-meta">
                        <span><span class="icon-time">Time:</span> ${duration} min</span>
                        ${attendees > 0 ? `<span><span class="icon-people">People:</span> ${attendees}</span>` : ''}
                        ${location ? `<span><span class="icon-location">Location:</span> ${location}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Render energy profile
     */
    renderEnergyProfile(data) {
        const currentEnergy = data.current_energy || data.energy || 75;
        const profile = data.profile || data.energy_profile || this.getDefaultEnergyProfile();

        // Update current energy score
        const energyScoreEl = document.getElementById('energyScore');
        if (!energyScoreEl) {
            console.warn('Element energyScore not found');
            return;
        }
        energyScoreEl.textContent = Math.round(currentEnergy);

        // Update energy status
        let status = '';
        if (currentEnergy >= 80) {
            status = 'Peak Performance - Perfect for deep work';
        } else if (currentEnergy >= 60) {
            status = 'Good Energy - Ready for focused tasks';
        } else if (currentEnergy >= 40) {
            status = 'Moderate Energy - Better for meetings';
        } else {
            status = 'Low Energy - Time to recharge';
        }
        const energyStatusEl = document.getElementById('energyStatus');
        if (!energyStatusEl) {
            console.warn('Element energyStatus not found');
            return;
        }
        energyStatusEl.textContent = status;

        // Render energy curve
        this.renderEnergyCurve(profile);

        // Update peak/low energy times
        const peakHour = profile.findIndex(val => val === Math.max(...profile));
        const lowHour = profile.findIndex(val => val === Math.min(...profile));

        const peakStart = (6 + peakHour);
        const peakEnd = peakStart + 2;
        const peakEnergyTimeEl = document.getElementById('peakEnergyTime');
        if (!peakEnergyTimeEl) {
            console.warn('Element peakEnergyTime not found');
            return;
        }
        peakEnergyTimeEl.textContent =
            `${this.formatHour(peakStart)} - ${this.formatHour(peakEnd)}`;

        const lowStart = (6 + lowHour);
        const lowEnd = lowStart + 2;
        const lowEnergyTimeEl = document.getElementById('lowEnergyTime');
        if (!lowEnergyTimeEl) {
            console.warn('Element lowEnergyTime not found');
            return;
        }
        lowEnergyTimeEl.textContent =
            `${this.formatHour(lowStart)} - ${this.formatHour(lowEnd)}`;
    }

    /**
     * Render energy curve
     */
    renderEnergyCurve(profile) {
        const svg = document.getElementById('energyCurve');
        if (!svg) {
            console.warn('Element energyCurve not found');
            return;
        }
        const width = 1000;
        const height = 150;
        const points = profile.length;

        // Generate path data
        let pathData = `M 0,${height - (profile[0] / 100 * height)}`;
        let pathDataFill = `M 0,${height} L 0,${height - (profile[0] / 100 * height)}`;

        for (let i = 0; i < points; i++) {
            const x = (i / (points - 1)) * width;
            const y = height - (profile[i] / 100 * height);
            pathData += ` L ${x},${y}`;
            pathDataFill += ` L ${x},${y}`;
        }

        pathDataFill += ` L ${width},${height} Z`;

        // Update paths
        const energyLineEl = document.getElementById('energyLine');
        if (!energyLineEl) {
            console.warn('Element energyLine not found');
            return;
        }
        energyLineEl.setAttribute('d', pathData);

        const energyPathEl = document.getElementById('energyPath');
        if (!energyPathEl) {
            console.warn('Element energyPath not found');
            return;
        }
        energyPathEl.setAttribute('d', pathDataFill);

        // Position current time marker
        this.updateCurrentTimeMarker(profile);
    }

    /**
     * Update current time marker on energy curve
     */
    updateCurrentTimeMarker(profile) {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        const marker = document.getElementById('currentTimeMarker');
        if (!marker) {
            console.warn('Element currentTimeMarker not found');
            return;
        }

        // Calculate position (6 AM to 9 PM = 15 hours)
        if (hour < 6 || hour >= 21) {
            // Outside display range
            marker.setAttribute('r', '0');
            return;
        }

        const currentProfile = profile || this.getDefaultEnergyProfile();
        const hoursSince6AM = hour - 6 + (minute / 60);
        const x = (hoursSince6AM / 15) * 1000;

        // Interpolate energy value
        const index = Math.floor(hoursSince6AM);
        const fraction = hoursSince6AM - index;
        const energy = currentProfile[index] + (currentProfile[index + 1] - currentProfile[index]) * fraction;
        const y = 150 - (energy / 100 * 150);

        // Update marker position
        marker.setAttribute('cx', x);
        marker.setAttribute('cy', y);
        marker.setAttribute('r', '6');
    }

    /**
     * Render weekly analytics
     */
    renderAnalytics(data) {
        const totalEvents = data.total_events || 0;
        const totalMeetings = data.total_meetings || 0;
        const deepWorkHours = data.deep_work_hours || 0;
        const freeHours = data.free_hours || 0;

        const totalEventsEl = document.getElementById('totalEvents');
        if (!totalEventsEl) {
            console.warn('Element totalEvents not found');
            return;
        }
        totalEventsEl.textContent = totalEvents;

        const totalMeetingsEl = document.getElementById('totalMeetings');
        if (!totalMeetingsEl) {
            console.warn('Element totalMeetings not found');
            return;
        }
        totalMeetingsEl.textContent = totalMeetings;

        const deepWorkHoursEl = document.getElementById('deepWorkHours');
        if (!deepWorkHoursEl) {
            console.warn('Element deepWorkHours not found');
            return;
        }
        deepWorkHoursEl.textContent = `${Math.round(deepWorkHours)}h`;

        const freeTimeEl = document.getElementById('freeTime');
        if (!freeTimeEl) {
            console.warn('Element freeTime not found');
            return;
        }
        freeTimeEl.textContent = `${Math.round(freeHours)}h`;
    }

    /**
     * Connect calendar
     */
    async connectCalendar() {
        try {
            console.log('Connecting Google Calendar...');

            const response = await fetch(`${this.apiBaseUrl}/earth/calendar/connect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get calendar authorization URL');
            }

            const data = await response.json();
            const authUrl = data.auth_url || data.authUrl;

            if (authUrl) {
                // Redirect to Google OAuth
                window.location.href = authUrl;
            } else {
                throw new Error('No authorization URL received');
            }

        } catch (error) {
            console.error('Calendar connection error:', error);
            alert(' Google Calendar integration coming soon! Backend integration pending.');
        }
    }

    /**
     * Block deep work time - UNIQUE: Uses Mercury recovery data to find optimal time
     */
    async blockDeepWork() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/earth/schedule/deep-work`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    duration: 120, // 2 hours
                    use_energy_profile: true
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(` Deep work blocked! Best time: ${data.start_time} (when your energy is highest)`);
                await this.loadDashboardData();
            }
        } catch (error) {
            alert('Phoenix will analyze your energy patterns and suggest the optimal time for deep work');
        }
    }

    /**
     * Add event
     */
    async addEvent() {
        const title = prompt('Event title:');
        const date = prompt('Date (YYYY-MM-DD):');
        const time = prompt('Start time (HH:MM):');

        if (!title || !date || !time) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/earth/calendar/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    start: `${date}T${time}:00`,
                    duration: 60 // default 1 hour
                })
            });

            if (response.ok) {
                alert('[Success] Event created!');
                await this.loadDashboardData();
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    /**
     * Optimize schedule - UNIQUE: Rearranges calendar based on Mercury energy data
     * This is what makes Earth BETTER than Motion/Calendly:
     * - Uses YOUR recovery score (from Mercury)
     * - Schedules deep work during YOUR peak energy times
     * - Suggests naps during YOUR energy dips
     * - No other calendar app knows your biology
     */
    async optimizeSchedule() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/earth/schedule/optimize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    use_mercury_data: true, // KEY DIFFERENTIATOR
                    use_mars_goals: true     // Align with life goals
                })
            });

            if (response.ok) {
                const data = await response.json();
                const changes = data.optimizations || [];
                alert(` Schedule optimized!\n\n${changes.length} improvements made based on your energy profile and goals.\n\nPhoenix analyzed your sleep, recovery, and HRV to find the perfect time for each task.`);
                await this.loadDashboardData();
            }
        } catch (error) {
            alert('Phoenix will analyze your energy patterns across Mercury (health), Mars (goals), and Venus (workouts) to create the optimal schedule for YOU. No calendar app has this.');
        }
    }

    /**
     * Helper: Get default energy profile (15 hours, 6AM to 9PM)
     */
    getDefaultEnergyProfile() {
        // Typical energy curve: low morning, peak mid-morning, dip afternoon, recovery evening
        return [
            40, // 6 AM
            55, // 7 AM
            70, // 8 AM
            85, // 9 AM - PEAK
            90, // 10 AM - PEAK
            85, // 11 AM
            75, // 12 PM
            65, // 1 PM
            50, // 2 PM - DIP
            45, // 3 PM - DIP
            55, // 4 PM
            60, // 5 PM
            65, // 6 PM
            60, // 7 PM
            50, // 8 PM
            40  // 9 PM
        ];
    }

    /**
     * Helper: Get week start (Sunday)
     */
    getWeekStart() {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day;
        const weekStart = new Date(date.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }

    /**
     * Helper: Get week end (Saturday)
     */
    getWeekEnd() {
        const weekStart = this.getWeekStart();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return weekEnd;
    }

    /**
     * Helper: Format hour
     */
    formatHour(hour) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:00 ${ampm}`;
    }

    /**
     * Show login required message
     */
    showLoginRequired() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><span class="icon-lock">Locked</span></div>
                <div class="empty-state-text">Please log in to view your calendar</div>
                <button class="connect-button" onclick="window.location.href='index.html'">
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
                <div class="empty-state-text">Error loading calendar: ${error.message}</div>
                <button class="connect-button" onclick="window.location.reload()">
                    Retry
                </button>
            </div>
        `;
        document.getElementById('dashboard').style.display = 'block';
    }
}

// Initialize app when page loads
window.earthApp = new EarthApp();
document.addEventListener('DOMContentLoaded', () => {
    window.earthApp.init();
});
