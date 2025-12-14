/* ============================================
   VOICE/MANUAL MODE CONTROLLER
   Manages switching between voice-first and manual modes
   Includes localStorage persistence and keyboard shortcuts
   ============================================ */

(function() {
    'use strict';

    // Mode constants
    const VOICE_MODE = 'voice';
    const MANUAL_MODE = 'manual';
    const STORAGE_KEY = 'phoenix_ui_mode';

    // Audio feedback
    function playModeTransitionSound(isVoiceMode) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if (isVoiceMode) {
                // Voice mode: Ascending pitch (opening up)
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } else {
                // Manual mode: Descending pitch (grounding down)
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }

    // Save mode to localStorage
    function saveMode(mode) {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
            console.log(`✅ Mode saved: ${mode}`);
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
    }

    // Load mode from localStorage
    function loadMode() {
        try {
            const isMobile = localStorage.getItem('phoenix_is_mobile') === 'true';
            // On mobile, ALWAYS return VOICE_MODE - never allow manual mode
            if (isMobile) {
                return VOICE_MODE;
            }
            const savedMode = localStorage.getItem(STORAGE_KEY);
            return savedMode || VOICE_MODE; // Default to voice mode
        } catch (e) {
            console.warn('localStorage not available:', e);
            return VOICE_MODE;
        }
    }

    // Apply mode to body
    function applyMode(mode) {
        document.body.setAttribute('data-mode', mode);

        // Update button states
        const voiceBtn = document.getElementById('voice-mode-btn');
        const manualBtn = document.getElementById('manual-mode-btn');
        const isMobile = localStorage.getItem('phoenix_is_mobile') === 'true';

        if (voiceBtn && manualBtn) {
            if (mode === VOICE_MODE) {
                voiceBtn.setAttribute('aria-pressed', 'true');
                manualBtn.setAttribute('aria-pressed', 'false');
            } else {
                voiceBtn.setAttribute('aria-pressed', 'false');
                manualBtn.setAttribute('aria-pressed', 'true');
            }

            // Hide manual mode button on mobile
            if (isMobile) {
                manualBtn.style.display = 'none';
                console.log('📱 Manual mode button hidden on mobile');
            }
        }

        console.log(`🎨 UI Mode: ${mode.toUpperCase()}`);
    }

    // Wake word management
    function manageWakeWord(mode) {
        // In voice mode, enable wake word detection
        // In manual mode, disable wake word to save battery
        if (mode === VOICE_MODE) {
            console.log('🎤 Wake word detection: ENABLED');
            // Enable wake word if available
            if (window.enableWakeWordAI && typeof window.enableWakeWordAI === 'function') {
                // Wake word will be enabled by user action if not already
            }
        } else {
            console.log('🔇 Wake word detection: DISABLED (battery optimization)');
            // Disable wake word to save battery
            if (window.disableWakeWordAI && typeof window.disableWakeWordAI === 'function') {
                window.disableWakeWordAI();
            }
        }
    }

    // Switch to Voice Mode
    window.switchToVoiceMode = function() {
        console.log('🎤 Switching to VOICE mode...');
        applyMode(VOICE_MODE);
        saveMode(VOICE_MODE);
        playModeTransitionSound(true);
        manageWakeWord(VOICE_MODE);

        // Close any open menus
        closeAllMenus();

        // Show brief notification
        showModeNotification('Voice Mode Active', 'Say "Hey Phoenix" to interact');
    };

    // Switch to Manual Mode
    window.switchToManualMode = function() {
        const isMobile = localStorage.getItem('phoenix_is_mobile') === 'true';

        // On mobile, VOICE MODE ONLY - cannot switch to manual
        if (isMobile) {
            console.log('📱 Manual mode not available on mobile - VOICE ONLY');
            showModeNotification('Voice Only Mode', 'Mobile devices use voice mode exclusively');
            // Force back to voice mode
            applyMode(VOICE_MODE);
            saveMode(VOICE_MODE);
            return;
        }

        console.log('👆 Switching to MANUAL mode...');
        applyMode(MANUAL_MODE);
        saveMode(MANUAL_MODE);
        playModeTransitionSound(false);
        manageWakeWord(MANUAL_MODE);

        // Show brief notification
        showModeNotification('Manual Mode Active', 'Use buttons and menus to interact');
    };

    // Open Phoenix Desk (Business Management Workspace)
    window.openPhoenixDesk = function() {
        console.log('💼 Opening Phoenix Desk...');

        const token = localStorage.getItem('phoenixToken');
        if (!token) {
            showModeNotification('Login Required', 'Please login to access Phoenix Desk');
            return;
        }

        // Navigate to desk mode
        showModeNotification('Opening Desk Mode', 'Loading business workspace...');
        setTimeout(() => {
            window.location.href = 'desk.html';
        }, 500);
    };

    // Switch to Genesis Mode (Natural Language Widget Creation)
    window.switchToGenesisMode = function() {
        console.log('🧬 Switching to GENESIS mode...');

        const GENESIS_MODE = 'genesis';
        applyMode(GENESIS_MODE);
        saveMode(GENESIS_MODE);

        // Update button states
        const voiceBtn = document.getElementById('voice-mode-btn');
        const manualBtn = document.getElementById('manual-mode-btn');
        const genesisBtn = document.getElementById('genesis-mode-btn');

        if (voiceBtn) voiceBtn.setAttribute('aria-pressed', 'false');
        if (manualBtn) manualBtn.setAttribute('aria-pressed', 'false');
        if (genesisBtn) genesisBtn.setAttribute('aria-pressed', 'true');

        // Close any open menus
        closeAllMenus();

        // Activate Genesis controller if available
        if (window.genesisController) {
            window.genesisController.activate();
        }

        // Show notification
        showModeNotification('Genesis Mode Active', 'Create custom widgets with natural language');

        console.log('✅ Genesis Mode activated');
    };

    // Show Desk Panel with Google Workspace features
    function showDeskPanel() {
        // Check if panel already exists
        let panel = document.getElementById('desk-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            return;
        }

        // Create Desk panel
        panel = document.createElement('div');
        panel.id = 'desk-panel';
        panel.innerHTML = `
            <div style="position:fixed;top:80px;right:20px;width:350px;background:rgba(0,10,20,0.95);border:2px solid rgba(0,217,255,0.4);border-radius:20px;padding:20px;z-index:10002;backdrop-filter:blur(15px);box-shadow:0 0 30px rgba(0,217,255,0.3)">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <h3 style="color:#00d9ff;margin:0;font-size:18px;letter-spacing:2px">PHOENIX DESK</h3>
                    <button onclick="document.getElementById('desk-panel').style.display='none'" style="background:none;border:none;color:#00d9ff;font-size:20px;cursor:pointer">&times;</button>
                </div>
                <div style="color:rgba(0,217,255,0.7);font-size:12px;margin-bottom:15px">Google Workspace Connected</div>
                <div style="display:grid;gap:10px">
                    <button onclick="deskAction('email')" style="padding:15px;background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.3);border-radius:10px;color:#00d9ff;cursor:pointer;text-align:left">
                        <div style="font-weight:bold">📧 Email</div>
                        <div style="font-size:11px;opacity:0.7">Read & send emails</div>
                    </button>
                    <button onclick="deskAction('calendar')" style="padding:15px;background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.3);border-radius:10px;color:#00d9ff;cursor:pointer;text-align:left">
                        <div style="font-weight:bold">📅 Calendar</div>
                        <div style="font-size:11px;opacity:0.7">View & create events</div>
                    </button>
                    <button onclick="deskAction('tasks')" style="padding:15px;background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.3);border-radius:10px;color:#00d9ff;cursor:pointer;text-align:left">
                        <div style="font-weight:bold">✅ Tasks</div>
                        <div style="font-size:11px;opacity:0.7">Manage to-do lists</div>
                    </button>
                    <button onclick="deskAction('contacts')" style="padding:15px;background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.3);border-radius:10px;color:#00d9ff;cursor:pointer;text-align:left">
                        <div style="font-weight:bold">👥 Contacts</div>
                        <div style="font-size:11px;opacity:0.7">Look up people</div>
                    </button>
                    <button onclick="deskAction('drive')" style="padding:15px;background:rgba(0,217,255,0.1);border:1px solid rgba(0,217,255,0.3);border-radius:10px;color:#00d9ff;cursor:pointer;text-align:left">
                        <div style="font-weight:bold">📁 Drive</div>
                        <div style="font-size:11px;opacity:0.7">Access your files</div>
                    </button>
                </div>
                <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(0,217,255,0.2)">
                    <button onclick="disconnectGoogle()" style="width:100%;padding:10px;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);border-radius:10px;color:#ff6b6b;cursor:pointer;font-size:12px">
                        Disconnect Google Account
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        showModeNotification('Phoenix Desk', 'Google Workspace ready');
    }

    // Desk action handler
    window.deskAction = async function(action) {
        const token = localStorage.getItem('phoenixToken');
        const API = window.PhoenixConfig?.API_BASE_URL || 'https://pal-backend-production.up.railway.app/api';

        try {
            let endpoint = '';
            switch(action) {
                case 'email': endpoint = '/google/gmail/recent'; break;
                case 'calendar': endpoint = '/google/calendar/upcoming'; break;
                case 'tasks': endpoint = '/google/tasks/lists'; break;
                case 'contacts': endpoint = '/google/contacts'; break;
                case 'drive': endpoint = '/google/drive/files'; break;
            }

            const res = await fetch(API + endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            console.log(`Desk ${action}:`, data);

            // Trigger widget display with data
            if (window.showDynamicWidget) {
                window.showDynamicWidget(action, data);
            } else {
                showModeNotification(action.charAt(0).toUpperCase() + action.slice(1), `Loaded ${data.count || 0} items`);
            }
        } catch (error) {
            console.error('Desk action error:', error);
            showModeNotification('Error', `Failed to load ${action}`);
        }
    };

    // Disconnect Google
    window.disconnectGoogle = async function() {
        const token = localStorage.getItem('phoenixToken');
        const API = window.PhoenixConfig?.API_BASE_URL || 'https://pal-backend-production.up.railway.app/api';

        try {
            await fetch(API + '/google/disconnect', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            document.getElementById('desk-panel').remove();
            showModeNotification('Disconnected', 'Google account removed');
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    };

    // Dynamic Widget Display for Desk data
    window.showDynamicWidget = function(type, data) {
        // Remove existing widget
        const existing = document.getElementById('desk-data-widget');
        if (existing) existing.remove();

        let content = '';
        const items = data.emails || data.events || data.taskLists || data.contacts || data.files || [];

        switch(type) {
            case 'email':
                content = `
                    <div style="font-weight:bold;margin-bottom:15px;color:#00d9ff">📧 Recent Emails (${items.length})</div>
                    ${items.length === 0 ? '<div style="opacity:0.5">No emails found</div>' : ''}
                    ${items.slice(0, 8).map(email => `
                        <div style="padding:12px;background:rgba(0,217,255,0.05);border-radius:8px;margin-bottom:8px;border-left:3px solid #00d9ff">
                            <div style="font-weight:bold;font-size:13px;margin-bottom:4px">${email.from?.split('<')[0] || 'Unknown'}</div>
                            <div style="font-size:12px;opacity:0.9">${email.subject || 'No subject'}</div>
                            <div style="font-size:10px;opacity:0.5;margin-top:4px">${email.date || ''}</div>
                        </div>
                    `).join('')}
                `;
                break;

            case 'calendar':
                content = `
                    <div style="font-weight:bold;margin-bottom:15px;color:#00d9ff">📅 Upcoming Events (${items.length})</div>
                    ${items.length === 0 ? '<div style="opacity:0.5">No upcoming events</div>' : ''}
                    ${items.slice(0, 8).map(event => `
                        <div style="padding:12px;background:rgba(0,217,255,0.05);border-radius:8px;margin-bottom:8px;border-left:3px solid #00ff88">
                            <div style="font-weight:bold;font-size:13px;margin-bottom:4px">${event.summary || 'Untitled'}</div>
                            <div style="font-size:11px;opacity:0.8">${new Date(event.start).toLocaleString()}</div>
                            ${event.location ? `<div style="font-size:10px;opacity:0.5;margin-top:4px">📍 ${event.location}</div>` : ''}
                        </div>
                    `).join('')}
                `;
                break;

            case 'tasks':
                content = `
                    <div style="font-weight:bold;margin-bottom:15px;color:#00d9ff">✅ Task Lists (${items.length})</div>
                    ${items.length === 0 ? '<div style="opacity:0.5">No task lists found</div>' : ''}
                    ${items.map(list => `
                        <div style="padding:12px;background:rgba(0,217,255,0.05);border-radius:8px;margin-bottom:8px;border-left:3px solid #ffaa00;cursor:pointer" onclick="loadTaskList('${list.id}')">
                            <div style="font-weight:bold;font-size:13px">${list.title || 'Untitled List'}</div>
                        </div>
                    `).join('')}
                `;
                break;

            case 'contacts':
                content = `
                    <div style="font-weight:bold;margin-bottom:15px;color:#00d9ff">👥 Contacts (${items.length})</div>
                    ${items.length === 0 ? '<div style="opacity:0.5">No contacts found</div>' : ''}
                    ${items.slice(0, 10).map(contact => `
                        <div style="padding:10px;background:rgba(0,217,255,0.05);border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:10px">
                            <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,217,255,0.2);display:flex;align-items:center;justify-content:center">
                                ${contact.photo ? `<img src="${contact.photo}" style="width:36px;height:36px;border-radius:50%">` : '👤'}
                            </div>
                            <div>
                                <div style="font-weight:bold;font-size:12px">${contact.name || 'Unknown'}</div>
                                <div style="font-size:10px;opacity:0.6">${contact.email || contact.phone || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                `;
                break;

            case 'drive':
                content = `
                    <div style="font-weight:bold;margin-bottom:15px;color:#00d9ff">📁 Drive Files (${items.length})</div>
                    ${items.length === 0 ? '<div style="opacity:0.5">No files found</div>' : ''}
                    ${items.slice(0, 10).map(file => `
                        <div style="padding:10px;background:rgba(0,217,255,0.05);border-radius:8px;margin-bottom:6px;cursor:pointer" onclick="window.open('${file.webViewLink}', '_blank')">
                            <div style="font-size:12px;font-weight:bold">${file.name}</div>
                            <div style="font-size:10px;opacity:0.5">${file.mimeType?.split('/')[1] || 'file'}</div>
                        </div>
                    `).join('')}
                `;
                break;
        }

        // Create widget
        const widget = document.createElement('div');
        widget.id = 'desk-data-widget';
        widget.innerHTML = `
            <div style="position:fixed;top:80px;left:50%;transform:translateX(-50%);width:400px;max-height:70vh;overflow-y:auto;background:rgba(0,10,20,0.95);border:2px solid rgba(0,217,255,0.4);border-radius:20px;padding:20px;z-index:10003;backdrop-filter:blur(15px);box-shadow:0 0 40px rgba(0,217,255,0.4)">
                <button onclick="document.getElementById('desk-data-widget').remove()" style="position:absolute;top:15px;right:15px;background:none;border:none;color:#00d9ff;font-size:20px;cursor:pointer">&times;</button>
                ${content}
            </div>
        `;
        document.body.appendChild(widget);
    };

    // Load specific task list
    window.loadTaskList = async function(listId) {
        const token = localStorage.getItem('phoenixToken');
        const API = window.PhoenixConfig?.API_BASE_URL || 'https://pal-backend-production.up.railway.app/api';

        try {
            const res = await fetch(`${API}/google/tasks/${listId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            // Update widget with tasks
            const widget = document.getElementById('desk-data-widget');
            if (widget) {
                const tasks = data.tasks || [];
                widget.querySelector('div > div').innerHTML = `
                    <button onclick="deskAction('tasks')" style="background:none;border:none;color:#00d9ff;cursor:pointer;margin-bottom:10px">← Back to Lists</button>
                    <div style="font-weight:bold;margin-bottom:15px;color:#00d9ff">✅ Tasks (${tasks.length})</div>
                    ${tasks.length === 0 ? '<div style="opacity:0.5">No tasks in this list</div>' : ''}
                    ${tasks.map(task => `
                        <div style="padding:10px;background:rgba(0,217,255,0.05);border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:10px">
                            <div style="width:20px;height:20px;border:2px solid ${task.status === 'completed' ? '#00ff88' : '#00d9ff'};border-radius:4px;display:flex;align-items:center;justify-content:center">
                                ${task.status === 'completed' ? '✓' : ''}
                            </div>
                            <div>
                                <div style="font-size:12px;${task.status === 'completed' ? 'text-decoration:line-through;opacity:0.5' : ''}">${task.title}</div>
                                ${task.due ? `<div style="font-size:10px;opacity:0.5">Due: ${new Date(task.due).toLocaleDateString()}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                `;
            }
        } catch (error) {
            console.error('Load tasks error:', error);
        }
    };

    // Close all open menus
    function closeAllMenus() {
        const jarvisMenu = document.getElementById('jarvis-quick-menu');
        const quickMenu = document.getElementById('quick-actions-menu');
        const settingsMenu = document.getElementById('settings-menu');
        const planetPanel = document.getElementById('planet-selection-panel');

        if (jarvisMenu) jarvisMenu.style.display = 'none';
        if (quickMenu) quickMenu.style.display = 'none';
        if (settingsMenu) settingsMenu.style.display = 'none';
        if (planetPanel) planetPanel.style.left = '-400px';
    }

    // Show mode transition notification
    function showModeNotification(title, subtitle) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('mode-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'mode-notification';
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%) translateY(-20px);
                z-index: 10002;
                background: rgba(0, 10, 20, 0.95);
                border: 2px solid rgba(0, 217, 255, 0.4);
                border-radius: 12px;
                padding: 15px 25px;
                backdrop-filter: blur(15px);
                box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            `;
            document.body.appendChild(notification);
        }

        notification.innerHTML = `
            <div style="font-size: 14px; color: #00d9ff; font-weight: bold; margin-bottom: 4px; text-align: center;">
                ${title}
            </div>
            <div style="font-size: 10px; color: rgba(0, 217, 255, 0.6); text-align: center;">
                ${subtitle}
            </div>
        `;

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // Animate out after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
        }, 2000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // V key - switch to Voice mode
        if (e.key === 'v' || e.key === 'V') {
            // Only if not typing in input field
            if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                window.switchToVoiceMode();
            }
        }

        // M key - switch to Manual mode
        if (e.key === 'm' || e.key === 'M') {
            // Only if not typing in input field
            if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                window.switchToManualMode();
            }
        }
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Voice Mode Controller initialized');

        // Load saved mode or default to voice
        const savedMode = loadMode();
        applyMode(savedMode);

        // Set initial button states
        const voiceBtn = document.getElementById('voice-mode-btn');
        const manualBtn = document.getElementById('manual-mode-btn');
        const isMobile = localStorage.getItem('phoenix_is_mobile') === 'true';

        if (voiceBtn) {
            voiceBtn.setAttribute('aria-label', 'Switch to voice mode');
            voiceBtn.setAttribute('role', 'button');
        }

        if (manualBtn) {
            manualBtn.setAttribute('aria-label', 'Switch to manual mode');
            manualBtn.setAttribute('role', 'button');

            // Hide manual button on mobile - VOICE ONLY MODE
            if (isMobile) {
                manualBtn.style.display = 'none';
                console.log('📱 Manual mode DISABLED on mobile - showing VOICE ONLY');
            }
        }

        console.log(`📍 Initial mode: ${savedMode.toUpperCase()}`);
    });

    // Listen for page visibility changes (tab switching)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Page hidden - pause wake word if in voice mode to save battery
            const currentMode = document.body.getAttribute('data-mode');
            if (currentMode === VOICE_MODE) {
                console.log('📴 Page hidden - pausing wake word');
                if (window.pauseWakeWord && typeof window.pauseWakeWord === 'function') {
                    window.pauseWakeWord();
                }
            }
        } else {
            // Page visible - resume wake word if in voice mode
            const currentMode = document.body.getAttribute('data-mode');
            if (currentMode === VOICE_MODE) {
                console.log('🔊 Page visible - resuming wake word');
                if (window.resumeWakeWord && typeof window.resumeWakeWord === 'function') {
                    window.resumeWakeWord();
                }
            }
        }
    });

    // Debug helper - expose current mode
    window.getCurrentMode = function() {
        return document.body.getAttribute('data-mode');
    };

    console.log('✅ Voice/Manual Mode Controller loaded');
})();
