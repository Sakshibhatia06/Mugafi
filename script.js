// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.autoClear = false;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// 3D Elements
let planet3D = null;
let planetBackground = null;

camera.position.z = 15;

let particleSystem = null;

let touchStartY = 0;
let touchStartX = 0;
let lastTouchTime = 0;
let isTouchDevice = false;
let touchSensitivity = 50; // Minimum swipe distance
let touchTimeLimit = 500; // Maximum time for swipe gesture

// Detect if device supports touch
function detectTouchDevice() {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
}

// Mobile touch handlers
function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    lastTouchTime = Date.now();
}

function handleTouchMove(e) {
    // Prevent default scrolling behavior
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchStartY || !touchStartX) return;
    
    const touch = e.changedTouches[0];
    const touchEndY = touch.clientY;
    const touchEndX = touch.clientX;
    const touchDuration = Date.now() - lastTouchTime;
    
    const deltaY = touchStartY - touchEndY;
    const deltaX = Math.abs(touchStartX - touchEndX);
    const absDeltaY = Math.abs(deltaY);
    
    // Check if it's a valid vertical swipe
    if (absDeltaY > touchSensitivity && 
        deltaX < touchSensitivity && 
        touchDuration < touchTimeLimit) {
        
        e.preventDefault();
        
        // Create a synthetic wheel event
        const syntheticEvent = {
            deltaY: deltaY > 0 ? 100 : -100, // Positive for down, negative for up
            preventDefault: () => {}
        };
        
        // Use the existing scroll handler
        handleScrollEvent(syntheticEvent);
    }
    
    // Reset touch values
    touchStartY = 0;
    touchStartX = 0;
    lastTouchTime = 0;
}

// Image preloader system - Updated
class AssetLoader {
    constructor() {
        this.imageSources = [];
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    // Extract all image sources from the HTML
    extractImageSources() {
        const images = document.querySelectorAll('img');
        const backgroundImages = document.querySelectorAll('[style*="background-image"]');
        
        // Get all img src attributes
        images.forEach(img => {
            if (img.src && !img.src.includes('data:') && !img.src.includes('blob:')) {
                this.imageSources.push(img.src);
            }
        });

        // Get inline background images
        backgroundImages.forEach(element => {
            const style = element.getAttribute('style');
            const matches = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
            if (matches && matches[1]) {
                this.imageSources.push(matches[1]);
            }
        });

        // Add all the mask background images and other assets
        const allAssets = [
            './assets/Group 1171275088.png',
            './assets/Rectangle 8311-3.png',
            './assets/Group 1171275097-1.png',
            './assets/Frame 2147224148-8.png',
            './assets/Frame 2147224148-6.png',
            './assets/Frame 2147224148.png',
            './assets/Vector 61.png',
            './assets/Vector 61-1.png',
            './assets/Vector 61-2.png',
            './assets/Vector 61-3.png',
            './assets/Vector 61-5.png',
            './assets/Frame 2147224336.png',
            './assets/Frame 2147224180-5.png',
            './assets/Group 1171275118.png',
            './assets/Frame 2147224338.png',
            './assets/Frame 2147224338-1.png',
            './assets/Frame 2147224339.png',
            './assets/Frame 2147224339-2.png',
            './assets/Frame 2147224340.png',
            './assets/Frame 2147224341.png',
            './assets/Mask group-8.png',
            './assets/Frame 2147224148-4.png',
            './assets/Frame 2147224339-1.png',
            // Background masks
            './assets/Mask group-2.png',
            './assets/Group 1171275138.png',
            './assets/image 269.png',
            './assets/glows.png',
            './assets/glows-2.png',
            './assets/koncepted.ai_red_rose_color_pallete_detailed_smooth_mountains_i_81b88cf3-c6dd-4118-9c38-94b63a67f4d2-2 1.png',
            './assets/image 376.png',
            // Section 15 backgrounds
            './assets/creator ownership.png',
            './assets/koncepted.ai_A_surreal_scene_with_a_circle_of_human_silhouettes_c0d5e498-c93a-4922-b101-5c5ed5a9b2eb 1.png',
            './assets/transparent funding.png',
            './assets/global reach.png',
            './assets/global reach-1.png',
            // Navigation
            './assets/Rectangle 8305.png'
        ];

        // Add all assets to sources
        allAssets.forEach(src => {
            if (!this.imageSources.includes(src)) {
                this.imageSources.push(src);
            }
        });

        // Remove duplicates
        this.imageSources = [...new Set(this.imageSources)];
        this.totalCount = this.imageSources.length;

        console.log(`Found ${this.totalCount} images to load:`, this.imageSources);
    }

    // Load a single image and return a promise
    loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                this.loadedCount++;
                const progress = (this.loadedCount / this.totalCount) * 100;
                
                if (this.onProgress) {
                    this.onProgress(progress, this.loadedCount, this.totalCount, src);
                }
                
                console.log(`✓ Loaded: ${src} (${this.loadedCount}/${this.totalCount})`);
                resolve({ success: true, src, img });
            };
            
            img.onerror = () => {
                console.warn(`✗ Failed to load: ${src}`);
                this.loadedCount++; // Count failed loads to prevent hanging
                const progress = (this.loadedCount / this.totalCount) * 100;
                
                if (this.onProgress) {
                    this.onProgress(progress, this.loadedCount, this.totalCount, src);
                }
                
                resolve({ success: false, src, img: null });
            };
            
            // Set a timeout to prevent hanging on slow/missing images
            setTimeout(() => {
                if (!img.complete) {
                    console.warn(`⏰ Timeout loading: ${src}`);
                    img.src = ''; // Cancel the request
                    this.loadedCount++;
                    const progress = (this.loadedCount / this.totalCount) * 100;
                    
                    if (this.onProgress) {
                        this.onProgress(progress, this.loadedCount, this.totalCount, src);
                    }
                    
                    resolve({ success: false, src, img: null });
                }
            }, 10000); // 10 second timeout per image
            
