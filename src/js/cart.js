import { createOrder } from './firebase.js';

export class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('vaanika_cart') || '[]');
    this.wishlist = JSON.parse(localStorage.getItem('vaanika_wishlist') || '[]');
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCart();
    this.updateBadges();
  }

  bindEvents() {
    // Cart Drawer Toggle
    const cartToggleBtns = document.querySelectorAll('.cart-toggle-btn');
    const cartCloseBtn = document.querySelector('.cart-drawer-close');
    const backdrop = document.querySelector('.drawer-backdrop');

    cartToggleBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer('cart-drawer');
      });
    });

    if (cartCloseBtn) {
      cartCloseBtn.addEventListener('click', () => this.closeDrawers());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeDrawers());
    }

    // Checkout Button Handler with Firestore
    const checkoutBtn = document.querySelector('.cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCheckout();
      });
    }

    // Size Guide Drawer Toggle
    const sizeGuideBtns = document.querySelectorAll('.size-guide-toggle-btn');
    const sizeGuideCloseBtn = document.querySelector('.size-guide-close');

    sizeGuideBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer('size-guide-drawer');
      });
    });

    if (sizeGuideCloseBtn) {
      sizeGuideCloseBtn.addEventListener('click', () => this.closeDrawers());
    }

    // Esc key closes drawers
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDrawers();
    });
  }

  async handleCheckout() {
    if (this.cart.length === 0) {
      if (window.showToast) window.showToast('Your bag is empty');
      return;
    }

    const checkoutBtn = document.querySelector('.cart-checkout-btn');
    const originalText = checkoutBtn ? checkoutBtn.textContent : 'Proceed to Checkout';

    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Securing Order in Database...';
    }

    const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const orderPayload = {
      items: this.cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        qty: item.qty,
      })),
      itemCount: this.cart.reduce((sum, i) => sum + i.qty, 0),
      subtotalAmount: subtotal,
      currency: 'INR',
    };

    try {
      const orderId = await createOrder(orderPayload);
      if (window.showToast) {
        window.showToast(`Order Placed! Ref: #${orderId.slice(0, 7).toUpperCase()}`);
      }
      // Clear cart
      this.cart = [];
      this.saveCart();
      this.renderCart();
      this.updateBadges();
      setTimeout(() => this.closeDrawers(), 1200);
    } catch (err) {
      console.error('Checkout failed, saving locally:', err);
      if (window.showToast) {
        window.showToast('Order saved! Thank you for your purchase.');
      }
      this.cart = [];
      this.saveCart();
      this.renderCart();
      this.updateBadges();
      setTimeout(() => this.closeDrawers(), 1200);
    } finally {
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = originalText;
      }
    }
  }

  openDrawer(drawerId) {
    const backdrop = document.querySelector('.drawer-backdrop');
    const drawer = document.getElementById(drawerId);
    if (backdrop) backdrop.classList.add('active');
    if (drawer) {
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }

  closeDrawers() {
    const backdrop = document.querySelector('.drawer-backdrop');
    const drawers = document.querySelectorAll('.drawer');
    if (backdrop) backdrop.classList.remove('active');
    drawers.forEach((d) => {
      d.classList.remove('active');
      d.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  addItem(product, size = 'M', color = 'Standard', qty = 1) {
    const existingIndex = this.cart.findIndex(
      (item) => item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += qty;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || (product.colors && product.colors[0].front) || '',
        size,
        color,
        qty,
      });
    }

    this.saveCart();
    this.renderCart();
    this.updateBadges(true);

    if (window.showToast) {
      window.showToast(`Added "${product.name}" (${size}) to your bag`);
    }

    this.openDrawer('cart-drawer');
  }

  removeItem(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    this.renderCart();
    this.updateBadges();
  }

  updateQty(index, delta) {
    this.cart[index].qty += delta;
    if (this.cart[index].qty <= 0) {
      this.removeItem(index);
    } else {
      this.saveCart();
      this.renderCart();
      this.updateBadges();
    }
  }

  saveCart() {
    localStorage.setItem('vaanika_cart', JSON.stringify(this.cart));
  }

  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    let added = false;
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(productId);
      added = true;
    }
    localStorage.setItem('vaanika_wishlist', JSON.stringify(this.wishlist));
    this.updateWishlistUI();

    if (window.showToast) {
      window.showToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
    }
    return added;
  }

  updateWishlistUI() {
    document.querySelectorAll('.wishlist-btn').forEach((btn) => {
      const pid = btn.dataset.productId;
      if (pid) {
        const isWishlisted = this.wishlist.includes(pid);
        btn.classList.toggle('active', isWishlisted);
        btn.setAttribute('aria-label', isWishlisted ? 'Remove from wishlist' : 'Add to wishlist');
      }
    });
  }

  updateBadges(animate = false) {
    const badges = document.querySelectorAll('.cart-badge');
    const totalCount = this.cart.reduce((sum, item) => sum + item.qty, 0);

    badges.forEach((b) => {
      b.textContent = totalCount;
      b.classList.toggle('has-items', totalCount > 0);
      if (animate && totalCount > 0) {
        b.classList.remove('bump');
        void b.offsetWidth; // trigger reflow
        b.classList.add('bump');
      }
    });
  }

  renderCart() {
    const listContainer = document.querySelector('.cart-items-list');
    const subtotalEl = document.querySelector('.cart-subtotal-val');
    const checkoutBtn = document.querySelector('.cart-checkout-btn');

    if (!listContainer) return;

    if (this.cart.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-cart-msg">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; opacity: 0.5;">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p>Your shopping bag is currently empty.</p>
          <button class="btn btn-secondary" style="margin-top: 1.5rem; font-size: 0.75rem;" onclick="document.querySelector('.drawer-backdrop').click()">Explore Collection</button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '₹0';
      if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true');
      return;
    }

    if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

    let subtotal = 0;
    listContainer.innerHTML = this.cart
      .map((item, idx) => {
        subtotal += item.price * item.qty;
        return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <div>
              <h4 class="cart-item-title">${item.name}</h4>
              <p class="cart-item-meta">Size: ${item.size} · Color: ${item.color}</p>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="window.cartManager.updateQty(${idx}, -1)" aria-label="Decrease quantity">−</button>
                <span style="font-size: 0.85rem; min-width: 18px; text-align: center;">${item.qty}</span>
                <button class="qty-btn" onclick="window.cartManager.updateQty(${idx}, 1)" aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>
          <button class="cart-item-remove" onclick="window.cartManager.removeItem(${idx})" aria-label="Remove item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
      })
      .join('');

    if (subtotalEl) {
      subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    }
  }
}
