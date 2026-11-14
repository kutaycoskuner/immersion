// declare module '*.md' {
//   import type { SvelteComponentTyped } from 'svelte';
//   const component: SvelteComponentTyped;
//   export default component;
// }

declare module '*.md' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}

// shaders imported without ?raw: vite-plugin-glsl (vite.config.ts) turns them into strings
declare module '*.glsl' {
	const source: string;
	export default source;
}

declare module '*.svx' {
  import type { SvelteComponentTyped } from 'svelte';
  const component: SvelteComponentTyped;
  export default component;
}