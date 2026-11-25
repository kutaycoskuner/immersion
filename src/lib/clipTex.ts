// -----------------------------------------------------------------------------------------
//   author          : Kutay Coskuner
//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
//   last update     : 2026-11-24
//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
//                     Check outputs before relying on them.
// -----------------------------------------------------------------------------------------
// KaTeX pieces shared by the projections' descriptions (PerspectiveDescription.svelte,
// OrthographicDescription.svelte): column vectors and matrices as LaTeX, and the clip test
// of a clip-space point written out per axis (-w <= x <= w ...) with a tick or a cross and
// the verdict, inside or outside the view volume.
import { AXIS_COLORS } from '$lib/viewGizmo/views';
import { clipTest, type Mat4, type Vec4 } from '$lib/transformMath';
import { colored, num } from '$lib/vectorTex';

/** A column vector. */
export const col = (v: (string | number)[]) =>
	`\\begin{bmatrix} ${v.join(' \\\\ ')} \\end{bmatrix}`;

/** A matrix of LaTeX pieces or numbers. */
export const rows = (m: (string | number)[][]) =>
	`\\begin{bmatrix} ${m.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;

/** A matrix of numbers, rounded for reading. */
export const numeric = (m: Mat4) => rows(m.map((r) => r.map(num)));

/** The clip test of a clip-space point: one line per axis, then the verdict. */
export function clipTestTex(p: Vec4): string {
	const w = p[3];
	const result = clipTest(p);
	if (w <= 0) return `w = ${num(w)} \\le 0: \\text{ behind the eye, outside}`;
	const line = (axis: 'x' | 'y' | 'z', v: number) =>
		`${colored(AXIS_COLORS[axis], `-w \\le ${axis} \\le w`)}: \\; ${num(-w)} \\le ${num(v)} \\le ${num(w)} \\;\\; ${result[axis] ? '\\checkmark' : '\\times'}`;
	return `\\begin{aligned} ${line('x', p[0])} \\\\ ${line('y', p[1])} \\\\ ${line('z', p[2])} \\end{aligned} \\quad \\Rightarrow \\quad \\text{${result.inside ? 'inside' : 'outside'}}`;
}
