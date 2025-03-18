import { defineConfig } from "vitest/config";
import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    plugins: [sveltekit(), glsl()],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },

    build: {
		chunkSizeWarningLimit: 800,
	},
});
