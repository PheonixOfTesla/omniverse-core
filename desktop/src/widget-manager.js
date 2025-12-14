/* ============================================
   PHOENIX WIDGET MANAGER - CONSCIOUS
   Dynamic widget system for dashboard
   Priority-based layout, organic animations, consciousness integration

   FEATURES:
   - Priority-based positioning (most important = most prominent)
   - CSS classes instead of inline styles (faster rendering)
   - Parallel widget creation (instant display)
   - Widget pooling (reuse instead of destroy/create)
   - Organic animations (breathe, flow, pulse)
   - Consciousness integration (orchestration-driven)
   ============================================ */

class WidgetManager {
    constructor() {
        this.activeWidgets = new Map();
        this.widgetPool = new Map(); // Pooled widgets for reuse
        this.widgetActions = new Map(); // Store widget actions for custom widgets
        this.widgetContainer = null;
        this.currentOrchestration = null;
        this.minimizedWidgets = new Map(); // Track minimized widgets
        this.widgetPositions = new Map(); // Track custom positions

        // ORBITAL WIDGET SYSTEM - Widgets orbit around the central Phoenix orb
        this.orbitalPositions = [
            { name: 'top', css: 'top: 8%; left: 50%; transform: translateX(-50%);' },
            { name: 'right', css: 'top: 45%; right: 3%; transform: translateY(-50%);' },
            { name: 'bottom', css: 'bottom: 12%; left: 50%; transform: translateX(-50%);' },
            { name: 'left', css: 'top: 45%; left: 3%; transform: translateY(-50%);' },
            { name: 'top-right', css: 'top: 15%; right: 8%;' },
            { name: 'top-left', css: 'top: 15%; left: 8%;' },
            { name: 'bottom-right', css: 'bottom: 18%; right: 8%;' },
            { name: 'bottom-left', css: 'bottom: 18%; left: 8%;' }
        ];
        this.orbitalWidgets = new Map(); // widgetId → position name
        this.init();
    }

    init() {
        // Create widget container if it doesn't exist
        this.createWidgetContainer();
        // Create dock bar for minimized widgets
        this.createDockBar();
        // Load saved widget layout
        this.loadWidgetLayout();
        // Make existing HUD elements manageable
        this.initializeHUDWidgets();

        // Listen for restore events from Phoenix Dock
        window.addEventListener('phoenix:restore-widget', (e) => {
            if (e.detail && e.detail.widgetId) {
                this.restoreWidget(e.detail.widgetId);
            }
        });

        console.log('Widget Manager initialized (optimized + drag/minimize)');
    }

