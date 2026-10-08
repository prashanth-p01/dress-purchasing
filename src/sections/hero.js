import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroSection() {
  const heroSection = document.querySelector('.hero-scroll-section');
  const video = document.querySelector('.hero-video');
  const canvas = document.querySelector('.hero-fallback-canvas');
  const progressBar = document.querySelector('.hero-progress-bar');
  const narratives = document.querySelectorAll('.hero-narrative-overlay');

  if (!heroSection) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Frame sequence preloading & high-performance double-buffered rendering
  const totalFrames = 120;
  const frameImages = new Array(totalFrames);
  let framesLoaded = 0;
  let useCanvasFrames = true; // Use smooth 60fps canvas sequence
  let targetFrameIndex = 0;
  let currentRenderedFrame = 0;
  let ctx = null;
  let renderLoopActive = true;

  if (canvas) {
    ctx = canvas.getContext('2d', { alpha: false });
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderCurrentFrame(Math.round(currentRenderedFrame));
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function getFrameUrl(idx) {
    let folder = '0-10';
    let localIndex = 1;
    if (idx < 30) {
      folder = '0-10';
      localIndex = Math.min(Math.floor(idx * 10) + 1, 300);
    } else if (idx < 60) {
      folder = '10-20';
      localIndex = Math.min(Math.floor((idx - 30) * 10) + 1, 300);
    } else if (idx < 90) {
      folder = '20-30';
      localIndex = Math.min(Math.floor((idx - 60) * 10) + 1, 300);
    } else {
      folder = '30-40';
      localIndex = Math.min(Math.floor((idx - 90) * 10) + 1, 300);
    }

    const paddedNum = String(localIndex).padStart(3, '0');
    return `/assets/frames/${folder}/ezgif-frame-${paddedNum}.jpg`;
  }

  // Pre-decode all frames into memory
  function preloadFrames() {
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        framesLoaded++;
        if (img.decode) {
          img.decode().catch(() => {});
        }
        if (i === 0) {
          renderCurrentFrame(0);
        }
      };
      frameImages[i] = img;
    }
  }

  preloadFrames();

  function renderCurrentFrame(index) {
    if (!ctx || !canvas) return;
    const boundedIndex = Math.max(0, Math.min(index, totalFrames - 1));
    const img = frameImages[boundedIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (canvas.width - img.width * ratio) / 2;
      const centerShiftY = (canvas.height - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShiftX,
        centerShiftY,
        img.width * ratio,
        img.height * ratio
      );
    }
  }

  // Smooth lerp render loop for liquid glass 60fps frame scrubbing
  function frameScrubLoop() {
    if (renderLoopActive && canvas) {
      if (Math.abs(targetFrameIndex - currentRenderedFrame) > 0.01) {
        currentRenderedFrame += (targetFrameIndex - currentRenderedFrame) * 0.18;
        renderCurrentFrame(Math.round(currentRenderedFrame));
      }
      requestAnimationFrame(frameScrubLoop);
    }
  }
  requestAnimationFrame(frameScrubLoop);

  // Check if real video is present, else keep seamless canvas
  if (video) {
    const videoSrc = isMobile ? '/assets/video/hero-scroll-mobile.mp4' : '/assets/video/hero-scroll.mp4';
    video.src = videoSrc;

    video.addEventListener('loadedmetadata', () => {
      useCanvasFrames = false;
      video.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
    });

    video.addEventListener('error', () => {
      useCanvasFrames = true;
      video.style.display = 'none';
      if (canvas) canvas.style.display = 'block';
    });
  }

  if (isReducedMotion) {
    if (narratives.length > 0) {
      narratives[0].style.opacity = '1';
      narratives[0].style.transform = 'translateY(0)';
    }
    return;
  }

  // Pinned GSAP ScrollTrigger timeline with generous 500% pin and silky 0.8s scrub
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: 0.8, // Smooth GSAP damping
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        if (progressBar) {
          progressBar.style.width = `${p * 100}%`;
        }

        if (useCanvasFrames) {
          targetFrameIndex = p * (totalFrames - 1);
        } else if (video && video.duration && !isNaN(video.duration)) {
          video.currentTime = p * video.duration;
        }
      },
    },
  });

  // Narrative transitions with soft overlapping fades
  if (narratives.length >= 4) {
    gsap.set(narratives[0], { opacity: 1, y: 0 });
    gsap.set([narratives[1], narratives[2], narratives[3]], { opacity: 0, y: 30 });

    tl.to(narratives[0], { opacity: 0, y: -20, duration: 0.15, ease: 'power1.inOut' }, 0.18)
      .to(narratives[1], { opacity: 1, y: 0, duration: 0.15, ease: 'power1.inOut' }, 0.25)
      .to(narratives[1], { opacity: 0, y: -20, duration: 0.15, ease: 'power1.inOut' }, 0.45)
      .to(narratives[2], { opacity: 1, y: 0, duration: 0.15, ease: 'power1.inOut' }, 0.50)
      .to(narratives[2], { opacity: 0, y: -20, duration: 0.15, ease: 'power1.inOut' }, 0.70)
      .to(narratives[3], { opacity: 1, y: 0, duration: 0.15, ease: 'power1.inOut' }, 0.75)
      .to(narratives[3], { opacity: 0.2, y: -10, duration: 0.15, ease: 'power1.inOut' }, 0.95);
  }
}