            img.src = src;
        });
    }

    // Load all images
    async loadAll() {
        this.extractImageSources();
        
        if (this.totalCount === 0) {
            console.log('No images to load');
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }

        console.log(`🚀 Starting to load ${this.totalCount} assets...`);
        
        const loadPromises = this.imageSources.map(src => this.loadImage(src));
        
        try {
            const results = await Promise.all(loadPromises);
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;
            
            console.log(`🎉 Asset loading complete! Success: ${successCount}, Failed: ${failCount}`);
            
            if (this.onComplete) {
                this.onComplete();
            }
        } catch (error) {
            console.error('❌ Unexpected error during asset loading:', error);
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
}

// Updated loading system - ONLY progresses with real asset loading
let assetLoader;
let assetsLoaded = false;

function initializeAssetLoading() {
    assetLoader = new AssetLoader();
    
    assetLoader.onProgress = (progress, loaded, total, currentSrc) => {
        updateLoadingDisplay(progress, loaded, total, currentSrc);
    };
    
    assetLoader.onComplete = () => {
        assetsLoaded = true;
        console.log('🏁 All assets loaded! Starting experience...');
        
        // Small delay to show 100% completion
        setTimeout(() => {
            startSection1();
        }, 800);
    };
    
    // Start loading assets
    assetLoader.loadAll();
}

function updateLoadingDisplay(progress, loaded, total, currentSrc = '') {
    const progressFill = document.querySelector('.progress-fill');
    const loadingPercentage = document.querySelector('.loading-percentage');
    const loadingText = document.querySelector('.loading-text');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (loadingPercentage) {
        loadingPercentage.textContent = Math.floor(progress) + '%';
    }
    
    if (loadingText) {
        if (total > 0) {
            const fileName = currentSrc ? currentSrc.split('/').pop() : '';
            loadingText.textContent = `loading assets ... (${loaded}/${total})`;
            
            // Optionally show current file being loaded
            if (fileName && loaded < total) {
                loadingText.textContent += ` • ${fileName}`;
            }
        } else {
            loadingText.textContent = `scanning assets ...`;
        }
    }
}

function createParticleSystem() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Create X-shape pattern
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 15 + 5;
        
        if (i % 2 === 0) {
            // First diagonal of X
            positions[i3] = Math.cos(angle) * radius * 0.7;
            positions[i3 + 1] = Math.sin(angle) * radius * 0.7;
        } else {
            // Second diagonal of X
            positions[i3] = Math.cos(angle + Math.PI/2) * radius * 0.7;
            positions[i3 + 1] = Math.sin(angle + Math.PI/2) * radius * 0.7;
        }
        
        positions[i3 + 2] = (Math.random() - 0.5) * 20; // Spread in Z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    particleSystem.position.set(0, 0, -5);
    scene.add(particleSystem);
    
    return particleSystem;
}

function createModelParticleBackground() {
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Create X-shape pattern behind the model with more visibility
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const t = (i / particleCount) * Math.PI * 6; // More rotations for denser pattern
        const radius = 5 + Math.random() * 3; // Larger radius for better visibility
        
        if (i % 2 === 0) {
            // First diagonal of X
            positions[i3] = Math.cos(t) * radius;
            positions[i3 + 1] = Math.sin(t) * radius;
        } else {
            // Second diagonal of X (rotated 90 degrees)
            positions[i3] = Math.cos(t + Math.PI/2) * radius;
            positions[i3 + 1] = Math.sin(t + Math.PI/2) * radius;
        }
        
        positions[i3 + 2] = (Math.random() - 0.5) * 8; // Wider spread in Z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15, // Larger size for better visibility
        transparent: true,
        opacity: 0.8, // Higher opacity
        blending: THREE.AdditiveBlending
    });
    
    const modelBackground = new THREE.Points(geometry, material);
    modelBackground.position.set(0, 0, -3); // Further back for better visibility
    scene.add(modelBackground);
    
    return modelBackground;
}

// Create a placeholder 3D sphere
function createPlaceholderPlanet() {
    const textureLoader = new THREE.TextureLoader();
    
    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    
    // Create gradient texture for darker bottom
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(0.7, '#ff4444');
    gradient.addColorStop(1, '#222222');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradientTexture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0x220000,
        emissiveIntensity: 0.3,
        map: gradientTexture
    });

    // Load additional textures...
    textureLoader.load('./3d assets/First Planet/fbx/tex/RS Standard_0_diffuse_red_00000.png', 
        (texture) => {
            material.map = texture;
            material.needsUpdate = true;
        },
        undefined,
        (error) => {
            console.log('Diffuse texture not found, using gradient');
        }
    );

    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.scale.set(0, 0, 0);
    sphere.position.set(0, 0, 0);
    scene.add(sphere);
    planet3D = sphere;

    // Create particle system instead of background image
    createParticleSystem();
    window.modelBackgroundParticles = createModelParticleBackground();
}

