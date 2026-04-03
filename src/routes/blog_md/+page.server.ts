// export function load({ cookies }) {
// 	const visited = cookies.get('visited');
// 	cookies.set('visited', 'true', { path: '/' });

// 	return {
// 		visited: visited === 'true'
// 	};
// }


// @/routes/api/posts/+page.server.ts
import type { Post } from '$lib/types'

export async function load({ fetch }) {
	const response = await fetch('api/posts')
	const posts: Post[] = await response.json()
	return { posts }
}