import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import looksData from '../data/looks.json';
import productsData from '../data/products.json';

gsap.registerPlugin(ScrollTrigger);

export function initLookbookSection() {
  const section = document.querySelector('.lookbook-section');
  const viewport = document.querySelector('.lookbook-viewport');

  if (!section || !viewport) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build 5 Look Slides
  viewport.innerHTML = looksData
    .map(
      (look, idx) => `
    <div class="look-slide ${idx === 0 ? 'active' : ''}" data-look-index="${idx}" style="background-color: ${look.bgColor}; color: ${look.textColor};">
      <div class="look-slide-grid">
        <div class="look-media-wrapper">
          <img src="${look.image}" alt="${look.title}" class="look-image" />
          ${look.tags
            .map(
              (tag) => `
            <div class="hotspot-pin" style="left: ${tag.x}%; top: ${tag.y}%;">
              <div class="hotspot-dot" data-product-id="${tag.id}" aria-label="View ${tag.name}">+</div>
              <div class="hotspot-card side-${tag.side}">
                <div class="hotspot-product-name">${tag.name}</div>
                <div class="hotspot-product-price">₹${tag.price.toLocaleString('en-IN')}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="look-meta-col">
          <div class="look-counter" style="color: ${look.accentColor};">${look.number} / ${look.total}</div>
          <span class="section-tag" style="color: ${look.accentColor};">${look.season}</span>
          <h2 class="look-heading" style="color: ${look.textColor};">${look.title}</h2>
          <p class="look-caption" style="color: ${look.textColor}; opacity: 0.85;">${look.caption}</p>
          <button class="btn btn-primary look-shop-all-btn" data-look-idx="${idx}" style="background-color: ${look.textColor}; color: ${look.bgColor};">
            Shop This Ensemble
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  // Bind hotspot clicks to Add to Cart / Drawer
  document.querySelectorAll('.hotspot-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = dot.dataset.productId;
      const product = productsData.find((p) => p.id === pid);
      if (product && window.cartManager) {
        window.cartManager.addItem(product);
      }
    });
  });

  // Bind 'Shop this Ensemble'
  document.querySelectorAll('.look-shop-all-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.lookIdx, 10);
      const look = looksData[idx];
      if (look && look.tags && window.cartManager) {
        look.tags.forEach((tag) => {
          const product = productsData.find((p) => p.id === tag.id);
          if (product) window.cartManager.addItem(product);
        });
      }
    });
  });

  if (isReducedMotion) return;

  const slides = document.querySelectorAll('.look-slide');
  const numLooks = looksData.length;
  let activeIdx = 0;

  // Pin section with 1.2s smooth scrub and cross-fade
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${numLooks * 120}%`, // Longer scroll distance for relaxed viewing
    pin: true,
    scrub: 1.0, // Smooth interpolation
    anticipatePin: 1,
    onUpdate: (self) => {
      const progress = self.progress;
      const newIndex = Math.min(Math.floor(progress * numLooks), numLooks - 1);

      if (newIndex !== activeIdx) {
        activeIdx = newIndex;
        slides.forEach((slide, idx) => {
          slide.classList.toggle('active', idx === activeIdx);
        });

        const activeLook = looksData[activeIdx];
        if (activeLook) {
          gsap.to(section, {
            backgroundColor: activeLook.bgColor,
            duration: 0.8,
            ease: 'power1.out',
          });
        }
      }
    },
  });
}
