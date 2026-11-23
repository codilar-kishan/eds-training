import { toClassName } from '../../scripts/aem.js';
import { decorateButtons } from '../../scripts/scripts.js';

const SWIPE_THRESHOLD = 50;

// slides per view follow the viewport breakpoints (1 / 2 from 768px / 3 from 992px)
function visibleCount() {
  if (window.matchMedia('(width >= 992px)').matches) return 3;
  if (window.matchMedia('(width >= 768px)').matches) return 2;
  return 1;
}

/**
 * Splits authored rows into config (slider-title, slider-button) and slides.
 * @param {Element} block
 */
function readContent(block) {
  const config = {};
  const slides = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const [keyCell, valueCell] = cells;
    const key = toClassName(keyCell?.textContent);
    if (['slider-title', 'slider-button'].includes(key) && !keyCell.querySelector('picture')) {
      config[key] = valueCell;
    } else if (row.textContent.trim() || row.querySelector('picture')) {
      slides.push(cells);
    }
  });
  return { config, slides };
}

function buildSlide(cells, index) {
  const slide = document.createElement('li');
  slide.className = 'slider-carousel-slide';
  slide.dataset.index = index;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const imageCell = cells.find((c) => c.querySelector('picture'));
  const textCell = cells.find((c) => c !== imageCell && c.textContent.trim());

  if (imageCell) {
    const media = document.createElement('div');
    media.className = 'slider-carousel-image';
    const picture = imageCell.querySelector('picture');
    picture.classList.add('shield-mask');
    const link = picture.closest('a');
    media.append(link || picture);
    if (link) link.setAttribute('aria-hidden', 'true');
    if (link) link.tabIndex = -1;
    slide.append(media);
  }

  if (textCell) {
    const content = document.createElement('div');
    content.className = 'slider-carousel-content';
    if (textCell.querySelector('p, h1, h2, h3, h4, h5, h6')) {
      content.append(...textCell.childNodes);
    } else {
      const p = document.createElement('p');
      p.append(...textCell.childNodes);
      content.append(p);
    }
    slide.append(content);
  }

  const label = slide.querySelector('h1, h2, h3, h4, h5, h6, p')?.textContent.trim()
    || slide.querySelector('a[title]')?.title;
  if (label) slide.setAttribute('aria-label', label);
  return slide;
}

function navButton(className, html) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button ${className}`;
  button.innerHTML = html;
  return button;
}

export default function decorate(block) {
  const { config, slides } = readContent(block);

  const header = document.createElement('div');
  header.className = 'slider-carousel-header';
  const titleCell = config['slider-title'];
  if (titleCell) {
    const title = document.createElement('div');
    title.className = 'slider-carousel-title';
    title.append(...titleCell.childNodes);
    header.append(title);
  }
  const ctaCell = config['slider-button'];
  if (ctaCell?.querySelector('a')) {
    const cta = document.createElement('div');
    cta.className = 'slider-carousel-cta';
    const p = document.createElement('p');
    p.append(ctaCell.querySelector('a'));
    cta.append(p);
    decorateButtons(cta);
    header.append(cta);
  }

  const viewport = document.createElement('div');
  viewport.className = 'slider-carousel-viewport';
  const track = document.createElement('ul');
  track.className = 'slider-carousel-track';
  const slideEls = slides.map(buildSlide);
  track.append(...slideEls);
  viewport.append(track);

  const pagination = document.createElement('div');
  pagination.className = 'slider-carousel-pagination';
  const dots = document.createElement('div');
  dots.className = 'slider-carousel-dots';
  const progress = document.createElement('div');
  progress.className = 'slider-carousel-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span class="slider-carousel-progress-fill"></span>';
  pagination.append(dots, progress);

  const prev = navButton('slider-carousel-prev', '<span aria-hidden="true">←</span> Back');
  const next = navButton('slider-carousel-next', 'Next <span aria-hidden="true">→</span>');

  const titleText = header.querySelector('h1, h2, h3, h4, h5, h6, p')?.textContent.trim();
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (titleText) block.setAttribute('aria-label', titleText);

  block.replaceChildren(
    ...(header.children.length ? [header] : []),
    viewport,
    pagination,
    prev,
    next,
  );

  let page = 0;
  let perView = 1;
  let step = 0;

  const pageCount = () => Math.max(1, Math.ceil(slideEls.length / perView));
  const firstIndex = (p) => Math.min(p * perView, Math.max(0, slideEls.length - perView));

  function render() {
    const pages = pageCount();
    page = Math.min(page, pages - 1);
    const start = firstIndex(page);
    block.style.setProperty('--slider-translate', `${start * step}px`);
    block.style.setProperty('--slider-progress', `${((page + 1) / pages) * 100}%`);
    slideEls.forEach((slide, i) => {
      const visible = i >= start && i < start + perView;
      slide.setAttribute('aria-hidden', String(!visible));
      slide.inert = !visible;
    });
    [...dots.children].forEach((dot, i) => {
      const active = i === page;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
    block.classList.toggle('is-static', pages <= 1);
  }

  function layout() {
    const width = viewport.clientWidth;
    if (!width) return;
    perView = Math.min(visibleCount(), Math.max(1, slideEls.length));
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0; // 32px phones, 40px desktop
    const slideWidth = (width - gap * (perView - 1)) / perView;
    step = slideWidth + gap;
    block.style.setProperty('--slider-slide-width', `${slideWidth}px`);
    const pages = pageCount();
    if (dots.children.length !== pages) {
      dots.replaceChildren(...Array.from({ length: pages }, (_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider-carousel-dot';
        dot.setAttribute('aria-label', `Go to slide group ${i + 1} of ${pages}`);
        dot.addEventListener('click', () => { page = i; render(); });
        return dot;
      }));
    }
    render();
  }

  const go = (delta) => {
    page = Math.max(0, Math.min(pageCount() - 1, page + delta));
    render();
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  block.tabIndex = 0;
  block.addEventListener('keydown', (e) => {
    if (e.target.closest('a, input')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });

  // touch / pointer drag: track follows the finger, snaps past the threshold
  let startX = null;
  let delta = 0;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    startX = e.clientX;
    delta = 0;
    track.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', (e) => {
    if (startX === null) return;
    delta = e.clientX - startX;
    const base = firstIndex(page) * step;
    const max = Math.max(0, slideEls.length - perView) * step;
    block.style.setProperty('--slider-translate', `${Math.max(0, Math.min(base - delta, max))}px`);
  });
  const endDrag = () => {
    if (startX === null) return;
    startX = null;
    track.classList.remove('is-dragging');
    if (Math.abs(delta) >= SWIPE_THRESHOLD) go(delta > 0 ? -1 : 1);
    else render();
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', endDrag);

  new ResizeObserver(() => requestAnimationFrame(layout)).observe(viewport);
  layout();
}
