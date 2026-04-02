varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// attribute float heightOffset;
// varying float vHeight;

// void main() {
//     vHeight = heightOffset;
//     vec3 newPosition = position;
//     newPosition.z += heightOffset; 
//     vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
//     gl_Position = projectionMatrix * viewMatrix * worldPosition;
//     // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
// }