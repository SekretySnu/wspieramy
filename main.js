import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

    const canvas = document.getElementById('ebook3D');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1430);

    // Aby kamera działała poprawnie, musimy pobrać aktualne rozmiary canvasa
    const initialWidth = canvas.clientWidth;
    const initialHeight = canvas.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(40, initialWidth / initialHeight, 0.1, 100);
    camera.position.set(0, 0.35, 3.3);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    // Ustawienie początkowego rozmiaru renderera
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444466, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 6, 3);
    scene.add(dir);
    
    // small rim light for nicer silhouettes (dodane z oryginalnego kodu, jest przydatne)
    const rim = new THREE.DirectionalLight(0x99bbff, 0.4);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    const loader = new GLTFLoader();
    // Ważne: W nowym kodzie ścieżka to './ebook.glb', co oznacza, że plik ma leżeć w tym samym folderze co index.html.
    // Dostosuj, jeśli plik jest gdzie indziej (np. w podkatalogu 'assets': './assets/ebook.glb').
    const modelUrl = './ebook.glb';

    console.log('Ładowanie modelu z', modelUrl);
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.3, 1.3, 1.3);
      model.position.set(0, -0.25, 0);
      model.rotation.y = Math.PI / 6;
      scene.add(model);
      console.log('✅ Model załadowany poprawnie.');

      function animate() {
        requestAnimationFrame(animate);
        model.rotation.y += 0.006;
        model.rotation.x = Math.sin(Date.now() * 0.001) * 0.03;
        renderer.render(scene, camera);
      }
      animate();
    }, (xhr) => {
      // Opcjonalne: wyświetlanie postępu ładowania, jak w oryginalnym kodzie
      if (xhr && xhr.total) {
        const pct = Math.round(xhr.loaded / xhr.total * 100);
        console.log('Ładowanie modelu: ' + pct + '%');
      }
    }, (error) => {
      console.error('❌ Błąd ładowania modelu:', error);
    });

    // Obsługa zmiany rozmiaru okna
    window.addEventListener('resize', () => {
      // Ponieważ rozmiar canvasa jest kontrolowany przez CSS (max-width: 90vw),
      // musimy pobrać jego nowy rozmiar
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
