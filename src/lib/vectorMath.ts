// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-14
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// Plain 3d vector math on {x, y, z} objects, shared by the vector page's math overlays
// (DotProduct.svelte, CrossProduct.svelte). The 3d scene uses THREE.Vector3 for the same
// operations; this file has no three.js dependency so the overlays stay light.

export type Vec3 = { x: number; y: number; z: number };

export function length(v: Vec3): number {
	return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/** Unit vector of v; the zero vector stays zero (instead of NaN from dividing by 0). */
export function normalize(v: Vec3): Vec3 {
	const len = length(v);
	if (len === 0) return { x: 0, y: 0, z: 0 };
	return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function dot(a: Vec3, b: Vec3): number {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** a x b, right-handed (the same handedness as three.js). */
export function cross(a: Vec3, b: Vec3): Vec3 {
	return {
		x: a.y * b.z - a.z * b.y,
		y: a.z * b.x - a.x * b.z,
		z: a.x * b.y - a.y * b.x
	};
}

/** Angle between a and b in degrees; 0 when either is the zero vector. */
export function angleDeg(a: Vec3, b: Vec3): number {
	const lenProduct = length(a) * length(b);
	if (lenProduct === 0) return 0;
	// clamped: rounding can push the cosine just past +-1, and acos would return NaN
	const cos = Math.min(1, Math.max(-1, dot(a, b) / lenProduct));
	return (Math.acos(cos) * 180) / Math.PI;
}
