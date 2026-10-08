import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import vertexShader from '../shaders/fabric.vert?raw';
import fragmentShader from '../shaders/fabric.frag?raw';

gsap.registerPlugin(ScrollTrigger);

export function initFabricSection() {
  const container = document.querySelector('.fabric-reveal-section');
  const canvas = document.getElementById('fabric-webgl-canvas');
  const brandTitle = document.querySelector('.fabric-brand-title');

  if (!container || !canvas) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.z = 3.2;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); // Optimized pixel ratio for 60fps

  // Custom Shader Material for Silky Fabric
  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorBase: { value: new THREE.Color('#E6D9C5') },
    uColorShadow: { value: new THREE.Color('#D4C3AC') },
    uColorHighlight: { value: new THREE.Color('#FDFCFA') },
  };

  // 64x64 grid is ideal for smooth cloth ripple with high FPS
  const geometry = new THREE.PlaneGeometry(4.5, 3.2, 64, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: false,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Mouse & Touch interaction
  let targetMouse = new THREE.Vector2(0.5, 0.5);
  let currentMouse = new THREE.Vector2(0.5, 0.5);

  const handlePointer = (e) => {
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    targetMouse.x = (clientX - rect.left) / rect.width;
    targetMouse.y = 1.0 - (clientY - rect.top) / rect.height;
  };

  container.addEventListener('mousemove', handlePointer, { passive: true });
  container.addEventListener('touchmove', handlePointer, { passive: true });

  // Render loop with visibility check
  let isVisible = false;
  let animId = null;
  const clock = new THREE.Clock();

  function animate() {
    if (!isVisible) return;

    if (!isReducedMotion) {
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Silky smooth mouse interpolation
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.035;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.035;
      uniforms.uMouse.value.copy(currentMouse);
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  }

  // IntersectionObserver to pause when off-screen
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          clock.start();
          animate();
        } else if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(container);

  // Debounced Resize Handler
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    }, 100);
  });

  // Reveal Text Animation on ScrollTrigger
  ScrollTrigger.create({
    trigger: container,
    start: 'top 75%',
    onEnter: () => {
      if (brandTitle) brandTitle.classList.add('revealed');
    },
  });
}
