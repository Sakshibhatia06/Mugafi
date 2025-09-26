// reverseScrolling.js
// Complete reverse scrolling implementation for the Koncepted website

class ReverseScrollHandler {
    constructor() {
        this.currentSection = 1;
        this.isAnimating = false;
        this.animationDuration = 1500; // ms
    }

    setCurrentSection(section) {
        this.currentSection = section;
    }

    handleReverseScroll(targetSection) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Stop any active timers when reversing
        if (this.currentSection === 7 && window.wheelInterval) {
            clearInterval(window.wheelInterval);
        }
        if (this.currentSection === 15 && window.carouselInterval) {
            clearInterval(window.carouselInterval);
        }

        // Execute the appropriate reverse transition
        switch(targetSection) {
            case 1: this.reverseToSection1(); break;
            case 2: this.reverseToSection2(); break;
            case 3: this.reverseToSection3(); break;
            case 4: this.reverseToSection4(); break;
            case 5: this.reverseToSection5(); break;
            case 6: this.reverseToSection6(); break;
            case 7: this.reverseToSection7(); break;
            case 8: this.reverseToSection8(); break;
            case 9: this.reverseToSection9(); break;
            case 10: this.reverseToSection10(); break;
            case 11: this.reverseToSection11(); break;
            case 12: this.reverseToSection12(); break;
            case 13: this.reverseToSection13(); break;
            case 14: this.reverseToSection14(); break;
            case 15: this.reverseToSection15(); break;
            case 16: this.reverseToSection16(); break;
            case 17: this.reverseToSection17(); break;
            case 18: this.reverseFromFooter(); break;
        }

