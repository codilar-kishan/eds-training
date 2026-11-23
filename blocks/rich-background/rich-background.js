import { prefersReducedMotion } from '../../scripts/motion.js';

const ANIMATE_QUERY = '(width >= 1220px)';
const POSITIONS = ['center-right', 'center-left', 'center'];

/**
 * Builds a full-size background URL from an authored image.
 * @param {HTMLImageElement} img
 */
function backgroundUrl(img) {
  const url = new URL(img.src, window.location.href);
  url.searchParams.set('width', '2000');
  url.searchParams.set('format', 'webply');
  url.searchParams.set('optimize', 'medium');
  return url.href;
}

export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  const pictureCells = cells.filter((c) => c.querySelector('picture'));
  const textCell = cells.find((c) => !c.querySelector('picture') && c.textContent.trim());
  // one picture: it is the shield image; two: background then shield
  const bgCell = pictureCells.length > 1 ? pictureCells[0] : null;
  const shieldCell = pictureCells.length > 1 ? pictureCells[1] : pictureCells[0];

  if (bgCell) {
    const layer = document.createElement('div');
    layer.className = 'rich-background-bg';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.backgroundImage = `url("${backgroundUrl(bgCell.querySelector('img'))}")`;
    block.classList.add('has-bg-image');
    block.prepend(layer);
  }

  const content = document.createElement('div');
  content.className = 'rich-background-content';

  const heading = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const description = document.createElement('div');
  description.className = 'rich-background-description';
  if (textCell) {
    description.append(...[...textCell.children].filter((el) => el !== heading));
  }

  const shield = document.createElement('div');
  const position = POSITIONS.find((p) => block.classList.contains(p)) || 'center-right';
  shield.className = `rich-background-shield position-${position}`;
  ['float', 'pulse', 'fade'].forEach((a) => {
    if (block.classList.contains(a) && !prefersReducedMotion()) shield.classList.add(a);
  });
  const picture = shieldCell?.querySelector('picture');
  if (picture) {
    picture.classList.add('shield-mask');
    shield.append(picture);
  }
  if (heading) {
    const title = document.createElement('div');
    title.className = 'rich-background-title';
    title.append(heading);
    shield.append(title);
  }

  content.append(description, shield);
  block.querySelectorAll(':scope > div:not(.rich-background-bg)').forEach((row) => row.remove());
  block.append(content);

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    block.classList.add('animate-in');
    return;
  }
  if (!window.matchMedia(ANIMATE_QUERY).matches) {
    // wait a paint so the mobile fade-in transition actually runs
    setTimeout(() => block.classList.add('animate-in'), 50);
    return;
  }

  // Re-triggers every pass: on when the top crosses 80% of the viewport,
  // off once the block has left the viewport (either direction).
  const observer = new IntersectionObserver(([entry]) => {
    block.classList.toggle('animate-in', entry.isIntersecting);
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });
  observer.observe(block);
}
