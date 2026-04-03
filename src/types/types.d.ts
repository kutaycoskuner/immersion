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

declare module '*.svx' {
  import type { SvelteComponentTyped } from 'svelte';
  const component: SvelteComponentTyped;
  export default component;
}