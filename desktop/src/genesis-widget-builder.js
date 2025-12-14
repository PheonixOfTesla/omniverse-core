/**
 * GENESIS WIDGET BUILDER
 * Builds actual widget DOM elements from blueprints
 */

class GenesisWidgetBuilder {
    /**
     * Build widget from blueprint
     * @param {Object} blueprint - Complete widget specification
     * @returns {HTMLElement} Widget DOM element
     */
    build(blueprint) {
        const widget = this.createWidgetStructure(blueprint);
        this.applyWidgetStyling(widget, blueprint.styling, blueprint.layout);
        this.attachWidgetControls(widget, blueprint);
        this.injectWidgetContent(widget, blueprint);
        this.makeWidgetDraggable(widget);

        return widget;
    }

    /**
     * Create base widget HTML structure
     */
    createWidgetStructure(blueprint) {
        const widget = document.createElement('div');
        widget.className = 'genesis-widget';
        widget.id = blueprint.id;
        widget.setAttribute('data-type', blueprint.type);

        widget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">${blueprint.name}</div>
                <div class="widget-controls"></div>
            </div>
            <div class="widget-content"></div>
        `;

        return widget;
    }

    /**
     * Apply styling from blueprint
     */
    applyWidgetStyling(widget, styling, layout) {
        widget.style.width = `${layout.width}px`;
        widget.style.height = `${layout.height}px`;
        widget.style.border = styling.border;
        widget.style.background = styling.background;
        widget.style.color = styling.textColor;
        widget.style.borderRadius = styling.borderRadius;
        widget.style.boxShadow = styling.shadow;
        widget.style.backdropFilter = styling.backdropFilter;

        // Initial position (center of screen)
        widget.style.left = `${(window.innerWidth - layout.width) / 2}px`;
        widget.style.top = `${(window.innerHeight - layout.height) / 2}px`;
    }

    /**
     * Attach control buttons (close, minimize, settings)
     */
    attachWidgetControls(widget, blueprint) {
        const controlsContainer = widget.querySelector('.widget-controls');

        blueprint.controls.forEach(controlType => {
            const btn = document.createElement('button');
            btn.className = `widget-control-btn widget-btn-${controlType}`;
            btn.setAttribute('data-action', controlType);

            const icons = {
                'minimize': '▼',
                'settings': '⚙️',
                'close': '✕'
            };

            btn.textContent = icons[controlType] || '•';
            btn.onclick = () => this.handleControlAction(controlType, widget, blueprint);
            controlsContainer.appendChild(btn);
        });
    }

    /**
     * Handle control button clicks
     */
    handleControlAction(action, widget, blueprint) {
        switch (action) {
            case 'close':
                this.closeWidget(widget, blueprint.id);
                break;
            case 'minimize':
                this.minimizeWidget(widget, blueprint.id);
                break;
            case 'settings':
                alert('Widget settings coming soon!');
                break;
        }
    }

    /**
     * Close widget with animation
     * Now removes from dock instead of page
     */
    closeWidget(widget, widgetId) {
        widget.style.animation = 'widgetMinimize 0.3s ease-out';
        setTimeout(() => {
            widget.remove();

            // Remove from dock
            if (window.genesisDock) {
                window.genesisDock.removeWidget(widgetId);
            }

            // Remove from localStorage
            if (window.genesisWidgetManager) {
                window.genesisWidgetManager.deleteWidget(widgetId);
            }
        }, 300);
    }

    /**
     * Minimize widget to dock
     * Now uses Genesis Dock system
     */
    minimizeWidget(widget, widgetId) {
        // Use Genesis Dock's toggle method (hides widget, keeps in dock)
        if (window.genesisDock) {
            window.genesisDock.toggleWidget(widgetId);
        } else {
            // Fallback
            widget.style.display = 'none';
        }
    }

    /**
     * Create widget dock if it doesn't exist
     */
    createDock() {
        const dock = document.createElement('div');
        dock.id = 'genesis-widget-dock';
        document.body.appendChild(dock);
        return dock;
    }

    /**
     * Create docked widget icon
     */
    createDockedIcon(widget, widgetId) {
        const icon = document.createElement('div');
        icon.className = 'docked-widget';
        icon.textContent = '📦';
        icon.onclick = () => {
            widget.classList.remove('minimized');
            widget.style.animation = 'widgetRestore 0.3s ease-out';
            icon.remove();

            // Hide dock if empty
            const dock = document.getElementById('genesis-widget-dock');
            if (dock && dock.children.length === 0) {
                dock.classList.remove('active');
            }
        };
        return icon;
    }

    /**
     * Inject widget content based on type
     */
    injectWidgetContent(widget, blueprint) {
        const contentDiv = widget.querySelector('.widget-content');

        // Generate content based on widget type
        const content = this.generateContent(blueprint);
        contentDiv.innerHTML = content;
    }

    /**
     * Generate widget content HTML
     */
    generateContent(blueprint) {
        const templates = {
            'social-media-panel': () => `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${blueprint.integrations.map(service => `
                        <div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                            <strong style="color: ${blueprint.styling.accentColor};">${service.toUpperCase()}</strong>
                            <p style="margin: 8px 0 0 0; opacity: 0.7;">Connected • Ready to sync</p>
                        </div>
                    `).join('')}
                </div>
            `,
            'calendar-view': () => `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; color: ${blueprint.styling.accentColor}; margin-bottom: 10px;">
                        ${new Date().getDate()}
                    </div>
                    <div style="font-size: 18px; opacity: 0.8;">
                        ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                        <p>No events today</p>
                    </div>
                </div>
            `,
            'timer-widget': () => `
                <div style="padding: 30px; text-align: center;">
                    <div style="font-size: 56px; color: ${blueprint.styling.accentColor}; margin-bottom: 20px; font-weight: bold; font-family: monospace;">
                        00:00:00
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button style="padding: 12px 24px; background: ${blueprint.styling.accentColor}33; border: 2px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.accentColor}; border-radius: 8px; cursor: pointer; font-weight: bold;">START</button>
                        <button style="padding: 12px 24px; background: rgba(255, 68, 68, 0.2); border: 2px solid #ff4444; color: #ff4444; border-radius: 8px; cursor: pointer; font-weight: bold;">STOP</button>
                        <button style="padding: 12px 24px; background: rgba(255, 165, 0, 0.2); border: 2px solid #ffa500; color: #ffa500; border-radius: 8px; cursor: pointer; font-weight: bold;">RESET</button>
                    </div>
                </div>
            `,
            'notes-panel': () => `
                <div style="padding: 15px;">
                    <textarea style="width: 100%; height: 200px; background: rgba(0,0,0,0.3); border: 1px solid ${blueprint.styling.accentColor}44; color: ${blueprint.styling.textColor}; border-radius: 8px; padding: 12px; font-family: inherit; resize: none;" placeholder="Type your notes here..."></textarea>
                    <button style="margin-top: 10px; width: 100%; padding: 12px; background: ${blueprint.styling.accentColor}33; border: 2px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.accentColor}; border-radius: 8px; cursor: pointer; font-weight: bold;">💾 SAVE NOTE</button>
                </div>
            `,
            'quote-display': () => `
                <div style="padding: 30px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 10px;">💭</div>
                    <blockquote style="font-size: 18px; font-style: italic; color: ${blueprint.styling.accentColor}; margin: 20px 0; line-height: 1.6;">
                        "The only way to do great work is to love what you do."
                    </blockquote>
                    <p style="opacity: 0.6; font-size: 14px;">— Steve Jobs</p>
                    <button style="margin-top: 20px; padding: 10px 20px; background: ${blueprint.styling.accentColor}33; border: 2px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.accentColor}; border-radius: 8px; cursor: pointer; font-size: 12px;">🔄 NEW QUOTE</button>
                </div>
            `,
            'todo-list': () => `
                <div style="padding: 15px;">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${[1, 2, 3].map(i => `
                            <div style="display: flex; align-items: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; border-left: 3px solid ${blueprint.styling.accentColor};">
                                <input type="checkbox" style="margin-right: 10px; cursor: pointer;">
                                <span style="opacity: 0.8;">Task item ${i}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button style="margin-top: 15px; width: 100%; padding: 10px; background: ${blueprint.styling.accentColor}33; border: 2px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.accentColor}; border-radius: 8px; cursor: pointer; font-size: 12px;">+ ADD TASK</button>
                </div>
            `,
            'dashboard-widget': () => `
                <div style="padding: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        ${['Active', 'Completed', 'Pending', 'Total'].map((label, i) => `
                            <div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: center;">
                                <div style="font-size: 32px; color: ${blueprint.styling.accentColor}; font-weight: bold;">${Math.floor(Math.random() * 100)}</div>
                                <div style="font-size: 11px; opacity: 0.6; margin-top: 5px;">${label}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            'music-player': () => `
                <div style="height: 100%; position: relative;">
                    <iframe src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            allowtransparency="true"
                            allow="encrypted-media"
                            style="border-radius: 12px;"></iframe>
                </div>
            `,
            'video-widget': () => `
                <div style="height: 100%; position: relative; background: #000;">
                    <div style="padding: 15px; text-align: center;">
                        <input type="text"
                               id="youtube-url-${blueprint.id}"
                               placeholder="Paste YouTube URL..."
                               style="width: 90%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.textColor}; border-radius: 6px; margin-bottom: 10px;">
                        <button onclick="loadYouTubeVideo('${blueprint.id}')"
                                style="padding: 10px 20px; background: ${blueprint.styling.accentColor}33; border: 2px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.accentColor}; border-radius: 6px; cursor: pointer;">
                            Load Video
                        </button>
                    </div>
                    <div id="youtube-player-${blueprint.id}" style="width: 100%; height: calc(100% - 80px);"></div>
                </div>
            `,
            'weather-widget': () => `
                <div style="height: 100%;">
                    <iframe src="https://wttr.in/?format=v2"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="background: rgba(0,0,0,0.5); border-radius: 8px;"></iframe>
                </div>
            `,
            'news-widget': () => `
                <div style="height: 100%;">
                    <iframe src="https://news.google.com"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border-radius: 8px;"></iframe>
                </div>
            `,
            'maps-widget': () => `
                <div style="height: 100%;">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596073366!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1234567890"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            allowfullscreen
                            style="border-radius: 8px;"></iframe>
                </div>
            `,
            'email-widget': () => `
                <div style="height: 100%;">
                    <iframe src="https://mail.google.com/mail/u/0/#inbox"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            allow="clipboard-read; clipboard-write"
                            style="border-radius: 8px;"></iframe>
                </div>
            `,
            'browser-panel': () => `
                <div style="height: 100%; display: flex; flex-direction: column;">
                    <div style="padding: 10px; background: rgba(0,0,0,0.5); display: flex; gap: 10px;">
                        <input type="text"
                               id="browser-url-${blueprint.id}"
                               placeholder="Enter URL (https://...)"
                               style="flex: 1; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid ${blueprint.styling.accentColor}44; color: ${blueprint.styling.textColor}; border-radius: 6px;">
                        <button onclick="loadBrowserURL('${blueprint.id}')"
                                style="padding: 8px 16px; background: ${blueprint.styling.accentColor}33; border: 2px solid ${blueprint.styling.accentColor}; color: ${blueprint.styling.accentColor}; border-radius: 6px; cursor: pointer;">
                            GO
                        </button>
                    </div>
                    <iframe id="browser-frame-${blueprint.id}"
                            src="https://www.example.com"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="flex: 1;"></iframe>
                </div>
            `,
            'custom-widget': () => `
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🧬</div>
                    <h3 style="color: ${blueprint.styling.accentColor}; margin-bottom: 10px;">
                        ${blueprint.name}
                    </h3>
                    <p style="opacity: 0.7; margin-bottom: 15px;">Custom interface created successfully!</p>
                    ${blueprint.rawInput ? `
                        <div style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-top: 20px;">
                            <p style="font-size: 12px; opacity: 0.6; margin-bottom: 5px;">YOUR REQUEST:</p>
                            <p style="font-size: 13px; opacity: 0.8;">"${blueprint.rawInput.substring(0, 100)}${blueprint.rawInput.length > 100 ? '...' : ''}"</p>
                        </div>
                    ` : ''}
                    ${blueprint.integrations && blueprint.integrations[0] !== 'none' ? `
                        <p style="opacity: 0.5; font-size: 12px; margin-top: 20px;">
                            Integrations: ${blueprint.integrations.join(', ')}
                        </p>
                    ` : ''}
                    <div style="margin-top: 25px; padding: 15px; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.2); border-radius: 8px;">
                        <p style="font-size: 11px; opacity: 0.6;">🚀 This is a Genesis-created interface</p>
                        <p style="font-size: 11px; opacity: 0.5; margin-top: 5px;">You can customize any aspect of your dashboard</p>
                    </div>
                </div>
            `
        };

        const template = templates[blueprint.type] || templates['custom-widget'];
        return template();
    }

    /**
     * Make widget draggable
     */
    makeWidgetDraggable(widget) {
        const header = widget.querySelector('.widget-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('widget-control-btn')) return;

            isDragging = true;
            widget.classList.add('dragging');

            initialX = e.clientX - parseInt(widget.style.left || 0);
            initialY = e.clientY - parseInt(widget.style.top || 0);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            widget.style.left = `${currentX}px`;
            widget.style.top = `${currentY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                widget.classList.remove('dragging');

                // Save position
                if (window.genesisWidgetManager) {
                    window.genesisWidgetManager.updateWidgetPosition(
                        widget.id,
                        parseInt(widget.style.left),
                        parseInt(widget.style.top)
                    );
                }
            }
        });
    }
}

// Helper functions for iframe widgets
window.loadYouTubeVideo = function(widgetId) {
    const input = document.getElementById(`youtube-url-${widgetId}`);
    const playerDiv = document.getElementById(`youtube-player-${widgetId}`);

    if (!input || !playerDiv) return;

    const url = input.value.trim();
    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    // Extract video ID from URL
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else {
        alert('Invalid YouTube URL');
        return;
    }

    // Create iframe
    playerDiv.innerHTML = `
        <iframe width="100%"
                height="100%"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style="border-radius: 8px;"></iframe>
    `;
};

window.loadBrowserURL = function(widgetId) {
    const input = document.getElementById(`browser-url-${widgetId}`);
    const iframe = document.getElementById(`browser-frame-${widgetId}`);

    if (!input || !iframe) return;

    let url = input.value.trim();
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    iframe.src = url;
};

if (typeof window !== 'undefined') {
    window.GenesisWidgetBuilder = GenesisWidgetBuilder;
}

console.log('✅ Genesis Widget Builder loaded');
