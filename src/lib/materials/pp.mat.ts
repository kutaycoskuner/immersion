import { Vector2, ShaderMaterial} from 'three';
import vertexShader from '$lib/shaders/pp-vrtx.glsl?raw';
import fragmentShader from '$lib/shaders/pp-frag.glsl?raw';

export const PostProcessMaterial = new ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	uniforms: {
		uTexColor: { value: null }, 	// <-- assign later
		uTexScrDepth: { value: null }, 	// <-- assign later
		uTexObjDepth: { value: null }, 	// <-- assign later
        uTexNormal: { value: null }, 	// <-- assign later
		
        uCameraFar: { value: null },
		uCameraNear: { value: null },

		uResolution: { value: new Vector2(800, 600) },  // default screen size
		uOutlineThickness: { value: 1.0 },              // default outline thickness in pixels
		uOutlineStrength: { value: 1.0 }                // default outline intensity
	}
});