        // Update current section after animation
        setTimeout(() => {
            this.currentSection = targetSection;
            this.isAnimating = false;
            
            // Update navigation dots
            this.updateNavigationDots(targetSection);
        }, this.animationDuration);
    }

    updateNavigationDots(section) {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            // Adjust for section 2 being transitional (not a dot)
            let dotSection = section > 2 ? section - 1 : section;
            if (section === 1) dotSection = 0;
            dot.classList.toggle('active', index === dotSection);
        });
    }

    reverseToSection1() {
        // Reverse from section 2 back to section 1
        gsap.to('.header-logo', {
            duration: 1,
            top: '30px',
            transform: 'translateX(-50%)',
            scale: 0.6,
            ease: "power2.inOut"
        });

        gsap.to(['.main-title', '.subtitle'], {
            duration: 0.5,
            opacity: 1,
            y: 0
        });

        gsap.to('.section-one-tombstone', {
            duration: 0.5,
            opacity: 1
        });

        // Reset tombstone structures to hidden state
        gsap.to(['.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4'], {
            duration: 0.5,
            opacity: 0,
            scale: 1
        });

        // Reverse 3D model scale back to zero
        if (window.planet3D) {
            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }

        // Ensure mask1 is visible again
        gsap.to('#mask1', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection2() {
        // Reverse from section 3 back to section 2 (transitional state)
        gsap.to('#mask1', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask2', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        // Reverse 3D model position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                z: 0,
                y: 0,
                ease: "power2.inOut"
            });
        }

        // Hide section 3 content
        gsap.to('.section-three-content', {
            duration: 0.5,
            opacity: 0
        });

        gsap.to('.section-three-overlays', {
            duration: 0.5,
            opacity: 0
        });

        gsap.to('.nav-frame', {
            duration: 1,
            opacity: 0
        });

        // Show tombstones again with proper scales
        gsap.to('.tombstone-1', {
            duration: 0.8,
            scale: 2,
            opacity: 1,
            ease: "power2.out"
        });

        gsap.to('.tombstone-2', {
            duration: 0.8,
            scale: 4,
            opacity: 1,
            ease: "power2.out",
            delay: 0.1
        });

        gsap.to('.tombstone-3', {
            duration: 0.8,
            scale: 5,
            opacity: 1,
            ease: "power2.out",
            delay: 0.2
        });

        gsap.to('.tombstone-4', {
            duration: 0.8,
            scale: 7,
            opacity: 1,
            ease: "power2.out",
            delay: 0.3
        });

        // Show header logo again
        gsap.to('.header-logo', {
            duration: 0.8,
            opacity: 1,
            scale: 1
        });
    }

    reverseToSection3() {
        // Reverse from section 4 back to section 3
        gsap.to('#mask3', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.inOut"
        });
        
        gsap.to('.section-three-overlays', {
            duration: 0.5,
            opacity: 1,
            scale: 1
        });
        
        gsap.to('#mask2', {
            duration: 1,
            y: 0,
            ease: "power2.inOut"
        });

        // Hide section 4 content
        gsap.to('.section-four-content', {
            duration: 0.5,
            opacity: 0
        });

        // Show section 3 content
        gsap.to('.section-three-content', {
            duration: 0.5,
            opacity: 1
        });

        // Reverse 3D model position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                y: -2,
                ease: "power2.inOut"
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    ease: "power2.inOut"
                });
            }
        }
    }

    reverseToSection4() {
        // Reverse from section 5 back to section 4
        gsap.to('#mask2', {
            duration: 1,
            opacity: 1,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask4', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-five-button', {
            duration: 0.8,
            opacity: 0
        });

        // Reverse 3D model position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                ease: "power2.inOut"
            });
        }

        // Show section 4 content
        gsap.to('.section-four-content', {
            duration: 0.5,
            opacity: 1
        });

        gsap.to('.bottom-content', {
            duration: 1,
            top: '5%',
            opacity: 0.3,
            ease: "power2.inOut"
        });

        gsap.to('.bottom-description', {
            duration: 0.5,
            opacity: 0.3
        });
    }

    reverseToSection5() {
        // Reverse from section 6 back to section 5
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: -6,
                y: 3,
                ease: "power2.inOut"
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut"
            });
        }

        // Hide section 6 content
        gsap.to('.section-six-content', {
            duration: 0.5,
            opacity: 0
        });

        // Show bottom content
        gsap.to('.bottom-content', {
            duration: 0.5,
            opacity: 1
        });

        // Reverse category items animation
        document.querySelectorAll('.category-item').forEach((item) => {
            gsap.to(item, {
                duration: 0.5,
                x: 100,
                opacity: 0
            });
        });
    }

    reverseToSection6() {
        // Reverse from section 7 back to section 6
        if (window.wheelInterval) {
            clearInterval(window.wheelInterval);
        }

        gsap.to('.section-seven-content', {
            duration: 1,
            x: window.innerWidth,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-six-content', {
            duration: 0.5,
            opacity: 1
        });

        if (window.planet3D) {
            gsap.set(window.planet3D.position, {
                x: -10,
                y: 8
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }
    }

    reverseToSection7() {
        // Reverse from section 8 back to section 7
        if (window.wheelInterval) {
            clearInterval(window.wheelInterval);
        }

        gsap.set('#mask3', { y: 0 });
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-eight-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-seven-content', {
            duration: 0.5,
            opacity: 1
        });

        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                y: 15,
                ease: "power2.inOut"
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }

        // Restart wheel timer
        setTimeout(() => {
            if (typeof startWheelTimer === 'function') {
                startWheelTimer();
            }
        }, 500);
    }

    reverseToSection8() {
        // Reverse from section 9 back to section 8
        gsap.to('#mask4', {
            duration: 0.5,
            opacity: 1,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask3', {
            duration: 0.5,
            opacity: 0.7,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-nine-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.ai-tool-header', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.inOut"
        });

        gsap.to('.input-container', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.inOut",
            transform: 'translate(-50%, -50%) translateY(0)'
        });

        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                y: -2,
                ease: "power2.inOut"
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.material, {
                    duration: 1,
                    opacity: 0.7
                });
            }
        }

        gsap.to('.section-eight-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection9() {
        // Reverse from section 10 back to section 9
        gsap.to('.section-ten-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1,
                y: 3,
                ease: "power2.inOut"
            });

            gsap.to(window.planet3D.scale, {
                duration: 1,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut"
            });
        }

        gsap.to('.section-nine-content', {
            duration: 0.5,
            opacity: 1
        });

        gsap.to('.rotating-container', {
            duration: 1,
            opacity: 1
        });

        // Trigger orbit animations
        if (typeof triggerOrbitAnimations === 'function') {
            triggerOrbitAnimations();
        }
    }

    reverseToSection10() {
        // Reverse from section 11 back to section 10
        gsap.to('#mask5', {
            duration: 1,
            opacity: 1,
            ease: "power2.inOut"
        });
        
        gsap.set('#mask6', { y: 0 });
        gsap.to('#mask6', {
            duration: 1.5,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-eleven-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-ten-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection11() {
        // Reverse from section 12 back to section 11
        gsap.to('#mask6', {
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-twelve-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-eleven-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection12() {
        // Reverse from section 13 back to section 12
        gsap.to('.section-thirteen-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-twelve-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection13() {
        // Reverse from section 14 back to section 13 (special tombstone transition)
        const transition = document.querySelector('.tombstone-transition');
        
        // Start reverse transition - zoom out
        gsap.set(transition, { 
            opacity: 1, 
            transform: 'scale(0)' 
        });
        
        gsap.to(transition, {
            duration: 0.8,
            transform: 'scale(15)',
            ease: "power2.out",
            onStart: () => {
                // Hide section 14 content and background
                gsap.to('.section-fourteen-content', {
                    duration: 0.2,
                    opacity: 0
                });
                
                gsap.to('#mask7', {
                    duration: 0.1,
                    opacity: 0,
                    delay: 0.4
                });
            },
            onComplete: () => {
                // Show section 13 content
                gsap.to('.section-thirteen-content', {
                    duration: 0.3,
                    opacity: 1
                });
                
                // Zoom transition back in to hide it
                gsap.to(transition, {
                    duration: 0.8,
                    transform: 'scale(0)',
                    opacity: 0,
                    ease: "power2.in",
                    delay: 0.2
                });
            }
        });
    }

    reverseToSection14() {
        // Reverse from section 15 back to section 14
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
        }
        
        gsap.to('.section-fifteen-content', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('.section-fifteen-background', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-sixteen-content', {
            duration: 0.5,
            opacity: 0
        });

        // Reinitialize carousel for section 14
        if (typeof initializeCarousel === 'function') {
            initializeCarousel();
        }
        
        gsap.to('.section-fourteen-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection15() {
        // Reverse from section 16 back to section 15
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
        }

        gsap.to('.section-sixteen-content', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-fifteen-content', {
            duration: 0.5,
            opacity: 1
        });

        // Reinitialize carousel
        if (typeof initializeCarousel === 'function') {
            initializeCarousel();
        }
    }

    reverseToSection16() {
        // Reverse from section 17 back to section 16
        gsap.to('.section-seventeen-content', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-sixteen-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.5
        });
        
        gsap.to('.logos-row', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "power2.out"
        });
        
        gsap.set('#mask3', { y: 0, opacity: 0 });
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('.section-seventeen-content', {
            duration: 0.5,
            opacity: 0
        });

        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                y: 8,
                ease: "power2.inOut"
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }

        gsap.to('.section-sixteen-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    reverseToSection17() {
        // This would be called when reversing from section 18 (footer) back to section 17
        this.reverseFromFooter();
    }

    reverseFromFooter() {
        // Reverse from footer back to section 17
        gsap.to('.footer-container', {
            duration: 1,
            y: '100%',
            opacity: 0,
            ease: "power2.in"
        });
        
        gsap.to('.section-seventeen-main', {
            duration: 1,
            y: 0,
            ease: "power2.inOut",
            delay: 0.3
        });
        
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1,
                y: -2,
                ease: "power2.inOut",
                delay: 0.3
            });
        }
    }
}

