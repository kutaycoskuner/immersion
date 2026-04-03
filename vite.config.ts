import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit(), glsl()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

	resolve: {
		alias: {
			// This maps $content to the actual src/content directory
			$content: path.resolve('./src/content')
		}
	},

	build: {
		chunkSizeWarningLimit: 800
	}
});
