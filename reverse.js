// reverseScrolling.js
class ReverseScrollHandler {
    constructor() {
        this.isAnimating = false;
        this.activeTimers = [];
        this._currentSection = 1; // Private property to store the actual value
    }

    get currentSection() {
        return this._currentSection;
    }

    set currentSection(value) {
        this._currentSection = value;
        // Also update the global variable to keep them in sync
        if (typeof window !== 'undefined') {
            window._currentSection = value;
        }
    }
    setCurrentSection(value) {
    this.currentSection = value;
}

    handleReverseScroll(targetSection) {
        if (this.isAnimating) return false;
        
        this.isAnimating = true;
        
        // Kill all ongoing animations immediately
        this.killAllAnimations();
        
        // Update navigation dots (skip section 2 for dot indexing)
        this.updateNavigationDots(targetSection);

        // Stop any running timers
        this.stopActiveTimers();

        // Execute reverse animation based on current section
        switch(this.currentSection) {
            case 18: this.reverseFromFooter(); break;
            case 17: this.reverseToSection16(); break;
            case 16: this.reverseToSection15(); break;
            case 15: this.reverseToSection14(); break;
            case 14: this.reverseToSection13(); break;
            case 13: this.reverseToSection12(); break;
            case 12: this.reverseToSection11(); break;
            case 11: this.reverseToSection10(); break;
            case 10: this.reverseToSection9(); break;
            case 9: this.reverseToSection8(); break;
            case 8: this.reverseToSection7(); break;
            case 7: this.reverseToSection6(); break;
            case 6: this.reverseToSection5(); break;
            case 5: this.reverseToSection4(); break;
            case 4: this.reverseToSection3(); break;
            case 3: this.reverseToSection2(); break;
            case 2: this.reverseToSection1(); break;
        }

        // Update current section
        this.currentSection = targetSection;
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 2000);

