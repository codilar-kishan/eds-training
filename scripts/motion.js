/**
 * Shared motion helpers for scroll-driven blocks.
 * Every helper respects prefers-reduced-motion.
 */

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Calls `callback` the first time `el` is at least `threshold` visible.
 * Runs immediately when the user prefers reduced motion.
 * @param {Element} el element to watch
 * @param {Function} callback runs once
 * @param {number} threshold visible fraction that triggers it
 */
export function onFirstView(el, callback, threshold = 0.2) {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    callback();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      callback();
    }
  }, { threshold });
  observer.observe(el);
}

/**
 * Finds what comes after a block: the next wrapper in its section,
 * otherwise the next section.
 * @param {Element} block the block element
 * @returns {Element|null}
 */
function findNextContent(block) {
  const wrapper = block.parentElement;
  if (wrapper?.nextElementSibling) return wrapper.nextElementSibling;
  return block.closest('.section')?.nextElementSibling || null;
}

/**
 * Builds the round "scroll to next" chevron button shared by full-height blocks.
 * @param {Element} block block the button belongs to
 * @param {string} className extra class for block-specific placement
 * @returns {HTMLButtonElement}
 */
export function createScrollArrow(block, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `scroll-arrow ${className}`.trim();
  button.setAttribute('aria-label', 'Scroll to next section');
  button.innerHTML = '<span class="scroll-arrow-icon" aria-hidden="true"></span>';
  button.addEventListener('click', () => {
    const target = findNextContent(block);
    const edge = target
      ? target.getBoundingClientRect().top
      : block.getBoundingClientRect().bottom;
    const top = edge + window.scrollY;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
  return button;
}
