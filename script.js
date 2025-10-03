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
// let planet3D = null;
let planetBackground = null;

camera.position.z = 15;

let particleSystem = null;

let touchStartY = 0;
let touchStartX = 0;
let lastTouchTime = 0;
let isTouchDevice = false;
let touchSensitivity = 50; // Minimum swipe distance
let touchTimeLimit = 300; // Maximum time for swipe gesture

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
function initMobileNavigation() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileNavMenu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
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

function createModelPlane() {
    // Create particle system for X shape with concentration towards the center lines
    const particleCount = 4000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Create X shape pattern with concentration towards the main lines
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Define X shape parameters
        const maxDistance = 6; // Maximum distance from the center lines
        const concentrationFactor = 1.0; // Higher = more concentrated near lines
        
        // Generate a random distance from the lines with exponential falloff
        // This creates the concentration effect
        const randomDistance = Math.pow(Math.random(), concentrationFactor) * maxDistance;
        
        // Randomly choose which of the two X lines to use as base
        const useFirstLine = Math.random() > 0.5;
        
        // Random position along the chosen line
        const linePosition = (Math.random() - 0.5) * 12;
        
        let x, y;
        
        if (useFirstLine) {
            // First diagonal line: y = x
            const baseX = linePosition;
            const baseY = linePosition;
            
            // Add perpendicular offset with the concentrated distance
            const angle = Math.PI / 4; // 45 degrees for perpendicular to y=x
            const offsetX = randomDistance * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
            const offsetY = randomDistance * Math.sin(angle) * (Math.random() > 0.5 ? 1 : -1);
            
            x = baseX + offsetX;
            y = baseY + offsetY;
        } else {
            // Second diagonal line: y = -x
            const baseX = linePosition;
            const baseY = -linePosition;
            
            // Add perpendicular offset with the concentrated distance
            const angle = -Math.PI / 4; // -45 degrees for perpendicular to y=-x
            const offsetX = randomDistance * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
            const offsetY = randomDistance * Math.sin(angle) * (Math.random() > 0.5 ? 1 : -1);
            
            x = baseX + offsetX;
            y = baseY + offsetY;
        }
        
        // Optional: Add some random noise for natural look
        const noise = 0.1;
        x += (Math.random() - 0.5) * noise;
        y += (Math.random() - 0.5) * noise;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = 0;
        
        // Color variation based on distance from center for visual effect
        const distanceFactor = 1 - (randomDistance / maxDistance);
        colors[i3] = 0.5 + distanceFactor * 0.5; // Red increases near center
        colors[i3 + 1] = 0.3 + distanceFactor * 0.4; // Green increases near center
        colors[i3 + 2] = 0.5 + distanceFactor * 0.3; // Blue increases near center
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: false
    });

    const modelPlane = new THREE.Points(geometry, material);
    modelPlane.position.set(0, 0, 0);
    scene.add(modelPlane);
    
    return modelPlane;
}

function updateNavigationDots() {
    const navIndicators = document.querySelector('.nav-indicators');
    navIndicators.innerHTML = `
        <div class="nav-dot active"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
        <div class="nav-dot"></div>
    `;
}
function isMobile() {
    return window.innerWidth <= 768;
}

