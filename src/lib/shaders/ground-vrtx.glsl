varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
    // -----------------------------
    // pass these to fragment
    // -----------------------------
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz; // world position

    // -----------------------------
    // apply matrices
    // -----------------------------
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

