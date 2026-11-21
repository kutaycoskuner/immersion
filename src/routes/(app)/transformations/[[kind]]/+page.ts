// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The transformation in the address, so each one has a link of its own to send:
// /transformations (translation), /transformations/translation, /transformations/scaling,
// /transformations/rotation. One route with an optional part, so switching between them
// keeps the page (and its viewport). `entries` lists them for the static build; an unknown
// or a projection's name is a 404 (projections have their own page).
import { kindEntries, loadKind } from '$lib/transformKinds';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => kindEntries(['transformations']);

export const load: PageLoad = ({ params }) => ({
	kind: loadKind(['transformations'], params.kind)
});
