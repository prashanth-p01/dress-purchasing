import gsap from 'gsap';
import productsData from '../data/products.json';

export function initMixMatchSection() {
  const mannequinStage = document.querySelector('.mannequin-stage');
  const topSlot = document.querySelector('.mannequin-slot.top-slot');
  const bottomSlot = document.querySelector('.mannequin-slot.bottom-slot');
  const accSlot = document.querySelector('.mannequin-slot.accessory-slot');
  const totalPriceEl = document.querySelector('.mixmatch-total-price');

  const topsListContainer = document.querySelector('.drag-tiles-row.tops-row');
  const bottomsListContainer = document.querySelector('.drag-tiles-row.bottoms-row');
  const accsListContainer = document.querySelector('.drag-tiles-row.accs-row');

  const btnAddOutfit = document.querySelector('.btn-add-outfit');
  const btnClearOutfit = document.querySelector('.btn-clear-outfit');
  const btnShuffleOutfit = document.querySelector('.btn-shuffle-outfit');

  if (!mannequinStage) return;

  // State
  const currentOutfit = {
    top: null,
    bottom: null,
    accessory: null,
  };

  const tops = productsData.filter((p) => p.mannequinType === 'top');
  const bottoms = productsData.filter((p) => p.mannequinType === 'bottom');
  const accessories = productsData.filter((p) => p.mannequinType === 'accessory');

  // Render Draggable Tiles
  function renderTiles(list, container, type) {
    if (!container) return;
    container.innerHTML = list
      .map(
        (item) => `
      <div 
        class="drag-item-card" 
        draggable="true" 
        data-product-id="${item.id}" 
        data-type="${type}" 
        title="Drag or tap to equip ${item.name}">
        <img src="${item.colors[0].front}" alt="${item.name}" class="drag-item-thumb" />
        <div class="drag-item-name">${item.name}</div>
        <div class="drag-item-price">₹${item.price.toLocaleString('en-IN')}</div>
      </div>
    `
      )
      .join('');
  }

  renderTiles(tops, topsListContainer, 'top');
  renderTiles(bottoms, bottomsListContainer, 'bottom');
  renderTiles(accessories, accsListContainer, 'accessory');

  // Equip Item on Mannequin
  function equipItem(product, type) {
    currentOutfit[type] = product;

    let targetSlot = null;
    if (type === 'top') targetSlot = topSlot;
    if (type === 'bottom') targetSlot = bottomSlot;
    if (type === 'accessory') targetSlot = accSlot;

    if (!targetSlot) return;

    // Slide out old item, slide in new item with spring animation
    targetSlot.innerHTML = `<img src="${product.colors[0].front}" alt="${product.name}" />`;
    gsap.fromTo(
      targetSlot,
      { scale: 0.8, y: -20, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );

    updateTotalPrice();
  }

  function updateTotalPrice() {
    let total = 0;
    if (currentOutfit.top) total += currentOutfit.top.price;
    if (currentOutfit.bottom) total += currentOutfit.bottom.price;
    if (currentOutfit.accessory) total += currentOutfit.accessory.price;

    if (totalPriceEl) {
      // Animated count up
      const currentVal = parseInt(totalPriceEl.textContent.replace(/[^0-9]/g, '') || '0', 10);
      gsap.to(
        { val: currentVal },
        {
          val: total,
          duration: 0.4,
          ease: 'power1.out',
          onUpdate: function () {
            totalPriceEl.textContent = `₹${Math.round(this.targets()[0].val).toLocaleString('en-IN')}`;
          },
        }
      );
    }
  }

  // Pointer & Drag and Drop Events
  document.querySelectorAll('.drag-item-card').forEach((card) => {
    // HTML5 Drag Events for desktop
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.productId);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    // Mobile/Desktop Tap/Click fallback
    card.addEventListener('click', () => {
      const pid = card.dataset.productId;
      const type = card.dataset.type;
      const product = productsData.find((p) => p.id === pid);
      if (product) {
        equipItem(product, type);
        if (window.showToast) {
          window.showToast(`Equipped "${product.name}" on mannequin`);
        }
      }
    });
  });

  // Drag over stage
  mannequinStage.addEventListener('dragover', (e) => {
    e.preventDefault();
    mannequinStage.style.borderColor = 'var(--accent-warm)';
  });

  mannequinStage.addEventListener('dragleave', () => {
    mannequinStage.style.borderColor = 'var(--border-strong)';
  });

  mannequinStage.addEventListener('drop', (e) => {
    e.preventDefault();
    mannequinStage.style.borderColor = 'var(--border-strong)';
    const pid = e.dataTransfer.getData('text/plain');
    const product = productsData.find((p) => p.id === pid);
    if (product) {
      equipItem(product, product.mannequinType);
      if (window.showToast) {
        window.showToast(`Equipped "${product.name}" on mannequin`);
      }
    }
  });

  // Shuffle Outfit
  if (btnShuffleOutfit) {
    btnShuffleOutfit.addEventListener('click', () => {
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      const randomAcc = accessories[Math.floor(Math.random() * accessories.length)];

      if (randomTop) equipItem(randomTop, 'top');
      if (randomBottom) equipItem(randomBottom, 'bottom');
      if (randomAcc) equipItem(randomAcc, 'accessory');

      if (window.showToast) window.showToast('Outfit shuffled!');
    });
  }

  // Clear Outfit
  if (btnClearOutfit) {
    btnClearOutfit.addEventListener('click', () => {
      currentOutfit.top = null;
      currentOutfit.bottom = null;
      currentOutfit.accessory = null;

      [topSlot, bottomSlot, accSlot].forEach((slot) => {
        if (slot) {
          gsap.to(slot, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            onComplete: () => (slot.innerHTML = ''),
          });
        }
      });
      updateTotalPrice();
    });
  }

  // Add Full Outfit to Cart
  if (btnAddOutfit) {
    btnAddOutfit.addEventListener('click', () => {
      const itemsToAdd = [currentOutfit.top, currentOutfit.bottom, currentOutfit.accessory].filter(Boolean);
      if (itemsToAdd.length === 0) {
        if (window.showToast) window.showToast('Please select or drag items onto the mannequin first.');
        return;
      }

      if (window.cartManager) {
        itemsToAdd.forEach((item) => {
          window.cartManager.addItem(item, 'M', item.colors[0].name);
        });
      }
    });
  }

  // Default initial outfit
  if (tops.length > 0) equipItem(tops[0], 'top');
  if (bottoms.length > 0) equipItem(bottoms[0], 'bottom');
  if (accessories.length > 0) equipItem(accessories[0], 'accessory');
}