// Initialize global reverse scroll handler
window.reverseScrollHandler = new ReverseScrollHandler();

// Enhanced scroll handler that supports both directions
function setupReverseScrolling() {
    let isScrolling = false;
    
    function handleReverseScrollEvent(e) {
        if (isScrolling) return;
        
        e.preventDefault();
        
        const currentSection = window.reverseScrollHandler.currentSection;
        let targetSection = currentSection;
        
        // Special handling for section 15 carousel (forward only)
        if (currentSection === 15 && e.deltaY > 0) {
            const handled = window.updateCarouselOnScroll ? window.updateCarouselOnScroll(e.deltaY) : false;
            if (handled) {
                isScrolling = true;
                setTimeout(() => { isScrolling = false; }, 300);
                return;
            }
        }
        
        // Determine scroll direction
        if (e.deltaY > 0) {
            // Scrolling down - forward navigation
            if (currentSection < 17) {
                targetSection = currentSection + 1;
            } else if (currentSection === 17) {
                // Show footer
                if (typeof showFooter === 'function') {
                    showFooter();
                    targetSection = 18;
                }
            }
        } else if (e.deltaY < 0) {
            // Scrolling up - reverse navigation
            if (currentSection > 1) {
                targetSection = currentSection - 1;
            }
        }
        
        // Execute transition if target changed
        if (targetSection !== currentSection) {
            isScrolling = true;
            
            if (targetSection < currentSection) {
                // Reverse scrolling
                window.reverseScrollHandler.handleReverseScroll(targetSection);
            } else {
                // Forward scrolling - use original functions
                switch(targetSection) {
                    case 1: startSection1(); break;
                    case 2: startSection2(); break;
                    case 3: startSection3(); break;
                    case 4: startSection4(); break;
                    case 5: startSection5(); break;
                    case 6: startSection6(); break;
                    case 7: startSection7(); break;
                    case 8: startSection8(); break;
                    case 9: startSection9(); break;
                    case 10: startSection10(); break;
                    case 11: startSection11(); break;
                    case 12: startSection12(); break;
                    case 13: startSection13(); break;
                    case 14: startSection14(); break;
                    case 15: startSection15(); break;
                    case 16: startSection16(); break;
                    case 17: startSection17(); break;
                }
                
                // Update reverse handler's current section
                window.reverseScrollHandler.setCurrentSection(targetSection);
            }
            
            setTimeout(() => {
                isScrolling = false;
            }, 2000);
        }
    }
    
    // Replace original scroll handler with enhanced version
    window.removeEventListener('wheel', window.handleScrollEvent);
    window.addEventListener('wheel', handleReverseScrollEvent, { 
        passive: false,
        capture: true 
    });
    
    // Update the global reference
    window.handleScrollEvent = handleReverseScrollEvent;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReverseScrolling);
} else {
    setupReverseScrolling();
}

// Mobile touch support for reverse scrolling
function setupMobileReverseScrolling() {
    if (!window.isTouchDevice) return;
    
    let touchStartY = 0;
    let lastTouchTime = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        lastTouchTime = Date.now();
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
        if (!touchStartY) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const touchTime = Date.now() - lastTouchTime;
        const deltaY = touchStartY - touchEndY;
        
        if (Math.abs(deltaY) > 50 && touchTime < 300) {
            e.preventDefault();
            
            const syntheticEvent = {
                deltaY: deltaY,
                preventDefault: () => {}
            };
            
            if (window.handleScrollEvent) {
                window.handleScrollEvent(syntheticEvent);
            }
        }
        
        touchStartY = 0;
    }, { passive: false });
}

// Initialize mobile reverse scrolling
setupMobileReverseScrolling();