// Load 3D Planet with FBX fallback
function load3DPlanet() {
    if (typeof THREE.FBXLoader !== 'undefined') {
        const textureLoader = new THREE.TextureLoader();
        const loader = new THREE.FBXLoader();
        
        loader.setPath('./3d assets/First Planet/fbx/');
        loader.load('Planet_1fbx.fbx', 
            function (model) {
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        // Create gradient material with darker bottom
                        const canvas = document.createElement('canvas');
                        canvas.width = 256;
                        canvas.height = 256;
                        const ctx = canvas.getContext('2d');
                        
                        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                        gradient.addColorStop(0, '#ff4444');
                        gradient.addColorStop(0.7, '#ff4444');
                        gradient.addColorStop(1, '#333333');
                        
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        const gradientTexture = new THREE.CanvasTexture(canvas);
                        
                        const material = new THREE.MeshStandardMaterial({
                            color: 0xff4444,
                            metalness: 0.5,
                            roughness: 0.5,
                            emissive: 0x220000,
                            map: gradientTexture
                        });

                        textureLoader.load('./assets/RS Standard_0_diffuse_red_00000.png', 
                            (texture) => {
                                // Blend with gradient
                                material.map = texture;
                                material.needsUpdate = true;
                            }
                        );

                        child.material = material;
                    }
                });

                model.scale.set(0, 0, 0);
                model.position.set(0, 0, 0);
                scene.add(model);
                planet3D = model;

                // Create particle system
                createParticleSystem();
                window.modelBackgroundParticles = createModelParticleBackground();
            },
            undefined,
            function (error) {
                console.log('FBX model not found, using placeholder sphere');
                createPlaceholderPlanet();
            }
        );
    } else {
        console.log('FBXLoader not available, using placeholder sphere');
        createPlaceholderPlanet();
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (planet3D) {
        planet3D.rotation.y += 0.01;
        
        // Move particle system with the planet
        if (particleSystem) {
            particleSystem.position.x = planet3D.position.x;
            particleSystem.position.y = planet3D.position.y;
            particleSystem.position.z = planet3D.position.z - 5;
            particleSystem.rotation.z += 0.002;
        }
        
        // Move model background particles with the planet
        if (window.modelBackgroundParticles) {
            window.modelBackgroundParticles.position.x = planet3D.position.x;
            window.modelBackgroundParticles.position.y = planet3D.position.y;
            window.modelBackgroundParticles.position.z = planet3D.position.z - 3;
            window.modelBackgroundParticles.rotation.z += 0.003; // Faster rotation for visibility
            window.modelBackgroundParticles.rotation.x += 0.001;
        }
    }

    renderer.clear();
    renderer.render(scene, camera);
}

// Animation and section management
let loadingProgress = 0;
let currentSection = 0;
let currentCardIndex = 0;
let currentWheelIndex = 0;
let currentCarouselIndex = 0;
let wheelInterval;
let carouselInterval;
const totalCards = 5;
const totalWheelImages = 5;
let totalCarouselItems = 5;

// Section transition functions with reverse capability
function startSection1(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        if (!assetsLoaded) {
            setTimeout(() => startSection1(reverse), 100);
            return;
        }
        
        const loadingSection = document.querySelector('.loading-section');
        const semicircle = document.querySelector('.semicircle');
        
        gsap.to(semicircle, {
            duration: 1,
            width: '150px',
            height: '300px',
            borderRadius: '75px 75px 0 0',
            ease: "power2.inOut",
            onComplete: () => {
                semicircle.style.borderBottom = '1px solid #ffffff5f';
                gsap.to('.section-one-tombstone', {
                    duration: 0.5,
                    opacity: 1
                });
            }
        });
        
        gsap.to('#mask1', {
            duration: 0.5,
            opacity: 1,
            delay: 1.5
        });

        gsap.to('.logo', {
            duration: 1.2,
            y: -window.innerHeight/2 + 60,
            scale: 0.6,
            ease: "power2.inOut"
        });

        gsap.to('.header-logo', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        gsap.to('.main-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });

        gsap.to('.subtitle', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4
        });

        gsap.to(loadingSection, {
            duration: 0.5,
            opacity: 0,
            delay: 1.5,
            onComplete: () => {
                loadingSection.style.display = 'none';
                document.body.style.overflowY = 'auto';
                setupScrolling();
            }
        });
    } else {
        // Reverse animation (coming back from section 2)
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

        // Reset tombstone structures
        gsap.to(['.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4'], {
            duration: 0.5,
            opacity: 0,
            scale: 1
        });

        if (planet3D) {
            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }
    }

    currentSection = 1;
}

