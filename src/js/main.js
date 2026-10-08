import '../css/main.css';
import { initSmoothScroll } from './scroll.js';
import { initCustomCursor } from './cursor.js';
import { SeasonThemeManager } from './theme.js';
import { CartManager } from './cart.js';
import { initPreloader } from './preloader.js';
import { initHeroSection } from '../sections/hero.js';
import { initFabricSection } from '../sections/fabric.js';
import { initMarqueeSection } from '../sections/marquee.js';
import { initStoriesSection } from '../sections/stories.js';
import { initLookbookSection } from '../sections/lookbook.js';
import { initProductsSection } from '../sections/products.js';
import { initMixMatchSection } from '../sections/mixmatch.js';
import { subscribeNewsletter } from './firebase.js';

// Global Toast System
window.showToast = function (message) {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Smooth Scroll
  initSmoothScroll();

  // 2. Initialize Custom Cursor
  initCustomCursor();

  // 3. Initialize Seasons & Particles
  const themeManager = new SeasonThemeManager();
  themeManager.init();
  window.themeManager = themeManager;

  // 4. Initialize Cart & Drawers
  const cartManager = new CartManager();
  window.cartManager = cartManager;

  // 5. Initialize Content Sections
  initHeroSection();
  initFabricSection();
  initMarqueeSection();
  initStoriesSection();
  initLookbookSection();
  initProductsSection();
  initMixMatchSection();

  // 6. Preloader Entrance
  initPreloader(() => {
    // Reveal first animations once preloader clears
    document.body.classList.add('loaded');
  });

  // Newsletter Submit handler with Firebase Firestore database sync
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('.newsletter-input');
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      if (input && input.value) {
        const email = input.value.trim();
        const originalText = submitBtn ? submitBtn.textContent : 'Join';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '...';
        }
        try {
          await subscribeNewsletter(email);
          window.showToast('Thank you for subscribing to Vaanika Journal.');
          input.value = '';
        } catch (err) {
          window.showToast('Subscribed! (Saved locally)');
          input.value = '';
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      }
    });
  }
});
