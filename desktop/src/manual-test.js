const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Opening Phoenix for manual testing...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--no-sandbox'
        ]
    });

    const page = await browser.newPage();

    // Collect console logs
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();

        if (type === 'error') {
            console.log(`❌ ERROR: ${text}`);
            logs.push({ type: 'error', text });
        } else if (text.includes('❌') || text.includes('ERROR')) {
            console.log(`⚠️  ${text}`);
            logs.push({ type: 'warning', text });
        } else if (text.includes('✅')) {
            console.log(`✅ ${text}`);
        }
    });

    // Navigate to dashboard
    console.log('📍 Loading dashboard...');
    await page.goto('http://localhost:8000/dashboard.html');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Check what's loaded
    const status = await page.evaluate(() => {
        return {
            orchestrator: typeof window.phoenixOrchestrator !== 'undefined',
            wakeWordAI: typeof window.wakeWordAI !== 'undefined',
            API: typeof window.API !== 'undefined',
            hasToken: !!localStorage.getItem('phoenixToken'),
            readyState: document.readyState,
            errors: logs
        };
    });

    console.log('\n📊 Dashboard Status:');
    console.log(`  Orchestrator: ${status.orchestrator ? '✅' : '❌'}`);
    console.log(`  Wake Word AI: ${status.wakeWordAI ? '✅' : '❌'}`);
    console.log(`  API Client: ${status.API ? '✅' : '❌'}`);
    console.log(`  Has Auth Token: ${status.hasToken ? '✅' : '❌'}`);
    console.log(`  Document State: ${status.readyState}`);

    console.log('\n👁️  Browser is open. Check the console in DevTools.');
    console.log('💬 To test voice, enable microphone and say "Hey Phoenix"');
    console.log('⌨️  Press Ctrl+C here when done.\n');

})();