// Image preloader system
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
            './assets/Group 1171275088.webp',
            './assets/Rectangle 8311-3.webp',
            './assets/Group 1171275097-1.webp',
            './assets/Frame 2147224148-8.webp',
            './assets/Frame 2147224148-6.webp',
            './assets/Frame 2147224148.webp',
            './assets/Vector 61.webp',
            './assets/Vector 61-1.webp',
            './assets/Vector 61-2.webp',
            './assets/Vector 61-3.webp',
            './assets/Vector 61-5.webp',
            './assets/Frame 2147224336.webp',
            './assets/Frame 2147224180-5.webp',
            './assets/Group 1171275118.webp',
            './assets/Frame 2147224338.webp',
            './assets/Frame 2147224338-1.webp',
            './assets/Frame 2147224339.webp',
            './assets/Frame 2147224339-2.webp',
            './assets/Frame 2147224340.webp',
            './assets/Frame 2147224341.webp',
            './assets/Mask group-8.webp',
            './assets/Frame 2147224148-4.webp',
            './assets/Frame 2147224339-1.webp',
            // Background masks
            './assets/Mask group-2.webp',
            './assets/Group 1171275138.webp',
            './assets/image 269.webp',
            './assets/glows.webp',
            './assets/glows-2.webp',
            './assets/koncepted.ai_red_rose_color_pallete_detailed_smooth_mountains_i_81b88cf3-c6dd-4118-9c38-94b63a67f4d2-2 1.webp',
            './assets/image 376.webp',
            // Section 15 backgrounds
            './assets/creator ownership.webp',
            './assets/koncepted.ai_A_surreal_scene_with_a_circle_of_human_silhouettes_c0d5e498-c93a-4922-b101-5c5ed5a9b2eb 1.webp',
            './assets/transparent funding.webp',
            './assets/global reach.webp',
            './assets/global reach-1.webp',
            // Navigation
            './assets/Rectangle 8305.webp'
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

// Loading system
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
    // 1. CLAMP THE PROGRESS VALUE: Ensure 'progress' never exceeds 100.
    const clampedProgress = Math.min(progress, 100);

    const progressFill = document.querySelector('.progress-fill');
    const loadingPercentage = document.querySelector('.loading-percentage');
    const loadingText = document.querySelector('.loading-text');
    
    if (progressFill) {
        progressFill.style.width = clampedProgress + '%';
    }
    
    if (loadingPercentage) {
        loadingPercentage.textContent = Math.floor(clampedProgress) + '%';
    }
    
    if (loadingText) {
        if (total > 0) {
            loadingText.textContent = `loading Multiverse...`;
        } else {
            loadingText.textContent = `scanning assets...`;
        }
    }
}

function createParticleSystem() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Create X-shape pattern
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3 + 4;
        
        if (i % 2 === 0) {
            // First diagonal of X
            positions[i3] = Math.cos(angle) * radius * 0.7;
            positions[i3 + 1] = Math.sin(angle) * radius * 0.7;
        } else {
            // Second diagonal of X
            positions[i3] = Math.cos(angle + Math.PI/2) * radius * 0.7;
            positions[i3 + 1] = Math.sin(angle + Math.PI/2) * radius * 0.7;
        }
        
        positions[i3 + 2] = (Math.random() - 0.5) * 10; // Spread in Z
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
        const t = (i / particleCount) * Math.PI * 3; // More rotations for denser pattern
        const radius = 1 + Math.random() * 2; // Larger radius for better visibility
        
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
        size: 0.12, // Larger size for better visibility
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
    canvas.width = 356;
    canvas.height = 356;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#980000ff');
    gradient.addColorStop(0.7, '#970000ff');
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
    window.modelPlane = createModelPlane();

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
    window.planet3D = sphere;

    // Create particle system instead of background image
    createParticleSystem();
    window.modelBackgroundParticles = createModelParticleBackground();
}

function animate() {
    requestAnimationFrame(animate);

    if (planet3D) {
        planet3D.rotation.y += 0.003;

        const showParticles = (currentSection === 1); 
        // Particle System
        if (particleSystem) {
            particleSystem.visible = showParticles;  // visibility control
            if (showParticles) {
                // Static: position and rotation fixed
                particleSystem.position.x = planet3D.position.x;
                particleSystem.position.y = planet3D.position.y;
                particleSystem.position.z = planet3D.position.z - 5;
                // particleSystem.rotation.z += 0.002;  // remove this for static
            }
        }

        // Model Background Particles
        if (window.modelBackgroundParticles) {
            window.modelBackgroundParticles.visible = showParticles;
            if (showParticles) {
                window.modelBackgroundParticles.position.x = planet3D.position.x;
                window.modelBackgroundParticles.position.y = planet3D.position.y;
                window.modelBackgroundParticles.position.z = planet3D.position.z - 3;
                // window.modelBackgroundParticles.rotation.z += 0.003; // remove for static
                // window.modelBackgroundParticles.rotation.x += 0.001;
            }
        }
    }

    // Model plane visibility
    if (planet3D && window.modelPlane) {
        if (currentSection === 1) {
            window.modelPlane.visible = false;
        } else {
            const isModelVisible = planet3D.scale.x > 0 || planet3D.scale.y > 0 || planet3D.scale.z > 0;
            window.modelPlane.visible = isModelVisible;
        }
        window.modelPlane.position.copy(planet3D.position);
    }

    renderer.clear();
    renderer.render(scene, camera);
}


