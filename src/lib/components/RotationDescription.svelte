<script lang="ts">
	// -----------------------------------------------------------------------------------------
	//   author          : Kutay Coskuner
	//   ai-contributors : Claude Opus 5.5 (claude-opus-5-5)
	//   last update     : 2026-11-20
	//   disclaimer      : Provided as is, without warranty of any kind; use at your own risk.
	//                     Check outputs before relying on them.
	// -----------------------------------------------------------------------------------------
	// Description of the transformations page (rotation): the live formulas for the typed
	// angles, the typed point and the stage t -- the three axis rotations, their product
	// R = Rz Ry Rx, the stage R(t) with t times every angle, the rotated point and its distance
	// to the origin; the words around them are ROTATION_SECTIONS in $lib/transformDescriptions,
	// laid out by DescriptionSections.svelte.
	import DescriptionSections from '$lib/components/DescriptionSections.svelte';
	import { ROTATION_SECTIONS } from '$lib/transformDescriptions';
	import { AXIS_COLORS } from '$lib/viewGizmo/views';
	import { apply, rotation, type Mat4 } from '$lib/transformMath';
	import { POINT_COLOR, homogeneous } from '$lib/stores/transform';
	import { colored, num } from '$lib/vectorTex';
	import type { Vec3 } from '$lib/vectorMath';

	let { angles, point, t }: { angles: Vec3; point: Vec3; t: number } = $props();

	const cx = (s: string | number) => colored(AXIS_COLORS.x, s);
	const cy = (s: string | number) => colored(AXIS_COLORS.y, s);
	const cz = (s: string | number) => colored(AXIS_COLORS.z, s);

	const rows = (m: (string | number)[][]) =>
		`\\begin{bmatrix} ${m.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
	const numeric = (m: Mat4) => rows(m.map((r) => r.map(num)));
	const column = (v: number[]) => `\\begin{bmatrix} ${v.map(num).join(' \\\\ ')} \\end{bmatrix}`;
	const deg = (v: number) => `${v.toFixed(1)}^\\circ`;

	const C = '\\cos\\theta';
	const S = '\\sin\\theta';
	const p = colored(POINT_COLOR, 'p');
	const pMoved = colored(POINT_COLOR, "p'");

	// the three axis rotations, symbolic (the kept axis in its colour)
	const rx = `R_${cx('x')}(\\theta) = ${rows([
		[cx(1), 0, 0, 0],
		[0, C, `-${S}`, 0],
		[0, S, C, 0],
		[0, 0, 0, 1]
	])}`;
	const ry = `R_${cy('y')}(\\theta) = ${rows([
		[C, 0, S, 0],
		[0, cy(1), 0, 0],
		[`-${S}`, 0, C, 0],
		[0, 0, 0, 1]
	])}`;
	const rz = `R_${cz('z')}(\\theta) = ${rows([
		[C, `-${S}`, 0, 0],
		[S, C, 0, 0],
		[0, 0, cz(1), 0],
		[0, 0, 0, 1]
	])}`;

	/** R_z(θz) R_y(θy) R_x(θx) with the angles written in. */
	const product = (a: Vec3) =>
		`R_${cz('z')}(${cz(deg(a.z))}) \\, R_${cy('y')}(${cy(deg(a.y))}) \\, R_${cx('x')}(${cx(deg(a.x))})`;

	const formulas = $derived.by(() => {
		const staged = { x: angles.x * t, y: angles.y * t, z: angles.z * t };
		const m = rotation(angles, t);
		const point4 = homogeneous(point);
		const moved = apply(m, point4);
		const length = (v: number[]) => num(Math.hypot(v[0], v[1], v[2]));
		return {
			point: `${p} = ${column(point4)}`,
			rx,
			ry,
			rz,
			values: `R = ${product(angles)} = ${numeric(rotation(angles, 1))}`,
			stageGeneral: `R(t) = R_${cz('z')}(t \\, ${cz('\\theta_z')}) \\, R_${cy('y')}(t \\, ${cy('\\theta_y')}) \\, R_${cx('x')}(t \\, ${cx('\\theta_x')})`,
			stageValues: `R(${num(t)}) = ${product(staged)} = ${numeric(m)}`,
			apply: `${pMoved} = R(${num(t)}) \\, ${p} = ${numeric(m)} ${column(point4)} = ${colored(POINT_COLOR, column(moved))}`,
			lengths: `|${p}| = ${length(point4)} \\qquad |${pMoved}| = ${length(moved)}`
		};
	});
</script>

<DescriptionSections sections={ROTATION_SECTIONS} {formulas} />
