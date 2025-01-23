import * as THREE from 'three';

// Define the material using Three.js ShaderMaterial
export const fadingGridLines: THREE.ShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 uColor; // Color passed from JavaScript
        varying vec3 vWorldPosition;

        void main() {
            float distanceFromOrigin = length(vWorldPosition);
            float opacity = 0.9 - distanceFromOrigin / 10.0;
            opacity = clamp(opacity, 0.0, 0.1);
            gl_FragColor = vec4(uColor, opacity); // Use the uniform color
        }
    `,
    transparent: true,
    vertexColors: false,
    uniforms: {
        uColor: { value: new THREE.Color(0x000000) } // Default color (black)
    }
});