// Animation and section management
let loadingProgress = 0;
Object.defineProperty(window, 'currentSection', {
    get: function() {
        return window.reverseScrollHandler ? window.reverseScrollHandler.currentSection : 1;
    },
    set: function(value) {
        if (window.reverseScrollHandler) {
            window.reverseScrollHandler.currentSection = value;
        }
    }
});
let currentCardIndex = 0;
let currentWheelIndex = 0;
let currentCarouselIndex = 0;
let wheelInterval;
let carouselInterval;
const totalCards = 5;
const totalWheelImages = 5;
let totalCarouselItems = 5;

// Section transition functions
function startSection1() {
    if (!assetsLoaded) {
        setTimeout(() => startSection1(), 100);
        return;
    }
    
    const loadingSection = document.querySelector('.loading-section');
    const semicircle = document.querySelector('.semicircle');
    
    gsap.to(semicircle, {
        duration: 1,
        width: '300px',
        height: '400px',
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

    currentSection = 1;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(1);
    }
}

window.addEventListener("load", () => {
    // Loader ke baad Section 1 hold
    setTimeout(() => {
        startSection2(); // 3s hold on Section 1
    }, 4000); 
});

function startSection2() {
    let tl = gsap.timeline({
        onComplete: () => {
            startSection3();
        }
    });

    // Section 1 content fade out
    tl.to('.welcome-texts', {
        duration: 0.8,
        opacity: 0,
        y: -50,
        ease: "power2.inOut"
    });

    // Section 1 tombstone fade out
    tl.to('.section-one-tombstone', {
        duration: 0.6,
        opacity: 0,
        ease: "power2.inOut"
    }, "-=0.4");

    // Header logo center me
    tl.to('.header-logo', {
        duration: 1,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        scale: 1,
        ease: "power2.inOut"
    }, "-=0.3");

    // Tombstone structures animate
    tl.to('.tombstone-1', { duration: 0.5, opacity: 1, scale: 2, delay: 0.2 })
      .to('.tombstone-2', { duration: 0.8, opacity: 1, scale: 4, ease: "back.out(1.7)" }, "-=0.3")
      .to('.tombstone-3', { duration: 0.8, opacity: 1, scale: 5, ease: "back.out(1.7)" }, "-=0.3")
      .to('.tombstone-4', { duration: 0.8, opacity: 1, scale: 7, ease: "back.out(1.7)" }, "-=0.3");

    // Planet animations
    if (planet3D) {
        tl.to(planet3D.scale, {
            duration: 1.5,
            x: 0.8, y: 0.8, z: 0.8,
            ease: "back.out(1.7)"
        }, "-=1");

        if (planetBackground) {
            tl.to(planetBackground.material, {
                duration: 1,
                opacity: 0.7
            }, "<");
        }
    }

    currentSection = 2;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(2);
    }
}


function startSection3() {
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
        if (isMobile() && planet3D) {
        gsap.to(planet3D.position, {
            duration: 1.5,
            z: 10,
            y: -3,
            ease: "power2.inOut"
        });
    } else if (planet3D) {
        gsap.to(planet3D.position, {
            duration: 1.5,
            z: 11,
            y: -2,
            ease: "power2.inOut"
        });
    }

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
        duration: 3,
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

    currentSection = 3;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(3);
    }
}

