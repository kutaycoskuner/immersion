import { Vector3, ShaderMaterial, Color } from 'three';
import vertexShader from '$lib/shaders/ground-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/ground-frag.glsl?raw';

export const groundMaterial: ShaderMaterial = new ShaderMaterial({
	vertexShader,
	fragmentShader,
	transparent: false,
	// vertexColors: false,
	side: 2, // DoubleSide
	uniforms: {
        uMap: { value: null },                              // texture map
		uColor: { value: new Color(0xbabfbb) },             // ground base color
		uPointLightPos: { value: new Vector3(0, 10, 0) },   // will update from scene
		uPointLightColor: { value: new Color(1, 1, 1) },    // white light
		uAmbient: { value: new Color(0.1, 0.1, 0.1) }       // ambient contribution
	}
});
