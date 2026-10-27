(() => {
  const doc = document.documentElement;
  const $ = id => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* Dark mode (remembers the choice) */
  const toggle = $('theme');
  const meta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(t, save) {
    doc.dataset.theme = t;
    toggle.setAttribute('aria-pressed', String(t === 'dark'));
    toggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    meta.content = t === 'dark' ? '#0a0f1e' : '#d3dae0';
    if (save) try { localStorage.setItem('wedding-theme', t); } catch (e) {}
  }
  applyTheme(doc.dataset.theme || 'light');
  toggle.addEventListener('click', () => applyTheme(doc.dataset.theme === 'dark' ? 'light' : 'dark', true));

  /* Falling, intertwined rings */
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const back = $('rings'), front = $('rings-front');

  function ring(layer, o) {
    const el = document.createElement('div');
    el.className = 'ring';
    const v = { '--x': o.x + '%', '--s': o.s + 'px', '--o': o.o, '--d': o.d + 's', '--dl': -rnd(0, o.d) + 's',
                '--a': o.a + 'px', '--sw': rnd(5, 9) + 's', '--sg': rnd(3.5, 6) + 's' };
    for (const k in v) el.style.setProperty(k, v[k]);
    if (o.blur) el.style.filter = `blur(${o.blur}px)`;
    el.innerHTML = '<div class="ring__sway"><div class="ring__tilt"><svg viewBox="0 0 100 100"><use href="#rings-pair"/></svg></div></div>';
    layer.append(el);
    return el;
  }

  function build() {
    back.replaceChildren();
    front.replaceChildren();
    if (motion.matches) {              // reduced motion: one still pair in the middle
      ring(back, { x: 50, s: 120, o: .85, d: 1, a: 0 }).classList.add('ring--still');
      return;
    }
    const small = innerWidth < 640, n = small ? 7 : 12;
    [...Array(n).keys()].sort(() => Math.random() - .5).forEach(i => {
      const depth = Math.random();     // 0 = far and small, 1 = near and large
      ring(back, { x: (i + rnd(.15, .85)) / n * 100, s: (small ? 34 : 44) + depth * (small ? 44 : 74),
                   o: .5 + depth * .45, d: 26 - depth * 12, a: rnd(14, 46), blur: depth < .2 ? 1.6 : 0 });
    });
    for (let i = 0; i < (small ? 2 : 3); i++)
      ring(front, { x: rnd(8, 92), s: rnd(26, 40), o: .9, d: rnd(11, 15), a: rnd(20, 40) });
  }

  let wasSmall = innerWidth < 640;
  build();
  addEventListener('resize', () => { const s = innerWidth < 640; if (s !== wasSmall) { wasSmall = s; build(); } });
  motion.addEventListener('change', build);

  /* Footer: shown only when the very bottom of the page is reached */
  const footer = $('footer');
  const fit = () => doc.style.setProperty('--footer-h', footer.offsetHeight + 'px');
  fit();
  new ResizeObserver(fit).observe(footer);
  new IntersectionObserver(([e]) => footer.classList.toggle('is-visible', e.isIntersecting)).observe($('end'));
})();
