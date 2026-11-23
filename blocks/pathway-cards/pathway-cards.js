import { toClassName } from '../../scripts/aem.js';
import { decorateButtons } from '../../scripts/scripts.js';

/**
 * Wraps a bare link (no paragraph) so it can be styled as a button.
 * @param {Element} cell
 */
function linkToButton(cell) {
  const a = cell.querySelector('a[href]');
  if (!a) return null;
  const p = document.createElement('p');
  p.append(a);
  const holder = document.createElement('div');
  holder.append(p);
  decorateButtons(holder);
  return p;
}

export default function decorate(block) {
  const header = document.createElement('div');
  header.className = 'pathway-cards-header';
  const list = document.createElement('ul');
  list.className = 'pathway-cards-grid';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = toClassName(cells[0]?.textContent);

    // optional config row: "section-title | Charge Towards Change"
    if (key === 'section-title' && !cells[0].querySelector('picture')) {
      const value = cells[1];
      if (value?.textContent.trim()) {
        const title = document.createElement('h2');
        title.className = 'pathway-cards-title';
        title.append(...(value.querySelector('h1, h2, h3, h4, h5, h6, p')?.childNodes || value.childNodes));
        header.append(title);
      }
      return;
    }

    const picture = row.querySelector('picture');
    const linkCell = cells.find((c) => c.querySelector('a[href]') && !c.querySelector('picture'));
    const textCell = cells.find((c) => c !== linkCell && !c.querySelector('picture') && c.textContent.trim());
    if (!picture && !textCell && !linkCell) return;

    const card = document.createElement('li');
    card.className = 'pathway-cards-card';

    if (picture) {
      const media = document.createElement('div');
      media.className = 'pathway-cards-image';
      picture.classList.add('shield-mask');
      media.append(picture);
      card.append(media);
    }

    if (textCell) {
      const body = document.createElement('div');
      body.className = 'pathway-cards-body';
      if (textCell.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol')) {
        body.append(...textCell.childNodes);
      } else {
        const p = document.createElement('p');
        p.append(...textCell.childNodes);
        body.append(p);
      }
      card.append(body);
    }

    if (linkCell) {
      const cta = document.createElement('div');
      cta.className = 'pathway-cards-cta';
      const button = linkToButton(linkCell);
      if (button) cta.append(button);
      card.append(cta);
    }

    list.append(card);
  });

  block.replaceChildren(...(header.children.length ? [header] : []), list);
}
