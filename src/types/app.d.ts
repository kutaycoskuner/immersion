// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Global types: SvelteKit's App namespace and the build constants from vite.config.ts.
// Module declarations (*.md, *.glsl) are in types.d.ts: they only work in a file that is not
// a module itself, and this one is (export {} below).
// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	// set in vite.config.ts: package.json version and the build day (dd-Mmm-yyyy)
	const __APP_VERSION__: string;
	const __BUILD_DATE__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
