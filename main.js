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
  model.scale.set(1.3, 1.3, 1.3);
  model.position.set(0, -0.25, 0);
  model.rotation.y = Math.PI / 6;
  scene.add(model);

  function animate() {
    requestAnimationFrame(animate);
    // obrót wokół własnej osi + delikatne kołysanie
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

// Responsywność
window.addEventListener('resize', () => {
  const w = canvas.clientWidth || 360;
  const h = canvas.clientHeight || 480;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
});
