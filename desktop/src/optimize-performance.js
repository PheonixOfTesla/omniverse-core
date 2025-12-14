/**
 * PERFORMANCE OPTIMIZATION ANALYZER
 * Identifies and reports performance bottlenecks in Phoenix
 */

const puppeteer = require('puppeteer');

async function analyzePerformance() {
    console.log('⚡ PHOENIX PERFORMANCE ANALYZER\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--disable-web-security'],
        devtools: true
    });

    const page = await browser.newPage();

    try {
        console.log('📊 Measuring initial page load...\n');

        // Enable performance metrics
        await page.evaluateOnNewDocument(() => {
            window.performance.mark('start');
        });

        const startTime = Date.now();
        await page.goto('http://localhost:8000/index.html', {
            waitUntil: 'networkidle0'
        });
        const loadTime = Date.now() - startTime;

        console.log(`⏱️  Initial Load Time: ${loadTime}ms\n`);

        // Get detailed performance metrics
        const metrics = await page.metrics();
        console.log('📈 Performance Metrics:');
        console.log(`   DOM Nodes: ${metrics.Nodes}`);
        console.log(`   JS Heap Size: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Layout Count: ${metrics.LayoutCount}`);
        console.log(`   Recalc Style Count: ${metrics.RecalcStyleCount}\n`);

        // Analyze CSS animations
        const animationCount = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            let animatedElements = 0;
            let blurElements = 0;

            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.animation !== 'none') animatedElements++;
                if (style.backdropFilter !== 'none' || style.filter !== 'none') blurElements++;
            });

            return { animatedElements, blurElements };
        });

        console.log('🎨 Animation Analysis:');
        console.log(`   Animated Elements: ${animationCount.animatedElements}`);
        console.log(`   Elements with Blur/Filter: ${animationCount.blurElements}\n`);

        // Check for heavy scripts
        const scriptSizes = await page.evaluate(() => {
            return Array.from(document.scripts)
                .filter(s => s.src)
                .map(s => s.src);
        });

        console.log('📦 Loaded Scripts:', scriptSizes.length);

        // Measure FPS
        console.log('\n🎬 Measuring FPS for 5 seconds...');
        const fps = await page.evaluate(() => {
            return new Promise(resolve => {
                let frameCount = 0;
                const startTime = performance.now();

                function countFrames() {
                    frameCount++;
                    if (performance.now() - startTime < 5000) {
                        requestAnimationFrame(countFrames);
                    } else {
                        const avgFPS = frameCount / 5;
                        resolve(avgFPS);
                    }
                }

                requestAnimationFrame(countFrames);
            });
        });

        console.log(`   Average FPS: ${fps.toFixed(2)}`);

        // Performance recommendations
        console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');

        if (animationCount.animatedElements > 10) {
            console.log('   ⚠️  Too many simultaneous animations (reduce or use will-change)');
        }

        if (animationCount.blurElements > 5) {
            console.log('   ⚠️  Too many blur effects (backdrop-filter is expensive)');
        }

        if (metrics.RecalcStyleCount > 100) {
            console.log('   ⚠️  High style recalculation count (optimize CSS)');
        }

        if (fps < 55) {
            console.log('   ⚠️  Low FPS detected (GPU acceleration needed)');
        }

        if (metrics.JSHeapUsedSize > 50 * 1024 * 1024) {
            console.log('   ⚠️  High memory usage (check for memory leaks)');
        }

        console.log('\n🛑 Press Ctrl+C to close');

        await new Promise(resolve => setTimeout(resolve, 300000));

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

analyzePerformance().catch(console.error);