        return true;
    }

    killAllAnimations() {
        // Kill animations for all possible elements
        const allSelectors = [
            '.footer-container', '.section-seventeen-main', '.section-seventeen-content',
            '.section-sixteen-content', '.section-sixteen-title', '.logos-row',
            '.section-fifteen-content', '.section-fifteen-background', '.text-carousel',
            '.carousel-container', '.carousel-item', '.section-fourteen-content',
            '.section-fourteen-left', '.section-fourteen-right', '.tombstone-transition',
            '.section-thirteen-content', '.section-thirteen-header', '.grid-icon',
            '.section-twelve-content', '.section-twelve-left', '.rolling-image',
            '.section-twelve-right', '.right-image', '.section-eleven-content',
            '.section-eleven-title', '.section-eleven-description', '.section-ten-content',
            '.testimonial-header', '.cards-container', '.section-nine-content',
            '.rotating-container', '.orbit-container', '.section-eight-content',
            '.ai-tool-header', '.input-container', '.section-seven-content',
            '.cafe-content', '.wheel-controls', '.section-six-content', '.category-item',
            '.bottom-content', '.section-five-button', '.section-four-content',
            '.section-four-title', '.image-gallery', '.section-three-content',
            '.section-three-title', '.explore-button', '.content-image',
            '.section-three-overlays', '.white-circle-behind', '.connection-curves',
            '.curve-path', '.connection-circle', '.header-logo', '.main-title',
            '.subtitle', '.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4',
            '.nav-frame', '#mask1', '#mask2', '#mask3', '#mask4', '#mask5', '#mask6', '#mask7'
        ];
        
        allSelectors.forEach(selector => {
            gsap.killTweensOf(selector);
        });

        // Kill 3D object animations
        if (window.planet3D) {
            gsap.killTweensOf(window.planet3D.position);
            gsap.killTweensOf(window.planet3D.scale);
            if (window.planet3D.material) {
                gsap.killTweensOf(window.planet3D.material);
                gsap.killTweensOf(window.planet3D.material.color);
            }
        }

        if (window.planetBackground) {
            gsap.killTweensOf(window.planetBackground.position);
            gsap.killTweensOf(window.planetBackground.material);
        }
    }

    updateNavigationDots(targetSection) {
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            let dotSection = targetSection;
            if (targetSection > 2) dotSection = targetSection - 1;
            if (targetSection === 1) dotSection = 0;
            dot.classList.toggle('active', index === dotSection);
        });
    }

    stopActiveTimers() {
        // Stop all known timers
        if (window.wheelInterval) {
            clearInterval(window.wheelInterval);
            window.wheelInterval = null;
        }
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
            window.carouselInterval = null;
        }
        
        // Clear any stored timers
        this.activeTimers.forEach(timer => clearTimeout(timer));
        this.activeTimers = [];
    }

    // Complete element reset to match initial CSS states
    resetElementToInitialState(selector, initialStyles, useSet = true) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;
        
        if (useSet) {
            gsap.set(selector, initialStyles);
        } else {
            elements.forEach(el => {
                Object.assign(el.style, initialStyles);
            });
        }
    }

    reverseFromFooter() {
        // Reset footer to initial hidden state
        this.resetElementToInitialState('.footer-container', {
            transform: 'translateY(100%)',
            opacity: 0
        });

        // Show section 17 content in its active state
        gsap.to('.section-seventeen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.2
        });

        gsap.to('.section-seventeen-main', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.out",
            delay: 0.5
        });

        // Reset planet position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1,
                y: -2,
                ease: "power2.inOut",
                delay: 0.3
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.position, {
                    duration: 1,
                    y: -2,
                    ease: "power2.inOut",
                    delay: 0.3
                });
            }
        }
    }

    reverseToSection16() {
        // Completely reset section 17 to initial state
        this.resetElementToInitialState('.section-seventeen-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-seventeen-main', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Fade out planet overlay
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        // Reset planet to section 16 state
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: 8,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });

            // Reset planet color to original
            if (window.planet3D.material) {
                gsap.to(window.planet3D.material.color, {
                    duration: 0.8,
                    r: 1,
                    g: 0.27,
                    b: 0.27
                });
                gsap.to(window.planet3D.material, {
                    duration: 0.8,
                    emissive: new THREE.Color(0x220000)
                });
            }
        }

        // Show section 16 background and content
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 1
        });

        gsap.to('.section-sixteen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1.2
        });

        // Reset and animate section 16 elements from initial state
        this.resetElementToInitialState('.section-sixteen-title', {
            opacity: 0,
            transform: 'translateY(-100px)'
        });

        this.resetElementToInitialState('.logos-row', {
            opacity: 0,
            transform: 'translateY(-100px)'
        });

        gsap.to('.section-sixteen-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4
        });

        gsap.to('.logos-row', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.6
        });
    }

    reverseToSection15() {
        // Reset section 16 completely
        this.resetElementToInitialState('.section-sixteen-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-sixteen-title', {
            opacity: 0,
            transform: 'translateY(-100px)'
        });
        
        this.resetElementToInitialState('.logos-row', {
            opacity: 0,
            transform: 'translateY(-100px)'
        });

        // Hide section 16 background
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        // Show section 15 content
        gsap.to('.section-fifteen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.8
        });

        // Reset carousel to first item
        window.currentCarouselIndex = 0;
        this.resetCarousel();
        
        // Reinitialize carousel after a delay
        const initTimer = setTimeout(() => {
            if (typeof window.initializeCarousel === 'function') {
                window.initializeCarousel();
            }
        }, 1000);
        this.activeTimers.push(initTimer);
    }

    reverseToSection14() {
        // Stop carousel if running
        this.stopActiveTimers();

        // Reset section 15 completely
        this.resetElementToInitialState('.section-fifteen-content', {
            opacity: 0
        });
        this.resetCarouselElements();

        // Use tombstone transition effect (reverse)
        const transition = document.querySelector('.tombstone-transition');
        
        this.resetElementToInitialState('.tombstone-transition', {
            opacity: 0,
            transform: 'scale(0)'
        });

        // Zoom out transition
        gsap.to(transition, {
            duration: 0.8,
            opacity: 1,
            transform: 'scale(15)',
            ease: "power2.out",
            delay: 0.5,
            onComplete: () => {
                // Show section 14 background
                gsap.to('#mask7', {
                    duration: 0.1,
                    opacity: 1
                });
                
                // Zoom back in
                gsap.to(transition, {
                    duration: 1,
                    transform: 'scale(0)',
                    opacity: 0,
                    ease: "power2.in",
                    delay: 0.5,
                    onComplete: () => {
                        // Reset section 14 elements to initial state
                        this.resetElementToInitialState('.section-fourteen-left', {
                            opacity: 0,
                            transform: 'translateX(-100px)'
                        });
                        
                        this.resetElementToInitialState('.section-fourteen-right', {
                            opacity: 0,
                            transform: 'translateX(100px)'
                        });

                        // Show section 14 content
                        gsap.to('.section-fourteen-content', {
                            duration: 0.5,
                            opacity: 1
                        });

                        gsap.to('.section-fourteen-left', {
                            duration: 0.8,
                            x: 0,
                            opacity: 1,
                            ease: "back.out(1.7)",
                            delay: 0.3
                        });

                        gsap.to('.section-fourteen-right', {
                            duration: 0.8,
                            x: 0,
                            opacity: 1,
                            ease: "back.out(1.7)",
                            delay: 0.5
                        });
                    }
                });
            }
        });
    }

    reverseToSection13() {
        // Reset section 14 completely
        this.resetElementToInitialState('.section-fourteen-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-fourteen-left', {
            opacity: 0,
            transform: 'translateX(-100px)'
        });
        
        this.resetElementToInitialState('.section-fourteen-right', {
            opacity: 0,
            transform: 'translateX(100px)'
        });

        // Use tombstone transition in reverse
        const transition = document.querySelector('.tombstone-transition');
        
        this.resetElementToInitialState('.tombstone-transition', {
            opacity: 0,
            transform: 'scale(0)'
        });
        
        gsap.to(transition, {
            duration: 0.8,
            opacity: 1,
            transform: 'scale(15)',
            ease: "power2.out",
            delay: 0.5,
            onComplete: () => {
                // Hide section 14 background
                gsap.to('#mask7', {
                    duration: 0.1,
                    opacity: 0
                });
                
                // Zoom back in and show section 13
                gsap.to(transition, {
                    duration: 1,
                    transform: 'scale(0)',
                    opacity: 0,
                    ease: "power2.in",
                    delay: 0.5,
                    onComplete: () => {
                        // Reset section 13 elements to initial state
                        this.resetElementToInitialState('.section-thirteen-header', {
                            opacity: 0,
                            transform: 'translateY(100px)'
                        });

                        document.querySelectorAll('.grid-icon').forEach((icon) => {
                            gsap.set(icon, {
                                opacity: 0,
                                transform: 'translateY(100px)'
                            });
                        });

                        gsap.to('.section-thirteen-content', {
                            duration: 0.5,
                            opacity: 1
                        });

                        gsap.to('.section-thirteen-header', {
                            duration: 0.8,
                            y: 0,
                            opacity: 1,
                            ease: "back.out(1.7)",
                            delay: 0.3
                        });

                        document.querySelectorAll('.grid-icon').forEach((icon, index) => {
                            gsap.to(icon, {
                                duration: 0.6,
                                y: 0,
                                opacity: 1,
                                ease: "back.out(1.7)",
                                delay: 0.5 + (index * 0.1)
                            });
                        });
                    }
                });
            }
        });
    }

    reverseToSection12() {
        // Reset section 13 completely
        this.resetElementToInitialState('.section-thirteen-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-thirteen-header', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        document.querySelectorAll('.grid-icon').forEach((icon) => {
            gsap.set(icon, {
                opacity: 0,
                transform: 'translateY(100px)'
            });
        });

        // Reset section 12 elements to initial state
        this.resetElementToInitialState('.section-twelve-left', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        this.resetElementToInitialState('.rolling-image', {
            opacity: 0,
            transform: 'translateX(-100px) rotateY(90deg) scale(0.5)'
        });

        this.resetElementToInitialState('.section-twelve-right', {
            opacity: 0
        });

        this.resetElementToInitialState('.right-image', {
            opacity: 0,
            transform: 'scale(0)'
        });

        // Show section 12 content
        gsap.to('.section-twelve-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        gsap.to('.section-twelve-left', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 0.8
        });

        gsap.to('.rolling-image', {
            duration: 1.5,
            x: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            delay: 1
        });

        gsap.to('.section-twelve-right', {
            duration: 0.5,
            opacity: 1,
            delay: 1.2
        });

        gsap.to('.right-image', {
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4
        });
    }

    reverseToSection11() {
        // Reset section 12 completely
        this.resetElementToInitialState('.section-twelve-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-twelve-left', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.rolling-image', {
            opacity: 0,
            transform: 'translateX(-100px) rotateY(90deg) scale(0.5)'
        });
        
        this.resetElementToInitialState('.section-twelve-right', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.right-image', {
            opacity: 0,
            transform: 'scale(0)'
        });

        // Change background
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('#mask6', {
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });

        // Reset section 11 elements to initial state
        this.resetElementToInitialState('.section-eleven-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        this.resetElementToInitialState('.section-eleven-description', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        gsap.to('.section-eleven-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        gsap.to('.section-eleven-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });

        gsap.to('.section-eleven-description', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4
        });
    }

    reverseToSection10() {
        // Reset section 11 completely
        this.resetElementToInitialState('.section-eleven-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-eleven-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.section-eleven-description', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Change background back to section 10
        gsap.to('#mask6', {
            duration: 1,
            scale: 2,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.8
        });

        // Reset section 10 elements to initial state
        this.resetElementToInitialState('.testimonial-header', {
            opacity: 0,
            transform: 'translateX(-50%) translateY(100px)'
        });

        this.resetElementToInitialState('.cards-container', {
            opacity: 0,
            transform: 'translateX(-50%) translateY(100px)'
        });

        // Show section 10 content
        gsap.to('.section-ten-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        gsap.to('.testimonial-header', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.out",
            delay: 1.2,
            transform: 'translateX(-50%) translateY(0)'
        });

        gsap.to('.cards-container', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.out",
            delay: 1.5,
            transform: 'translateX(-50%) translateY(0)'
        });

        // Reset planet position for section 10
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1,
                x: 0,
                y: 15,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(window.planet3D.scale, {
                duration: 1,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });
        }
    }

    reverseToSection9() {
        // Reset section 10 completely
        this.resetElementToInitialState('.section-ten-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.testimonial-header', {
            opacity: 0,
            transform: 'translateX(-50%) translateY(100px)'
        });
        
        this.resetElementToInitialState('.cards-container', {
            opacity: 0,
            transform: 'translateX(-50%) translateY(100px)'
        });

        // Reset section 9 elements to initial state
        this.resetElementToInitialState('.rotating-container', {
            opacity: 0
        });

        // Show section 9 content
        gsap.to('.section-nine-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        gsap.to('.rotating-container', {
            duration: 1,
            opacity: 1,
            delay: 0.8
        });

        // Move planet back to section 9 position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1,
                x: 0,
                y: 3,
                z: 11,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(window.planet3D.scale, {
                duration: 1,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut",
                delay: 0.5
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.position, {
                    duration: 1,
                    x: 0,
                    y: 3,
                    z: 3,
                    ease: "power2.inOut",
                    delay: 0.5
                });

                gsap.to(window.planetBackground.material, {
                    duration: 1,
                    opacity: 0,
                    delay: 0.5
                });
            }
        }

        // Trigger orbit animations after delay
        const orbitTimer = setTimeout(() => {
            if (typeof window.triggerOrbitAnimations === 'function') {
                window.triggerOrbitAnimations();
            }
        }, 1000);
        this.activeTimers.push(orbitTimer);
    }

    reverseToSection8() {
        // Reset section 9 completely
        this.resetElementToInitialState('.section-nine-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.rotating-container', {
            opacity: 0
        });

        // Reset section 8 elements to initial state
        this.resetElementToInitialState('.ai-tool-header', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        this.resetElementToInitialState('.input-container', {
            opacity: 0,
            transform: 'translate(-50%, -50%) translateY(100px)'
        });

        // Show section 8 background and content
        gsap.to('#mask4', {
            duration: 0.5,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        gsap.to('#mask3', {
            duration: 0.5,
            opacity: 0.7,
            ease: "power2.inOut",
            delay: 0.5
        });

        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-eight-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.8
        });

        gsap.to('.ai-tool-header', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });

        gsap.to('.input-container', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2,
            transform: 'translate(-50%, -50%) translateY(0)'
        });

        // Reset planet position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: -2,
                z: 11,
                ease: "power2.inOut",
                delay: 0.5
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.position, {
                    duration: 1.5,
                    x: 0,
                    y: -2,
                    z: 3,
                    ease: "power2.inOut",
                    delay: 0.5
                });

                gsap.to(window.planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    delay: 0.5
                });
            }
        }
    }

    reverseToSection7() {
        // Reset section 8 completely
        this.resetElementToInitialState('.section-eight-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.ai-tool-header', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.input-container', {
            opacity: 0,
            transform: 'translate(-50%, -50%) translateY(100px)'
        });

        // Hide section 8 background
        gsap.to('#mask4', {
            duration: 0.5,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        // Reset section 7 elements to initial state
        this.resetElementToInitialState('.cafe-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.wheel-controls', {
            opacity: 0
        });

        // Show section 7 content
        gsap.to('.section-seven-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.8
        });

        gsap.to('.cafe-content', {
            duration: 0.8,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });

        gsap.to('.wheel-controls', {
            duration: 0.8,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });

        // Reset planet position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: 15,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });
        }

        // Restart wheel timer
        const wheelTimer = setTimeout(() => {
            if (typeof window.startWheelTimer === 'function') {
                window.startWheelTimer();
            }
        }, 1500);
        this.activeTimers.push(wheelTimer);
    }

    reverseToSection6() {
        // Stop wheel timer
        this.stopActiveTimers();

        // Reset section 7 completely
        this.resetElementToInitialState('.section-seven-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.cafe-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.wheel-controls', {
            opacity: 0
        });

        // Reset section 6 elements to initial state
        document.querySelectorAll('.category-item').forEach((item) => {
            gsap.set(item, {
                opacity: 0,
                transform: 'translateX(100px)'
            });
        });

        // Show section 6 content
        gsap.to('.section-six-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        document.querySelectorAll('.category-item').forEach((item, index) => {
            gsap.to(item, {
                duration: 0.8,
                x: 0,
                opacity: 1,
                ease: "back.out(1.7)",
                delay: 0.8 + (index * 0.1)
            });
        });

        // Reset planet position for section 6
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: -10,
                y: 8,
                z: 0,
                ease: "power2.inOut",
                delay: 0.3
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.3
            });
        }
    }

    reverseToSection5() {
        // Reset section 6 completely
        this.resetElementToInitialState('.section-six-content', {
            opacity: 0
        });

        document.querySelectorAll('.category-item').forEach((item) => {
            gsap.set(item, {
                opacity: 0,
                transform: 'translateX(100px)'
            });
        });

        // Reset section 5 elements to their original state
        this.resetElementToInitialState('.bottom-content', {
            opacity: 0.3,
            transform: 'translateX(-50%) translateY(100px)'
        });

        this.resetElementToInitialState('.section-five-button', {
            opacity: 0
        });

        // Show section 5 content
        gsap.to('.bottom-content', {
            duration: 0.8,
            top: '50%',
            opacity: 1,
            ease: "power2.out",
            delay: 0.5,
            transform: 'translateX(-50%) translateY(0)'
        });

        gsap.to('.bottom-description', {
            duration: 0.5,
            opacity: 1,
            delay: 0.8
        });

        gsap.to('.section-five-button', {
            duration: 0.8,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });

        // Reset planet position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: -6,
                y: 3,
                z: 0,
                ease: "power2.inOut",
                delay: 0.3
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut",
                delay: 0.3
            });
        }
    }

    reverseToSection4() {
        // Hide section 5 specific elements
        this.resetElementToInitialState('.section-five-button', {
            opacity: 0
        });

        // Reset section 4 elements to their original states
        this.resetElementToInitialState('.section-four-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        this.resetElementToInitialState('.image-gallery', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Show section 4 content
        gsap.to('.section-four-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.3
        });

        gsap.to('.section-four-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 0.8
        });

        gsap.to('.image-gallery', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });

        gsap.to('.bottom-content', {
            duration: 0.8,
            top: '5%',
            opacity: 0.3,
            ease: "power2.inOut",
            delay: 0.5,
            transform: 'translateX(-50%) translateY(0)'
        });

        gsap.to('.bottom-description', {
            duration: 0.5,
            opacity: 0.3,
            delay: 0.8
        });

        // Show section 4 background
        gsap.to('#mask2', {
            duration: 1,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        gsap.to('#mask4', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        // Reset planet position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: 3,
                z: 11,
                ease: "power2.inOut",
                delay: 0.3
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.material, {
                    duration: 1,
                    opacity: 0,
                    delay: 0.5
                });
            }
        }
    }

    reverseToSection3() {
        // Reset section 4 completely
        this.resetElementToInitialState('.section-four-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-four-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.image-gallery', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Reset section 3 elements to initial states
        this.resetElementToInitialState('.section-three-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.explore-button', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.content-image', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Show section 3 background and overlays
        gsap.to('#mask3', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        gsap.to('#mask2', {
            duration: 1,
            y: -100,
            ease: "power2.inOut",
            delay: 0.5
        });

        gsap.to('.section-three-overlays', {
            duration: 0.5,
            opacity: 1,
            scale: 1,
            delay: 0.8
        });

        // Show section 3 content
        gsap.to('.section-three-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        gsap.to('.section-three-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });

        gsap.to('.explore-button', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4
        });

        gsap.to('.content-image', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.6
        });

        // Reset planet position
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: -2,
                z: 11,
                ease: "power2.inOut",
                delay: 0.5
            });

            if (window.planetBackground) {
                gsap.to(window.planetBackground.position, {
                    duration: 1.5,
                    x: 0,
                    y: -2,
                    z: 3,
                    ease: "power2.inOut",
                    delay: 0.5
                });

                gsap.to(window.planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    delay: 0.5
                });
            }
        }

        // Show navigation
        gsap.to('.nav-frame', {
            duration: 1,
            opacity: 1,
            delay: 1.8
        });
    }

    reverseToSection2() {
        // Reset section 3 completely
        this.resetElementToInitialState('.section-three-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-three-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.explore-button', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.content-image', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.section-three-overlays', {
            opacity: 0
        });

        // Hide navigation
        gsap.to('.nav-frame', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.in"
        });

        // Change backgrounds back to section 2
        gsap.to('#mask1', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
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

        // Show section 2 elements (tombstones and logo)
        gsap.to('.header-logo', {
            duration: 0.8,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            scale: 1,
            opacity: 1,
            delay: 0.8
        });

        gsap.to(['.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4'], {
            duration: 1,
            scale: [2, 4, 5, 7],
            opacity: 1,
            ease: "power2.out",
            delay: 1
        });

        // Reset planet position for section 2
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut",
                delay: 0.5
            });
        }
        
        setTimeout(() => {
            
            this.reverseToSection1();
        // If you need to go to other sections, add them here
    }, 1000);
    }

    reverseToSection1() {
        // Hide tombstone structures
        gsap.to(['.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4'], {
            duration: 0.8,
            scale: 1,
            opacity: 0,
            ease: "power2.in"
        });

        // Move header logo back to section 1 position
        gsap.to('.header-logo', {
            duration: 1,
            top: '30px',
            transform: 'translateX(-50%)',
            scale: 0.6,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        // Reset section 1 elements to proper initial state
        this.resetElementToInitialState('.main-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.subtitle', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Show section 1 content
        gsap.to(['.main-title', '.subtitle'], {
            duration: 0.8,
            opacity: 1,
            y: 0,
            ease: "back.out(1.7)",
            delay: 0.8
        });

        gsap.to('.section-one-tombstone', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        // Reset planet completely
        if (window.planet3D) {
            gsap.to(window.planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(window.planet3D.position, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: 0.5
            });
        }
    }

    resetCarousel() {
        // Reset carousel to first item with proper states
        document.querySelectorAll('.carousel-item').forEach((item, index) => {
            item.classList.toggle('active', index === 0);
        });

        document.querySelectorAll('.section-fifteen-background').forEach((bg, index) => {
            bg.classList.toggle('active', index === 0);
        });

        const container = document.getElementById('carouselContainer');
        if (container) {
            container.style.transform = 'translateX(0)';
        }

        // Reset carousel index
        window.currentCarouselIndex = 0;
    }

    resetCarouselElements() {
        // Reset all carousel elements to hidden state
        this.resetElementToInitialState('.text-carousel', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.carousel-container', {
            transform: 'translateX(0)'
        });
        
        this.resetElementToInitialState('.section-fifteen-background', {
            opacity: 0
        });
        
        // Reset active states
        document.querySelectorAll('.carousel-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.section-fifteen-background').forEach(bg => {
            bg.classList.remove('active');
        });

        // Reset carousel index
        window.currentCarouselIndex = 0;
    }
}

// Initialize and export - Use singleton pattern
if (!window.reverseScrollHandler) {
    window.reverseScrollHandler = new ReverseScrollHandler();
}

// Also update the main script's currentSection reference
Object.defineProperty(window, 'currentSection', {
    get: function() {
        return window.reverseScrollHandler ? window.reverseScrollHandler.currentSection : window._currentSection || 1;
    },
    set: function(value) {
        window._currentSection = value;
        if (window.reverseScrollHandler) {
            window.reverseScrollHandler.currentSection = value;
        }
    }
});