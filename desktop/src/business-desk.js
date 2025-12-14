/**
 * BUSINESS DESK MODE CONTROLLER
 * Manages desk mode interface, data loading, and voice integration
 */

const API_BASE = window.PhoenixConfig?.API_BASE_URL || 'https://pal-backend-production.up.railway.app/api';
let phoenixToken = localStorage.getItem('phoenixToken');

/**
 * Initialize Desk Mode on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🖥️ Initializing Business Desk Mode...');

    // Check authentication
    if (!phoenixToken) {
        console.error('❌ No auth token - redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    // Load business dashboard data
    await loadDashboardData();

    // Set up workspace tab switching
    setupWorkspaceTabs();

    // Set up voice integration
    setupVoiceIntegration();

    console.log('✅ Business Desk Mode initialized');
});

/**
 * Load Business Dashboard Data
 */
async function loadDashboardData() {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/business/dashboard`, {
            headers: {
                'Authorization': `Bearer ${phoenixToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            updateQuickStats(result.data);
        }
    } catch (error) {
        console.error('❌ Failed to load dashboard:', error);
        showError('Failed to load business data');
    } finally {
        showLoading(false);
    }
}

/**
 * Update Quick Stats Cards
 */
function updateQuickStats(data) {
    // Revenue
    document.getElementById('revenue-value').textContent = `$${data.revenue.thisMonth.toLocaleString()}`;
    document.getElementById('revenue-subtitle').textContent = `${data.orders.completed} completed orders`;

    // Active Orders
    document.getElementById('orders-value').textContent = data.orders.active;
    document.getElementById('orders-subtitle').textContent = `${data.orders.total} total`;

    // Outstanding Invoices
    document.getElementById('invoices-value').textContent = `$${data.invoices.outstandingAmount.toLocaleString()}`;
    document.getElementById('invoices-subtitle').textContent = `${data.invoices.outstanding} invoices`;

    // Clients
    document.getElementById('clients-value').textContent = data.clients.total;
    document.getElementById('clients-subtitle').textContent = `${data.clients.active} active`;

    // Low Stock
    document.getElementById('inventory-value').textContent = data.inventory.lowStock;

    // Add alert styling if there are low stock items
    const inventoryCard = document.getElementById('inventory-card');
    if (data.inventory.lowStock > 0) {
        inventoryCard.classList.add('alert-card');
    } else {
        inventoryCard.classList.remove('alert-card');
    }
}

/**
 * Setup Workspace Tab Switching
 */
function setupWorkspaceTabs() {
    const tabs = document.querySelectorAll('.workspace-tab');
    const views = document.querySelectorAll('.workspace-view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewName = tab.getAttribute('data-view');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active view
            views.forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(`${viewName}-view`);
            if (targetView) {
                targetView.classList.add('active');

                // Load data for this view
                loadViewData(viewName);
            }
        });
    });
}

/**
 * Load Data for Specific View
 */
