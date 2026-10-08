import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.6, // Luxurious, slow & fluid scroll dampening
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8, // Calibrated so user scroll doesn't fly too fast
    touchMultiplier: 1.1,
    infinite: false,
  });

  // Keep ScrollTrigger completely synchronized with Lenis
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(500, 33); // Smooth out frame drops gracefully

  // Sticky Header Auto-Hide / Show on Scroll with subtle debounce
  const header = document.querySelector('.site-header');
  let lastScrollY = 0;
  let ticking = false;

  lenis.on('scroll', ({ scroll }) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (scroll > 40) {
          header?.classList.add('scrolled');
        } else {
          header?.classList.remove('scrolled');
        }

        if (scroll > 180 && scroll > lastScrollY + 5) {
          header?.classList.add('header-hidden');
        } else if (scroll < lastScrollY - 5) {
          header?.classList.remove('header-hidden');
        }

        lastScrollY = scroll;
        ticking = false;
      });
      ticking = true;
    }
  });

  window.lenis = lenis;
  return lenis;
}
