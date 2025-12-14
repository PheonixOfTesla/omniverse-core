const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Set token from previous login
    await page.goto('http://localhost:8000/mercury.html');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Capture what's showing
    const bodyText = await page.evaluate(() => {
        return {
            loadingVisible: document.getElementById('loading')?.style.display !== 'none',
            dashboardVisible: document.getElementById('dashboard')?.style.display !== 'none',
            emptyStateVisible: document.getElementById('emptyState')?.style.display !== 'none',
            recoveryScore: document.getElementById('recoveryScore')?.textContent,
            bodySnippet: document.body.innerText.substring(0, 500)
        };
    });

    console.log('\n=== MERCURY CURRENT STATE ===');
    console.log('Loading visible:', bodyText.loadingVisible);
    console.log('Dashboard visible:', bodyText.dashboardVisible);
    console.log('Empty state visible:', bodyText.emptyStateVisible);
    console.log('Recovery score text:', bodyText.recoveryScore);
    console.log('\nBody text preview:');
    console.log(bodyText.bodySnippet);

    await page.screenshot({ path: 'CURRENT-STATE-Mercury.png' });
    console.log('\n📸 Screenshot saved as CURRENT-STATE-Mercury.png');

    // Keep browser open for 30 seconds so you can see it
    console.log('\nBrowser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);

    await browser.close();
})();