function startSection2(reverse = false) {
    if (!reverse) {
        // Forward animation
        gsap.to('.header-logo', {
            duration: 1,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            scale: 1,
            ease: "power2.inOut"
        });

        gsap.to(['.main-title', '.subtitle'], {
            duration: 0.5,
            opacity: 0,
            y: -100
        });

        gsap.to('.section-one-tombstone', {
            duration: 0.5,
            opacity: 0
        });

        // Show tombstone structure and animate scales
        gsap.to('.tombstone-1', {
            duration: 0.5,
            opacity: 1,
            scale: 2,
            delay: 0.2
        });

        gsap.to('.tombstone-2', {
            duration: 0.8,
            opacity: 1,
            scale: 4,
            ease: "back.out(1.7)",
            delay: 0.4
        });

        gsap.to('.tombstone-3', {
            duration: 0.8,
            opacity: 1,
            scale: 5,
            ease: "back.out(1.7)",
            delay: 0.6
        });

        gsap.to('.tombstone-4', {
            duration: 0.8,
            opacity: 1,
            scale: 7,
            ease: "back.out(1.7)",
            delay: 0.8
        });

        if (planet3D) {
            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "back.out(1.7)",
                delay: 0.5
            });

            if (planetBackground) {
                gsap.to(planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    delay: 0.5
                });
            }
        }
    } else {
        // Reverse animation (coming back from section 3)
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

        if (planet3D) {
            gsap.to(planet3D.position, {
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

        // Show tombstones again
        gsap.to(['.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4'], {
            duration: 1,
            scale: [2, 4, 5, 7],
            opacity: 1,
            ease: "power2.out"
        });

        gsap.to('.header-logo', {
            duration: 0.8,
            opacity: 1,
            scale: 1
        });
    }

    currentSection = 2;
}

function startSection3(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.to('#mask1', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask2', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.3
        });
        
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });
        
        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                z: 11,
                y: -2,
                ease: "power2.inOut"
            });

            if (planetBackground) {
                gsap.to(planetBackground.position, {
                    duration: 1.5,
                    z: 3,
                    y: -2,
                    ease: "power2.inOut"
                });
            }
        }
        
        gsap.to('.section-three-overlays', {
            duration: 0.5,
            opacity: 1,
            delay: 2
        });

        gsap.to('.white-circle-behind', {
            duration: 1,
            opacity: 1,
            delay: 2.2
        });

        gsap.to('.section-three-overlay', {
            duration: 0.8,
            opacity: 1,
            stagger: 0.2,
            delay: 2.4
        });

        // Move tombstones with the planet and fade out
        gsap.to(['.tombstone-1', '.tombstone-2', '.tombstone-3', '.tombstone-4'], {
            duration: 1,
            scale: 10,
            opacity: 0,
            z: 1000,
            ease: "power2.in"
        });

        gsap.to('.header-logo', {
            duration: 0.8,
            opacity: 0,
            scale: 0,
            delay: 0.5
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
            delay: 2
        });
        
        gsap.to('.connection-curves', {
            duration: 0.5,
            opacity: 1,
            delay: 2.8
        });

        // Animate curves drawing
        gsap.to('.curve-path', {
            duration: 1.5,
            strokeDashoffset: 0,
            stagger: 0.3,
            delay: 3,
            ease: "power2.out"
        });

        // Animate circles bouncing in
        gsap.to('.connection-circle', {
            duration: 0.6,
            opacity: 1,
            scale: 1.2,
            stagger: 0.2,
            delay: 4,
            ease: "bounce.out",
            onComplete: () => {
                // Add continuous pulse animation
                gsap.to('.connection-circle', {
                    duration: 2,
                    scale: 1,
                    repeat: -1,
                    yoyo: true,
                    ease: "power2.inOut"
                });
            }
        });
    } else {
        // Reverse animation (coming back from section 4)
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

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: -2,
                ease: "power2.inOut"
            });

            if (planetBackground) {
                gsap.to(planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    ease: "power2.inOut"
                });
            }
        }
    }

    currentSection = 3;
}

function startSection4(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.to('#mask3', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('.section-three-overlays', {
            duration: 0.5,
            opacity: 0,
            scale: 0
        });
        
        gsap.to('#mask2', {
            duration: 1,
            y: -100,
            ease: "power2.inOut"
        });
        
        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: 3,
                ease: "power2.inOut"
            });

            if (planetBackground) {
                gsap.to(planetBackground.material, {
                    duration: 1,
                    opacity: 0,
                    ease: "power2.inOut"
                });
            }
        }

        gsap.to('.section-three-content', {
            duration: 0.5,
            opacity: 0,
            y: -100
        });

        gsap.to('.section-four-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
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
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2,
            transform: 'translateX(-50%) translateY(0)'
        });
    } else {
        // Reverse animation (coming back from section 5)
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

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                x: 0,
                ease: "power2.inOut"
            });
        }

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

    currentSection = 4;
}

function startSection5(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.to('#mask2', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask4', {
            duration: 1,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });
        
        gsap.to('.section-five-button', {
            duration: 0.8,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });
        
        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                x: -6,
                ease: "power2.inOut"
            });
        }

        gsap.to('.section-four-content', {
            duration: 0.5,
            opacity: 0,
            y: -100
        });

        gsap.to('.bottom-content', {
            duration: 1,
            top: '50%',
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });

        gsap.to('.bottom-description', {
            duration: 0.5,
            opacity: 1,
            delay: 0.8
        });
    } else {
        // Reverse animation (coming back from section 6)
        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                x: -6,
                y: 3,
                ease: "power2.inOut"
            });

            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut"
            });
        }

        gsap.to('.section-six-content', {
            duration: 0.5,
            opacity: 0
        });

        gsap.to('.bottom-content', {
            duration: 0.5,
            opacity: 1
        });

        document.querySelectorAll('.category-item').forEach((item) => {
            gsap.to(item, {
                duration: 0.5,
                x: 100,
                opacity: 0
            });
        });
    }

    currentSection = 5;
}

function startSection6(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                x: -10,
                y: 8,
                ease: "power2.inOut"
            });

            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }

        gsap.to('.bottom-content', {
            duration: 0.5,
            opacity: 0,
            y: -100
        });

        gsap.to('.section-six-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.8
        });

        document.querySelectorAll('.category-item').forEach((item, index) => {
            gsap.to(item, {
                duration: 0.8,
                x: 0,
                opacity: 1,
                ease: "back.out(1.7)",
                delay: 1 + (index * 0.2)
            });
        });
    } else {
        // Reverse animation (coming back from section 7)
        if (wheelInterval) {
            clearInterval(wheelInterval);
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

        if (planet3D) {
            gsap.set(planet3D.position, {
                x: -10,
                y: 8
            });

            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }
    }

    currentSection = 6;
}

function startSection7(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.to('.section-six-content', {
            duration: 1,
            x: -window.innerWidth,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-seven-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
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

        startWheelTimer();
    } else {
        // Reverse animation (coming back from section 8)
        if (wheelInterval) {
            clearInterval(wheelInterval);
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

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: 15,
                ease: "power2.inOut"
            });

            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }

        startWheelTimer();
    }

    currentSection = 7;
}

