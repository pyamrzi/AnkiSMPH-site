import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let camera, scene, renderer, diamond;
let isDragging = false;
let previousMouseX = 0;
let currentRotationY = 0;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let baseRotation = 0;
const rotationSensitivity = {
    x: 0.001,  // Cursor position horizontal sensitivity
    y: 0.001,  // Cursor position vertical sensitivity
    drag: 0.005,  // Sensitivity for drag rotation
    base: 0.010 // Base rotation speed (independent of mouse movement)
};

function init() {
    console.log('Initializing Ruby visualization...');
    
    const container = document.getElementById('ruby-container');
    if (!container) {
        console.error('Ruby container not found!');
        return;
    }

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup with fixed dimensions
    const fixedWidth = 200; // Fixed width in pixels
    const fixedHeight = 200; // Fixed height in pixels
    const aspect = fixedWidth / fixedHeight;
    
    // Use a consistent vertical FOV
    const fov = 35;  // Narrower FOV for closer view
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    camera.position.set(0, 2, 20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        premultipliedAlpha: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(fixedWidth, fixedHeight); // Fixed size
    renderer.useLegacyLights = false;
    renderer.outputColorSpace = 'srgb-linear';
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    // Set fixed size and position for the container
    container.style.width = '200px';
    container.style.height = '100px';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.margin = '0 auto';  // Center horizontally
    container.style.display = 'flex';   // Use flexbox for centering
    container.style.justifyContent = 'center';  // Center horizontally within flex container
    container.style.alignItems = 'center';      // Center vertically within flex container
    container.style.cursor = 'grab';  // Show grab cursor to indicate draggable
    
    // Add renderer to container
    container.appendChild(renderer.domElement);
    
    // Disable zoom interactions only for the ruby container
    container.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    container.addEventListener('touchstart', (e) => e.touches.length > 1 && e.preventDefault());
    container.addEventListener('touchmove', (e) => e.touches.length > 1 && e.preventDefault());
    container.addEventListener('gesturestart', (e) => e.preventDefault());
    container.addEventListener('gesturechange', (e) => e.preventDefault());
    container.addEventListener('gestureend', (e) => e.preventDefault());
    
    // Set renderer element style to be centered
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '50%';
    renderer.domElement.style.left = '50%';
    renderer.domElement.style.transform = 'translate(-50%, -50%)';

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Load model
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
        "https://assets.codepen.io/439000/diamond2.glb",
        function (gltf) {
            diamond = gltf.scene;
            diamond.scale.set(3, 3, 3);  // Make the ruby larger
            diamond.position.set(0, -2, 0);  // Move down by 1 unit
            diamond.rotation.set(0.1, 0, 0); // Rotate towards the camera with 0.3 tilt
            diamond.castShadow = true;
            diamond.receiveShadow = true;

            // Create base material with less transmission and more color
            const mat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(1, 0, 0),  // Pure red
                metalness: 0.1,
                roughness: 0.02,
                transmission: 0.3,  // Reduced transmission to show more color
                thickness: 0.5,
                opacity: 1,
                side: THREE.DoubleSide,
                transparent: true,
                envMapIntensity: 1.0,
                clearcoat: 0.8,
                clearcoatRoughness: 0.05,
                ior: 1.77,  // Actual ruby IOR
                attenuationColor: new THREE.Color(1, 0, 0),
                attenuationDistance: 0.2,  // Reduced to intensify color
                sheen: 0.2,
                sheenRoughness: 0.2,
                sheenColor: new THREE.Color(1, 0, 0)
            });
            
            // Debug logging
            console.log('Material created:', mat);
            console.log('Material color:', mat.color);
            console.log('Material properties:', {
                metalness: mat.metalness,
                roughness: mat.roughness,
                transmission: mat.transmission,
                transparent: mat.transparent,
                side: mat.side
            });

            // Apply material to all mesh children
            diamond.traverse((child) => {
                if (child.isMesh) {
                    console.log('Applying material to mesh:', child.name);
                    child.material = mat;
                }
            });
            scene.add(diamond);

            // Load environment map
            console.log('Starting HDR load...');
            const rgbeLoader = new RGBELoader();
            rgbeLoader.setDataType(THREE.HalfFloatType);
            rgbeLoader.load(
                'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/royal_esplanade_1k.hdr',
                (texture) => {
                    console.log('HDR loaded successfully');
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.format = THREE.RGBAFormat;
                    texture.type = THREE.HalfFloatType;
                    texture.colorSpace = 'srgb-linear';
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    texture.flipY = false;
                    texture.needsUpdate = true;
                    
                    // Create a PMREMGenerator to convert HDR to cubic reflection map
                    const pmremGenerator = new THREE.PMREMGenerator(renderer);
                    pmremGenerator.compileEquirectangularShader();
                    
                    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                    texture.dispose();
                    pmremGenerator.dispose();
                    
                    mat.envMap = envMap;
                    mat.needsUpdate = true;
                    
                    // Set scene environment map too
                    scene.environment = envMap;
                    renderer.toneMapping = THREE.ACESFilmicToneMapping;
                    renderer.toneMappingExposure = 1;
                },
                (progress) => {
                    console.log('HDR loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.error('Error loading HDR:', error);
                }
            );

            // Start animation immediately, don't wait for HDR
            animate();
        },
        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (error) {
            console.error('Error loading model:', error);
        }
    );

    // Window resize handler
    window.addEventListener('resize', onWindowResize);
    
    // Mouse interaction handlers for dragging
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Prevent context menu on right click
    container.addEventListener('contextmenu', (e) => e.preventDefault());
}

function onMouseDown(event) {
    isDragging = true;
    previousMouseX = event.clientX;
    container.style.cursor = 'grabbing';
}

function onMouseMove(event) {
    // Always track cursor position for position-based rotation
    mouseX = (event.clientX - window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2);
    
    // Update target rotation based on mouse position and sensitivity
    targetRotationX = mouseY * rotationSensitivity.y;
    targetRotationY = mouseX * rotationSensitivity.x;
    
    // Handle dragging for manual rotation
    if (isDragging) {
        const deltaX = event.clientX - previousMouseX;
        currentRotationY += deltaX * rotationSensitivity.drag;
        previousMouseX = event.clientX;
        
        // Pause base rotation while dragging by storing current base rotation
        baseRotation = diamond.rotation.y - targetRotationY - currentRotationY;
    }
}

function onMouseUp(event) {
    isDragging = false;
    container.style.cursor = 'grab';
}

// Remove window resize handler since we're using fixed dimensions
function onWindowResize() {
    // No resize needed - using fixed dimensions
}

function animate() {
    requestAnimationFrame(animate);
    
    if (diamond) {
        // Update base rotation
        baseRotation += rotationSensitivity.base;
        
        // Combine all rotation sources:
        // 1. Base rotation (continuous)
        // 2. Cursor position rotation (targetRotationY)
        // 3. Drag rotation (currentRotationY)
        const finalRotationY = baseRotation + targetRotationY + currentRotationY;

        // Maintain the initial tilt and add cursor position influence
        const baseTilt = 0.2; // Match the initial tilt
        diamond.rotation.x = baseTilt + (targetRotationX * 0.3); // Add cursor influence to the base tilt
        diamond.rotation.y += (finalRotationY - diamond.rotation.y) * 0.05; // Smooth rotation with easing
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);