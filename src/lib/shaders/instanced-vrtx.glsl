precision highp float;

attribute vec3 instancePos;


void main() {
    // transform vertex by instanceMatrix
    vec4 worldPosition = vec4(position + instancePos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}