async function loadViewData(viewName) {
    showLoading(true);

    try {
        let endpoint = '';
        let containerId = '';

        switch (viewName) {
            case 'clients':
                endpoint = '/business/clients';
                containerId = 'clients-table-container';
                break;
            case 'orders':
                endpoint = '/business/orders';
                containerId = 'orders-kanban-container';
                break;
            case 'invoices':
                endpoint = '/business/invoices';
                containerId = 'invoices-table-container';
                break;
            case 'inventory':
                endpoint = '/business/inventory';
                containerId = 'inventory-table-container';
                break;
            case 'dashboard':
                // Dashboard already loaded
                return;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${phoenixToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            renderData(viewName, result.data, containerId);
        }
    } catch (error) {
        console.error(`❌ Failed to load ${viewName}:`, error);
        showError(`Failed to load ${viewName} data`);
    } finally {
        showLoading(false);
    }
}

/**
 * Render Data in View
 */
function renderData(viewName, data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(0, 217, 255, 0.5);">
                <p>No ${viewName} yet. Use voice or click the button to add one!</p>
            </div>
        `;
        return;
    }

    switch (viewName) {
        case 'clients':
            renderClientsTable(data, container);
            break;
        case 'orders':
            renderOrdersKanban(data, container);
            break;
        case 'invoices':
            renderInvoicesTable(data, container);
            break;
        case 'inventory':
            renderInventoryTable(data, container);
            break;
    }
}

/**
 * Render Clients Table
 */
function renderClientsTable(data, container) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Last Contact</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(client => `
                    <tr>
                        <td><strong>${client.data.client_name || 'N/A'}</strong></td>
                        <td>${client.data.email || 'N/A'}</td>
                        <td>${client.data.phone || 'N/A'}</td>
                        <td><span class="status-badge status-${(client.data.status || 'lead').toLowerCase()}">${client.data.status || 'Lead'}</span></td>
                        <td>${client.data.last_contact ? new Date(client.data.last_contact).toLocaleDateString() : 'N/A'}</td>
                        <td>
                            <button class="icon-btn" onclick="viewClient('${client._id}')" title="View">👁️</button>
                            <button class="icon-btn" onclick="emailClient('${client._id}')" title="Email">📧</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

/**
 * Render Orders Kanban
 */
function renderOrdersKanban(data, container) {
    const statuses = ['Quote', 'Confirmed', 'In Progress', 'Complete'];
    const ordersByStatus = {};

    statuses.forEach(status => {
        ordersByStatus[status] = data.filter(o => o.data.status === status);
    });

    const html = `
        <div class="kanban-board">
            ${statuses.map(status => `
                <div class="kanban-column">
                    <div class="kanban-header">
                        <h4>${status}</h4>
                        <span class="count">${ordersByStatus[status].length}</span>
                    </div>
                    <div class="kanban-cards">
                        ${ordersByStatus[status].map(order => `
                            <div class="kanban-card" onclick="viewOrder('${order._id}')">
                                <div class="card-title">${order.data.title || 'Untitled'}</div>
                                <div class="card-meta">${order.data.client || 'No client'}</div>
                                ${order.data.revenue ? `<div class="card-amount">$${parseFloat(order.data.revenue).toLocaleString()}</div>` : ''}
                                ${order.data.event_date ? `<div class="card-date">📅 ${new Date(order.data.event_date).toLocaleDateString()}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    container.innerHTML = html;
}

/**
 * Render Invoices Table
 */
function renderInvoicesTable(data, container) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(invoice => `
                    <tr>
                        <td><strong>${invoice.data.invoice_number || 'N/A'}</strong></td>
                        <td>${invoice.data.client || 'N/A'}</td>
                        <td>$${parseFloat(invoice.data.amount || 0).toLocaleString()}</td>
                        <td>${invoice.data.due_date ? new Date(invoice.data.due_date).toLocaleDateString() : 'N/A'}</td>
                        <td><span class="status-badge status-${(invoice.data.status || 'draft').toLowerCase()}">${invoice.data.status || 'Draft'}</span></td>
                        <td>
                            <button class="icon-btn" onclick="viewInvoice('${invoice._id}')" title="View">👁️</button>
                            <button class="icon-btn" onclick="sendInvoice('${invoice._id}')" title="Send">📧</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

/**
 * Render Inventory Table
 */
function renderInventoryTable(data, container) {
    const html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Reorder Point</th>
                    <th>Supplier</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => {
                    const isLowStock = (item.data.quantity || 0) <= (item.data.reorder_point || 0);
                    return `
                        <tr class="${isLowStock ? 'low-stock-row' : ''}">
                            <td><strong>${item.data.item_name || 'N/A'}</strong></td>
                            <td>${item.data.quantity || 0}</td>
                            <td>${item.data.unit || 'units'}</td>
                            <td>${item.data.reorder_point || 0}</td>
                            <td>${item.data.supplier || 'N/A'}</td>
                            <td>
                                <button class="icon-btn" onclick="adjustQuantity('${item._id}')" title="Adjust">➕</button>
                                ${isLowStock ? '<button class="icon-btn" onclick="reorderItem(\''+item._id+'\')" title="Reorder">🛒</button>' : ''}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

/**
 * Setup Voice Integration
 */
function setupVoiceIntegration() {
    const orb = document.getElementById('desk-orb');
    const statusEl = document.getElementById('orb-status');

    // Initialize voice commands if available
    if (window.phoenixVoiceCommands) {
        console.log('✅ Voice commands available in desk mode');
    }
}

/**
 * Toggle Voice Assistant
 */
function toggleVoiceAssistant() {
    const orb = document.getElementById('desk-orb');
    const statusEl = document.getElementById('orb-status');

    if (window.phoenixVoiceCommands) {
        if (window.phoenixVoiceCommands.isListening) {
            window.phoenixVoiceCommands.stopListening();
            orb.classList.remove('listening');
            statusEl.textContent = 'Click to activate voice';
        } else {
            window.phoenixVoiceCommands.startListening();
            orb.classList.add('listening');
            statusEl.textContent = 'Listening...';
        }
    } else {
        console.error('Voice commands not available');
    }
}

/**
 * Execute Voice Command (from quick action buttons)
 */
function voiceCommand(command) {
    const transcriptDisplay = document.getElementById('transcript-display');

    // Show command in transcript
    transcriptDisplay.innerHTML = `<p class="transcript-text">🎙️ "${command}"</p>`;

    // Process command
    processBusinessVoiceCommand(command);
}

/**
 * Process Business Voice Command
 */
async function processBusinessVoiceCommand(transcript) {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/business/voice-command`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${phoenixToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transcript })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Show response in transcript
            const transcriptDisplay = document.getElementById('transcript-display');
            transcriptDisplay.innerHTML += `<p class="transcript-response">✅ ${result.message}</p>`;

            // Handle action
            if (result.action) {
                handleVoiceAction(result.action, result.data);
            }

            // Reload dashboard data
            await loadDashboardData();
        } else {
            throw new Error(result.error || 'Command failed');
        }
    } catch (error) {
        console.error('❌ Voice command failed:', error);
        const transcriptDisplay = document.getElementById('transcript-display');
        transcriptDisplay.innerHTML += `<p class="transcript-response" style="color: #ff4444;">❌ ${error.message}</p>`;
    } finally {
        showLoading(false);
    }
}

/**
 * Handle Voice Action Result
 */
function handleVoiceAction(action, data) {
    switch (action) {
        case 'display_clients':
            switchToView('clients');
            break;
        case 'display_orders':
            switchToView('orders');
            break;
        case 'display_invoices':
            switchToView('invoices');
            break;
        case 'display_inventory':
            switchToView('inventory');
            break;
        case 'show_business_dashboard':
            switchToView('dashboard');
            break;
    }
}

/**
 * Switch to View
 */
function switchToView(viewName) {
    const tab = document.querySelector(`[data-view="${viewName}"]`);
    if (tab) {
        tab.click();
    }
}

/**
 * Show/Hide Loading Overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

/**
 * Show Error Message
 */
function showError(message) {
    // TODO: Implement toast notification
    console.error(message);
    alert(message);
}

/**
 * Placeholder action functions
 */
function addClient() {
    voiceCommand('add new client');
}

function addOrder() {
    voiceCommand('create new order');
}

function createInvoice() {
    voiceCommand('create invoice');
}

function addInventoryItem() {
    voiceCommand('add inventory item');
}

function filterLowStock() {
    voiceCommand('show low stock items');
}

function viewClient(id) {
    console.log('View client:', id);
}

function emailClient(id) {
    console.log('Email client:', id);
}

function viewOrder(id) {
    console.log('View order:', id);
}

function viewInvoice(id) {
    console.log('View invoice:', id);
}

function sendInvoice(id) {
    console.log('Send invoice:', id);
}

function adjustQuantity(id) {
    console.log('Adjust quantity:', id);
}

function reorderItem(id) {
    console.log('Reorder item:', id);
}