function startSection4() {
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
        if (isMobile() && planet3D) {
        gsap.to(planet3D.position, {
            duration: 1.5,
            y: 4.5,
            ease: "power2.inOut"
        });
    } else if (planet3D) {
        gsap.to(planet3D.position, {
            duration: 1.5,
            y: 3,
            ease: "power2.inOut"
        });
    }
    gsap.to(planet3D.scale, {
        duration: 1.5,
        x: 1.1, 
        y: 1.1,
        z: 1.1,
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

    currentSection = 4;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(4);
    }
}

function startSection5() {
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
        if (isMobile() && planet3D) {
        gsap.to(planet3D.position, {
            duration: 1.5,
            x: -3,
            ease: "power2.inOut"
        });
    } else if (planet3D) {
        gsap.to(planet3D.position, {
            duration: 1.5,
            x: -6,
            ease: "power2.inOut"
        });
    }
        
        gsap.to(planet3D.scale, {
            duration: 1.2,
            x: 1.2,
            y: 1.6,
            z: 1,
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
    gsap.to('.bottom-header', {
        duration: 0.5,
        opacity: 1,
        delay: 0.8
    });

    currentSection = 5;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(5);
    }
}

function startSection6() {
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

    currentSection = 6;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(6);
    }
}

function startSection7() {
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

    currentSection = 7;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(7);
    }
}

function startSection8() {
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

    currentSection = 8;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(8);
    }
}
// Update the mobile orbit animation function
window.triggerMobileOrbitAnimations = function () {
    console.log('Triggering mobile orbit animations');
    
    const orbitContainers = [
        document.querySelector('.orbit-container.one'),
        document.querySelector('.orbit-container.two'),
        document.querySelector('.orbit-container.three')
    ];
    
    const rotations = [220, 180, 140];
    
    orbitContainers.forEach((orbit, index) => {
        if (orbit) {
            const featureOrbit = orbit.querySelector('.feature-orbit');
            
            // Reset first
            gsap.set(orbit, { rotation: 0 });
            if (featureOrbit) {
                gsap.set(featureOrbit, { rotation: 0 });
            }
            
            // Animate with staggered delays
            gsap.to(orbit, {
                duration: 2,
                rotation: rotations[index],
                ease: "power2.inOut",
                delay: index * 0.5
            });
            
            if (featureOrbit) {
                gsap.to(featureOrbit, {
                    duration: 2,
                    rotation: -rotations[index],
                    ease: "power2.inOut",
                    delay: index * 0.5
                });
            }
        }
    });
}
function startSection9() {
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
                if (isMobile()) {
        setTimeout(() => {
            triggerMobileOrbitAnimations();
        }, 1200);
    } else {
        setTimeout(() => {
            triggerOrbitAnimations();
        }, 1200);
    }
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

    currentSection = 9;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(9);
    }   
}

function startSection10() {
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

    currentSection = 10;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(10);
    }
}

function startSection11() {
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

    currentSection = 11;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(11);
    }
}

function startSection12() {
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

    currentSection = 12;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(12);
    }
}

function startSection13() {
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

    currentSection = 13;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(13);
    }
}

function startSection14() {
    // Hide section 13 content immediately
    gsap.to('.section-thirteen-content', {
        duration: 0.2,
        opacity: 0
    });

    const transition = document.querySelector('.tombstone-transition');
    
    // Step 1: Show transition overlay while section 13 background is still visible
    gsap.set(transition, { 
        opacity: 0, 
        transform: 'scale(0)' 
    });
    
    gsap.to(transition, {
        duration: 0.8,
        opacity: 1,
        transform: 'scale(15)',
        ease: "power2.out",
        onComplete: () => {
            // Step 2: Change background to section 14 while overlay is visible
            gsap.to('#mask7', {
                duration: 0.1,
                opacity: 1
            });
            
            // Step 3: Wait a moment, then zoom transition back in
            gsap.to(transition, {
                duration: 1,
                transform: 'scale(0)',
                opacity: 0,
                ease: "power2.in",
                delay: 1, // Wait 1 second before zooming back in
                onComplete: () => {
                    // Step 4: Show section 14 content
                    gsap.to('.section-fourteen-content', {
                        duration: 0.5,
                        opacity: 1
                    });
                }
            });
        }
    });

    // Animate section 14 content with delay
    gsap.to('.section-fourteen-left', {
        duration: 0.8,
        x: 0,
        opacity: 1,
        ease: "back.out(1)",
        delay: 2// After transition completes
    });

    gsap.to('.section-fourteen-right', {
        duration: 0.8,
        x: 0,
        opacity: 1,
        ease: "back.out(1)",
        delay: 3
    });

    currentSection = 14;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(14);
    }
}

