/**
 * CONSOLE MONITOR
 * Opens Phoenix locally and displays all console output in real-time
 */

const puppeteer = require('puppeteer');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function monitorConsole() {
    console.log('🔍 PHOENIX CONSOLE MONITOR\n');
    console.log('Opening site at http://localhost:8000/index.html');
    console.log('All browser console messages will appear below:\n');
    console.log('=' .repeat(70));

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--disable-web-security'],
        devtools: true  // Open DevTools automatically
    });

    const page = await browser.newPage();

    // Capture ALL console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();

        // Color-code by type
        const prefix = {
            'log': '📋',
            'info': 'ℹ️ ',
            'warn': '⚠️ ',
            'error': '❌',
            'debug': '🐛'
        }[type] || '  ';

        // Highlight important messages
        if (text.includes('JARVIS')) {
            console.log(`${prefix} 🤖 ${text}`);
        } else if (text.includes('⚡') || text.includes('initialized')) {
            console.log(`${prefix} ⚡ ${text}`);
        } else if (text.includes('Orb') || text.includes('voice')) {
            console.log(`${prefix} 🎨 ${text}`);
        } else if (type === 'error') {
            console.log(`${prefix} ${text}`);
        } else {
            console.log(`${prefix} ${text}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        console.log('❌ PAGE ERROR:', error.message);
    });

    // Capture network errors
    page.on('requestfailed', request => {
        console.log(`❌ REQUEST FAILED: ${request.url()}`);
    });

    try {
        await page.goto('http://localhost:8000/index.html', {
            waitUntil: 'networkidle0',
            timeout: 10000
        });

        console.log('\n✅ Page loaded - monitoring console...');
        console.log('💡 Interact with the site normally');
        console.log('🛑 Press Ctrl+C to stop monitoring\n');
        console.log('=' .repeat(70) + '\n');

        // Keep monitoring indefinitely
        await wait(600000); // 10 minutes

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
}

monitorConsole().catch(console.error);
