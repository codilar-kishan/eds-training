import { createScrollArrow, onFirstView } from '../../scripts/motion.js';

const DESKTOP_QUERY = '(width >= 992px)';

export default function decorate(block) {
  const cells = [...(block.firstElementChild?.children || [])];
  const imageCell = cells.find((c) => c.querySelector('picture'));
  const textCell = cells.find((c) => c !== imageCell) || document.createElement('div');

  const content = document.createElement('div');
  content.className = 'parallax-image-content';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'parallax-image-media';
  const picture = imageCell?.querySelector('picture');
  if (picture) {
    picture.classList.add('shield-mask');
    imageContainer.append(picture);
  }

  const textContainer = document.createElement('div');
  textContainer.className = 'parallax-image-text';
  textContainer.append(...textCell.childNodes);

  // the dot motif sits behind whichever column is on the left
  const dots = document.createElement('div');
  dots.className = 'parallax-image-dots';
  dots.setAttribute('aria-hidden', 'true');
  const leftColumn = block.classList.contains('image-right') ? textContainer : imageContainer;
  leftColumn.prepend(dots);

  const arrow = createScrollArrow(block);
  content.append(imageContainer, textContainer);
  block.replaceChildren(content, arrow);

  const animateIn = () => {
    block.classList.add('animate-in');
    arrow.classList.add('is-visible');
  };
  if (window.matchMedia(DESKTOP_QUERY).matches) {
    onFirstView(block, animateIn, 0.2);
  } else {
    animateIn();
  }
}
