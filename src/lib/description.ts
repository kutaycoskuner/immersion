// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-19
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Shape of a page description (rendered by DescriptionSections.svelte): sections with a
// title and blocks; text is plain with inline math between $ signs, a { formula } block names
// a live formula the page computes. The texts themselves are data files per page
// (vectorDescriptions.ts, transformDescriptions.ts).

export type Block = { text: string } | { formula: string };
export interface Section {
	title: string;
	blocks: Block[];
}
