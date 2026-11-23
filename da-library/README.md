# da.live block library

Source documents for the da.live Library panel. This folder is listed in
`.hlxignore`, so it is never served from code; the documents only take effect
once they are in DA.

## 1. Upload the block docs

In da.live, open `codilar-kishan/eds-training`, create the folder
`/library/blocks`, and drag the files from `da-library/blocks/` into it
(DA accepts `.html` uploads). You get one doc per block:

| Doc | Variants in it |
| --- | --- |
| `hero-video` | autoplay, mute, loop |
| `columns` | button row, text-center + font-book |
| `parallax-image` | image-left + speed-slow + mobile-text-first, image-right + speed-slow |
| `pathway-cards` | default |
| `rich-background` | no-gradient + center-right + float |
| `slider-carousel` | shield + brand-refresh |
| `section-metadata` | background |

Replace each `[Replace with image]` cell with a real image after upload.
Every block has a `library-metadata` description that authors see from the
info icon.

## 2. Create the `blocks` sheet

New sheet at `/library/blocks` with columns `name` and `path`:

| name | path |
| --- | --- |
| Hero Video | `https://content.da.live/codilar-kishan/eds-training/library/blocks/hero-video` |
| Columns | `https://content.da.live/codilar-kishan/eds-training/library/blocks/columns` |
| Parallax Image | `https://content.da.live/codilar-kishan/eds-training/library/blocks/parallax-image` |
| Pathway Cards | `https://content.da.live/codilar-kishan/eds-training/library/blocks/pathway-cards` |
| Rich Background | `https://content.da.live/codilar-kishan/eds-training/library/blocks/rich-background` |
| Slider Carousel | `https://content.da.live/codilar-kishan/eds-training/library/blocks/slider-carousel` |
| Section Metadata | `https://content.da.live/codilar-kishan/eds-training/library/blocks/section-metadata` |

## 3. Point the site config at it

Open `https://da.live/config#/codilar-kishan/eds-training/`, add a tab named
`library`, and add a row:

| title | path |
| --- | --- |
| Blocks | `https://content.da.live/codilar-kishan/eds-training/library/blocks.json` |

Reload the editor; the Library panel now lists the blocks.
Reference: https://www.aem.live/docs/ew/administering/set-up-library

## Authoring notes

- Italic text is the brand's serif accent (e.g. *TOWARDS*, *CHANGE*), not emphasis.
- A link alone on its own line becomes a red pill button.
- Put several Rich Background blocks one after another in the same section to
  get the sticky stacking effect.
- End each coloured section with Section Metadata, `background` = `crimson` or `off-white`.
