const puppeteer = require('puppeteer');
const https = require('https');

// Check Railway backend status
async function checkRailwayStatus() {
  console.log('\n🚂 CHECKING RAILWAY BACKEND...');
  console.log('='.repeat(60));

  return new Promise((resolve) => {
    https.get('https://pal-backend-production.up.railway.app/api/auth/docs', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Railway Backend: ONLINE');
          console.log('✅ Status Code:', res.statusCode);
          resolve(true);
        } else {
          console.log('❌ Railway Backend: ERROR');
          console.log('❌ Status Code:', res.statusCode);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Railway Backend: OFFLINE');
      console.log('❌ Error:', err.message);
      resolve(false);
    });
  });
}

async function debugDashboard() {
  console.log('\n🔍 STARTING COMPREHENSIVE DEBUG...\n');

  // Check Railway first
  const railwayUp = await checkRailwayStatus();
  if (!railwayUp) {
    console.log('\n⚠️  WARNING: Railway backend is not responding!');
  }

  console.log('\n🌐 LAUNCHING BROWSER...');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--window-size=1920,1080',
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  const page = await browser.newPage();

  // Tracking variables
  const logs = {
    console: [],
    errors: [],
    warnings: [],
    networkErrors: [],
    railwayRequests: [],
    ttsEvents: []
  };

  // Monitor console logs
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    // Categorize logs
    if (type === 'error') {
      logs.errors.push(text);
      console.log(`❌ [ERROR]: ${text}`);
    } else if (type === 'warning') {
      logs.warnings.push(text);
      console.log(`⚠️  [WARN]: ${text}`);
    } else if (text.includes('TTS') || text.includes('speech') || text.includes('voice') || text.includes('🎤')) {
      logs.ttsEvents.push(text);
      console.log(`🎤 [TTS]: ${text}`);
    } else if (text.includes('Railway') || text.includes('pal-backend-production')) {
      logs.railwayRequests.push(text);
      console.log(`🚂 [RAILWAY]: ${text}`);
    } else if (text.includes('✅') || text.includes('🚀') || text.includes('INITIALIZED')) {
      console.log(`✨ [SUCCESS]: ${text}`);
    } else {
      logs.console.push(text);
      console.log(`📱 [LOG]: ${text}`);
    }
  });

  // Monitor network requests
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();

    if (url.includes('pal-backend-production.up.railway.app')) {
      const method = response.request().method();
      const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';

      logs.railwayRequests.push({
        method,
        url: url.replace('https://pal-backend-production.up.railway.app', ''),
        status
      });

      console.log(`${statusEmoji} [RAILWAY ${method}] ${status} - ${url.replace('https://pal-backend-production.up.railway.app', '')}`);

      if (status >= 400) {
        try {
          const body = await response.text();
          console.log(`   📄 Response: ${body.substring(0, 200)}`);
        } catch (e) {}
      }
    }
  });

  // Monitor failed requests
  page.on('requestfailed', request => {
    const url = request.url();
    logs.networkErrors.push(url);
    console.log(`❌ [NETWORK FAIL]: ${url}`);
    console.log(`   Failure: ${request.failure().errorText}`);
  });

  try {
    console.log('\n📄 LOADING DASHBOARD...');
    console.log('='.repeat(60));

    await page.goto('http://localhost:8000/dashboard.html', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    console.log('✅ Dashboard loaded\n');

    // Wait for initialization
    console.log('⏳ Waiting for Phoenix initialization...');
    await page.waitForTimeout(3000);

    // Check if config is loaded correctly
    console.log('\n⚙️  CHECKING CONFIGURATION...');
    console.log('='.repeat(60));

    const config = await page.evaluate(() => {
      return {
        apiUrl: window.PhoenixConfig?.API_BASE_URL,
        wsUrl: window.PhoenixConfig?.WS_URL,
        env: window.PhoenixConfig?.NODE_ENV,
        phoenixLoaded: typeof window.PhoenixAPI !== 'undefined',
        ttsAvailable: 'speechSynthesis' in window
      };
    });

    console.log('API URL:', config.apiUrl);
    console.log('WebSocket URL:', config.wsUrl);
    console.log('Environment:', config.env);
    console.log('Phoenix API Loaded:', config.phoenixLoaded ? '✅' : '❌');
    console.log('TTS Available:', config.ttsAvailable ? '✅' : '❌');

    // Test Railway connection
    console.log('\n🧪 TESTING RAILWAY CONNECTION...');
    console.log('='.repeat(60));

    const railwayTest = await page.evaluate(async () => {
      try {
        const response = await fetch('https://pal-backend-production.up.railway.app/api/auth/docs');
        const data = await response.json();
        return {
          success: true,
          status: response.status,
          hasData: !!data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    if (railwayTest.success) {
      console.log('✅ Railway API is reachable from browser');
      console.log(`✅ Status: ${railwayTest.status}`);
    } else {
      console.log('❌ Railway API NOT reachable from browser');
      console.log(`❌ Error: ${railwayTest.error}`);
    }

    // Test TTS
    console.log('\n🎤 TESTING TTS FUNCTIONALITY...');
    console.log('='.repeat(60));

    const ttsTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
          resolve({ available: false, error: 'Speech Synthesis not available' });
          return;
        }

        const startTime = performance.now();
        const utterance = new SpeechSynthesisUtterance('Testing Phoenix TTS. Can you hear me?');

        utterance.rate = 1.2;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          console.log('🎤 TTS Started!');
        };

        utterance.onend = () => {
          const duration = performance.now() - startTime;
          resolve({
            available: true,
            success: true,
            duration: duration,
            message: 'TTS working!'
          });
        };

        utterance.onerror = (error) => {
          resolve({
            available: true,
            success: false,
            error: error.error
          });
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          resolve({
            available: true,
            success: false,
            error: error.message
          });
        }
      });
    });

    if (ttsTest.success) {
      console.log('✅ TTS is working!');
      console.log(`✅ Duration: ${ttsTest.duration.toFixed(2)}ms`);
      console.log('🔊 You should hear: "Testing Phoenix TTS. Can you hear me?"');
    } else {
      console.log('❌ TTS failed');
      console.log(`❌ Error: ${ttsTest.error}`);
    }

    // Test wake word detection
    console.log('\n👂 CHECKING WAKE WORD DETECTION...');
    console.log('='.repeat(60));

    const wakeWordStatus = await page.evaluate(() => {
      return {
        recognitionAvailable: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        wakeWordActive: typeof window.wakeWordDetector !== 'undefined'
      };
    });

    console.log('Speech Recognition Available:', wakeWordStatus.recognitionAvailable ? '✅' : '❌');
    console.log('Wake Word Detector Active:', wakeWordStatus.wakeWordActive ? '✅' : '❌');

    // Summary Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Console Logs: ${logs.console.length}`);
    console.log(`Errors: ${logs.errors.length}`);
    console.log(`Warnings: ${logs.warnings.length}`);
    console.log(`Network Failures: ${logs.networkErrors.length}`);
    console.log(`Railway Requests: ${logs.railwayRequests.length}`);
    console.log(`TTS Events: ${logs.ttsEvents.length}`);

    if (logs.errors.length > 0) {
      console.log('\n❌ TOP ERRORS:');
      logs.errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.substring(0, 100)}`);
      });
    }

    if (logs.networkErrors.length > 0) {
      console.log('\n❌ NETWORK FAILURES:');
      logs.networkErrors.slice(0, 5).forEach(url => {
        console.log(`   - ${url}`);
      });
    }

    // Overall status
    console.log('\n' + '='.repeat(60));
    console.log('🎯 OVERALL STATUS');
    console.log('='.repeat(60));

    const allGood =
      railwayTest.success &&
      ttsTest.success &&
      config.ttsAvailable &&
      wakeWordStatus.recognitionAvailable;

    if (allGood) {
      console.log('✅ ALL SYSTEMS OPERATIONAL!');
      console.log('✅ Railway: Connected');
      console.log('✅ TTS: Working');
      console.log('✅ Voice: Ready');
      console.log('\n🎉 Dashboard is ready for Siri-like experience!');
    } else {
      console.log('⚠️  SOME ISSUES DETECTED:');
      if (!railwayTest.success) console.log('❌ Railway connection failed');
      if (!ttsTest.success) console.log('❌ TTS not working');
      if (!config.ttsAvailable) console.log('❌ TTS API not available');
      if (!wakeWordStatus.recognitionAvailable) console.log('❌ Speech recognition not available');
    }

    console.log('\n⏳ Keeping browser open for 15 seconds...');
    console.log('   Try saying "Hey Phoenix" to test wake word!');
    console.log('   Check the browser console for real-time logs.');

    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error.message);
    console.error(error.stack);
  }

  await browser.close();
  console.log('\n✅ Debug session complete!');
}

// Run the debug
checkRailwayStatus().then(() => {
  debugDashboard().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
});
