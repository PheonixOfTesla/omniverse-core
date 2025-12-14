const puppeteer = require('puppeteer');

(async () => {
    console.log('🌐 Opening fresh cache-free browser for manual testing...\n');

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--incognito', // Incognito mode
            '--disk-cache-size=0', // No disk cache
            '--media-cache-size=0', // No media cache
            '--disable-application-cache', // No app cache
            '--disable-cache',
            '--disable-offline-load-stale-cache'
        ],
        defaultViewport: { width: 1920, height: 1080 },
        devtools: true // Open DevTools automatically
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    // Disable cache via CDP
    const client = await page.target().createCDPSession();
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });

    // Navigate to Phoenix
    console.log('📍 Loading: http://localhost:8000/index.html');
    console.log('🔧 DevTools: OPEN');
    console.log('🚫 Cache: DISABLED');
    console.log('🕵️  Mode: Incognito\n');

    await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle2' });

    console.log('✅ Browser ready for testing!');
    console.log('💡 Browser will stay open - close it manually when done\n');
    console.log('📋 Quick Test Checklist:');
    console.log('   □ Phoenix Orb visible and animating?');
    console.log('   □ Can navigate to planets?');
    console.log('   □ Voice interface accessible?');
    console.log('   □ Console shows no errors?');
    console.log('   □ Network tab shows API calls?');
    console.log('\n🎮 Happy testing!\n');

    // Keep the script alive so browser doesn't close
    await new Promise(resolve => {
        // Browser will stay open until manually closed
        browser.on('disconnected', () => {
            console.log('👋 Browser closed. Exiting...');
            resolve();
        });
    });
})();
