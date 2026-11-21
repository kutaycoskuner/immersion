// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The fold model in the address, so each has a link of its own: /origami (the first model),
// /origami/dodecahedron, /origami/cube, ... One route with an optional part, so switching
// keeps the page. `entries` lists every bundled model for the static build; an unknown name
// gives the 404 page.
import { error } from '@sveltejs/kit';
import { DEFAULT_MODEL, MODELS, bundledModel } from '$lib/origami/models';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => MODELS.map((m) => ({ model: m.id }));

export const load: PageLoad = ({ params }) => {
	const id = params.model ?? DEFAULT_MODEL;
	if (!bundledModel(id)) error(404, `unknown fold model "${params.model}"`);
	return { id };
};