function startSection15() {
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

    currentSection = 15;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(15);
    }
}

function startSection16() {
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

    currentSection = 16;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(16);
    }
}

function startSection17() {
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

    currentSection = 17;
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(17);
    }
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
    if (window.reverseScrollHandler) {
        window.reverseScrollHandler.setCurrentSection(18);
    }
}

// Add this new function to trigger orbit animations
window.triggerOrbitAnimations = function () {
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

window.initializeCarousel = function () {
    console.log('Initializing carousel');
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

// In script.js, replace the existing nextCarouselItem and prevCarouselItem functions

function nextCarouselItem() {
	if (currentCarouselIndex >= totalCarouselItems - 1) return;

	const nextIndex = currentCarouselIndex + 1;
	updateCarouselState(nextIndex);
	currentCarouselIndex = nextIndex;
}

function prevCarouselItem() {
	if (currentCarouselIndex <= 0) return;

	const prevIndex = currentCarouselIndex - 1;
	updateCarouselState(prevIndex);
	currentCarouselIndex = prevIndex;
}

function updateCarouselState(newIndex) {
	updateCarouselBackground(newIndex + 1);

	document.querySelectorAll(".carousel-item").forEach((item, index) => {
		item.classList.toggle("active", index === newIndex);
	});

	const container = document.getElementById("carouselContainer");
	if (container) {
		let translateX;
		// Use different translation logic based on viewport width
		if (window.innerWidth >= 1024) {
			translateX = -(newIndex * 30); // 100vw per item
			container.style.transform = `translateX(${translateX}vw)`;
		} else {
			translateX = -(newIndex * 500); // 500px per item on mobile
			container.style.transform = `translateX(${translateX}px)`;
		}
	}
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

// Updated scroll handling function - only forward scrolling
let isScrolling = false;

function handleScrollEvent(e) {
    if (isScrolling) return;
    
    e.preventDefault();
    
    let targetSection = currentSection;
    
    // Special handling for section 15 carousel
    if (currentSection === 15) {
        const handled = updateCarouselOnScroll(e.deltaY);
        if (handled) {
            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 300);
            return;
        }
    }
    
    // Handle both downward and upward scrolling
    if (e.deltaY > 0) {
        // Downward scrolling (forward)
        if (currentSection < 17) {
            targetSection = currentSection + 1;
        } else if (currentSection === 17) {
            showFooter();
            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 2000);
            return;
        }
    } else if (e.deltaY < 0) {
        // Upward scrolling (backward) - USE REVERSE HANDLER
        if (currentSection > 1) {
            const success = window.reverseScrollHandler.handleReverseScroll(currentSection - 1);
            if (success) {
                isScrolling = true;
                setTimeout(() => { isScrolling = false; }, 2000);
                return;
            }
        }
    }
    
    // Execute forward section transition if target changed
    if (targetSection !== currentSection && e.deltaY > 0) {
        isScrolling = true;
        
        // Update navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            let dotSection = targetSection;
            if (targetSection > 2) dotSection = targetSection - 1;
            if (targetSection === 1) dotSection = 0;
            dot.classList.toggle('active', index === dotSection);
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
        
        setTimeout(() => {
            isScrolling = false;
        }, 2000);
    }
}

function setupScrolling() {
    // Initialize touch detection
    detectTouchDevice();
    
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

    // Setup wheel controls
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

    // Setup testimonial card controls
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
    initMobileNavigation();
    updateNavigationDots();
    addMobileStyles();
    createPlaceholderPlanet();;
    animate();
    initializeAssetLoading();
});
window.startWheelTimer = function() {
    if (window.wheelInterval) {
        clearInterval(window.wheelInterval);
    }
    
    window.wheelInterval = setInterval(() => {
        nextWheelImage();
    }, 3000);
};