uniform vec3 uColor;
varying vec2 vUv;

void main() {
    gl_FragColor = vec4(uColor, 1.0);
}

// precision highp float;

// varying float vHeight;

// void main() {
//     // visualize the attribute as a color
//     gl_FragColor = vec4(vHeight, 0.0, 1.0 - vHeight, 1.0);
// }