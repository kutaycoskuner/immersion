# Page layout

The building blocks of the framed pages (vectors, transformations), in the style of imge's matrix calculator panels.

## Framed areas

- **`Area.svelte`**: one framed area: a faint 1 px frame with pixelated corners (the corner pixel left empty), no shadow, the title small and lower case in a gap of the top line at the left
    - `scroll`: the body scrolls on its own with a thin, faint scrollbar (text areas); without it the content fills the body (a 3d viewport)
- **`SplitAreas.svelte`**: two areas side by side with a draggable gap between them
    - drag the gap to resize, double-click to reset, or focus it (Tab) and use the arrow keys
    - the split is remembered per page in the browser (`storageKey`)
    - below 720 px width the areas stack, the first on top
- the page itself is `position: fixed` between the top navigation and the bottom-left bar

```svelte
<SplitAreas storageKey="immersion.my-page.split">
	{#snippet first()}<Area title="I. description" scroll>...</Area>{/snippet}
	{#snippet second()}<Area title="II. viewport"><MyScene /></Area>{/snippet}
</SplitAreas>
```

## Descriptions

- **`DescriptionSections.svelte`** renders a description: sections separated by dashed lines, each with a small title, text with inline KaTeX math and display formulas
- the texts are data files (`vectorDescriptions.ts`, `transformDescriptions.ts`), shaped as in `src/lib/description.ts`:
    - `{ text: 'the angle $\\theta$ between ...' }`: plain text, math between `$` signs
    - `{ formula: 'values' }`: a live formula; the page's component computes it by name from the current values and passes `formulas` in
- math is rendered with KaTeX (`src/lib/vectorTex.ts`: `tex`, `rich`, `colored`, `num`, `columnVector`); there is no MathJax any more
- `vectorDescriptions.spec.ts` renders every text of every page and fails on a KaTeX error

## No sideways scrolling

- **`fitWidth`** (`src/lib/actions/fitWidth.ts`): `use:fitWidth={content}` shrinks an element's font until its content fits its width, and grows it back when there is room; it re-fits on resize and when `content` changes
- used for every description formula and the matrix rows of the transformations page; anything inside must be sized in em (KaTeX and `MatrixGrid` are)
- it stops at 45 % of the normal size; narrower than that, the right edge is cut

## No scrollbar that moves a few pixels

- **`fitHeight`** (`src/lib/actions/fitHeight.ts`), on every scrolling `Area`: when the content is only a little too tall (it still fits at 75 % of its size or more), the whole content is scaled down to fit instead of showing a scrollbar
- content that needs more (a long description) keeps its size and scrolls as before
- it scales with CSS `zoom` on the content, so rem-sized gaps and buttons shrink too and the area really stops overflowing; it re-fits when the area or the content changes size
- the general rule (rows shrink to the width, panels scale to the height, long content scrolls) is the shared skill `fit-instead-of-scroll`

## Matrices with inputs

**`MatrixGrid.svelte`**: a matrix or column vector in square brackets as HTML, so cells can be inputs. Each cell is `{ value, color?, label?, dim?, edit? }`; with `edit` the cell is an input that calls it with the typed number, clamped to ±`limit`.
