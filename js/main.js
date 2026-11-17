'use strict';

// Enable reveal animations only if JS is available.
document.documentElement.classList.add('js');

// Current year in footer.
document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

// Load local images from data-image. Until each file exists, a styled placeholder
// with its filename is shown instead of a broken image icon.
document.querySelectorAll('[data-image]').forEach((surface) => {
  const path = surface.getAttribute('data-image');
  if (!path) return;
  const img = new Image();
  img.onload = () => {
    surface.style.backgroundImage = `url("${path.replace(/"/g, '%22')}")`;
    surface.classList.add('has-image');
  };
  img.onerror = () => { /* Keep gradient and filename as the fallback. */ };
  img.src = path;
});

// Transparent header over hero; solid once the page scrolls.
const header = document.getElementById('siteHeader');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 30);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Mobile menu with ESC and link-click dismissal.
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('primaryNav');
function closeMenu() {
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open menu');
  nav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', opening);
    document.body.classList.toggle('menu-open', opening);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

// Homepage background slideshow.
const slides = Array.from(document.querySelectorAll('.hero-slide'));
const counter = document.getElementById('currentSlide');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (slides.length > 1) {
  let current = 0;
  let timer;
  const showSlide = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    if (counter) counter.textContent = String(current + 1).padStart(2, '0');
  };
  const restart = () => {
    clearInterval(timer);
    if (!reducedMotion) timer = setInterval(() => showSlide(current + 1), 6500);
  };
  document.getElementById('prevSlide')?.addEventListener('click', () => {
    showSlide(current - 1); restart();
  });
  document.getElementById('nextSlide')?.addEventListener('click', () => {
    showSlide(current + 1); restart();
  });
  showSlide(0);
  restart();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restart();
  });
}

// Gentle viewport reveals. Users with reduced-motion preference see all content.
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}

// Contact form is deliberately frontend-only: no fetch(), no form submission,
// no localStorage, no cookies, no email, and no backend calls.
const form = document.getElementById('enquiryForm');
const status = document.getElementById('formStatus');
if (form && status) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'Demo preview only. Your enquiry was not sent or saved anywhere.';
    status.hidden = false;
    status.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  });
  form.addEventListener('input', () => { status.hidden = true; });
}
