uniform vec3 uColor; // Color passed from JavaScript
varying vec3 vWorldPosition;

void main() {
    float distanceFromOrigin = length(vWorldPosition);
    float opacity = 0.9 - distanceFromOrigin / 10.0;
    opacity = clamp(opacity, 0.0, 0.1);
    gl_FragColor = vec4(uColor, opacity); // Use the uniform color
}