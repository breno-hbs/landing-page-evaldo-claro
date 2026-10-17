(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navegacao');
  if (!header || !toggle || !navigation) return;

  const desktop = window.matchMedia('(min-width: 70rem)');
  const label = toggle.querySelector('.menu-label');

  function setMenuOpen(open, returnFocus = false) {
    toggle.setAttribute('aria-expanded', String(open));
    header.dataset.menuOpen = String(open);
    label.textContent = open ? 'Fechar' : 'Menu';
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false, true);
    }
  });

  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || desktop.matches) return;
    setMenuOpen(false);
    if (link.hash && link.origin === window.location.origin) {
      const destination = document.getElementById(link.hash.slice(1));
      destination?.focus({ preventScroll: true });
    }
  });

  desktop.addEventListener('change', () => {
    const focusWouldBeHidden = !desktop.matches && navigation.contains(document.activeElement);
    if (desktop.matches && document.activeElement === toggle) {
      navigation.querySelector('a').focus();
    }
    setMenuOpen(false, focusWouldBeHidden);
  });

  // Enhance the menu only after its controls work; without JS all links stay visible.
  setMenuOpen(false);
  toggle.hidden = false;
  header.classList.add('menu-enhanced');

  // Keep native page keys available in the compact viewport's scroll area.
  if (!desktop.matches && document.activeElement === document.body) {
    document.body.focus({ preventScroll: true });
  }
})();

(() => {
  'use strict';

  const dock = document.querySelector('.contact-dock');
  const heroContact = document.querySelector('.hero .button');
  if (!dock || !heroContact) return;

  const desktop = window.matchMedia('(min-width: 70rem)');
  let frame = 0;

  function updateDock() {
    frame = 0;
    // Keep the reserved viewport space stable and never hide the active control.
    const containsFocus = dock.contains(document.activeElement);
    const header = document.querySelector('.site-header');
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const heroContactPassed = heroContact.getBoundingClientRect().bottom <= headerBottom;
    dock.hidden = !desktop.matches && !heroContactPassed && !containsFocus;
  }

  function scheduleUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateDock);
  }

  // Attach behavior before changing the default, visible-without-JS state.
  document.body.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  desktop.addEventListener('change', scheduleUpdate);
  document.addEventListener('focusin', scheduleUpdate);
  document.addEventListener('focusout', scheduleUpdate);
  document.querySelector('.site-header')?.addEventListener('click', scheduleUpdate);
  updateDock();
})();

(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  if (!header) return;
  function measureHeader() {
    const height = getComputedStyle(header).position === 'sticky' ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
  }
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
  window.addEventListener('resize', measureHeader);
  header.addEventListener('click', measureHeader);

  function revealFocus() {
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active?.matches('a, button, summary') || header.contains(active) || active.closest('.contact-dock')) return;
      const bounds = active.getBoundingClientRect();
      const top = header.getBoundingClientRect().bottom + 8;
      const bottom = Math.min(window.innerHeight, document.body.clientHeight) - 8;
      if (bounds.top < top || bounds.bottom > bottom) {
        active.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      }
    });
  }
  document.addEventListener('focusin', revealFocus);
  // The shared name provides native exclusivity; this also supports older browsers.
  const questions = [...document.querySelectorAll('.faq-list details')];
  questions.forEach(question => question.addEventListener('toggle', () => {
    if (question.open) questions.forEach(other => { if (other !== question) other.open = false; });
    revealFocus();
  }));
})();

(() => {
  'use strict';

  // Nothing is hidden in CSS: unsupported APIs or failed initialization leave
  // the content visible. Each temporary animation starts only on intersection.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || document.documentElement.dataset.motion === "off") return;

  const targets = document.querySelectorAll('.hero ~ .section > .container');
  const animations = new Map();
  let observer;

  function stopReveals() {
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }

  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        observer.unobserve(target);
        if (reducedMotion.matches || target.parentElement.contains(document.activeElement)) return;

        try {
          const animation = target.animate(
            [{ opacity: .55, transform: 'perspective(1400px) translate3d(0, 12px, -22px) rotateX(3deg)' }, { opacity: 1, transform: 'none' }],
            { duration: 650, easing: 'cubic-bezier(.16, 1, .3, 1)', iterations: 1 }
          );
          animations.set(target, animation);
          const forget = () => animations.delete(target);
          animation.addEventListener('finish', forget, { once: true });
          animation.addEventListener('cancel', forget, { once: true });
        } catch {
          stopReveals();
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -16px 0px' });

    document.addEventListener('motionchange', () => {
      if (document.documentElement.dataset.motion === 'off') stopReveals();
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) stopReveals();
    });
    document.addEventListener('focusin', event => {
      targets.forEach(target => {
        if (!target.parentElement.contains(event.target)) return;
        observer.unobserve(target);
        animations.get(target)?.cancel();
      });
    });
    targets.forEach(target => observer.observe(target));
  } catch {
    stopReveals();
  }
})();

(() => {
  'use strict';

  // Indicate the section at the reading line, without moving focus or history.
  const header = document.querySelector('.site-header');
  const entries = [...document.querySelectorAll('.site-nav li a[href^="#"]')]
    .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(entry => entry.section);
  if (!header || !entries.length) return;
  let frame = 0;

  function updateCurrentSection() {
    frame = 0;
    if (header.dataset.menuOpen === 'true') return;
    const headerBottom = header.getBoundingClientRect().bottom;
    const viewportBottom = Math.min(window.innerHeight, document.body.clientHeight);
    const readingLine = headerBottom + Math.min(160, (viewportBottom - headerBottom) * .3);
    const current = entries.find(({ section }) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= readingLine && bounds.bottom > readingLine;
    });
    entries.forEach(entry => {
      if (entry === current) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateCurrentSection);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  document.body.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  document.addEventListener('toggle', scheduleUpdate, true);
  header.addEventListener('click', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(header);
    entries.forEach(({ section }) => observer.observe(section));
  }
  scheduleUpdate();
})();
