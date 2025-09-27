// reverseScrolling.js
class ReverseScrollHandler {
    constructor() {
        this.isAnimating = false;
        this.activeTimers = [];
        this._currentSection = 1;
    }

    get currentSection() {
        return this._currentSection;
    }

    set currentSection(value) {
        this._currentSection = value;
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
    
    // Special handling for section 3 going back
    if (this.currentSection === 3 && targetSection === 1) {
        this.reverseToSection2(1); // This will show section 2 then go to 1
        setTimeout(() => {
            this.isAnimating = false;
        }, 3000); // Longer timeout since we have the 1-second transition
        return true;
    }
    
    // Skip section 2 in normal reverse scrolling
    if (targetSection === 2) {
        targetSection = 1; // Jump directly to section 1
    }
    
    // Rest of your existing code...
    this.stopActiveTimers();
    
    switch(this.currentSection) {
        case 18: this.reverseFromFooter(); break;
        case 17: this.reverseToSection16(); break;
        // ... rest of cases (skip case for section 2)
        case 3: this.reverseToSection2(targetSection); break; // Special handling
        // case 2: not needed since it's transitional
    }
    
    this.currentSection = targetSection;
    window.currentSection = targetSection;
    
    setTimeout(() => {
        this.isAnimating = false;
    }, 2000);
    
    return true;
}

    killAllAnimations() {
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
            if (window.planet3D.traverse) {
                window.planet3D.traverse(function(child) {
                    if (child instanceof THREE.Mesh && child.material) {
                        gsap.killTweensOf(child.material);
                        gsap.killTweensOf(child.material.color);
                    }
                });
            }
        }

