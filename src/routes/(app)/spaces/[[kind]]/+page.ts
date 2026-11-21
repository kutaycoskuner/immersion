// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-21
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// The step between coordinate spaces in the address, so each has a link of its own:
// /spaces (local -> world), /spaces/local-to-world, /spaces/orthographic,
// /spaces/perspective. One route with an optional part, so switching keeps the page;
// `entries` lists them for the static build; an unknown name is a 404.
import { SPACE_GROUPS, kindEntries, loadKind } from '$lib/transformKinds';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => kindEntries(SPACE_GROUPS);

export const load: PageLoad = ({ params }) => ({ kind: loadKind(SPACE_GROUPS, params.kind) });