function startSection8(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.set('#mask3', { y: 0 });
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0.7,
            ease: "power2.inOut",
            delay: 1
        });
        
        if (wheelInterval) {
            clearInterval(wheelInterval);
        }

        gsap.to('.section-seven-content', {
            duration: 1,
            y: -window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (planet3D) {
            gsap.set(planet3D.position, {
                x: 0,
                y: -15,
                z: 11
            });

            gsap.to(planet3D.position, {
                duration: 1.5,
                y: -2,
                ease: "power2.inOut",
                delay: 0.5
            });

            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut",
                delay: 0.5
            });

            if (planetBackground) {
                gsap.to(planetBackground.position, {
                    duration: 1.5,
                    x: 0,
                    y: -2,
                    z: 3,
                    ease: "power2.inOut",
                    delay: 0.5
                });

                gsap.to(planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    delay: 0.5
                });
            }
        }

        gsap.to('.section-eight-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        gsap.to('.ai-tool-header', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });

        gsap.to('.input-container', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.4,
            transform: 'translate(-50%, -50%) translateY(0)'
        });
    } else {
        // Reverse animation (coming back from section 9)
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

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: -2,
                ease: "power2.inOut"
            });

            if (planetBackground) {
                gsap.to(planetBackground.material, {
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

    currentSection = 8;
}

function startSection9(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.to('#mask4', {
            duration: 0.5,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask3', {
            duration: 0.5,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.to('#mask5', {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });

        gsap.to('.ai-tool-header', {
            duration: 1,
            y: -200,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.input-container', {
            duration: 1,
            y: -200,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: 3,
                ease: "power2.inOut",
                delay: 0.5,
                onStart: () => {
                    setTimeout(() => {
                        triggerOrbitAnimations();
                    }, 500);
                }
            });

            if (planetBackground) {
                gsap.to(planetBackground.material, {
                    duration: 1,
                    opacity: 0,
                    delay: 0.5
                });
            }
        }

        gsap.to('.section-nine-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });

        gsap.to('.rotating-container', {
            duration: 1,
            opacity: 1,
            delay: 1.2
        });
    } else {
        // Reverse animation (coming back from section 10)
        gsap.to('.section-ten-content', {
            duration: 1,
            y: window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1,
                y: 3,
                ease: "power2.inOut"
            });

            gsap.to(planet3D.scale, {
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

        triggerOrbitAnimations();
    }

    currentSection = 9;
}

// Continue with the rest of the sections following the same pattern...
function startSection10(reverse = false) {
    if (!reverse) {
        // Forward animation (original)
        gsap.to('.section-nine-content', {
            duration: 1,
            y: -window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1,
                y: 15,
                ease: "power2.inOut"
            });

            gsap.to(planet3D.scale, {
                duration: 1,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }

        gsap.to('.section-ten-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        gsap.to('.testimonial-header', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.inOut",
            delay: 1,
            transform: 'translateX(-50%) translateY(0)'
        });

        gsap.to('.cards-container', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.inOut",
            delay: 1.3,
            transform: 'translateX(-50%) translateY(0)'
        });
    } else {
        // Reverse animation (coming back from section 11)
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

    currentSection = 10;
}

// Add the remaining sections with reverse animations...
function startSection11(reverse = false) {
    if (!reverse) {
        gsap.to('#mask5', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });
        
        gsap.set('#mask6', { y: window.innerHeight });
        gsap.to('#mask6', {
            duration: 1.5,
            y: 0,
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });
        
        gsap.to('.section-ten-content', {
            duration: 1,
            y: -window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-eleven-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        gsap.to('.section-eleven-title', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });

        gsap.to('.section-eleven-description', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });
    } else {
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

    currentSection = 11;
}

function startSection12(reverse = false) {
    if (!reverse) {
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
        
        gsap.to('.section-eleven-content', {
            duration: 1,
            y: -window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
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
            delay: 1
        });

        gsap.to('.rolling-image', {
            duration: 1.5,
            x: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            delay: 1.5
        });

        gsap.to('.section-twelve-right', {
            duration: 0.5,
            opacity: 1,
            delay: 1.8
        });

        gsap.to('.right-image', {
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 2
        });
    } else {
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

    currentSection = 12;
}

function startSection13(reverse = false) {
    if (!reverse) {
        gsap.to('.section-twelve-content', {
            duration: 1,
            y: -window.innerHeight,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-thirteen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        gsap.to('.section-thirteen-header', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1
        });

        document.querySelectorAll('.grid-icon').forEach((icon, index) => {
            gsap.to(icon, {
                duration: 0.6,
                y: 0,
                opacity: 1,
                ease: "back.out(1.7)",
                delay: 1.5 + (index * 0.2)
            });
        });
    } else {
        const transition = document.querySelector('.tombstone-transition');
        
        gsap.set(transition, { opacity: 1, transform: 'scale(15)' });
        gsap.to(transition, {
            duration: 1,
            transform: 'scale(0)',
            ease: "power2.inOut",
            onStart: () => {
                gsap.to('#mask7', {
                    duration: 0.2,
                    opacity: 0
                });
                
                gsap.to('.section-fourteen-content', {
                    duration: 0.5,
                    opacity: 0
                });
            },
            onComplete: () => {
                gsap.to(transition, {
                    duration: 1,
                    transform: 'scale(15)',
                    opacity: 0,
                    ease: "power2.inOut"
                });
            }
        });

        gsap.to('.section-thirteen-content', {
            duration: 0.3,
            opacity: 1,
            delay: 1.5
        });
    }

    currentSection = 13;
}

function startSection14(reverse = false) {
    if (!reverse) {
        gsap.to('.section-thirteen-content', {
            duration: 0.3,
            opacity: 0
        });

        const transition = document.querySelector('.tombstone-transition');
        
        gsap.set(transition, { opacity: 1, transform: 'scale(0)' });
        gsap.to(transition, {
            duration: 1,
            transform: 'scale(15)',
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to('#mask7', {
                    duration: 0.2,
                    opacity: 1
                });
                
                gsap.to('.section-fourteen-content', {
                    duration: 0.5,
                    opacity: 1
                });
                
                gsap.to(transition, {
                    duration: 1,
                    transform: 'scale(0)',
                    opacity: 0,
                    ease: "power2.inOut",
                    delay: 0.5
                });
            }
        });

        gsap.to('.section-fourteen-left', {
            duration: 0.8,
            x: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 2.5
        });

        gsap.to('.section-fourteen-right', {
            duration: 0.8,
            x: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 2.7
        });
    } else {
        gsap.to('#mask7', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (carouselInterval) {
            clearInterval(carouselInterval);
        }

        gsap.to('.section-fifteen-content', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-fourteen-content', {
            duration: 0.5,
            opacity: 1
        });

        currentCarouselIndex = 0;
    }

    currentSection = 14;
}

function startSection15(reverse = false) {
    if (!reverse) {
        gsap.to('#mask7', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut"
        });

        if (carouselInterval) {
            clearInterval(carouselInterval);
        }

        gsap.to('.section-fourteen-content', {
            duration: 1,
            opacity: 0,
            ease: "power2.inOut"
        });

        gsap.to('.section-fifteen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 0.5
        });

        initializeCarousel();
    } else {
        if (carouselInterval) {
            clearInterval(carouselInterval);
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

        initializeCarousel();
        gsap.to('.section-fifteen-content', {
            duration: 0.5,
            opacity: 1
        });
    }

    currentSection = 15;
}

function startSection16(reverse = false) {
    if (!reverse) {
        if (carouselInterval) {
            clearInterval(carouselInterval);
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
            opacity: 1,
            ease: "power2.inOut",
            delay: 0.5
        });
        
        gsap.to('.section-sixteen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });
        
        gsap.to('.section-sixteen-title', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.2
        });
        
        gsap.to('.logos-row', {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.5
        });
    } else {
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

        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: 8,
                ease: "power2.inOut"
            });

            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut"
            });
        }
    }

    currentSection = 16;
}

