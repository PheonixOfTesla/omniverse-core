/**
 * Enhanced Smooth Scrolling for Phoenix
 * Provides buttery smooth scrolling across all planets
 */

class PhoenixSmoothScroll {
    constructor() {
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.init();
    }

    init() {
        // Enable smooth scrolling globally
        document.documentElement.style.scrollBehavior = 'smooth';

        // Add momentum scrolling for iOS
        document.body.style.webkitOverflowScrolling = 'touch';

        // Optimize scroll performance
        this.optimizeScrolling();

        // Add scroll snap points for sections
        this.addScrollSnap();

        // Add scroll-to-top functionality
        this.addScrollToTop();

        // Add keyboard navigation
        this.addKeyboardNav();

        console.log('[Smooth Scroll] Enhanced scrolling initialized');
    }

    optimizeScrolling() {
        // Passive event listeners for better performance
        document.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        document.addEventListener('wheel', this.handleWheel.bind(this), { passive: true });

        // Throttle scroll events
        let ticking = false;
        document.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    handleScroll(e) {
        // Clear existing timeout
        clearTimeout(this.scrollTimeout);

        // Set scrolling flag
        this.isScrolling = true;
        document.body.classList.add('is-scrolling');

        // Set timeout to detect when scrolling stops
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            document.body.classList.remove('is-scrolling');
        }, 150);
    }

    handleWheel(e) {
        // Smooth wheel scrolling with acceleration
        if (Math.abs(e.deltaY) > 100) {
            // Large scroll - accelerate
            const multiplier = 1.5;
            const scrollAmount = e.deltaY * multiplier;

            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;

        // Update scroll progress indicator if exists
        const indicator = document.getElementById('scrollProgress');
        if (indicator) {
            indicator.style.width = `${scrollPercent}%`;
        }

        // Add parallax effect to header
        const header = document.querySelector('.dashboard-header');
        if (header && scrollTop > 50) {
            header.style.transform = `translateY(${Math.min(scrollTop * 0.5, 100)}px)`;
            header.style.opacity = Math.max(1 - (scrollTop / 300), 0.5);
        }
    }

    addScrollSnap() {
        // Add scroll snap for major sections
        const sections = document.querySelectorAll('.glass-card, .dashboard-section');
        sections.forEach(section => {
            section.style.scrollMarginTop = '20px';
        });
    }

    addScrollToTop() {
        // Create scroll-to-top button
        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollToTop';
        scrollBtn.innerHTML = '↑';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 40px;
            right: 40px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(0, 212, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: #00d4ff;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            transform: translateY(100px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
        `;

        scrollBtn.addEventListener('mouseenter', () => {
            scrollBtn.style.background = 'rgba(0, 212, 255, 0.3)';
            scrollBtn.style.transform = 'translateY(0) scale(1.1)';
        });

        scrollBtn.addEventListener('mouseleave', () => {
            scrollBtn.style.background = 'rgba(0, 212, 255, 0.2)';
            scrollBtn.style.transform = 'translateY(0) scale(1)';
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(scrollBtn);

        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translateY(100px)';
            }
        }, { passive: true });
    }

    addKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Space bar - page down
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.scrollBy({
                    top: window.innerHeight * 0.8,
                    behavior: 'smooth'
                });
            }

            // Shift + Space - page up
            if (e.shiftKey && e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.scrollBy({
                    top: -window.innerHeight * 0.8,
                    behavior: 'smooth'
                });
            }

            // Home key
            if (e.code === 'Home' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }

            // End key
            if (e.code === 'End' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Utility method to scroll to element
    scrollToElement(element, offset = 0) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Smooth scroll with easing
    smoothScrollTo(targetY, duration = 800) {
        const startY = window.pageYOffset;
        const difference = targetY - startY;
        const startTime = performance.now();

        const easeInOutCubic = (t) => {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easing = easeInOutCubic(progress);

            window.scrollTo(0, startY + (difference * easing));

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.phoenixScroll = new PhoenixSmoothScroll();
    });
} else {
    window.phoenixScroll = new PhoenixSmoothScroll();
}

// Add scroll progress indicator styles
const scrollProgressStyle = document.createElement('style');
scrollProgressStyle.textContent = `
    /* Scroll Progress Indicator */
    #scrollProgress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #00d4ff 0%, #00ffaa 100%);
        width: 0%;
        z-index: 9999;
        transition: width 0.1s ease-out;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }

    /* Hide scrollbar but keep functionality */
    body::-webkit-scrollbar {
        width: 8px;
    }

    body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }

    body::-webkit-scrollbar-thumb {
        background: rgba(0, 212, 255, 0.3);
        border-radius: 4px;
        transition: background 0.3s;
    }

    body::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 212, 255, 0.5);
    }

    /* Smooth scroll for all elements */
    * {
        scroll-behavior: smooth;
    }

    /* Prevent scroll jump on focus */
    *:focus {
        scroll-margin-top: 80px;
    }

    /* Glass cards smooth appearance on scroll */
    .glass-card {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.3s ease;
    }

    body.is-scrolling .glass-card {
        pointer-events: none;
    }
`;
document.head.appendChild(scrollProgressStyle);

// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.appendChild(progressBar);
