import { toClassName } from '../../scripts/aem.js';
import { createScrollArrow, prefersReducedMotion } from '../../scripts/motion.js';

const MOBILE_QUERY = '(width < 768px)';

/**
 * Reads the key/value rows (first cell = key) into a map of value cells.
 * @param {Element} block
 * @returns {Map<string, Element>}
 */
function readRows(block) {
  const rows = new Map();
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    if (!keyCell || !valueCell) return;
    const key = toClassName(keyCell.textContent);
    if (key) rows.set(key, valueCell);
  });
  return rows;
}

function linkOf(cell) {
  const a = cell?.querySelector('a[href]');
  return a ? a.href : (cell?.textContent.trim() || '');
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
}

function buildVideo(src, poster, block) {
  const video = document.createElement('video');
  video.src = src;
  if (poster) video.poster = poster;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'auto';
  // block options control playback; the reference page uses all three
  const opts = block.classList;
  const optionsGiven = ['autoplay', 'loop', 'mute'].some((o) => opts.contains(o));
  video.loop = !optionsGiven || opts.contains('loop');
  video.autoplay = !optionsGiven || opts.contains('autoplay');
  if (video.autoplay) video.play().catch(() => {});
  return video;
}

/**
 * Merges the description's consecutive headings into one heading,
 * one span per authored line, so screen readers hear a single title.
 * @param {Element} cell description cell
 * @returns {Element[]} nodes for the text column
 */
function buildHeadline(cell) {
  const nodes = [...cell.children];
  const headings = nodes.filter((n) => /^H[1-6]$/.test(n.tagName));
  if (headings.length < 2) return nodes;

  const merged = document.createElement(headings[0].tagName);
  merged.id = headings.map((h) => h.id).filter(Boolean).join('-') || '';
  if (!merged.id) merged.removeAttribute('id');
  headings.forEach((h) => {
    const line = document.createElement('span');
    line.className = 'hero-video-line';
    line.append(...h.childNodes);
    merged.append(line, ' ');
  });
  const first = nodes.indexOf(headings[0]);
  return [
    ...nodes.slice(0, first),
    merged,
    ...nodes.filter((n, i) => i > first && !headings.includes(n)),
  ];
}

export default function decorate(block) {
  const rows = readRows(block);
  const desktopSrc = linkOf(rows.get('campaign-assets-desktop'));
  const mobileCell = rows.get('campaign-assets-mobile');
  const posterPicture = rows.get('campaign-poster')?.querySelector('picture');
  const overlayPicture = rows.get('campaign-image-overlay')?.querySelector('picture');
  const description = rows.get('campaign-description');
  const gap = rows.get('campaign-description-gap')?.textContent.trim().match(/(\d+)/);
  if (gap) block.style.setProperty('--hero-video-gap', `${Number(gap[1]) * 8}px`);

  const media = document.createElement('div');
  media.className = 'hero-video-media';

  const isMobile = window.matchMedia(MOBILE_QUERY).matches;
  const mobilePicture = mobileCell?.querySelector('picture');
  const mobileSrc = mobileCell && !mobilePicture ? linkOf(mobileCell) : '';
  const background = isMobile && mobilePicture ? mobilePicture : posterPicture;

  if (background) {
    const img = background.querySelector('img');
    img.loading = 'eager';
    img.fetchPriority = 'high';
    img.alt = '';
    media.append(background);
  }

  const src = isMobile && mobileSrc ? mobileSrc : desktopSrc;
  const showVideo = !prefersReducedMotion() && !(isMobile && mobilePicture) && isVideo(src);
  if (showVideo) {
    media.append(buildVideo(src, background?.querySelector('img')?.currentSrc, block));
  }

  const content = document.createElement('div');
  content.className = 'hero-video-content';
  if (overlayPicture) {
    overlayPicture.classList.add('hero-video-mark');
    overlayPicture.querySelector('img').loading = 'eager';
    content.append(overlayPicture);
  }
  if (description) {
    const text = document.createElement('div');
    text.className = 'hero-video-text';
    text.append(...buildHeadline(description));
    content.append(text);
  }

  const arrow = createScrollArrow(block);
  block.replaceChildren(media, content, arrow);

  const reveal = () => {
    content.classList.add('is-visible');
    arrow.classList.add('is-visible');
  };
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    reveal();
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        reveal();
      }
    }, { threshold: 0.25 });
    observer.observe(content);
  }
}
