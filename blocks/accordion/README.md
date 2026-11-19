# Accordion

A list of collapsible items. Each item has a heading that toggles a content panel.
All items start collapsed and open independently, so several can be open at the same time.

Files:

- `accordion.js` decorates the authored table into accessible markup.
- `accordion.css` styles and animates it.

This README is not served: `.hlxignore` excludes `*.md`.

## Block structure

### What the backend delivers

Every row of the authored table becomes one `div`, and every cell becomes a child `div`.
Before `decorate()` runs, `decorateBlock()` in `scripts/aem.js` wraps bare text in a cell with `<p>`. Plain text in a cell therefore reaches the block as `<div><p>…</p></div>`.

```html
<div class="accordion block">
  <div>                                   <!-- row = item -->
    <div><p>Question one</p></div>        <!-- cell 1 = heading -->
    <div><p>Answer one…</p></div>         <!-- cell 2+ = body -->
  </div>
  <div>…</div>
</div>
```

### What `decorate()` produces

```html
<div class="accordion block">
  <div class="accordion-item">
    <h3 class="accordion-item-heading">
      <button type="button" id="accordion-button-1" class="accordion-item-button"
              aria-expanded="false" aria-controls="accordion-panel-1">
        <span class="accordion-item-label">Question one</span>
        <span class="accordion-item-icon" aria-hidden="true"></span>
      </button>
    </h3>
    <div id="accordion-panel-1" class="accordion-item-panel"
         role="region" aria-labelledby="accordion-button-1">
      <div class="accordion-item-body"><p>Answer one…</p></div>
    </div>
  </div>
  …
</div>
```

This follows the [WAI-ARIA APG accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

## How the JavaScript works

`decorate(block)` loops over the rows:

1. **Heading cell (first cell).** A row with an empty first cell is skipped.
   - **Heading level:** if the author typed a heading (H2–H6) in the cell, that level is kept. Otherwise the block uses `h3`.
   - **Button content:** `<p>` and heading wrappers are unwrapped, because a `<button>` may only contain inline content. Inline formatting such as bold and italic is kept. Links are reduced to plain text, because a link inside a button is invalid HTML.
2. **Body cells (second cell onward).** The content of all remaining cells is moved, in order, into one `.accordion-item-body`. The nodes are moved, not copied with `innerHTML`, so anything the page scripts already decorated stays as it is. This includes buttons made by `decorateButtons`, optimised pictures and icons.
3. **Rows with no body.** If a row has a heading but no body, it is shown as a plain, non-clickable heading (`.accordion-item-static`). Nothing is created that would expand to an empty panel.
4. **IDs.** A module-level counter gives each button and panel a unique `id`, even when a page has several accordions. These ids link `aria-controls` and `aria-labelledby`.
5. **Toggle.** Clicking a button flips `aria-expanded` and toggles `is-open` on the `.accordion-item`. The CSS reacts to that class.
6. **Keyboard.** Enter and Space work natively because the trigger is a real `<button>`. One `keydown` listener on the block adds the following keys:

   | Key            | Action                                         |
   | -------------- | ---------------------------------------------- |
   | Tab / Shift+Tab | Move through headings and any open panel content |
   | Enter / Space  | Toggle the focused item                        |
   | Arrow Down     | Focus next heading (wraps to first)            |
   | Arrow Up       | Focus previous heading (wraps to last)         |
   | Home / End     | Focus first / last heading                     |

The script has no imports and no dependencies.

## How the CSS works

All selectors are scoped to `.accordion`.

- **Custom properties.** `--accordion-border-color`, `--accordion-gap` and `--accordion-duration` are set on `.accordion`, so a section or variant can override them. Fonts and colours come from the global tokens in `styles/styles.css` (`--heading-font-size-xs`, `--link-color`, `--link-hover-color`).
- **Dividers.** The block has a top border and each item has a bottom border.
- **Button reset.** The button is full width, left-aligned and has no default border, background or font. Its label and icon sit at opposite ends using flexbox. `:focus-visible` shows a clear outline for keyboard users.
- **Icon.** The plus/minus sign is drawn with two CSS bars (`::before` and `::after`), so no icon file is needed. When the item opens, the vertical bar rotates flat and the plus becomes a minus.
- **Open/close animation.** The panel is a one-row grid that changes from `grid-template-rows: 0fr` to `1fr`. This animates to the content's natural height without measuring it in JS. Collapsed panels also get `visibility: hidden`, which removes their links from the tab order and hides them from screen readers. The visibility change is delayed until the height animation finishes.
- **Responsive.** The layout is fluid at every width. From 900px up, `--accordion-gap` increases from 16px to 24px. Font sizes come from the global tokens, which already change at the same breakpoint. Images in the body are capped at the panel width.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, the animations are turned off.

## Authoring in DA.live

Insert a table. The first row holds only the block name, **Accordion**, in a single merged cell. Each row after that is one item:

| Column 1 | Column 2 |
| -------- | -------- |
| Heading (the clickable title) | Content shown when the item is expanded |

### Exact table structure

```
+--------------------------------------------------------------+
| Accordion                                                    |
+-----------------------------+--------------------------------+
| Heading of item 1           | Content of item 1              |
+-----------------------------+--------------------------------+
| Heading of item 2           | Content of item 2              |
+-----------------------------+--------------------------------+
| Heading of item 3           | Content of item 3              |
+-----------------------------+--------------------------------+
```

### Example with multiple items

```
+---------------------------------------------------------------------------+
| Accordion                                                                 |
+-------------------------------------+-------------------------------------+
| What is Edge Delivery Services?     | Edge Delivery Services is Adobe's   |
|                                     | platform for publishing fast sites  |
|                                     | from document-based content.        |
+-------------------------------------+-------------------------------------+
| How do I preview my changes?        | Use the Preview button in DA.live.  |
|                                     | Your page is then available at:     |
|                                     |  • {branch}--{repo}--{owner}        |
|                                     |    .aem.page/{path}                 |
+-------------------------------------+-------------------------------------+
| Can I add images and links?         | Yes. The content cell accepts any   |
|                                     | rich text: paragraphs, lists,       |
|                                     | images, links and buttons.          |
|                                     | **[Read the docs](https://www.aem.live/docs/)** |
+-------------------------------------+-------------------------------------+
```

This renders three collapsed items with the headings "What is Edge Delivery Services?", "How do I preview my changes?" and "Can I add images and links?".

### Authoring rules

- **Block name.** The first row must contain only `Accordion`. Spelling is case-insensitive.
- **Heading cell.** Keep it short; plain text is best. Bold and italic are kept. Links are turned into plain text.
  - To make the heading level fit the page outline, format the heading cell as a heading. For example, use Heading 2 when the accordion sits directly under a page H1. Unformatted text becomes an `h3`.
- **Content cell.** Accepts any rich content: paragraphs, lists, images, links, and buttons (a link formatted bold or italic).
- **Extra columns.** If a row has more than two cells, cells 2, 3 and so on are joined in order into that item's content.
- **Heading but no content.** The row appears as a plain heading that cannot be expanded.
- **Content but no heading.** The row is **dropped**, because it has nothing to click. Always fill in the first column.
- **Several accordions on one page** are fine. Each one works independently.

## Testing locally

1. Run `npx -y @adobe/aem-cli up`.
2. Open a previewed page that contains the block.
3. Check the delivered markup with `curl localhost:3000/{path}.plain.html`.
