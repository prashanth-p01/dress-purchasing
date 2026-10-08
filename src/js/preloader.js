import gsap from 'gsap';

export function initPreloader(onCompleteCallback) {
  const preloader = document.querySelector('.preloader');
  const bar = document.querySelector('.preloader-bar');
  const counter = document.querySelector('.preloader-counter');

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress > 100) progress = 100;

    if (bar) bar.style.width = `${progress}%`;
    if (counter) counter.textContent = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        dismissPreloader();
      }, 500);
    }
  }, 90);

  function dismissPreloader() {
    gsap.to(preloader, {
      yPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut',
      onComplete: () => {
        if (preloader) preloader.style.display = 'none';
        if (typeof onCompleteCallback === 'function') {
          onCompleteCallback();
        }
      },
    });
  }
}
