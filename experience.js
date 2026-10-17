(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let enabled = !reduce.matches;
  root.dataset.motion = enabled ? 'on' : 'off';

  const scenes = [...document.querySelectorAll('[data-depth]')].map(element => ({
    element, pointerX: 0, pointerY: 0, x: 0, y: 0, travel: 0, turn: -14,
    visible: true
  }));
  let frame = 0;
  let lastTime = 0;
  let introStart = 0;
  let introDone = !enabled;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function wake() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render(time) {
    frame = 0;
    const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
    lastTime = time;
    const smoothing = 1 - Math.exp(-dt / 135);
    const scroller = innerWidth < 1120 ? document.body : document.scrollingElement;
    const viewport = Math.min(innerHeight, document.body.clientHeight);
    const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    root.style.setProperty('--reading-progress', clamp(scroller.scrollTop / maxScroll, 0, 1));
    if (!enabled) return;
    if (!introStart) introStart = time;
    const intro = introDone ? 0 : Math.max(0, 1 - (time - introStart) / 2600);
    if (intro === 0) introDone = true;
    let moving = !introDone;

    scenes.forEach(scene => {
      if (!scene.visible) return;
      const bounds = scene.element.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > viewport) return;
      const progress = clamp((viewport / 2 - bounds.top - bounds.height / 2) / viewport, -.65, .65);
      const amount = finePointer.matches ? 1 : .45;
      const targetX = scene.pointerY * -3.5 + progress * 3 * amount;
      const targetY = scene.pointerX * 5 + (scene.element.dataset.depth === 'hero' ? -4 * intro : 0);
      const targetTravel = intro * 7;
      const targetTurn = -14 + progress * 30 * amount + scene.pointerX * 7 + intro * 8;
      for (const [key, target] of [['x', targetX], ['y', targetY], ['travel', targetTravel], ['turn', targetTurn]]) {
        const difference = target - scene[key];
        scene[key] = Math.abs(difference) < .015 ? target : scene[key] + difference * smoothing;
        if (Math.abs(difference) >= .015) moving = true;
      }
      scene.element.style.setProperty('--tilt-x', `${scene.x.toFixed(3)}deg`);
      scene.element.style.setProperty('--tilt-y', `${scene.y.toFixed(3)}deg`);
      scene.element.style.setProperty('--travel-y', `${scene.travel.toFixed(3)}px`);
      scene.element.style.setProperty('--scene-turn', `${scene.turn.toFixed(3)}deg`);
    });
    if (moving) wake();
  }

  function refreshPreference() {
    enabled = !reduce.matches;
    root.dataset.motion = enabled ? 'on' : 'off';

    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      introDone = true;
    }
    document.dispatchEvent(new Event('motionchange'));
    wake();
  }

  scenes.forEach(scene => {
    scene.element.addEventListener('pointermove', event => {
      if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
      const bounds = scene.element.getBoundingClientRect();
      scene.pointerX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
      scene.pointerY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
      wake();
    }, { passive: true });
    scene.element.addEventListener('pointerleave', () => {
      scene.pointerX = scene.pointerY = 0;
      wake();
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const scene = scenes.find(scene => scene.element === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      });
      wake();
    }, { rootMargin: '80px' });
    scenes.forEach(scene => observer.observe(scene.element));
  }
  document.body.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  window.addEventListener('pageshow', wake);
  document.addEventListener('toggle', wake, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = 0; wake(); }
  });
  if ('ResizeObserver' in window) new ResizeObserver(wake).observe(document.querySelector('.page-shell'));
  reduce.addEventListener('change', refreshPreference);
  finePointer.addEventListener('change', () => {
    scenes.forEach(scene => { scene.pointerX = scene.pointerY = 0; });
    wake();
  });

  refreshPreference();
})();