        if (window.planetBackground) {
            gsap.killTweensOf(window.planetBackground.position);
            gsap.killTweensOf(window.planetBackground.material);
        }
    }

    updateNavigationDots(activeSection) {
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
        // Skip section 2 in dot indexing since it's transitional
        let dotSection = activeSection;
        if (activeSection > 2) dotSection = activeSection - 1;
        if (activeSection === 1) dotSection = 0;
        if (activeSection === 2) dotSection = activeSection === 2 ? (goingForward ? 1 : 0) : dotSection;
        
        dot.classList.toggle('active', index === dotSection);
    });
}

    stopActiveTimers() {
        if (window.wheelInterval) {
            clearInterval(window.wheelInterval);
            window.wheelInterval = null;
        }
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
            window.carouselInterval = null;
        }
        
        this.activeTimers.forEach(timer => clearTimeout(timer));
        this.activeTimers = [];
    }

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

    reset3DModelToState(position, scale, materialProps = null) {
        if (window.planet3D) {
            gsap.to(window.planet3D.position, {
                duration: 1,
                x: position.x,
                y: position.y,
                z: position.z,
                ease: "power2.inOut"
            });

            gsap.to(window.planet3D.scale, {
                duration: 1,
                x: scale.x,
                y: scale.y,
                z: scale.z,
                ease: "power2.inOut"
            });

            if (materialProps && window.planet3D.material) {
                gsap.to(window.planet3D.material.color, {
                    duration: 0.8,
                    r: materialProps.color.r,
                    g: materialProps.color.g,
                    b: materialProps.color.b
                });
                gsap.to(window.planet3D.material, {
                    duration: 0.8,
                    emissive: materialProps.emissive
                });
            } else if (materialProps && window.planet3D.traverse) {
                window.planet3D.traverse(function(child) {
                    if (child instanceof THREE.Mesh && child.material) {
                        gsap.to(child.material.color, {
                            duration: 0.8,
                            r: materialProps.color.r,
                            g: materialProps.color.g,
                            b: materialProps.color.b
                        });
                        gsap.to(child.material, {
                            duration: 0.8,
                            emissive: materialProps.emissive
                        });
                    }
                });
            }

            if (window.planetBackground) {
                gsap.to(window.planetBackground.position, {
                    duration: 1,
                    x: position.x,
                    y: position.y,
                    z: position.z - 8,
                    ease: "power2.inOut"
                });
            }
        }
    }

    reverseFromFooter() {
        this.resetElementToInitialState('.footer-container', {
            transform: 'translateY(100%)',
            opacity: 0
        });

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

        // Reset planet to section 17 state
        this.reset3DModelToState(
            { x: 0, y: -2, z: 11 },
            { x: 0.8, y: 0.8, z: 0.8 },
            {
                color: { r: 1, g: 0.5, b: 0 },
                emissive: new THREE.Color(0x442200)
            }
        );

        // Ensure correct background
        gsap.set('#mask3', { opacity: 0.7 });
        gsap.set('#mask5', { opacity: 0 });
    }

    reverseToSection16() {
        // Reset section 17 completely
        this.resetElementToInitialState('.section-seventeen-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.section-seventeen-main', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        // Change backgrounds
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });

        // Reset planet to section 16 state
        this.reset3DModelToState(
            { x: 0, y: 8, z: 0 },
            { x: 0, y: 0, z: 0 },
            {
                color: { r: 1, g: 0.27, b: 0.27 },
                emissive: new THREE.Color(0x220000)
            }
        );

        gsap.to('.section-sixteen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        // Reset and animate section 16 elements
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
            delay: 1.2
        });

        gsap.to('.logos-row', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4
        });
    }

    reverseToSection15() {
        // Reset section 16
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
        
        // Reinitialize carousel
        const initTimer = setTimeout(() => {
            if (typeof window.initializeCarousel === 'function') {
                window.initializeCarousel();
            }
        }, 1000);
        this.activeTimers.push(initTimer);
    }

    reverseToSection14() {
        this.stopActiveTimers();
        this.resetElementToInitialState('.section-fifteen-content', {
            opacity: 0
        });
        this.resetCarouselElements();

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
                gsap.to('#mask7', {
                    duration: 0.1,
                    opacity: 1
                });
                
                gsap.to(transition, {
                    duration: 1,
                    transform: 'scale(0)',
                    opacity: 0,
                    ease: "power2.in",
                    delay: 0.5,
                    onComplete: () => {
                        this.resetElementToInitialState('.section-fourteen-left', {
                            opacity: 0,
                            transform: 'translateX(-100px)'
                        });
                        
                        this.resetElementToInitialState('.section-fourteen-right', {
                            opacity: 0,
                            transform: 'translateX(100px)'
                        });

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
                gsap.to('#mask7', {
                    duration: 0.1,
                    opacity: 0
                });
                
                gsap.to(transition, {
                    duration: 1,
                    transform: 'scale(0)',
                    opacity: 0,
                    ease: "power2.in",
                    delay: 0.5,
                    onComplete: () => {
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
        // Reset section 13
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

        // Show section 12 background
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        // Reset section 12 elements
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
        // Reset section 12
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

        // Change background to section 11
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

        // Reset section 11 elements
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
        // Reset section 11
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

        // Change background
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

        // Reset planet to section 10 state
        this.reset3DModelToState(
            { x: 0, y: 15, z: 0 },
            { x: 0, y: 0, z: 0 }
        );

        // Reset section 10 elements
        this.resetElementToInitialState('.testimonial-header', {
            opacity: 0,
            transform: 'translateX(-50%) translateY(100px)'
        });

        this.resetElementToInitialState('.cards-container', {
            opacity: 0,
            transform: 'translateX(-50%) translateY(100px)'
        });

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
    }

    reverseToSection9() {
        // Reset section 10
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

        // Reset planet to section 9 state
        this.reset3DModelToState(
            { x: 0, y: 3, z: 11 },
            { x: 0.8, y: 0.8, z: 0.8 }
        );

        // Reset section 9 elements
        this.resetElementToInitialState('.rotating-container', {
            opacity: 0
        });

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

        // Trigger orbit animations
        const orbitTimer = setTimeout(() => {
            if (typeof window.triggerOrbitAnimations === 'function') {
                window.triggerOrbitAnimations();
            }
        }, 1000);
        this.activeTimers.push(orbitTimer);
    }

    reverseToSection8() {
        // Reset section 9
        this.resetElementToInitialState('.section-nine-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.rotating-container', {
            opacity: 0
        });

        // Show section 8 backgrounds
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

        // Reset planet to section 8 state
        this.reset3DModelToState(
            { x: 0, y: -2, z: 11 },
            { x: 0.8, y: 0.8, z: 0.8 }
        );

        // Reset section 8 elements
        this.resetElementToInitialState('.ai-tool-header', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        this.resetElementToInitialState('.input-container', {
            opacity: 0,
            transform: 'translate(-50%, -50%) translateY(100px)'
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
    }

    reverseToSection7() {
        // Reset section 8
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

        // Hide section 8 backgrounds
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

        // Reset planet to section 7 state
        this.reset3DModelToState(
            { x: 0, y: 15, z: 0 },
            { x: 0, y: 0, z: 0 }
        );

        // Reset section 7 elements
        this.resetElementToInitialState('.cafe-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.wheel-controls', {
            opacity: 0
        });

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

        // Restart wheel timer
        const wheelTimer = setTimeout(() => {
            if (typeof window.startWheelTimer === 'function') {
                window.startWheelTimer();
            }
        }, 1500);
        this.activeTimers.push(wheelTimer);
    }

    reverseToSection6() {
        this.stopActiveTimers();

        // Reset section 7
        this.resetElementToInitialState('.section-seven-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.cafe-content', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.wheel-controls', {
            opacity: 0
        });

        // Reset planet to section 6 state
        this.reset3DModelToState(
            { x: -10, y: 8, z: 0 },
            { x: 0, y: 0, z: 0 }
        );

        // Reset section 6 elements
        document.querySelectorAll('.category-item').forEach((item) => {
            gsap.set(item, {
                opacity: 0,
                transform: 'translateX(100px)'
            });
        });

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
    }

    reverseToSection5() {
        // Reset section 6
        this.resetElementToInitialState('.section-six-content', {
            opacity: 0
        });

        document.querySelectorAll('.category-item').forEach((item) => {
            gsap.set(item, {
                opacity: 0,
                transform: 'translateX(100px)'
            });
        });

        // Show section 5 background
        gsap.to('#mask4', {
            duration: 1,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        // Reset planet to section 5 state
        this.reset3DModelToState(
            { x: -6, y: 3, z: 11 },
            { x: 0.8, y: 0.8, z: 0.8 }
        );

        // Reset section 5 elements to their original state
        this.resetElementToInitialState('.bottom-content', {
            opacity: 1,
            top: '50%',
            transform: 'translateX(-50%) translateY(0)'
        });

        this.resetElementToInitialState('.bottom-description', {
            opacity: 1
        });

        this.resetElementToInitialState('.section-five-button', {
            opacity: 0
        });

        gsap.to('.section-five-button', {
            duration: 0.8,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });
    }

    reverseToSection4() {
        // Hide section 5 specific elements
        this.resetElementToInitialState('.section-five-button', {
            opacity: 0
        });

        // Change backgrounds
        gsap.to('#mask4', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('#mask2', {
            duration: 1,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });

        // Reset planet to section 4 state
        this.reset3DModelToState(
            { x: 0, y: 3, z: 11 },
            { x: 0.8, y: 0.8, z: 0.8 }
        );

        // Reset section 4 elements
        this.resetElementToInitialState('.section-four-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

        this.resetElementToInitialState('.image-gallery', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

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
            delay: 0.5
        });

        gsap.to('.bottom-description', {
            duration: 0.5,
            opacity: 0.3,
            delay: 0.8
        });
    }

    reverseToSection3() {
        // Reset section 4
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

        // Change backgrounds
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

        // Reset planet to section 3 state
        this.reset3DModelToState(
            { x: 0, y: -2, z: 11 },
            { x: 0.8, y: 0.8, z: 0.8 }
        );

        // Reset section 3 elements
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

        gsap.to('.section-three-overlays', {
            duration: 0.5,
            opacity: 1,
            scale: 1,
            delay: 0.8
        });

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

        gsap.to('.nav-frame', {
            duration: 1,
            opacity: 1,
            delay: 1.8
        });
    }

    reverseToSection2() {
        // Reset section 3
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

        // Change backgrounds
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

        // Reset planet to section 2 state
        this.reset3DModelToState(
            { x: 0, y: 0, z: 0 },
            { x: 0.8, y: 0.8, z: 0.8 }
        );

        // Show section 2 elements
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

        this.currentSection = 2;
    window.currentSection = 2;
        setTimeout(() => {
        if (targetSection === 1) {
            this.reverseToSection1();
        }
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

        // Reset section 1 elements
        this.resetElementToInitialState('.main-title', {
            opacity: 0,
            transform: 'translateY(100px)'
        });
        
        this.resetElementToInitialState('.subtitle', {
            opacity: 0,
            transform: 'translateY(100px)'
        });

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
        this.reset3DModelToState(
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 }
        );
    }

    resetCarousel() {
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

        window.currentCarouselIndex = 0;
    }

    resetCarouselElements() {
        this.resetElementToInitialState('.text-carousel', {
            opacity: 0
        });
        
        this.resetElementToInitialState('.carousel-container', {
            transform: 'translateX(0)'
        });
        
        this.resetElementToInitialState('.section-fifteen-background', {
            opacity: 0
        });
        
        document.querySelectorAll('.carousel-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.section-fifteen-background').forEach(bg => {
            bg.classList.remove('active');
        });

        window.currentCarouselIndex = 0;
    }
}

// Initialize and export
if (!window.reverseScrollHandler) {
    window.reverseScrollHandler = new ReverseScrollHandler();
}

// Update the main script's currentSection reference
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