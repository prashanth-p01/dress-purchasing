import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMarqueeSection() {
  const marqueeSection = document.querySelector('.marquee-section');
  const rowForward = document.querySelector('.marquee-row-forward .marquee-inner');
  const rowReverse = document.querySelector('.marquee-row-reverse .marquee-inner');

  if (!marqueeSection) return;

  // Split letters for hover effects
  const marqueeItems = document.querySelectorAll('.marquee-item');
  marqueeItems.forEach((item) => {
    const text = item.textContent.trim();
    const parts = text.split('');
    item.innerHTML = parts
      .map((char) => {
        if (char === '·') return `<span class="marquee-dot"></span>`;
        if (char === ' ') return `<span>&nbsp;</span>`;
        return `<span class="marquee-char">${char}</span>`;
      })
      .join('');
  });

  // Pure GSAP Infinite Horizontal Glide with silky velocity response
  let forwardX = 0;
  let reverseX = 0;
  let scrollVelocity = 0;
  let dampedVelocity = 0;

  ScrollTrigger.create({
    trigger: marqueeSection,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      scrollVelocity = self.getVelocity() / 1500;
    },
  });

  // Ticker for 60fps translation
  gsap.ticker.add(() => {
    // Dampen velocity smoothly
    dampedVelocity += (scrollVelocity - dampedVelocity) * 0.05;
    scrollVelocity *= 0.92; // Natural friction

    const speed = 0.6 + Math.min(Math.abs(dampedVelocity), 2.0);

    forwardX -= speed;
    reverseX += speed;

    if (forwardX <= -50) forwardX = 0;
    if (reverseX >= 0) reverseX = -50;

    if (rowForward) {
      rowForward.style.transform = `translate3d(${forwardX}%, 0, 0)`;
    }
    if (rowReverse) {
      rowReverse.style.transform = `translate3d(${reverseX}%, 0, 0)`;
    }
  });

  // Hover letter skew micro-interactions
  document.querySelectorAll('.marquee-char').forEach((char) => {
    char.addEventListener('mouseenter', () => {
      gsap.to(char, {
        y: -6,
        skewX: -10,
        scale: 1.15,
        color: '#B46534',
        duration: 0.25,
        ease: 'power2.out',
      });
    });

    char.addEventListener('mouseleave', () => {
      gsap.to(char, {
        y: 0,
        skewX: 0,
        scale: 1,
        color: 'inherit',
        duration: 0.35,
        ease: 'power2.in',
      });
    });
  });
}