    /* ============================================
       CREATE DOCK BAR FOR MINIMIZED WIDGETS
       ============================================ */
    createDockBar() {
        let dock = document.getElementById('widget-dock');
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'widget-dock';
            dock.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 8px;
                padding: 8px 15px;
                background: rgba(0, 10, 20, 0.95);
                border: 2px solid rgba(0, 217, 255, 0.4);
                border-bottom: none;
                border-radius: 15px 15px 0 0;
                z-index: 9999;
                backdrop-filter: blur(15px);
                box-shadow: 0 -5px 30px rgba(0, 217, 255, 0.3);
                min-height: 40px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(dock);
        }
        this.dockBar = dock;
    }

    /* ============================================
       ORBITAL WIDGET SYSTEM - Widgets orbit around the Phoenix orb
       ============================================ */

    // Get next available orbital position
    getNextOrbitalPosition() {
        const usedPositions = new Set(this.orbitalWidgets.values());
        for (const pos of this.orbitalPositions) {
            if (!usedPositions.has(pos.name)) {
                return pos;
            }
        }
        // All positions used, return first position (will stack)
        return this.orbitalPositions[0];
    }

    // Show an orbital widget around the Phoenix orb
    showOrbitalWidget(widgetType, data = {}, preferredPosition = null) {
        console.log(`🌐 [Orbital] Showing widget: ${widgetType}`);

        // Check if this widget type is already showing
        const existingWidget = document.querySelector(`[data-orbital-type="${widgetType}"]`);
        if (existingWidget) {
            // Update existing widget's data
            const content = this.renderOrbitalContent(widgetType, data);
            existingWidget.querySelector('.orbital-content').innerHTML = content;
            this.pulseWidget(existingWidget);
            return existingWidget;
        }

        // Get orbital position
        let position;
        if (preferredPosition) {
            position = this.orbitalPositions.find(p => p.name === preferredPosition) || this.getNextOrbitalPosition();
        } else {
            position = this.getNextOrbitalPosition();
        }

        // Create orbital widget
        const widget = document.createElement('div');
        widget.className = 'orbital-widget';
        widget.dataset.orbitalType = widgetType;
        widget.dataset.position = position.name;

        // Orbital widget styling
        widget.style.cssText = `
            position: fixed;
            ${position.css}
            width: 320px;
            max-width: 90vw;
            max-height: 50vh;
            background: rgba(0, 10, 20, 0.95);
            border: 2px solid rgba(0, 217, 255, 0.6);
            border-radius: 16px;
            padding: 16px;
            z-index: 9998;
            backdrop-filter: blur(20px);
            box-shadow: 0 0 40px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.1);
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
            overflow-y: auto;
        `;

        // Widget content
        const content = this.renderOrbitalContent(widgetType, data);
        widget.innerHTML = `
            <div class="orbital-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span class="orbital-title" style="color:#00d9ff;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:1px;">${this.getWidgetTitle(widgetType)}</span>
                <button onclick="window.widgetManager.closeOrbitalWidget('${widgetType}')" style="background:none;border:none;color:#00d9ff;font-size:20px;cursor:pointer;opacity:0.7;transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">×</button>
            </div>
            <div class="orbital-content">${content}</div>
        `;

        document.body.appendChild(widget);
        this.orbitalWidgets.set(widgetType, position.name);

        // Animate in
        requestAnimationFrame(() => {
            widget.style.opacity = '1';
            widget.style.transform = 'scale(1)';
        });

        // Apply breathing animation if available
        if (window.organicMotion) {
            setTimeout(() => {
                window.organicMotion.breathe(widget, { type: 'glow', intensity: 0.3 });
            }, 300);
        }

        console.log(`🌐 [Orbital] Widget "${widgetType}" shown at position: ${position.name}`);
        return widget;
    }

    // Close an orbital widget
    closeOrbitalWidget(widgetType) {
        const widget = document.querySelector(`[data-orbital-type="${widgetType}"]`);
        if (widget) {
            widget.style.opacity = '0';
            widget.style.transform = 'scale(0.8)';
            setTimeout(() => {
                widget.remove();
                this.orbitalWidgets.delete(widgetType);
            }, 300);
        }
    }

    // Close all orbital widgets
    closeAllOrbitalWidgets() {
        document.querySelectorAll('.orbital-widget').forEach(widget => {
            widget.style.opacity = '0';
            widget.style.transform = 'scale(0.8)';
            setTimeout(() => widget.remove(), 300);
        });
        this.orbitalWidgets.clear();
    }

    // Pulse animation for updates
    pulseWidget(widget) {
        widget.style.boxShadow = '0 0 60px rgba(0, 217, 255, 0.6), inset 0 0 30px rgba(0, 217, 255, 0.2)';
        setTimeout(() => {
            widget.style.boxShadow = '0 0 40px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.1)';
        }, 500);
    }

    // Get friendly widget title
    getWidgetTitle(widgetType) {
        const titles = {
            'email': '📧 EMAILS',
            'calendar': '📅 CALENDAR',
            'tasks': '✅ TASKS',
            'contacts': '👥 CONTACTS',
            'drive': '📁 DRIVE',
            'health': '❤️ HEALTH',
            'health-recovery': '💚 RECOVERY',
            'health-hrv': '💓 HRV',
            'health-sleep': '😴 SLEEP',
            'finance': '💰 FINANCE',
            'goals': '🎯 GOALS',
            'workout': '💪 WORKOUT',
            'preview-health': '❤️ HEALTH',
            'preview-finance': '💰 FINANCE',
            'preview-calendar': '📅 CALENDAR',
            'preview-fitness': '💪 FITNESS',
            'preview-goals': '🎯 GOALS'
        };
        return titles[widgetType] || widgetType.toUpperCase();
    }

    // Render orbital widget content based on type
    renderOrbitalContent(widgetType, data) {
        // Descriptive/Preview widgets (for planning mode)
        if (widgetType.startsWith('preview-')) {
            return this.renderPreviewWidget(widgetType, data);
        }

        // Data widgets
        switch(widgetType) {
            case 'email':
                return this.renderEmailWidget(data);
            case 'calendar':
                return this.renderCalendarWidget(data);
            case 'tasks':
                return this.renderTasksWidget(data);
            case 'contacts':
                return this.renderContactsWidget(data);
            case 'drive':
                return this.renderDriveWidget(data);
            case 'health':
            case 'health-recovery':
                return this.renderHealthWidget(data);
            case 'finance':
                return this.renderFinanceWidget(data);
            case 'goals':
                return this.renderGoalsWidget(data);
            default:
                return `<div style="color:#fff;">Loading ${widgetType}...</div>`;
        }
    }

    // PREVIEW WIDGETS (Descriptive - for planning/onboarding)
    renderPreviewWidget(widgetType, data) {
        const previews = {
            'preview-health': `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:48px;margin-bottom:15px;animation:heartbeat 1.5s infinite;">❤️</div>
                    <div style="color:#00ff88;font-size:18px;margin-bottom:10px;">Health Tracking</div>
                    <div style="color:#aaa;font-size:13px;">Monitor your HRV, sleep quality, recovery score, and heart rate in real-time</div>
                </div>`,
            'preview-finance': `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:48px;margin-bottom:15px;animation:coinFlip 2s infinite;">💰</div>
                    <div style="color:#00ff88;font-size:18px;margin-bottom:10px;">Financial Control</div>
                    <div style="color:#aaa;font-size:13px;">Track spending, manage budgets, and grow your savings automatically</div>
                </div>`,
            'preview-calendar': `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:48px;margin-bottom:15px;">📅</div>
                    <div style="color:#00ff88;font-size:18px;margin-bottom:10px;">Smart Scheduling</div>
                    <div style="color:#aaa;font-size:13px;">Manage your calendar, meetings, and events with voice commands</div>
                </div>`,
            'preview-fitness': `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:48px;margin-bottom:15px;animation:muscleFlip 1s infinite;">💪</div>
                    <div style="color:#00ff88;font-size:18px;margin-bottom:10px;">Fitness Plans</div>
                    <div style="color:#aaa;font-size:13px;">Get personalized workout plans, track progress, and optimize your training</div>
                </div>`,
            'preview-goals': `
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:48px;margin-bottom:15px;">🎯</div>
                    <div style="color:#00ff88;font-size:18px;margin-bottom:10px;">Goal Setting</div>
                    <div style="color:#aaa;font-size:13px;">Set goals, build habits, and track your progress toward the life you want</div>
                </div>`
        };
        return previews[widgetType] || `<div style="color:#fff;">Preview: ${widgetType}</div>`;
    }

    // EMAIL WIDGET
    renderEmailWidget(data) {
        const emails = data.emails || data.messages || [];
        if (!emails.length) {
            return '<div style="color:#aaa;text-align:center;padding:20px;">No recent emails</div>';
        }
        return emails.slice(0, 5).map(email => `
            <div style="padding:12px;border-bottom:1px solid rgba(0,217,255,0.2);cursor:pointer;" onmouseover="this.style.background='rgba(0,217,255,0.1)'" onmouseout="this.style.background='transparent'">
                <div style="color:#00d9ff;font-size:13px;margin-bottom:4px;">${email.from || email.sender || 'Unknown'}</div>
                <div style="color:#fff;font-size:14px;font-weight:500;margin-bottom:4px;">${email.subject || 'No subject'}</div>
                <div style="color:#888;font-size:12px;">${email.snippet || email.preview || ''}</div>
            </div>
        `).join('');
    }

    // CALENDAR WIDGET
    renderCalendarWidget(data) {
        const events = data.events || [];
        if (!events.length) {
            return '<div style="color:#aaa;text-align:center;padding:20px;">No upcoming events</div>';
        }
        return events.slice(0, 5).map(event => `
            <div style="padding:12px;border-left:3px solid #00ff88;margin-bottom:8px;background:rgba(0,255,136,0.05);">
                <div style="color:#00ff88;font-size:12px;">${this.formatEventTime(event.start)}</div>
                <div style="color:#fff;font-size:14px;font-weight:500;">${event.summary || event.title || 'Event'}</div>
                ${event.location ? `<div style="color:#888;font-size:12px;">📍 ${event.location}</div>` : ''}
            </div>
        `).join('');
    }

    // TASKS WIDGET
    renderTasksWidget(data) {
        const tasks = data.tasks || data.items || data.taskLists || [];
        if (!tasks.length) {
            return '<div style="color:#aaa;text-align:center;padding:20px;">No tasks</div>';
        }
        return tasks.slice(0, 6).map(task => `
            <div style="padding:10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(0,217,255,0.1);">
                <div style="width:18px;height:18px;border:2px solid #ffaa00;border-radius:4px;flex-shrink:0;"></div>
                <div style="color:#fff;font-size:14px;">${task.title || task.name || 'Task'}</div>
            </div>
        `).join('');
    }

    // CONTACTS WIDGET
    renderContactsWidget(data) {
        const contacts = data.contacts || data.connections || [];
        if (!contacts.length) {
            return '<div style="color:#aaa;text-align:center;padding:20px;">No contacts</div>';
        }
        return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
            ${contacts.slice(0, 6).map(contact => `
                <div style="padding:10px;background:rgba(0,217,255,0.05);border-radius:8px;text-align:center;">
                    <div style="width:40px;height:40px;background:rgba(0,217,255,0.2);border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#00d9ff;">${(contact.name || 'U')[0].toUpperCase()}</div>
                    <div style="color:#fff;font-size:13px;">${contact.name || contact.displayName || 'Contact'}</div>
                </div>
            `).join('')}
        </div>`;
    }

    // DRIVE WIDGET
    renderDriveWidget(data) {
        const files = data.files || [];
        if (!files.length) {
            return '<div style="color:#aaa;text-align:center;padding:20px;">No recent files</div>';
        }
        return files.slice(0, 5).map(file => `
            <div style="padding:10px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(0,217,255,0.1);cursor:pointer;" onmouseover="this.style.background='rgba(0,217,255,0.1)'" onmouseout="this.style.background='transparent'">
                <div style="font-size:20px;">${this.getFileIcon(file.mimeType)}</div>
                <div style="color:#fff;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name || 'File'}</div>
            </div>
        `).join('');
    }

    // HEALTH WIDGET
    renderHealthWidget(data) {
        const recovery = data.recoveryScore || data.recovery || 75;
        const hrv = data.hrv || data.heartRateVariability || 45;
        const sleep = data.sleepHours || data.sleep || 7.2;
        return `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;text-align:center;">
                <div>
                    <div style="font-size:28px;color:#00ff88;font-weight:bold;">${recovery}%</div>
                    <div style="color:#888;font-size:11px;">RECOVERY</div>
                </div>
                <div>
                    <div style="font-size:28px;color:#00d9ff;font-weight:bold;">${hrv}ms</div>
                    <div style="color:#888;font-size:11px;">HRV</div>
                </div>
                <div>
                    <div style="font-size:28px;color:#aa88ff;font-weight:bold;">${sleep}h</div>
                    <div style="color:#888;font-size:11px;">SLEEP</div>
                </div>
            </div>
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(0,217,255,0.2);color:#aaa;font-size:12px;text-align:center;">
                ${recovery >= 70 ? '💚 Ready for high intensity' : recovery >= 50 ? '🟡 Moderate activity recommended' : '🔴 Rest day advised'}
            </div>
        `;
    }

    // FINANCE WIDGET
    renderFinanceWidget(data) {
        const budget = data.budgetRemaining || data.budget || 450;
        const spent = data.spent || data.spending || 320;
        const savings = data.savings || 1250;
        return `
            <div style="margin-bottom:15px;">
                <div style="color:#888;font-size:12px;margin-bottom:5px;">BUDGET REMAINING</div>
                <div style="font-size:32px;color:#00ff88;font-weight:bold;">$${budget}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div style="background:rgba(255,100,100,0.1);padding:12px;border-radius:8px;">
                    <div style="color:#ff6666;font-size:20px;font-weight:bold;">$${spent}</div>
                    <div style="color:#888;font-size:11px;">SPENT</div>
                </div>
                <div style="background:rgba(0,255,136,0.1);padding:12px;border-radius:8px;">
                    <div style="color:#00ff88;font-size:20px;font-weight:bold;">$${savings}</div>
                    <div style="color:#888;font-size:11px;">SAVINGS</div>
                </div>
            </div>
        `;
    }

    // GOALS WIDGET
    renderGoalsWidget(data) {
        const goals = data.goals || [
            { name: 'Fitness', progress: 65 },
            { name: 'Savings', progress: 40 },
            { name: 'Reading', progress: 80 }
        ];
        return goals.slice(0, 4).map(goal => `
            <div style="margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span style="color:#fff;font-size:13px;">${goal.name}</span>
                    <span style="color:#00d9ff;font-size:13px;">${goal.progress}%</span>
                </div>
                <div style="height:6px;background:rgba(0,217,255,0.2);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${goal.progress}%;background:linear-gradient(90deg,#00d9ff,#00ff88);border-radius:3px;"></div>
                </div>
            </div>
        `).join('');
    }

    // Helper: Format event time
    formatEventTime(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString.dateTime || dateString);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch {
            return dateString;
        }
    }

    // Helper: Get file icon based on MIME type
    getFileIcon(mimeType) {
        if (!mimeType) return '📄';
        if (mimeType.includes('folder')) return '📁';
        if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📑';
        if (mimeType.includes('image')) return '🖼️';
        if (mimeType.includes('pdf')) return '📕';
        return '📄';
    }

    /* ============================================
       INITIALIZE EXISTING HUD WIDGETS
       ============================================ */
    initializeHUDWidgets() {
        // Find all existing HUD elements that should be manageable
        const hudElements = [
            { id: 'hud-tl', name: 'Time & Weather', icon: '🕐' },
            { id: 'sleep-widget', name: 'Sleep', icon: '😴' },
            { id: 'schedule-widget', name: 'Schedule', icon: '📅' },
            { id: 'goal-panel', name: 'Goals', icon: '🎯' }
        ];

        // Also find any elements with class containing 'widget' or 'hud'
        document.querySelectorAll('[id*="widget"], [id*="hud"], [class*="widget-panel"]').forEach(el => {
            if (el.id && !hudElements.find(h => h.id === el.id)) {
                hudElements.push({ id: el.id, name: el.id.replace(/-/g, ' '), icon: '📦' });
            }
        });

        // Wait for DOM to be ready, then add controls
        setTimeout(() => {
            hudElements.forEach(config => {
                const element = document.getElementById(config.id);
                if (element) {
                    this.addWidgetControls(element, config);
                }
            });
        }, 1000);
    }

    /* ============================================
       ADD CONTROLS TO ANY WIDGET
       ============================================ */
    addWidgetControls(element, config) {
        // Skip if already has controls
        if (element.querySelector('.widget-controls')) return;

        // Store original position for restoration
        const rect = element.getBoundingClientRect();
        element.dataset.originalTop = element.style.top || rect.top + 'px';
        element.dataset.originalLeft = element.style.left || rect.left + 'px';
        element.dataset.widgetName = config.name;
        element.dataset.widgetIcon = config.icon;

        // Make sure element is positioned
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'fixed';
        }

        // Ensure pointer events work
        element.style.pointerEvents = 'auto';

        // Create controls container
        const controls = document.createElement('div');
        controls.className = 'widget-controls';
        controls.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            display: flex;
            gap: 4px;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        // Minimize button
        const minBtn = document.createElement('button');
        minBtn.innerHTML = '−';
        minBtn.title = 'Minimize';
        minBtn.style.cssText = `
            width: 20px;
            height: 20px;
            background: rgba(0, 217, 255, 0.2);
            border: 1px solid rgba(0, 217, 255, 0.5);
            border-radius: 4px;
            color: #00d9ff;
            cursor: pointer;
            font-size: 14px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        minBtn.onclick = (e) => {
            e.stopPropagation();
            this.minimizeWidget(element.id);
        };

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close';
        closeBtn.style.cssText = minBtn.style.cssText;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.closeWidget(element.id);
        };

        controls.appendChild(minBtn);
        controls.appendChild(closeBtn);
        element.appendChild(controls);

        // Show controls on hover
        element.addEventListener('mouseenter', () => {
            controls.style.opacity = '1';
        });
        element.addEventListener('mouseleave', () => {
            controls.style.opacity = '0';
        });

        // Make draggable
        this.makeDraggable(element);

        // Make resizable
        this.makeResizable(element);
    }

    /* ============================================
       MAKE ELEMENT DRAGGABLE
       ============================================ */
    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        const onMouseDown = (e) => {
            // Don't drag if clicking a button
            if (e.target.tagName === 'BUTTON') return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = element.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            element.style.cursor = 'grabbing';
            element.style.transition = 'none';
            element.style.zIndex = '10000';

            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            element.style.left = (startLeft + deltaX) + 'px';
            element.style.top = (startTop + deltaY) + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.transform = 'none';
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;

            element.style.cursor = 'grab';
            element.style.transition = '';
            element.style.zIndex = '';

            // Save position
            this.widgetPositions.set(element.id, {
                left: element.style.left,
                top: element.style.top
            });
            this.saveWidgetLayout();
        };

        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        element.style.cursor = 'grab';
    }

    /* ============================================
       MAKE ELEMENT RESIZABLE
       ============================================ */
    makeResizable(element) {
        // Add resize handles
        const handles = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

        handles.forEach(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${direction}`;
            handle.dataset.direction = direction;
            element.appendChild(handle);

            let isResizing = false;
            let startX, startY, startWidth, startHeight, startLeft, startTop;

            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // Prevent dragging while resizing
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(getComputedStyle(element).width, 10);
                startHeight = parseInt(getComputedStyle(element).height, 10);
                startLeft = element.offsetLeft;
                startTop = element.offsetTop;

                element.style.transition = 'none';

                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', resizeEnd);
            });

            const resize = (e) => {
                if (!isResizing) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                // Handle different resize directions
                if (direction.includes('right')) {
                    element.style.width = (startWidth + dx) + 'px';
                }
                if (direction.includes('left')) {
                    element.style.width = (startWidth - dx) + 'px';
                    element.style.left = (startLeft + dx) + 'px';
                }
                if (direction.includes('bottom')) {
                    element.style.height = (startHeight + dy) + 'px';
                }
                if (direction.includes('top')) {
                    element.style.height = (startHeight - dy) + 'px';
                    element.style.top = (startTop + dy) + 'px';
                }

                // Clear max constraints during resize
                element.style.maxWidth = 'none';
                element.style.maxHeight = 'none';
            };

            const resizeEnd = () => {
                isResizing = false;
                element.style.transition = '';
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', resizeEnd);
                this.saveWidgetLayout();
            };
        });
    }

    /* ============================================
       MINIMIZE WIDGET TO DOCK
       ============================================ */
    minimizeWidget(widgetId) {
        const widget = document.getElementById(widgetId);
        if (!widget) return;

        // Gather widget data
        const widgetData = {
            title: widget.dataset.widgetName || widget.querySelector('.widget-header')?.textContent || widgetId,
            icon: widget.dataset.widgetIcon || '📦',
            color: widget.dataset.widgetColor || '#00d9ff',
            html: widget.innerHTML,
            style: widget.style.cssText
        };

        // Hide widget (don't remove from DOM, just hide)
        widget.style.display = 'none';
        widget.classList.add('minimized-to-dock');

        // Use new Phoenix Dock system
        if (window.minimizeWidgetToDock) {
            window.minimizeWidgetToDock(widgetId, widgetData);
        } else {
            // Fallback: use old dock system
            this.minimizedWidgets.set(widgetId, widgetData);
            this.addToDock(widgetId);
        }

        this.saveWidgetLayout();
        console.log(`[WidgetManager] Minimized: ${widgetId}`);
    }

    /* ============================================
       ADD WIDGET ICON TO DOCK
       ============================================ */
    addToDock(widgetId) {
        const info = this.minimizedWidgets.get(widgetId);
        if (!info) return;

        // Create dock icon
        const dockIcon = document.createElement('div');
        dockIcon.id = `dock-${widgetId}`;
        dockIcon.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px 10px;
            background: rgba(0, 217, 255, 0.1);
            border: 1px solid rgba(0, 217, 255, 0.3);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        dockIcon.innerHTML = `
            <span style="font-size: 18px">${info.icon}</span>
            <span style="font-size: 9px; color: #00d9ff; white-space: nowrap; max-width: 60px; overflow: hidden; text-overflow: ellipsis">${info.name}</span>
        `;

        // Click to restore
        dockIcon.onclick = () => this.restoreWidget(widgetId);

        // Hover effect
        dockIcon.onmouseenter = () => {
            dockIcon.style.background = 'rgba(0, 217, 255, 0.2)';
            dockIcon.style.transform = 'translateY(-3px)';
        };
        dockIcon.onmouseleave = () => {
            dockIcon.style.background = 'rgba(0, 217, 255, 0.1)';
            dockIcon.style.transform = '';
        };

        this.dockBar.appendChild(dockIcon);
    }

    /* ============================================
       RESTORE WIDGET FROM DOCK
       ============================================ */
    restoreWidget(widgetId) {
        const widget = document.getElementById(widgetId);
        const dockIcon = document.getElementById(`dock-${widgetId}`);

        if (widget) {
            widget.style.display = '';
        }

        if (dockIcon) {
            dockIcon.remove();
        }

        this.minimizedWidgets.delete(widgetId);

        // Hide dock if empty
        if (this.dockBar.children.length === 0) {
            this.dockBar.style.opacity = '0';
            this.dockBar.style.pointerEvents = 'none';
        }

        this.saveWidgetLayout();
        console.log(`[WidgetManager] Restored: ${widgetId}`);
    }

    /* ============================================
       CLOSE WIDGET COMPLETELY
       ============================================ */
    closeWidget(widgetId) {
        const widget = document.getElementById(widgetId);
        if (!widget) return;

        // Animate out
        widget.style.transition = 'opacity 0.3s, transform 0.3s';
        widget.style.opacity = '0';
        widget.style.transform = 'scale(0.8)';

        setTimeout(() => {
            widget.style.display = 'none';
        }, 300);

        // Track closed widgets
        const closedWidgets = JSON.parse(localStorage.getItem('phoenix_closed_widgets') || '[]');
        if (!closedWidgets.includes(widgetId)) {
            closedWidgets.push(widgetId);
            localStorage.setItem('phoenix_closed_widgets', JSON.stringify(closedWidgets));
        }

        console.log(`[WidgetManager] Closed: ${widgetId}`);
    }

    /* ============================================
       SAVE/LOAD WIDGET LAYOUT
       ============================================ */
    saveWidgetLayout() {
        const layout = {
            positions: Object.fromEntries(this.widgetPositions),
            minimized: Array.from(this.minimizedWidgets.keys())
        };
        localStorage.setItem('phoenix_widget_layout', JSON.stringify(layout));
    }

    loadWidgetLayout() {
        try {
            const saved = localStorage.getItem('phoenix_widget_layout');
            if (!saved) return;

            const layout = JSON.parse(saved);

            // Restore positions
            if (layout.positions) {
                Object.entries(layout.positions).forEach(([widgetId, pos]) => {
                    this.widgetPositions.set(widgetId, pos);
                    setTimeout(() => {
                        const widget = document.getElementById(widgetId);
                        if (widget && pos.left && pos.top) {
                            widget.style.left = pos.left;
                            widget.style.top = pos.top;
                            widget.style.right = 'auto';
                            widget.style.transform = 'none';
                        }
                    }, 1500);
                });
            }

            // Restore minimized state
            if (layout.minimized) {
                setTimeout(() => {
                    layout.minimized.forEach(widgetId => {
                        const widget = document.getElementById(widgetId);
                        if (widget) {
                            this.minimizeWidget(widgetId);
                        }
                    });
                }, 2000);
            }

            console.log('[WidgetManager] Layout restored from localStorage');
        } catch (e) {
            console.warn('[WidgetManager] Failed to restore layout:', e);
        }
    }

    /* ============================================
       CREATE WIDGET CONTAINER
       ============================================ */
    createWidgetContainer() {
        // Check if container already exists
        let container = document.getElementById('phoenix-widget-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'phoenix-widget-container';
            document.body.appendChild(container);
        }

        this.widgetContainer = container;
    }

    /* ============================================
       DISPLAY WIDGETS FROM ORCHESTRATION (CONSCIOUS)
       ============================================ */
    async displayFromOrchestration(orchestration) {
        if (!orchestration || !orchestration.layout) return;

        console.log('[WidgetManager] Displaying from orchestration:', orchestration);

        this.currentOrchestration = orchestration;

        // Hide widgets marked for hiding
        if (orchestration.layout.hidden) {
            orchestration.layout.hidden.forEach(widgetId => {
                this.removeWidget(widgetId);
            });
        }

        // Display widgets with priorities
        if (orchestration.layout.widgets) {
            const widgetPromises = orchestration.layout.widgets.map(widgetConfig =>
                this.createWidgetWithPriority(widgetConfig)
            );

            await Promise.all(widgetPromises);
        }

        // Apply dimming to low-priority widgets
        if (orchestration.layout.dimmed) {
            orchestration.layout.dimmed.forEach(widgetId => {
                const widget = this.activeWidgets.get(widgetId);
                if (widget) {
                    widget.style.opacity = '0.5';
                }
            });
        }

        console.log('[WidgetManager] Orchestration complete');
    }

    /* ============================================
       CREATE WIDGET WITH PRIORITY (CONSCIOUS)
       ============================================ */
    async createWidgetWithPriority(widgetConfig) {
        const { id, position, size, urgency, priority } = widgetConfig;

        // Try to get widget from pool first
        let widget = this.getFromPool(id);

        if (!widget) {
            // Create new widget if none in pool
            widget = document.createElement('div');
            widget.id = `widget-${id}`;
            widget.className = 'phoenix-widget';
            widget.dataset.widgetType = id;
        }

        // Update widget content with close button
        const content = this.renderWidgetContent(id, widgetConfig.data || {});
        widget.innerHTML = `
            <button class="widget-close-btn" onclick="window.widgetManager.removeWidget('${id}')" aria-label="Close widget">×</button>
            ${content}
        `;

        // Apply priority-based classes
        widget.dataset.priority = priority;
        widget.dataset.urgency = urgency;
        widget.classList.add(`widget-${size}`);
        widget.classList.add(`widget-${position}`);
        widget.classList.add(`urgency-${urgency}`);

        // Add widget to container if not already there
        if (!widget.parentElement) {
            this.widgetContainer.appendChild(widget);
        }

        // Store in active widgets
        this.activeWidgets.set(id, widget);

        // Bind actions for custom widgets
        this.bindWidgetActions(id, widget);

        // Use organic motion for entrance
        if (window.organicMotion) {
            window.organicMotion.enterWidget(widget, priority === 0 ? 'high' : priority < 3 ? 'medium' : 'low');

            // Apply urgency indicator
            if (urgency) {
                window.organicMotion.indicateUrgency(widget, urgency);
            }

            // Start breathing animation
            window.organicMotion.breathe(widget, { type: 'glow', intensity: 0.5 });
        } else {
            // Fallback: Animate in using requestAnimationFrame
            requestAnimationFrame(() => {
                widget.classList.add('show');
                widget.classList.remove('hide', 'pooled');
            });
        }

        // Log interaction with consciousness client
        if (window.consciousnessClient) {
            window.consciousnessClient.logInteraction(id, 'viewed', {
                displayedWidgets: Array.from(this.activeWidgets.keys()),
                layoutType: this.currentOrchestration?.layout?.layoutType
            });
        }
    }

    /* ============================================
       DISPLAY WIDGETS (PARALLEL) - Legacy support
       ============================================ */
    async displayWidgets(widgetIds, widgetData = {}) {
        console.log('Displaying widgets (parallel):', widgetIds);

        // OPTIMIZATION: Create all widgets in parallel
        const widgetPromises = widgetIds.map(widgetId =>
            this.createWidget(widgetId, widgetData[widgetId])
        );

        await Promise.all(widgetPromises);
    }

    /* ============================================
       CREATE WIDGET (WITH POOLING)
       ============================================ */
    async createWidget(widgetId, data) {
        // Try to get widget from pool first
        let widget = this.getFromPool(widgetId);

        if (!widget) {
            // Create new widget if none in pool
            widget = document.createElement('div');
            widget.id = `widget-${widgetId}`;
            widget.className = 'phoenix-widget';
            widget.dataset.widgetType = widgetId;
        }

        // Update widget content with close button
        const content = this.renderWidgetContent(widgetId, data);
        widget.innerHTML = `
            <button class="widget-close-btn" onclick="window.widgetManager.removeWidget('${widgetId}')" aria-label="Close widget">×</button>
            ${content}
        `;

        // Add widget to container if not already there
        if (!widget.parentElement) {
            this.widgetContainer.appendChild(widget);
        }

        // Store in active widgets
        this.activeWidgets.set(widgetId, widget);

        // Animate in using requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            widget.classList.add('show');
            widget.classList.remove('hide', 'pooled');
        });
    }

    /* ============================================
       WIDGET POOL MANAGEMENT
       ============================================ */
    getFromPool(widgetId) {
        // Check if we have a pooled widget of this type
        const pooled = this.widgetPool.get(widgetId);
        if (pooled) {
            this.widgetPool.delete(widgetId);
            return pooled;
        }
        return null;
    }

    returnToPool(widgetId, widget) {
        // Store widget in pool for reuse
        widget.classList.add('pooled');
        widget.classList.remove('show', 'hide');
        this.widgetPool.set(widgetId, widget);
    }

    /* ============================================
       CUSTOM WIDGET ACTIONS
       ============================================ */
    storeWidgetActions(widgetId, actions) {
        this.widgetActions.set(widgetId, actions);
        console.log(`[WidgetManager] Stored actions for ${widgetId}:`, actions);
    }

    bindWidgetActions(widgetId, widgetElement) {
        const actions = this.widgetActions.get(widgetId);
        if (!actions) return; // No custom actions to bind

        // Find all buttons with data-action attribute
        const actionButtons = widgetElement.querySelectorAll('[data-action]');

        actionButtons.forEach(button => {
            const actionName = button.getAttribute('data-action');
            const endpoint = actions[actionName];

            if (!endpoint) {
                console.warn(`[WidgetManager] No endpoint found for action: ${actionName}`);
                return;
            }

            // Bind click handler
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.executeWidgetAction(widgetId, actionName, endpoint, button);
            });
        });

        console.log(`[WidgetManager] Bound ${actionButtons.length} actions for widget ${widgetId}`);
    }

    async executeWidgetAction(widgetId, actionName, endpoint, buttonElement) {
        console.log(`[WidgetManager] Executing action: ${actionName} for widget ${widgetId}`);

        // Show loading state
        const originalText = buttonElement.textContent;
        buttonElement.disabled = true;
        buttonElement.textContent = 'Loading...';

        try {
            // Call the API endpoint
            const token = localStorage.getItem('phoenixToken');
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    widgetId,
                    actionName,
                    timestamp: new Date().toISOString()
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`[WidgetManager] Action ${actionName} succeeded:`, result);

                // Update widget with new data if provided
                if (result.data) {
                    this.updateWidgetData(widgetId, result.data);
                }

                // Show success feedback
                buttonElement.textContent = '✓';
                setTimeout(() => {
                    buttonElement.textContent = originalText;
                    buttonElement.disabled = false;
                }, 1500);
            } else {
                throw new Error(result.message || 'Action failed');
            }

        } catch (error) {
            console.error(`[WidgetManager] Action ${actionName} failed:`, error);

            // Show error feedback
            buttonElement.textContent = '✗ Error';
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.disabled = false;
            }, 2000);
        }
    }

    updateWidgetData(widgetId, newData) {
        const widget = this.activeWidgets.get(widgetId);
        if (!widget) return;

        // Find elements to update by ID or class
        Object.keys(newData).forEach(key => {
            const element = widget.querySelector(`#${key}`) ||
                           widget.querySelector(`.${key}`);

            if (element) {
                element.textContent = newData[key];
            }
        });
    }

    /* ============================================
       RENDER WIDGET CONTENT (CSS CLASSES)
       ============================================ */
    renderWidgetContent(widgetId, data) {
        // DYNAMIC WIDGET: If AI generated custom HTML, use it
        if (data && data.html) {
            console.log(`[WidgetManager] Rendering custom AI-generated widget: ${widgetId}`);

            // Store actions and tracking fields for later binding
            if (data.actions) {
                this.storeWidgetActions(widgetId, data.actions);
            }

            return data.html; // Return AI-generated HTML directly
        }

        // STANDARD TEMPLATES: Use hardcoded templates for known widgets
        const templates = {
            'health-recovery': () => this.renderHealthRecovery(data),
            'health-hrv': () => this.renderHealthHRV(data),
            'health-sleep': () => this.renderHealthSleep(data),
            'health-metrics': () => this.renderHealthMetrics(data),
            'finance-overview': () => this.renderFinanceOverview(data),
            'finance-spending': () => this.renderFinanceSpending(data),
            'calendar-today': () => this.renderCalendarToday(data),
            'goals-progress': () => this.renderGoalsProgress(data),
            'workout-plan': () => this.renderWorkoutPlan(data),
            'nutrition-stats': () => this.renderNutritionStats(data)
        };

        const template = templates[widgetId];
        return template ? template() : this.renderDefault(widgetId, data);
    }

    /* ============================================
       WIDGET TEMPLATES (CSS CLASSES)
       ============================================ */
    renderHealthRecovery(data) {
        const score = data?.recoveryScore || 0;
        const scoreClass = score >= 80 ? 'recovery-excellent' : score >= 60 ? 'recovery-good' : 'recovery-poor';

        return `
            <div class="widget-health">
                <h3 class="widget-header">Recovery Score</h3>
                <div class="widget-value ${scoreClass}">${score}%</div>
                <div class="widget-status">${data?.status || 'Good recovery status'}</div>
            </div>
        `;
    }

    renderHealthHRV(data) {
        return `
            <div class="widget-health">
                <h3 class="widget-header">Heart Rate Variability</h3>
                <div class="widget-value medium">${data?.hrv || '0'} ms</div>
                <div class="widget-status">${data?.trend || 'Normal range'}</div>
            </div>
        `;
    }

    renderHealthSleep(data) {
        return `
            <div class="widget-health">
                <h3 class="widget-header">Sleep Quality</h3>
                <div class="widget-value medium">${data?.hours || '0'}h ${data?.minutes || '0'}m</div>
                <div class="widget-status">${data?.quality || 'Good sleep quality'}</div>
            </div>
        `;
    }

    renderHealthMetrics(data) {
        const metricsHTML = data?.metrics?.map(metric => `
            <div class="widget-list-item">
                <span>${metric.name}</span>
                <span class="widget-value small">${metric.value}</span>
            </div>
        `).join('') || '<div class="widget-status">No metrics available</div>';

        return `
            <div class="widget-health">
                <h3 class="widget-header">Health Metrics</h3>
                <div class="widget-list">${metricsHTML}</div>
            </div>
        `;
    }

    renderFinanceOverview(data) {
        return `
            <div class="widget-finance">
                <h3 class="widget-header">Finance Overview</h3>
                <div class="widget-value medium">$${data?.balance || '0'}</div>
                <div class="widget-status">${data?.status || 'Current balance'}</div>
            </div>
        `;
    }

    renderFinanceSpending(data) {
        return `
            <div class="widget-finance">
                <h3 class="widget-header">Spending This Month</h3>
                <div class="widget-value medium">$${data?.spending || '0'}</div>
                <div class="widget-status">${data?.budget ? `$${data.budget} budget` : 'No budget set'}</div>
            </div>
        `;
    }

    renderCalendarToday(data) {
        const eventsHTML = data?.events?.map(event => `
            <div class="calendar-event">
                <div class="calendar-event-title">${event.title}</div>
                <div class="calendar-event-time">${event.time}</div>
            </div>
        `).join('') || '<div class="widget-status">No events today</div>';

        return `
            <div class="widget-calendar">
                <h3 class="widget-header">Today's Schedule</h3>
                <div class="widget-list">${eventsHTML}</div>
            </div>
        `;
    }

    renderGoalsProgress(data) {
        const goalsHTML = data?.goals?.map(goal => `
            <div>
                <div class="widget-status" style="margin-bottom: 6px;">${goal.name}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${goal.progress}%;"></div>
                </div>
                <div class="widget-status" style="margin-top: 4px;">${goal.progress}% complete</div>
            </div>
        `).join('') || '<div class="widget-status">No active goals</div>';

        return `
            <div class="widget-goals">
                <h3 class="widget-header">Goals Progress</h3>
                <div class="widget-list">${goalsHTML}</div>
            </div>
        `;
    }

    renderWorkoutPlan(data) {
        return `
            <div class="widget-health">
                <h3 class="widget-header">Today's Workout</h3>
                <div class="widget-value small">${data?.workout || 'Rest Day'}</div>
                <div class="widget-status">${data?.duration || 'No workout planned'}</div>
            </div>
        `;
    }

    renderNutritionStats(data) {
        return `
            <div class="widget-health">
                <h3 class="widget-header">Nutrition Today</h3>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-value">${data?.calories || '0'}</div>
                        <div class="metric-label">Calories</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data?.protein || '0'}g</div>
                        <div class="metric-label">Protein</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${data?.carbs || '0'}g</div>
                        <div class="metric-label">Carbs</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDefault(widgetId, data) {
        return `
            <div class="widget-health">
                <h3 class="widget-header">${widgetId.replace(/-/g, ' ')}</h3>
                <div class="widget-status">${data ? JSON.stringify(data, null, 2) : 'Loading...'}</div>
            </div>
        `;
    }

    /* ============================================
       HIDE WIDGETS (PARALLEL)
       ============================================ */
    async hideWidgets(widgetIds) {
        // OPTIMIZATION: Hide all in parallel
        widgetIds.forEach(widgetId => this.removeWidget(widgetId));
    }

    /* ============================================
       REMOVE WIDGET (WITH POOLING)
       ============================================ */
    removeWidget(widgetId) {
        const widget = this.activeWidgets.get(widgetId);
        if (!widget) return;

        // Animate out
        widget.classList.add('hide');
        widget.classList.remove('show');

        // Return to pool after animation
        setTimeout(() => {
            this.returnToPool(widgetId, widget);
            this.activeWidgets.delete(widgetId);
        }, 300);
    }

    /* ============================================
       CLEAR ALL WIDGETS
       ============================================ */
    clearAll() {
        this.activeWidgets.forEach((widget, widgetId) => {
            this.removeWidget(widgetId);
        });
    }
}

// Initialize widget manager
let widgetManager;

document.addEventListener('DOMContentLoaded', () => {
    widgetManager = new WidgetManager();
    window.widgetManager = widgetManager;
    console.log('Widget Manager ready (optimized)');
});