function startSection17(reverse = false) {
    if (!reverse) {
        gsap.to('.section-sixteen-title', {
            duration: 0.8,
            y: -200,
            opacity: 0,
            ease: "power2.in"
        });
        
        gsap.to('.logos-row', {
            duration: 0.8,
            y: -200,
            opacity: 0,
            ease: "power2.in",
            delay: 0.1
        });
        
        gsap.set('#mask3', { y: 0, opacity: 0 });
        gsap.to('#mask3', {
            duration: 0.8,
            opacity: 0.7,
            ease: "power2.inOut",
            delay: 0.5
        });
        
        if (planet3D) {
            if (planet3D.material) {
                gsap.to(planet3D.material.color, {
                    duration: 0.5,
                    r: 1,
                    g: 0.5,
                    b: 0
                });
                gsap.to(planet3D.material, {
                    duration: 0.5,
                    emissive: new THREE.Color(0x442200)
                });
            } else if (planet3D.traverse) {
                planet3D.traverse(function(child) {
                    if (child instanceof THREE.Mesh && child.material) {
                        gsap.to(child.material.color, {
                            duration: 0.5,
                            r: 1,
                            g: 0.5,
                            b: 0
                        });
                        gsap.to(child.material, {
                            duration: 0.5,
                            emissive: new THREE.Color(0x442200)
                        });
                    }
                });
            }
            
            gsap.set(planet3D.position, {
                x: 0,
                y: -15,
                z: 11
            });
            
            gsap.to(planet3D.position, {
                duration: 1.5,
                y: -2,
                ease: "power2.inOut",
                delay: 0.8
            });
            
            gsap.to(planet3D.scale, {
                duration: 1.5,
                x: 0.8,
                y: 0.8,
                z: 0.8,
                ease: "power2.inOut",
                delay: 0.8
            });
            
            if (planetBackground) {
                gsap.to(planetBackground.position, {
                    duration: 1.5,
                    x: 0,
                    y: -2,
                    z: 3,
                    ease: "power2.inOut",
                    delay: 0.8
                });
                
                gsap.to(planetBackground.material, {
                    duration: 1,
                    opacity: 0.7,
                    delay: 0.8
                });
            }
        }
        
        gsap.to('.section-seventeen-content', {
            duration: 0.5,
            opacity: 1,
            delay: 1
        });
        
        gsap.to('.section-seventeen-main', {
            duration: 1.2,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)",
            delay: 1.5
        });
    } else {
        // Reverse from footer
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
        
        if (planet3D) {
            gsap.to(planet3D.position, {
                duration: 1,
                y: -2,
                ease: "power2.inOut",
                delay: 0.3
            });
        }
    }

    currentSection = 17;
}

function showFooter() {
    gsap.to('.section-seventeen-main', {
        duration: 1,
        y: -150,
        ease: "power2.inOut"
    });
    
    if (planet3D) {
        gsap.to(planet3D.position, {
            duration: 1,
            y: 2,
            ease: "power2.inOut"
        });
        
        if (planetBackground) {
            gsap.to(planetBackground.position, {
                duration: 1,
                y: 2,
                ease: "power2.inOut"
            });
        }
    }
    
    gsap.to('.footer-container', {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: "power2.out",
        delay: 0.3
    });
    
    currentSection = 18;
}

// Add this new function to trigger orbit animations
function triggerOrbitAnimations() {
    const orbitOne = document.querySelector('.orbit-container.one');
    const orbitTwo = document.querySelector('.orbit-container.two');
    const orbitThree = document.querySelector('.orbit-container.three');
    
    [orbitOne, orbitTwo, orbitThree].forEach(orbit => {
        if (orbit) {
            orbit.style.animation = 'none';
            orbit.offsetHeight;
        }
    });
    
    setTimeout(() => {
        if (orbitOne) orbitOne.style.animation = 'rotate-orbit-one 3s ease-in-out 0s forwards';
    }, 100);
    
    setTimeout(() => {
        if (orbitTwo) orbitTwo.style.animation = 'rotate-orbit-two 3s ease-in-out 0s forwards';
    }, 1100);
    
    setTimeout(() => {
        if (orbitThree) orbitThree.style.animation = 'rotate-orbit-three 3s ease-in-out 0s forwards';
    }, 2100);
}

