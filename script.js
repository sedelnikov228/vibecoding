'use strict';
(() => {
  document.getElementById('year').textContent = new Date().getFullYear();
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './polish.css?v=2';
  document.head.append(stylesheet);
  const contact = document.querySelector('.contact-bottom');
  if (contact) {
    contact.replaceChildren();
    const text = document.createElement('p');
    text.textContent = 'Есть идея? Давай обсудим.';
    const handle = document.createElement('span');
    handle.className = 'social-handle';
    handle.textContent = 'Telegram: @IvanSedOne · Instagram: @sedelnikov_dsgn';
    text.append(document.createElement('br'), handle);
    const links = document.createElement('div');
    links.className = 'contact-links';
    [['TELEGRAM', 'https://t.me/IvanSedOne', false], ['INSTAGRAM', 'https://www.instagram.com/sedelnikov_dsgn/', true]].forEach(([label, url, secondary]) => {
      const link = document.createElement('a');
      link.className = 'button' + (secondary ? ' secondary' : '');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      links.append(link);
    });
    contact.append(text, links);
  }
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  let scrollQueued = false;
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
    scrollQueued = false;
  };
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'motion-toggle';
  const syncToggle = () => {
    document.body.classList.toggle('motion-paused', paused);
    toggle.textContent = paused ? 'АНИМАЦИЯ: ВЫКЛ' : 'АНИМАЦИЯ: ВКЛ';
    toggle.setAttribute('aria-label', 'Остановить анимацию');
    toggle.setAttribute('aria-pressed', String(paused));
  };
  toggle.addEventListener('click', () => { paused = !paused; syncToggle(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; syncToggle(); });
  document.querySelector('footer').append(toggle);
  syncToggle();
  stylesheet.addEventListener('load', () => {
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('reveal-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.project, .about-grid, .contact h2').forEach(element => {
      element.classList.add('reveal-ready', 'reveal-pending');
      observer.observe(element);
    });
  }, { once: true });
  const hero = document.querySelector('.hero');
  const orbital = document.querySelector('.orbital');
  let pointerQueued = false;
  let x = 0, y = 0;
  if (hero && orbital && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', event => {
      if (paused || reduced.matches) return;
      const rect = hero.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - .5) * 24;
      y = ((event.clientY - rect.top) / rect.height - .5) * 18;
      if (!pointerQueued) {
        pointerQueued = true;
        requestAnimationFrame(() => {
          orbital.style.setProperty('--mx', `${x}px`);
          orbital.style.setProperty('--my', `${y}px`);
          pointerQueued = false;
        });
      }
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      orbital.style.setProperty('--mx', '0px');
      orbital.style.setProperty('--my', '0px');
    });
  }
})();
