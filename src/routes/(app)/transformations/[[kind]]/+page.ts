// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-20
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The transformation in the address, so each one has a link of its own to send:
// /transformations (translation), /transformations/translation, /transformations/scaling,
// /transformations/rotation. One route with an optional part, so switching between them
// keeps the page (and its viewport) instead of building a new one. An unknown name is a 404.
// `entries` lists every transformation for the static build (prerendering), so each address
// exists as its own page on the live site.
import { error } from '@sveltejs/kit';
import { KINDS } from '$lib/transformKinds';
import type { KindId } from '$lib/stores/transform';
import type { EntryGenerator, PageLoad } from './$types';

const DEFAULT: KindId = 'translation';

export const entries: EntryGenerator = () =>
	KINDS.filter((kind) => kind.ready).map((kind) => ({ kind: kind.id }));

export const load: PageLoad = ({ params }) => {
	const id = params.kind ?? DEFAULT;
	const kind = KINDS.find((k) => k.id === id && k.ready);
	if (!kind) error(404, `unknown transformation "${params.kind}"`);
	return { kind: kind.id };
};
