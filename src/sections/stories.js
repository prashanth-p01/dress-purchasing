import Swiper from 'swiper';
import { Navigation, EffectFade, Autoplay } from 'swiper/modules';
import categoriesData from '../data/categories.json';

export function initStoriesSection() {
  const container = document.querySelector('.stories-bubbles-container');
  const overlay = document.querySelector('.story-overlay');
  const closeBtn = document.querySelector('.story-close-btn');

  if (!container) return;

  // Render Category Story Bubbles
  container.innerHTML = categoriesData
    .map(
      (cat) => `
      <div class="story-bubble-card" data-category-id="${cat.id}">
        <div class="story-ring-wrapper">
          <div class="story-img-inner">
            <img src="${cat.cover}" alt="${cat.name}" loading="lazy" />
          </div>
        </div>
        <h3 class="story-bubble-label">${cat.name}</h3>
        <span class="story-bubble-tag">${cat.tag}</span>
      </div>
    `
    )
    .join('');

  let swiperInstance = null;
  let progressInterval = null;
  let activeCategory = null;
  let currentSlideIndex = 0;
  let isPaused = false;
  let slideDuration = 4000;
  let slideTimeElapsed = 0;

  // Click bubble to open story modal
  container.querySelectorAll('.story-bubble-card').forEach((bubble) => {
    bubble.addEventListener('click', () => {
      const catId = bubble.dataset.categoryId;
      const cat = categoriesData.find((c) => c.id === catId);
      if (cat) openStoryModal(cat);
    });
  });

  function openStoryModal(cat) {
    activeCategory = cat;
    currentSlideIndex = 0;
    slideTimeElapsed = 0;

    const modalWrapper = document.querySelector('.story-swiper-wrapper');
    const authorImg = document.querySelector('.story-author-img');
    const authorName = document.querySelector('.story-author-name');
    const progressGroup = document.querySelector('.story-progress-bar-group');

    if (authorImg) authorImg.src = cat.cover;
    if (authorName) authorName.textContent = cat.name;

    // Build segmented progress bars
    if (progressGroup) {
      progressGroup.innerHTML = cat.stories
        .map(
          (_, idx) => `
        <div class="story-progress-segment">
          <div class="story-progress-fill" id="story-seg-${idx}"></div>
        </div>
      `
        )
        .join('');
    }

    // Build Swiper Slides
    if (modalWrapper) {
      modalWrapper.innerHTML = cat.stories
        .map(
          (s) => `
        <div class="swiper-slide" style="position: relative; width: 100%; height: 100%;">
          <img src="${s.image}" alt="${s.title}" class="story-slide-image" />
          <div class="story-slide-caption">
            <span class="section-tag" style="color: #E6D9C5;">${s.tag}</span>
            <h3 class="story-slide-title">${s.title}</h3>
            <p style="color: rgba(245,239,230,0.85); font-size: 0.85rem; margin-bottom: 0.5rem;">${s.description}</p>
            <div class="story-slide-price">${s.price}</div>
            <button class="btn btn-primary story-shop-btn" data-category="${cat.id}" style="padding: 0.65rem 1.5rem; font-size: 0.78rem;">Shop this Look</button>
          </div>
        </div>
      `
        )
        .join('');
    }

    if (swiperInstance) {
      swiperInstance.destroy(true, true);
    }

    swiperInstance = new Swiper('.story-swiper', {
      modules: [EffectFade],
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 300,
      allowTouchMove: true,
      on: {
        slideChange: () => {
          currentSlideIndex = swiperInstance.activeIndex;
          slideTimeElapsed = 0;
          updateSegmentFill();
        },
      },
    });

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    startProgressTimer();

    // Bind slide 'Shop this look' button
    document.querySelectorAll('.story-shop-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetCategory = e.currentTarget.dataset.category;
        closeStoryModal();
        const filterBtn = document.querySelector(`.filter-chip[data-category="${targetCategory}"]`);
        if (filterBtn) filterBtn.click();
        const prodSection = document.querySelector('.products-section');
        if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function startProgressTimer() {
    clearInterval(progressInterval);
    const step = 50; // update every 50ms

    progressInterval = setInterval(() => {
      if (isPaused) return;

      slideTimeElapsed += step;
      const pct = Math.min((slideTimeElapsed / slideDuration) * 100, 100);

      const activeSeg = document.getElementById(`story-seg-${currentSlideIndex}`);
      if (activeSeg) activeSeg.style.width = `${pct}%`;

      if (slideTimeElapsed >= slideDuration) {
        if (currentSlideIndex < activeCategory.stories.length - 1) {
          swiperInstance.slideNext();
        } else {
          closeStoryModal();
        }
      }
    }, step);
  }

  function updateSegmentFill() {
    activeCategory.stories.forEach((_, idx) => {
      const seg = document.getElementById(`story-seg-${idx}`);
      if (!seg) return;
      if (idx < currentSlideIndex) {
        seg.style.width = '100%';
      } else if (idx > currentSlideIndex) {
        seg.style.width = '0%';
      }
    });
  }

  // Hold to pause story
  const modalContainer = document.querySelector('.story-modal-container');
  if (modalContainer) {
    const pause = () => (isPaused = true);
    const resume = () => (isPaused = false);

    modalContainer.addEventListener('mousedown', pause);
    modalContainer.addEventListener('mouseup', resume);
    modalContainer.addEventListener('touchstart', pause, { passive: true });
    modalContainer.addEventListener('touchend', resume, { passive: true });
  }

  function closeStoryModal() {
    clearInterval(progressInterval);
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeStoryModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeStoryModal();
    });
  }
}
