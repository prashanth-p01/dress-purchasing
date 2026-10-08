import productsData from '../data/products.json';

export function initProductsSection() {
  const grid = document.querySelector('.products-grid');
  const filterChips = document.querySelectorAll('.filter-chip');

  if (!grid) return;

  function renderProducts(filteredList) {
    grid.innerHTML = filteredList
      .map((product) => {
        const primaryColor = product.colors[0];
        return `
        <div class="product-card" data-product-id="${product.id}" data-category="${product.category}">
          <div class="product-card-media">
            <span class="product-badge">${product.badge}</span>
            <button class="wishlist-btn" data-product-id="${product.id}" aria-label="Add to wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <img src="${primaryColor.front}" alt="${product.name}" class="product-card-img primary-view" loading="lazy" />
            <img src="${primaryColor.back || primaryColor.model || primaryColor.front}" alt="${product.name} alternate view" class="product-card-img back-view" loading="lazy" />
          </div>
          <div class="product-card-body">
            <h3 class="product-card-title">${product.name}</h3>
            <div class="product-card-price">₹${product.price.toLocaleString('en-IN')}</div>
            
            <!-- Color Swatches -->
            <div class="color-swatches-group">
              ${product.colors
                .map(
                  (c, cIdx) => `
                <div 
                  class="color-swatch-dot ${cIdx === 0 ? 'active' : ''}" 
                  style="background-color: ${c.hex};" 
                  title="${c.name}"
                  data-color-name="${c.name}"
                  data-front-img="${c.front}"
                  data-back-img="${c.back || c.model || c.front}">
                </div>
              `
                )
                .join('')}
            </div>

            <!-- Size Selector Pills -->
            <div class="size-selector-pills">
              ${product.sizes
                .map(
                  (s, sIdx) => `
                <button class="size-pill ${sIdx === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
              `
                )
                .join('')}
            </div>

            <div class="product-card-actions">
              <button class="btn btn-primary btn-add-cart" style="width: 100%; font-size: 0.78rem; padding: 0.75rem 1rem;">
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    bindProductCardInteractions();
    if (window.cartManager) {
      window.cartManager.updateWishlistUI();
    }
  }

  function bindProductCardInteractions() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach((card) => {
      const pid = card.dataset.productId;
      const product = productsData.find((p) => p.id === pid);
      if (!product) return;

      let selectedColor = product.colors[0].name;
      let selectedSize = product.sizes[0];
      let activeFrontImg = product.colors[0].front;

      // Color Swatch Swapping
      const swatches = card.querySelectorAll('.color-swatch-dot');
      const primaryImg = card.querySelector('.product-card-img.primary-view');
      const backImg = card.querySelector('.product-card-img.back-view');

      swatches.forEach((swatch) => {
        swatch.addEventListener('click', (e) => {
          e.stopPropagation();
          swatches.forEach((s) => s.classList.remove('active'));
          swatch.classList.add('active');

          selectedColor = swatch.dataset.colorName;
          activeFrontImg = swatch.dataset.frontImg;

          // Smooth wipe morph
          if (primaryImg) {
            primaryImg.style.opacity = '0';
            setTimeout(() => {
              primaryImg.src = activeFrontImg;
              primaryImg.style.opacity = '1';
            }, 180);
          }
          if (backImg && swatch.dataset.backImg) {
            backImg.src = swatch.dataset.backImg;
          }
        });
      });

      // Size Selection
      const sizePills = card.querySelectorAll('.size-pill');
      sizePills.forEach((pill) => {
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          sizePills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          selectedSize = pill.dataset.size;
        });
      });

      // Add to Bag Button
      const addBtn = card.querySelector('.btn-add-cart');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.cartManager) {
            window.cartManager.addItem(
              {
                ...product,
                image: activeFrontImg,
              },
              selectedSize,
              selectedColor
            );
          }
        });
      }

      // Wishlist Button
      const wishBtn = card.querySelector('.wishlist-btn');
      if (wishBtn) {
        wishBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.cartManager) {
            window.cartManager.toggleWishlist(product.id);
          }
        });
      }

      // 3D Tilt on Desktop
      if (!window.matchMedia('(pointer: coarse)').matches) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -7;
          const rotateY = ((x - centerX) / centerX) * 7;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
      }
    });
  }

  // Filter chips click handling
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const category = chip.dataset.category;
      if (category === 'all') {
        renderProducts(productsData);
      } else {
        const filtered = productsData.filter((p) => p.category === category);
        renderProducts(filtered);
      }
    });
  });

  // Initial render
  renderProducts(productsData);
}
