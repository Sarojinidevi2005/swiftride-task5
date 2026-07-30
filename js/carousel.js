/* ============================================================
   SwiftRide — carousel.js
   Home page image gallery carousel (preserved from the original
   Task-3 project): auto-slides every 3s, prev/next buttons,
   clickable dots, and pauses on hover / tab-blur.
   ============================================================ */

const carousel = document.getElementById('carousel');

if (carousel) {
  const track = document.getElementById('carouselTrack');
  const slides = track.querySelectorAll('.carousel-slide');
  const dotsWrap = document.getElementById('carouselDots');
  const dots = dotsWrap.querySelectorAll('.dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  const totalSlides = slides.length;
  let currentSlide = 0;
  let autoSlideTimer = null;
  const AUTO_SLIDE_INTERVAL = 3000;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
  }
  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  nextBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
  prevBtn.addEventListener('click', () => { prevSlide(); startAutoSlide(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide, 10));
      startAutoSlide();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);
  // Pause for keyboard users too, not just mouse hover (Task-5 accessibility)
  carousel.addEventListener('focusin', stopAutoSlide);
  carousel.addEventListener('focusout', startAutoSlide);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoSlide();
    else startAutoSlide();
  });

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  goToSlide(0);
  if (!prefersReducedMotion) startAutoSlide();
}
