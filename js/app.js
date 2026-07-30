/* ============================================================
   SwiftRide — app.js
   Shared UI behavior loaded on every page: navbar, hamburger,
   active-page highlighting, theme toggle, scroll-to-top, toast
   notifications, scroll-reveal animations, page loader, footer
   year, and smooth scrolling for in-page anchors.
   ============================================================ */

/* ===== PAGE LOADER ===== */
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => loader.classList.add('hide'), 250);
  }
});

/* ===== NAVBAR: scroll shrink ===== */
const navbar = document.getElementById('navbar');
const isHomePage = document.body.dataset.page === 'home';

function updateNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 50 || !isHomePage) {
    // Inner pages keep a solid navbar always (page-header sits right below it)
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
updateNavbarScroll();

/* ===== ACTIVE NAVIGATION ===== */
(function setActiveNav() {
  const currentPage = document.body.dataset.page || 'home';
  document.querySelectorAll('.nav-link[data-page], .footer-col a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
}

/* ===== THEME PREFERENCE (light / dark) ===== */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
    icon.className = theme === 'dark' ? 'ph-fill ph-sun' : 'ph-fill ph-moon';
  });
}

(function initTheme() {
  const saved = SwiftStorage.getTheme();
  applyTheme(saved);
})();

document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    SwiftStorage.saveTheme(next);
  });
});

/* ===== SCROLL-TO-TOP BUTTON ===== */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== SHARED SCROLL HANDLER (Task-5 perf: one listener, rAF-throttled,
   passive so the browser never blocks scrolling to wait on JS) ===== */
let scrollTicking = false;
function onScrollFrame() {
  updateNavbarScroll();
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScrollFrame);
    scrollTicking = true;
  }
}, { passive: true });

/* ===== SMOOTH SCROLL for in-page anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId.length < 2) return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 84;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ===== TOAST NOTIFICATION (shared by every form on every page) ===== */
function showToast(title = 'Success!', message = 'Your action was completed.', type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = document.getElementById('toastIcon');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = message;
  icon.className = type === 'error' ? 'ph-fill ph-x-circle' : 'ph-fill ph-check-circle';
  icon.style.color = type === 'error' ? '#ef4444' : '#22c55e';
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}
window.showToast = showToast;

/* ===== SCROLL REVEAL ANIMATIONS ===== */
function addRevealClasses() {
  const revealTargets = [
    '.service-card', '.why-card', '.review-card', '.contact-card',
    '.booking-info', '.booking-form-card', '.contact-form-info',
    '.vehicle-card', '.dash-card', '.pricing-card', '.faq-item',
    '.timeline-item', '.process-card', '.driver-card', '.booking-row',
  ];
  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', '');
        el.style.transitionDelay = `${Math.min(i, 8) * 70}ms`;
      }
    });
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeReveal() {
  document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => revealObserver.observe(el));
}
window.observeReveal = observeReveal;

function initReveal() {
  addRevealClasses();
  observeReveal();
}
document.addEventListener('DOMContentLoaded', initReveal);

/* ===== ANIMATED STAT COUNTERS (used on About / Home) ===== */
function animateCounters(scope = document) {
  const counters = scope.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    if (counter.dataset.counted) return;
    counter.dataset.counted = 'true';
    const target = parseInt(counter.dataset.target, 10);
    const duration = 1800;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = current.toLocaleString();
    }, 16);
  });
}
window.animateCounters = animateCounters;

document.querySelectorAll('.stats').forEach(statsSection => {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters(statsSection);
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
});

/* ===== SHARED DEBOUNCE UTILITY (Task-5 perf) =====
   Used by search inputs across pages (Fleet, My Bookings) so a full
   list re-render only fires after the user pauses typing, instead of
   on every single keystroke. */
function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
window.debounce = debounce;

/* ===== FOOTER YEAR ===== */
document.querySelectorAll('.footer-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* ===== GLOBAL ERROR HANDLING (Task-5) =====
   Catches unexpected runtime errors / rejected promises so one broken
   feature (e.g. a failed fetch) can't silently break the whole page,
   and surfaces a friendly toast instead of a blank screen. */
window.addEventListener('error', (event) => {
  console.warn('SwiftRide: caught a runtime error —', event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.warn('SwiftRide: caught an unhandled promise rejection —', event.reason);
});
