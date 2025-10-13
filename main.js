import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('ebook3D');
const scene = new THREE.Scene();
scene.background = null; // Ustawienie na przezroczystość, by nie było prostokąta

// Pobranie aktualnych rozmiarów canvasa
const width = canvas.clientWidth || 360;
const height = canvas.clientHeight || 480;

const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
// Pozycja kamery będzie dostosowana automatycznie, usuwamy stałe wartości

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(width, height, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444466, 0.9);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(5, 6, 3);
scene.add(dir);
const rim = new THREE.DirectionalLight(0x99bbff, 0.4);
rim.position.set(-3, 2, -2);
scene.add(rim);

// Ładowanie modelu
const loader = new GLTFLoader();
const modelUrl = './ebook.glb';

loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;

    // 1) Ukryj helpery
    model.traverse((child) => {
        const n = (child.name || '').toLowerCase();
        if (
            child.type === 'Line' ||
            child.type === 'LineSegments' ||
            n.includes('helper') ||
            n.includes('axis') ||
            n.includes('gizmo') ||
            n.includes('grid') ||
            n.includes('floor') ||
            n.includes('bounds') ||
            n.includes('limit')
        ) {
            child.visible = false;
        }
    });

    // 2) Automatyczne dopasowanie skali i wycentrowanie modelu:
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // KLUCZOWE CENTROWANIE: Przenieś środek modelu do (0,0,0)
    // Zapewnia to, że model będzie na środku sceny (X=0, Y=0, Z=0)
    model.position.sub(center);

    // Docelowa wysokość modelu w scenie (zmieniona dla większego rozmiaru)
    const targetHeight = 2.0; 
    if (size.y > 0) {
        const scale = targetHeight / size.y;
        model.scale.setScalar(scale);
    }

    // Opcjonalny delikatny “tilt”
    model.rotation.y = Math.PI / 6;

    scene.add(model);

    // 3) Ustaw kamerę tak, żeby na pewno objęła model i była wycentrowana:
    const largestDim = Math.max(size.x, size.y) * (model.scale.x || 1);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    
    // Oblicz odległość, przy której model mieści się w kadrze
    let dist = (largestDim / 2) / Math.tan(fov / 2);
    dist *= 1.2; // Zmniejszony margines (większy zoom)

    // Ustawienie kamery na osi Y = 0 (środek ekranu) i przesunięcie na osi Z
    camera.position.set(0, 0, dist); 
    camera.lookAt(0, 0, 0); // Kamera patrzy na środek sceny (gdzie jest wycentrowany model)

    // 4) Start animacji
    function animate() {
        requestAnimationFrame(animate);
        model.rotation.y += 0.018; // Zwiększona prędkość obrotu
        model.rotation.x = Math.sin(Date.now() * 0.001) * 0.05; // Zwiększone kiwanie
        renderer.render(scene, camera);
    }
    animate();

}, (xhr) => {
    if (xhr && xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        console.log('Ładowanie modelu: ' + pct + '%');
    }
}, (error) => {
    console.error('❌ Błąd ładowania modelu:', error);
});

// Obsługa zmiany rozmiaru okna
window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
