// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The fold models that ship with the site: every static/origami/<id>.json, read at build time
// (import.meta.glob), so the origami page needs no request and each has its own link
// /origami/<id>. The same files are served as they are, to download, edit and drop back onto
// the page. A new model = a new JSON file there (format: foldFormat.ts); ORDER only decides
// which come first in the list.

const files = import.meta.glob('/static/origami/*.json', {
	eager: true,
	import: 'default'
}) as Record<string, unknown>;

const ORDER = ['dodecahedron', 'cube']; // the rest follow alphabetically

export interface BundledModel {
	id: string;
	/** The file as written (not checked yet: parseFoldModel does that). */
	data: unknown;
}

const idOf = (path: string) =>
	path
		.split('/')
		.pop()!
		.replace(/\.json$/, '');
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);

export const MODELS: BundledModel[] = Object.entries(files)
	.map(([path, data]) => ({ id: idOf(path), data }))
	.sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));

export const DEFAULT_MODEL = MODELS[0]?.id ?? 'dodecahedron';

export function bundledModel(id: string): BundledModel | undefined {
	return MODELS.find((m) => m.id === id);
}
