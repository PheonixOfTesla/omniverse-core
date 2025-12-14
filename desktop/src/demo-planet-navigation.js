/**
 * PLANET NAVIGATION SYSTEM DEMO
 * Opens the dashboard with the new planet navigation system
 * Click the left edge tab to open the planet panel!
 */

const puppeteer = require('puppeteer');

(async () => {
    console.log('\n🌟 OPENING PLANET NAVIGATION DEMO\n');
    console.log('='.repeat(70));
    console.log('\n📝 Features to test:');
    console.log('   1. Click the glowing tab on the LEFT EDGE to open planet panel');
    console.log('   2. Panel should slide in showing 6 planets');
    console.log('   3. Click any planet to see holographic analysis view');
    console.log('   4. Click X button to close hologram');
    console.log('   5. Click left edge tab again to close panel\n');
    console.log('='.repeat(70));

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: [
            '--disable-web-security',
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled'
        ],
        devtools: false
    });

    const page = await browser.newPage();

    console.log('\n⏳ Loading dashboard...\n');

    await page.goto('http://localhost:8000/dashboard.html', {
        waitUntil: 'networkidle2',
        timeout: 15000
    });

    // Set token
    await page.evaluate(() => {
        localStorage.setItem('phoenixToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzI3YTBiODczOTY1OTExYWVmYTBhNCIsImlhdCI6MTczMDQyMDAxOSwiZXhwIjoxNzMzMDEyMDE5fQ.LblCaEzKOjYFcIrBRhHhHQ7KlqFPjRPJiUKZ2OoPbOk');
    });

    // Reload with token
    await page.reload({ waitUntil: 'networkidle2' });

    console.log('✅ Dashboard loaded\n');
    console.log('⏳ Waiting for greeting to disappear (6 seconds)...\n');

    await new Promise(r => setTimeout(r, 6000));

    console.log('✅ Ready to test!\n');
    console.log('👉 Look for the glowing PLANETS tab on the LEFT EDGE of the screen');
    console.log('👉 Click it to open the planet selection panel\n');
    console.log('🎨 Each planet has its own color scheme:');
    console.log('   • MARS (red-orange) - Fitness & Workout Analysis');
    console.log('   • VENUS (green) - Nutrition & Meal Planning');
    console.log('   • JUPITER (gold) - Growth & Goal Tracking');
    console.log('   • MERCURY (light blue) - AI Conversation & Insights');
    console.log('   • SATURN (dark gold) - Task Management & Automation');
    console.log('   • URANUS (turquoise) - Data Insights & Analytics\n');
    console.log('='.repeat(70));
    console.log('\n⏸️  Browser will stay open indefinitely for testing...');
    console.log('   Press Ctrl+C in terminal to close when done.\n');

    // Keep browser open indefinitely
    await new Promise(() => {});
})();
