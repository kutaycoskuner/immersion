// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : unknown (before 2026-11-14), Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Vite config: SvelteKit + GLSL imports, the $content alias, the version / build date shown in
// the bottom-left bar (src/lib/components/IconButtons.svelte) and the unit test pattern.
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';
import path from 'path';
import pkg from './package.json';

// shown in the bottom-left bar: the version from package.json and the day the site was built
// (a deploy builds it, so the build date is the site's last update)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const now = new Date();
const buildDate = `${String(now.getDate()).padStart(2, '0')}-${MONTHS[now.getMonth()]}-${now.getFullYear()}`;

export default defineConfig({
	plugins: [sveltekit(), glsl()],

	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
		__BUILD_DATE__: JSON.stringify(buildDate)
	},

	// the dev server must not watch the symlinked folders (other repos with their node_modules,
	// the docs repo): walking them on OneDrive keeps every request waiting
	server: {
		watch: {
			ignored: ['**/.linked_projects/**', '**/_documentation/**', '**/build/**', '**/docs/**']
		},
		// the origami models are imported from static/origami ($lib/origami/models.ts), but
		// SvelteKit lets the dev server read only src, routes, .svelte-kit and node_modules;
		// this adds that one folder (the build does not check this list)
		fs: {
			allow: ['static/origami']
		}
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

	resolve: {
		alias: {
			// maps $content to the src/content directory
			$content: path.resolve('./src/content')
		}
	},

	build: {
		chunkSizeWarningLimit: 800
	}
});
