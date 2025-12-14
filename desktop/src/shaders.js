// shaders.js - WebGL Holographic Effects

class ShaderEffects {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationFrame = null;
        this.startTime = Date.now();
        this.currentEffect = 0;
        this.effectSwitchInterval = null;
        this.supported = false;
    }

    init() {
        console.log('🌈 Initializing Shader Effects...');
        
        if (!this.createWebGLCanvas()) {
            console.warn('WebGL not supported, falling back to CSS');
            this.fallbackToCSS();
            return;
        }

        this.setupShaders();
        this.animate();
        this.startEffectSwitching();
        
        console.log('Shader Effects initialized');
    }

    createWebGLCanvas() {
        try {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'shader-canvas';
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
                mix-blend-mode: screen;
                opacity: 0.3;
            `;
            
            document.body.insertBefore(this.canvas, document.body.firstChild);
            
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            
            if (!this.gl) {
                console.warn('WebGL context not available');
                return false;
            }

            this.supported = true;
            this.setupResizeHandler();
            return true;
        } catch (error) {
            console.error('WebGL initialization error:', error);
            return false;
        }
    }

    setupShaders() {
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform float time;
            uniform vec2 resolution;
            uniform int effect;

            // Holographic scanlines effect
            vec3 holographicScanlines(vec2 uv) {
                float scanline = sin(uv.y * resolution.y * 2.0 + time * 2.0) * 0.5 + 0.5;
                float flicker = sin(time * 10.0) * 0.02 + 0.98;
                
                vec3 color = vec3(0.0, 1.0, 1.0); // Cyan
                color *= scanline * 0.3 + 0.7;
                color *= flicker;
                
                // Add horizontal scan
                float hscan = abs(sin(uv.y * 3.14159 + time * 0.5));
                color *= hscan * 0.2 + 0.8;
                
                return color;
            }

            // Energy field effect
            vec3 energyField(vec2 uv) {
                vec2 center = vec2(0.5, 0.5);
                float dist = length(uv - center);
                
                float pulse = sin(dist * 10.0 - time * 3.0) * 0.5 + 0.5;
                float wave = sin(dist * 20.0 - time * 5.0) * 0.3 + 0.7;
                
                vec3 color = vec3(0.0, pulse, pulse);
                color *= wave;
                
                // Add radial gradient
                color *= 1.0 - dist * 0.8;
                
                return color;
            }

            // Glitch effect
            vec3 glitchEffect(vec2 uv) {
                vec2 glitchUV = uv;
                
                // Horizontal glitch bars
                float glitchLine = step(0.99, sin(uv.y * 50.0 + time * 20.0));
                glitchUV.x += glitchLine * (sin(time * 100.0) * 0.1);
                
                // Color separation
                float r = step(0.5, sin(glitchUV.x * 10.0 + time * 3.0));
                float g = step(0.5, sin(glitchUV.x * 10.0 + time * 3.0 + 2.0));
                float b = step(0.5, sin(glitchUV.x * 10.0 + time * 3.0 + 4.0));
                
                vec3 color = vec3(r, g, b) * 0.3;
                color.g = max(color.g, 0.5); // Cyan bias
                color.b = max(color.b, 0.5);
                
                return color;
            }

            // Grid overlay effect
            vec3 gridOverlay(vec2 uv) {
                float gridX = abs(sin(uv.x * resolution.x * 0.05));
                float gridY = abs(sin(uv.y * resolution.y * 0.05));
                
                float grid = max(step(0.98, gridX), step(0.98, gridY));
                
                // Animated grid
                float animGrid = sin(uv.x * 20.0 + time) * sin(uv.y * 20.0 + time);
                
                vec3 color = vec3(0.0, grid * 0.8, grid * 0.8);
                color += vec3(0.0, animGrid * 0.1, animGrid * 0.1);
                
                return color;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution;
                vec3 color = vec3(0.0);

                if (effect == 0) {
                    color = holographicScanlines(uv);
                } else if (effect == 1) {
                    color = energyField(uv);
                } else if (effect == 2) {
                    color = glitchEffect(uv);
                } else if (effect == 3) {
                    color = gridOverlay(uv);
                }

                gl_FragColor = vec4(color, 0.3);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Shader program link error:', this.gl.getProgramInfoLog(this.program));
            return;
        }

        this.gl.useProgram(this.program);

        // Create full-screen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Get uniform locations
        this.timeLocation = this.gl.getUniformLocation(this.program, 'time');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'resolution');
        this.effectLocation = this.gl.getUniformLocation(this.program, 'effect');
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    animate() {
        if (!this.supported || !this.gl) return;

        const time = (Date.now() - this.startTime) / 1000;
        this.updateUniforms(time);

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    updateUniforms(time) {
        this.gl.uniform1f(this.timeLocation, time);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        this.gl.uniform1i(this.effectLocation, this.currentEffect);
    }

    switchEffect() {
        this.currentEffect = (this.currentEffect + 1) % 4;
        console.log('Switched to effect:', this.currentEffect);
    }

    startEffectSwitching() {
        // Switch effect every 10 seconds
        this.effectSwitchInterval = setInterval(() => {
            this.switchEffect();
        }, 10000);
    }

    triggerGlitch() {
        const previousEffect = this.currentEffect;
        this.currentEffect = 2; // Glitch effect
        
        setTimeout(() => {
            this.currentEffect = previousEffect;
        }, 500);
    }

    fallbackToCSS() {
        console.log('Using CSS fallback effects');
        
        const overlay = document.createElement('div');
        overlay.id = 'css-shader-fallback';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            background: 
                repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 217, 255, 0.03) 2px,
                    rgba(0, 217, 255, 0.03) 4px
                );
            animation: scanlineMove 8s linear infinite;
            mix-blend-mode: screen;
            opacity: 0.4;
        `;
        
        document.body.insertBefore(overlay, document.body.firstChild);

        // Add scanline animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scanlineMove {
                0% {
                    background-position: 0 0;
                }
                100% {
                    background-position: 0 100vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.effectSwitchInterval) {
            clearInterval(this.effectSwitchInterval);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize
const shaderEffects = new ShaderEffects();
window.shaderEffects = shaderEffects;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => shaderEffects.init());
} else {
    shaderEffects.init();
}
