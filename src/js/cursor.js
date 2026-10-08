export function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';
  follower.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function render() {
    cursorX += (mouseX - cursorX) * 0.35;
    cursorY += (mouseY - cursorY) * 0.35;
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Hover states delegation
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    if (target.closest('.product-card-media') || target.closest('.look-media-wrapper')) {
      document.body.classList.add('cursor-view');
      cursor.textContent = 'View';
    } else if (target.closest('.btn-add-cart') || target.closest('.btn-quick-add')) {
      document.body.classList.add('cursor-add');
      cursor.textContent = 'Add';
    } else if (target.closest('a, button, .story-bubble-card, .drag-item-card, .hotspot-dot, .color-swatch-dot')) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (!target) return;

    if (target.closest('.product-card-media') || target.closest('.look-media-wrapper')) {
      document.body.classList.remove('cursor-view');
      cursor.textContent = '';
    } else if (target.closest('.btn-add-cart') || target.closest('.btn-quick-add')) {
      document.body.classList.remove('cursor-add');
      cursor.textContent = '';
    } else if (target.closest('a, button, .story-bubble-card, .drag-item-card, .hotspot-dot, .color-swatch-dot')) {
      document.body.classList.remove('cursor-hover');
    }
  });
}
