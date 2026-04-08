varying vec3 vNormal;
void main() {
    // view-space normal
    vNormal = normalize(normalMatrix * normal); 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}