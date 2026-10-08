# VAANIKA — Handcrafted Earthwear & Artisanal Silhouettes (Dress Purchasing)

A heavily animated, production-quality single-page clothing boutique website built with **Vite + Vanilla JS**, **GSAP ScrollTrigger**, **Three.js GLSL shaders**, **Lenis Smooth Scroll**, **Swiper.js**, and **Firebase Firestore**.

---

## 🌟 Features Implemented

1. **Preloader**: Dynamic SVG path drawing animation with percentage counter and upward wipe transition.
2. **Scroll-Driven Hero Video (Wool to Shirt)**:
   - Pinned for 400vh with GSAP ScrollTrigger.
   - Dual-engine playback: scrubs `<video>` currentTime with fallback to 60fps high-fidelity canvas frame scrubbing using local 1,200 frame sequence.
   - Responsive switch for mobile video (`hero-scroll-mobile.mp4`).
   - 4-phase typography narratives ("From the fleece", "To the thread", "To the fabric", "To the shirt").
3. **Floating-Fabric Brand Reveal (Three.js WebGL)**:
   - Custom GLSL vertex & fragment shaders (`fabric.vert`, `fabric.frag`).
   - Silky cloth ripples in cream & beige with light sheen, subsurface scattering, and mouse/touch ripple deformation.
   - Auto-pauses off-screen; capped at 2x pixel ratio for mobile performance.
   - Blur-to-sharp & letter-spacing reveal for brand name.
4. **Kinetic Typography Marquee**:
   - Dual infinite counter-scrolling marquee strips.
   - Dynamically accelerates with scroll velocity.
   - Split-character hover skew and scale micro-interactions.
5. **Story-Style Categories**:
   - Circular Instagram-story bubbles with gradient active borders.
   - Fullscreen 9:16 Swiper story viewer with 4s auto-advance, segmented progress bars, hold-to-pause, and direct "Shop this look" links.
6. **Scroll-Driven Lookbook**:
   - Pinned section cross-transitioning through 5 curated looks.
   - Smooth dynamic background color shifting per look.
   - Interactive hotspot pins revealing product details, prices, and one-click bag addition.
7. **Color-Swap Product Cards**:
   - Responsive product grid with category filter chips (Women, Men, Festive, Kids).
   - Instant colorway swatch morphs.
   - Secondary back/model view reveal on hover with subtle zoom.
   - 3D cursor tilt on desktop.
   - Wishlist heart toggle & size selectors.
8. **Mix & Match Mannequin Atelier**:
   - Interactive mannequin stage with top, bottom, and accessory slots.
   - Draggable wardrobe tiles with spring snap animations and slide replacement.
   - Live counting total price ticker in INR (₹).
   - "Shuffle", "Clear", and "Add Full Outfit to Bag" actions with pointer/touch support.
9. **Seasonal Theme Transitions**:
   - Switcher (Spring, Summer, Autumn, Winter) + auto-selection by current month.
   - Real-time CSS variable morphing and HTML5 canvas particle layers (petals, sunglow, leaves, snow).
10. **Global Polish**:
    - Magnetic custom cursor with "View" and "Add" states.
    - Lenis smooth scroll synchronized with ScrollTrigger.
    - Smart sticky header that hides on scroll down and reveals on scroll up.
    - Slide-in Cart and Size Guide drawers with Indian Rupee (₹) formatting.
    - Full `prefers-reduced-motion` accessibility support.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🛠️ Customization Guide

### 1. How to Replace Video & Images
- **Hero Video**:
  - Place your desktop video at `/public/assets/video/hero-scroll.mp4`.
  - Place your mobile video at `/public/assets/video/hero-scroll-mobile.mp4`.
  - To use custom image frame sequences, place frames in `/public/assets/frames/`.
- **Product Images & Lookbook Photos**:
  - Open `/src/data/products.json`, `/src/data/looks.json`, or `/src/data/categories.json`.
  - Replace the image URLs with your local assets (e.g. `/assets/images/my-photo.jpg`) or hosted CDN links.

### 2. How to Edit Shop Name, Tagline & Brand Palette
- **Shop Name & Tagline**:
  - In `index.html`, update the `<title>`, `<meta name="description">`, `<header class="brand-logo">`, and `<section class="fabric-reveal-section">`.
- **Brand Palette & CSS Tokens**:
  - Open `/src/css/variables.css` to customize primary tokens:
    ```css
    --cream: #F5EFE6;
    --beige: #E6D9C5;
    --soft-brown: #6B4F3A;
    --muted-sage: #8A9A82;
    --charcoal: #1E1B18;
    ```
- **Seasonal Variables**:
  - Open `/src/data/seasons.json` to change the colors, particle density, and particle shapes for Spring, Summer, Autumn, and Winter.

### 3. How to Edit Products & Inventory
- Open `/src/data/products.json`:
  ```json
  {
    "id": "p1",
    "name": "Ahimsa Raw Silk Kurta",
    "category": "women",
    "price": 6800,
    "badge": "Signature",
    "mannequinType": "top",
    "sizes": ["XS", "S", "M", "L", "XL"],
    "colors": [
      {
        "name": "Sand Dune",
        "hex": "#E6D9C5",
        "front": "/assets/images/front.jpg",
        "back": "/assets/images/back.jpg"
      }
    ]
  }
  ```

---

## 🌐 Deployment

### Deploy to Vercel
```bash
npx vercel
```
Or link your GitHub repository to Vercel with framework preset **Vite** (Build command: `npm run build`, Output directory: `dist`).

### Deploy to Netlify
```bash
npx netlify deploy --prod --dir=dist
```
Or import your repository on Netlify with build command `npm run build` and publish directory `dist`.
