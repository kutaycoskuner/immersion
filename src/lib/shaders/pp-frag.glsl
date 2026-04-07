precision highp float;

uniform sampler2D uTexDepth;
uniform float uCameraNear;
uniform float uCameraFar;

varying vec2 vUv;

// Converts non-linear depth to linear [0-1]
float getLinearDepth(float depth) {
    float z = depth * 2.0 - 1.0;            // back to NDC
    return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
}

void main() {
    float depth = texture2D(uTexDepth, vUv).r;
    float linearDepth = getLinearDepth(depth);

    // normalize between near and far
    float d = (linearDepth - uCameraNear) / (uCameraFar - uCameraNear);
    d = 1.0 - d;  // invert: closest → white, farthest → black

    gl_FragColor = vec4(vec3(d), 1.0);
}