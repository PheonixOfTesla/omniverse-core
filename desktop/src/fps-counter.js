/**
 * IN-BROWSER FPS COUNTER
 * Paste this into Safari's Developer Console to monitor real-time FPS
 */

(function() {
    console.log('🎮 Starting FPS Counter...\n');

    let fps = 0;
    let lastTime = performance.now();
    let frames = 0;
    let fpsValues = [];

    // Create FPS display overlay
    const fpsDisplay = document.createElement('div');
    fpsDisplay.id = 'fps-monitor';
    fpsDisplay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        padding: 15px 20px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        border-radius: 10px;
        z-index: 999999;
        border: 2px solid #00ff00;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        min-width: 250px;
    `;
    document.body.appendChild(fpsDisplay);

    function updateFPS(currentTime) {
        frames++;
        const delta = currentTime - lastTime;

        if (delta >= 1000) {
            fps = Math.round((frames * 1000) / delta);
            fpsValues.push(fps);

            // Keep only last 60 values (1 minute at 1 fps update/sec)
            if (fpsValues.length > 60) {
                fpsValues.shift();
            }

            // Calculate stats
            const avgFPS = Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length);
            const minFPS = Math.min(...fpsValues);
            const maxFPS = Math.max(...fpsValues);

            // Color based on FPS
            let color = '#00ff00'; // Green for 60 FPS
            if (fps < 30) color = '#ff0000'; // Red
            else if (fps < 45) color = '#ff8800'; // Orange
            else if (fps < 55) color = '#ffff00'; // Yellow

            fpsDisplay.style.borderColor = color;
            fpsDisplay.style.boxShadow = `0 0 20px ${color}80`;
            fpsDisplay.style.color = color;

            // Performance status
            let status = '🟢 EXCELLENT';
            if (fps < 30) status = '🔴 POOR';
            else if (fps < 45) status = '🟠 FAIR';
            else if (fps < 55) status = '🟡 GOOD';

            fpsDisplay.innerHTML = `
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                    ${fps} FPS
                </div>
                <div style="font-size: 12px; line-height: 1.6;">
                    Status: ${status}<br>
                    Avg: ${avgFPS} fps<br>
                    Min: ${minFPS} fps<br>
                    Max: ${maxFPS} fps<br>
                    Samples: ${fpsValues.length}
                </div>
            `;

            frames = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(updateFPS);
    }

    // Start monitoring
    requestAnimationFrame(updateFPS);

    // Log to console
    console.log('✅ FPS Monitor started!');
    console.log('📊 Look for the FPS counter in the top-right corner');
    console.log('🎯 60 FPS = Excellent (Green)');
    console.log('🎯 45-59 FPS = Good (Yellow)');
    console.log('🎯 30-44 FPS = Fair (Orange)');
    console.log('🎯 <30 FPS = Poor (Red)\n');

    // Also check GPU usage
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            console.log('🎮 GPU INFO:');
            console.log('   Vendor:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
            console.log('   Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }
    }

    // Memory usage (if available)
    if (performance.memory) {
        setInterval(() => {
            const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
            const total = Math.round(performance.memory.totalJSHeapSize / 1048576);
            console.log(`💾 Memory: ${used} MB / ${total} MB`);
        }, 5000);
    }

    // Return stop function
    window.stopFPSMonitor = function() {
        const monitor = document.getElementById('fps-monitor');
        if (monitor) {
            monitor.remove();
            console.log('⏹️  FPS Monitor stopped');
        }
    };

    console.log('💡 To stop: Run stopFPSMonitor() in console\n');
})();
