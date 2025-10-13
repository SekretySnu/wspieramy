import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('ebook3D');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1430);

// aktualne rozmiary canvasa sterowane są przez CSS
const width = canvas.clientWidth || 360;
const height = canvas.clientHeight || 480;

const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
camera.position.set(0, 0.35, 3.3);

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

// Ładowanie modelu (plik w tym samym folderze co index.html i main.js)
const loader = new GLTFLoader();
const modelUrl = './ebook.glb';

loader.load(modelUrl, (gltf) => {
  const model = gltf.scene;

  // 1) Ukryj helpery / linie / osie z eksportu:
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

  // Przenieś środek modelu do (0,0,0)
  model.position.sub(center);

  // Docelowa wysokość modelu w scenie (w jednostkach 3D)
  const targetHeight = 1.6; // zwiększ/zmniejsz według uznania
  if (size.y > 0) {
    const scale = targetHeight / size.y;
    model.scale.setScalar(scale);
  }

  // Opcjonalny delikatny “tilt”
  model.rotation.y = Math.PI / 6;

  scene.add(model);

  // 3) Ustaw kamerę tak, żeby na pewno objęła model:
  // bierzemy większy z wymiarów X/Y, żeby ładnie wypełnić kadr
  const largestDim = Math.max(size.x, size.y) * (model.scale.x || 1);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  // odległość przy której największy wymiar mieści się w pionie
  let dist = (largestDim / 2) / Math.tan(fov / 2);
  dist *= 1.4; // mały margines

  camera.position.set(0, 0.35, dist);
  camera.lookAt(0, 0, 0);

  // 4) Start animacji
  function animate() {
    requestAnimationFrame(animate);
    model.rotation.y += 0.006;
    model.rotation.x = Math.sin(Date.now() * 0.001) * 0.03;
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
