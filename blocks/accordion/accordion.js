const HEADING_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const DEFAULT_HEADING_LEVEL = 3;

// Unique across every accordion on the page, so aria-controls/labelledby never collide.
let idCounter = 0;

/**
 * Builds the inline content for the toggle button from the authored label cell.
 * Block-level wrappers (p, h1-h6) are unwrapped because a button only accepts
 * phrasing content, and links are flattened to text because interactive
 * elements cannot be nested inside a button.
 * @param {Element} cell The label cell
 * @returns {Node[]} Nodes to append to the button
 */
function getLabelNodes(cell) {
  const nodes = [];
  [...cell.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'P' || HEADING_TAGS.includes(node.tagName))) {
      if (nodes.length) nodes.push(document.createTextNode(' '));
      nodes.push(...node.childNodes);
    } else {
      nodes.push(node);
    }
  });

  const fragment = document.createDocumentFragment();
  fragment.append(...nodes);
  fragment.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
  return [...fragment.childNodes];
}

/**
 * Uses the heading level the author picked, or h3 by default.
 * @param {Element} cell The label cell
 * @returns {number} Heading level 1-6
 */
function getHeadingLevel(cell) {
  const heading = cell.querySelector(HEADING_TAGS.join(','));
  return heading ? Number(heading.tagName[1]) : DEFAULT_HEADING_LEVEL;
}

/**
 * Expands or collapses one item.
 * @param {HTMLButtonElement} button The item's toggle button
 * @param {boolean} expand Whether to expand the item
 */
function setExpanded(button, expand) {
  button.setAttribute('aria-expanded', expand);
  button.closest('.accordion-item').classList.toggle('is-open', expand);
}

/**
 * Arrow Up/Down move between headers (wrapping), Home/End jump to the ends.
 * Enter and Space are handled natively by the button.
 * @param {KeyboardEvent} event The keydown event
 * @param {HTMLButtonElement[]} buttons All toggle buttons in this block
 */
function onKeydown(event, buttons) {
  const index = buttons.indexOf(event.target);
  if (index === -1) return;

  const last = buttons.length - 1;
  const targets = {
    ArrowDown: index === last ? 0 : index + 1,
    ArrowUp: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  };
  if (!(event.key in targets)) return;

  event.preventDefault();
  buttons[targets[event.key]].focus();
}

/**
 * Decorates the accordion block.
 * Each row is one item: first cell is the heading, remaining cells are the body.
 * @param {Element} block The accordion block element
 */
export default function decorate(block) {
  const buttons = [];
  const items = [];

  [...block.children].forEach((row) => {
    const [labelCell, ...bodyCells] = [...row.children];
    if (!labelCell || !labelCell.textContent.trim()) return;

    idCounter += 1;
    const buttonId = `accordion-button-${idCounter}`;
    const panelId = `accordion-panel-${idCounter}`;

    const item = document.createElement('div');
    item.className = 'accordion-item';

    const heading = document.createElement(`h${getHeadingLevel(labelCell)}`);
    heading.className = 'accordion-item-heading';

    const bodyNodes = bodyCells.flatMap((cell) => [...cell.childNodes]);
    const hasBody = bodyCells.some((cell) => cell.textContent.trim() || cell.querySelector('picture, img, video, iframe'));

    if (!hasBody) {
      // Nothing to expand: keep the authored heading visible but not interactive.
      heading.append(...getLabelNodes(labelCell));
      item.classList.add('accordion-item-static');
      item.append(heading);
      items.push(item);
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.id = buttonId;
    button.className = 'accordion-item-button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);

    const label = document.createElement('span');
    label.className = 'accordion-item-label';
    label.append(...getLabelNodes(labelCell));

    const icon = document.createElement('span');
    icon.className = 'accordion-item-icon';
    icon.setAttribute('aria-hidden', 'true');

    button.append(label, icon);
    button.addEventListener('click', () => {
      setExpanded(button, button.getAttribute('aria-expanded') !== 'true');
    });
    heading.append(button);

    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'accordion-item-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    body.append(...bodyNodes);
    panel.append(body);

    item.append(heading, panel);
    items.push(item);
    buttons.push(button);
  });

  block.addEventListener('keydown', (event) => onKeydown(event, buttons));
  block.replaceChildren(...items);
}
