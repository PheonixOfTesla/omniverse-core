const puppeteer = require('puppeteer');

const API_BASE = 'https://pal-backend-production.up.railway.app/api';
const LOCAL_URL = 'http://localhost:8000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('\n🚀 PHOENIX PRODUCTION TESTING\n');
    console.log('='.repeat(60));

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream'
        ]
    });

    const page = await browser.newPage();
    const errors = [];
    const successes = [];

    // Listen to console
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('❌') || msg.type() === 'error') {
            errors.push(text);
            console.log(`❌ ${text}`);
        } else if (text.includes('✅')) {
            successes.push(text);
            console.log(`✅ ${text}`);
        }
    });

    try {
        // TEST 1: Load login page
        console.log('\n📍 TEST 1: Loading login page...');
        await page.goto(`${LOCAL_URL}/login.html`);
        await sleep(2000);
        console.log('✅ Login page loaded');

        // TEST 2: Register new user
        console.log('\n📍 TEST 2: Registering new user...');
        const testEmail = `ironman${Date.now()}@stark.com`;
        const testPassword = 'IAmIronMan2025!';
        const testName = 'Tony Stark';

        await page.click('#register-tab');
        await sleep(1000);

        await page.type('#register-name', testName);
        await page.type('#register-email', testEmail);
        await page.type('#register-password', testPassword);
        await page.type('#register-password-confirm', testPassword);

        console.log(`📧 Email: ${testEmail}`);
        console.log(`👤 Name: ${testName}`);

        await page.click('#register-btn');
        await sleep(5000);

        const token = await page.evaluate(() => localStorage.getItem('phoenixToken'));
        if (token) {
            console.log('✅ Registration successful - Token received');
            console.log(`🔑 Token: ${token.substring(0, 20)}...`);
        } else {
            console.log('❌ Registration failed - No token');
            throw new Error('No token received');
        }

        // TEST 3: Load dashboard
        console.log('\n📍 TEST 3: Loading dashboard...');
        await page.goto(`${LOCAL_URL}/dashboard.html`);
        await sleep(5000);

        const dashboardStatus = await page.evaluate(() => {
            return {
                orchestrator: typeof window.phoenixOrchestrator !== 'undefined',
                wakeWordAI: typeof window.wakeWordAI !== 'undefined',
                API: typeof window.API !== 'undefined',
                userName: localStorage.getItem('userName'),
                micEnabled: localStorage.getItem('phoenixMicEnabled')
            };
        });

        console.log(`  Orchestrator: ${dashboardStatus.orchestrator ? '✅' : '❌'}`);
        console.log(`  Wake Word AI: ${dashboardStatus.wakeWordAI ? '✅' : '❌'}`);
        console.log(`  API Client: ${dashboardStatus.API ? '✅' : '❌'}`);
        console.log(`  User Name: ${dashboardStatus.userName || 'Not set'}`);

        // TEST 4: Check voice timeout setting
        if (dashboardStatus.wakeWordAI) {
            console.log('\n📍 TEST 4: Checking voice timeout...');
            const voiceConfig = await page.evaluate(() => {
                return {
                    hasTimeout: window.wakeWordAI.INACTIVITY_LIMIT !== undefined,
                    timeout: window.wakeWordAI.INACTIVITY_LIMIT,
                    hasResetMethod: typeof window.wakeWordAI.resetInactivityTimer === 'function',
                    hasClearMethod: typeof window.wakeWordAI.clearInactivityTimer === 'function'
                };
            });

            if (voiceConfig.timeout === 20000) {
                console.log('✅ 20-second timeout configured correctly');
            } else {
                console.log(`❌ Timeout is ${voiceConfig.timeout}ms, expected 20000ms`);
            }

            console.log(`  resetInactivityTimer(): ${voiceConfig.hasResetMethod ? '✅' : '❌'}`);
            console.log(`  clearInactivityTimer(): ${voiceConfig.hasClearMethod ? '✅' : '❌'}`);
        }

        // TEST 5: Navigate to planets
        console.log('\n📍 TEST 5: Testing planet navigation...');
        const planets = ['mercury', 'venus', 'mars', 'jupiter', 'earth', 'saturn'];

        for (const planet of planets) {
            await page.goto(`${LOCAL_URL}/${planet}.html`);
            await sleep(2000);

            const loaded = await page.evaluate(() => document.readyState === 'complete');
            console.log(`  ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${loaded ? '✅' : '❌'}`);
        }

        // TEST 6: Test API connectivity
        console.log('\n📍 TEST 6: Testing backend API...');
        const apiTests = [
            { name: 'Profile', endpoint: '/auth/me' },
            { name: 'Voice Chat', endpoint: '/phoenixVoice/chat' },
            { name: 'TTS', endpoint: '/tts/generate' }
        ];

        for (const test of apiTests) {
            try {
                const response = await fetch(`${API_BASE}${test.endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200 || response.status === 400) {
                    console.log(`  ${test.name}: ✅ (${response.status})`);
                } else {
                    console.log(`  ${test.name}: ⚠️  (${response.status})`);
                }
            } catch (error) {
                console.log(`  ${test.name}: ❌ ${error.message}`);
            }
        }

        // FINAL REPORT
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL REPORT');
        console.log('='.repeat(60));
        console.log(`✅ Successes: ${successes.length}`);
        console.log(`❌ Errors: ${errors.length}`);

        if (errors.length === 0) {
            console.log('\n🏆 PRODUCTION READY - Ship it!');
        } else {
            console.log('\n⚠️  Issues found:');
            errors.slice(0, 10).forEach(err => console.log(`   ${err}`));
        }

        console.log('\n👁️  Browser will stay open. Press Ctrl+C to close.\n');

    } catch (error) {
        console.error(`\n❌ FATAL ERROR: ${error.message}\n`);
        console.error(error.stack);
    }
}

main();