// Wheel management functions
function startWheelTimer() {
    wheelInterval = setInterval(() => {
        nextWheelImage();
    }, 3000);
}

function nextWheelImage() {
    currentWheelIndex = (currentWheelIndex + 1) % totalWheelImages;
    rotateWheel();
    updateWheelCounter();
    updateCafeImage();
}

function prevWheelImage() {
    currentWheelIndex = (currentWheelIndex - 1 + totalWheelImages) % totalWheelImages;
    rotateWheel();
    updateWheelCounter();
    updateCafeImage();
}

function updateCafeImage() {
    document.querySelectorAll('.cafe-image').forEach((img, index) => {
        img.classList.toggle('active', index === currentWheelIndex);
    });
}

function rotateWheel() {
    const wheel = document.getElementById('imageWheel');
    const rotationY = -(currentWheelIndex * 72);
    wheel.style.transform = `perspective(1000px) rotateY(${rotationY}deg)`;
}

function updateWheelCounter() {
    document.getElementById('wheelCounter').textContent = 
        String(currentWheelIndex + 1).padStart(2, '0') + '/05';
}

// Carousel functions
currentCarouselIndex = 0;
totalCarouselItems = 5;
let section15ScrollProgress = 0;

function initializeCarousel() {
    currentCarouselIndex = 0;
    section15ScrollProgress = 0;

    document.querySelectorAll('.section-fifteen-background').forEach((bg, index) => {
        bg.classList.toggle('active', index === 0);
    });

    const container = document.getElementById('carouselContainer');
    if (container) {
        container.style.transform = 'translateX(0)';
    }

    document.querySelectorAll('.carousel-item').forEach((item, index) => {
        item.classList.toggle('active', index === 0);
    });
}

function updateCarouselOnScroll(direction) {
    if (direction > 0 && currentCarouselIndex < totalCarouselItems - 1) {
        nextCarouselItem();
        return true;
    } else if (direction < 0 && currentCarouselIndex > 0) {
        prevCarouselItem();
        return true;
    }
    
    return false;
}

function nextCarouselItem() {
    if (currentCarouselIndex >= totalCarouselItems - 1) return;
    
    const nextIndex = currentCarouselIndex + 1;
    
    updateCarouselBackground(nextIndex + 1);
    
    document.querySelectorAll('.carousel-item').forEach((item, index) => {
        item.classList.toggle('active', index === nextIndex);
    });
    
    const container = document.getElementById('carouselContainer');
    if (container) {
        const translateX = -(nextIndex * 500);
        container.style.transform = `translateX(${translateX}px)`;
    }
    
    currentCarouselIndex = nextIndex;
}

function prevCarouselItem() {
    if (currentCarouselIndex <= 0) return;
    
    const prevIndex = currentCarouselIndex - 1;
    
    updateCarouselBackground(prevIndex + 1);
    
    document.querySelectorAll('.carousel-item').forEach((item, index) => {
        item.classList.toggle('active', index === prevIndex);
    });
    
    const container = document.getElementById('carouselContainer');
    if (container) {
        const translateX = -(prevIndex * 500);
        container.style.transform = `translateX(${translateX}px)`;
    }
    
    currentCarouselIndex = prevIndex;
}

function updateCarouselBackground(bgNumber) {
    document.querySelectorAll('.section-fifteen-background').forEach(bg => {
        bg.classList.remove('active');
    });
    
    const newBg = document.querySelector(`.bg-${bgNumber}`);
    if (newBg) {
        newBg.classList.add('active');
    }
}

function updateCardSlider() {
    const slider = document.getElementById('cardsSlider');
    const cardWidth = 330;
    const translateX = -(currentCardIndex * cardWidth);
    slider.style.transform = `translateX(${translateX}px)`;
}

// Mobile touch support
// let touchStartY = 0;
// let touchStartX = 0;
// let lastTouchTime = 0;
const touchThreshold = 50; // Minimum swipe distance
const timeThreshold = 300; // Maximum time for swipe

function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    lastTouchTime = Date.now();
}

function handleTouchEnd(e) {
    if (!touchStartY || !touchStartX) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const touchTime = Date.now() - lastTouchTime;
    
    const deltaY = touchStartY - touchEndY;
    const deltaX = Math.abs(touchStartX - touchEndX);
    
    // Only process vertical swipes (ignore horizontal swipes)
    if (Math.abs(deltaY) > touchThreshold && deltaX < touchThreshold && touchTime < timeThreshold) {
        e.preventDefault();
        
        // Simulate wheel event
        const wheelEvent = {
            deltaY: deltaY > 0 ? 100 : -100,
            preventDefault: () => {}
        };
        
        handleScroll(wheelEvent);
    }
    
    touchStartY = 0;
    touchStartX = 0;
}

