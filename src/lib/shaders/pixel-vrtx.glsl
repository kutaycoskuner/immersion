// precision highp float;

varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;

    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos,1.0);
}