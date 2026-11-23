import { decorateButtons } from '../../scripts/scripts.js';

/**
 * A cell is "link only" when its visible text comes entirely from links.
 * @param {Element} cell
 */
function isLinkOnly(cell) {
  const links = [...cell.querySelectorAll('a[href]')];
  // lists of links (e.g. footer link lists) stay as lists
  if (!links.length || cell.querySelector('picture, img, ul, ol, .icon')) return false;
  const linkText = links.map((a) => a.textContent.trim()).join('');
  return cell.textContent.replace(/\s+/g, '') === linkText.replace(/\s+/g, '');
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // Rows of plain links render as a row of buttons (e.g. a lone "Apply Now")
  if (cells.length && cells.every(isLinkOnly)) {
    block.classList.add('button-list');
    const items = cells.flatMap((cell) => [...cell.querySelectorAll('a[href]')].map((a) => {
      const p = document.createElement('p');
      p.append(a);
      return p;
    }));
    block.replaceChildren(...items);
    decorateButtons(block);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