// Updated scroll handling function that supports both directions and mobile
let isScrolling = false;
function handleScroll(e) {
    if (isScrolling) return;
    
    e.preventDefault();
    
    let targetSection = currentSection;
    
    // Special handling for section 15
    if (currentSection === 15) {
        const handled = updateCarouselOnScroll(e.deltaY);
        if (handled) {
            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 300);
            return;
        }
    }
    
    if (e.deltaY > 0) {
        // Scrolling down
        if (currentSection < 17) {
            targetSection = currentSection + 1;
        } else if (currentSection === 17 && currentSection !== 18) {
            showFooter();
            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 2000);
            return;
        }
    } else if (e.deltaY < 0) {
        // Scrolling up
        if (currentSection === 18) {
            // Hide footer and go back to section 17
            startSection17(true); // Pass true for reverse
            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 2000);
            return;
        } else if (currentSection > 1) {
            targetSection = currentSection - 1;
        }
    }
    
    if (targetSection !== currentSection) {
        isScrolling = true;
        
        // Update navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === targetSection - 1);
        });

        // Stop timers when leaving sections
        if (currentSection === 7 && wheelInterval) {
            clearInterval(wheelInterval);
        }
        if (currentSection === 15 && carouselInterval) {
            clearInterval(carouselInterval);
        }
        
        // Call the appropriate section function with reverse flag
        const isReverse = targetSection < currentSection;
        
        switch(targetSection) {
            case 1: startSection1(isReverse); break;
            case 2: startSection2(isReverse); break;
            case 3: startSection3(isReverse); break;
            case 4: startSection4(isReverse); break;
            case 5: startSection5(isReverse); break;
            case 6: startSection6(isReverse); break;
            case 7: startSection7(isReverse); break;
            case 8: startSection8(isReverse); break;
            case 9: startSection9(isReverse); break;
            case 10: startSection10(isReverse); break;
            case 11: startSection11(isReverse); break;
            case 12: startSection12(isReverse); break;
            case 13: startSection13(isReverse); break;
            case 14: startSection14(isReverse); break;
            case 15: startSection15(isReverse); break;
            case 16: startSection16(isReverse); break;
            case 17: startSection17(isReverse); break;
        }
        
        setTimeout(() => {
            isScrolling = false;
        }, 2000);
    }
}
function handleScrollEvent(e) {
    if (window.isScrolling) return;
    
    e.preventDefault();
    
    let targetSection = currentSection;
    
    // Special handling for section 15 carousel
    if (currentSection === 15) {
        const handled = updateCarouselOnScroll(e.deltaY);
        if (handled) {
            window.isScrolling = true;
            setTimeout(() => { window.isScrolling = false; }, 300);
            return;
        }
    }
    
    // Determine scroll direction and target section
    if (e.deltaY > 0) {
        // Scrolling down
        if (currentSection < 17) {
            targetSection = currentSection + 1;
        } else if (currentSection === 17 && currentSection !== 18) {
            showFooter();
            window.isScrolling = true;
            setTimeout(() => { window.isScrolling = false; }, 2000);
            return;
        }
    } else if (e.deltaY < 0) {
        // Scrolling up
        if (currentSection === 18) {
            // Hide footer and return to section 17
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
            
            if (planet3D) {
                gsap.to(planet3D.position, {
                    duration: 1,
                    y: -2,
                    ease: "power2.inOut",
                    delay: 0.3
                });
            }
            
            currentSection = 17;
            window.isScrolling = true;
            setTimeout(() => { window.isScrolling = false; }, 2000);
            return;
        } else if (currentSection > 1) {
            targetSection = currentSection - 1;
        }
    }
    
    // Execute section transition if target changed
    if (targetSection !== currentSection) {
        window.isScrolling = true;
        
        // Update navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === targetSection - 1);
        });

        // Stop timers when leaving certain sections
        if (currentSection === 7 && wheelInterval) {
            clearInterval(wheelInterval);
        }
        if (currentSection === 15 && carouselInterval) {
            clearInterval(carouselInterval);
        }
        
        // Execute the appropriate section transition
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
        
        // Reset scroll lock after animation completes
        setTimeout(() => {
            window.isScrolling = false;
        }, 2000);
    }
}

function setupScrolling() {
    // Initialize touch detection
    detectTouchDevice();
    
    // Initialize scroll lock
    window.isScrolling = false;
    
    // Desktop mouse wheel support
    window.addEventListener('wheel', handleScrollEvent, { 
        passive: false,
        capture: true 
    });
    
    // Mobile touch support
    if (isTouchDevice) {
        console.log('Touch device detected - enabling mobile scrolling');
        
        // Add touch event listeners
        document.addEventListener('touchstart', handleTouchStart, { 
            passive: false,
            capture: true 
        });
        
        document.addEventListener('touchmove', handleTouchMove, { 
            passive: false,
            capture: true 
        });
        
        document.addEventListener('touchend', handleTouchEnd, { 
            passive: false,
            capture: true 
        });
        
        // Prevent elastic scrolling on iOS
        document.body.addEventListener('touchstart', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.body.addEventListener('touchend', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.body.addEventListener('touchmove', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Setup wheel controls (existing code)
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            if (wheelInterval) clearInterval(wheelInterval);
            prevWheelImage();
            startWheelTimer();
        });
    }

    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            if (wheelInterval) clearInterval(wheelInterval);
            nextWheelImage();
            startWheelTimer();
        });
    }

    // Setup testimonial card controls (existing code)
    const testPrevArrow = document.getElementById('testPrevArrow');
    const testNextArrow = document.getElementById('testNextArrow');
    
    if (testPrevArrow) {
        testPrevArrow.addEventListener('click', () => {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                updateCardSlider();
            }
        });
    }

    if (testNextArrow) {
        testNextArrow.addEventListener('click', () => {
            if (currentCardIndex < totalCards - 3) {
                currentCardIndex++;
                updateCardSlider();
            }
        });
    }
}

// Add mobile-specific CSS to prevent default behaviors
function addMobileStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .touch-device {
            -webkit-overflow-scrolling: touch;
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
        }
        
        .touch-device body {
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        /* Prevent pull-to-refresh on mobile */
        .touch-device {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: none;
        }
        
        /* Improve touch responsiveness */
        .touch-device * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
        }
        
        /* Ensure buttons are still touchable */
        .touch-device button,
        .touch-device .wheel-arrow,
        .touch-device .testimonial-arrow,
        .touch-device .explore-button,
        .touch-device .brainstorm-button,
        .touch-device .chat-button,
        .touch-device .ved-button,
        .touch-device .contact-button,
        .touch-device .explore-ips-button {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            pointer-events: auto;
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addMobileStyles()
    load3DPlanet();
    animate();
    initializeAssetLoading();
});