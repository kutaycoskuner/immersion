export type Categories = 'sveltekit' | 'svelte'

export type Post = {
	title: string
	revision: string
	slug: string
	description: string
	updated: string
	categories: Categories[]
	visibility: boolean
}