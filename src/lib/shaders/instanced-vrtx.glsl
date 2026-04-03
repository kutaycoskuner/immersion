precision highp float;

attribute vec3 instancePos;

varying vec2 vUv;

void main() {

    // pass to fragment directly
    vUv = uv;

    // ----- based on camera but ignore pitch (y-axis rotation)
    // camera forward direction in world space
    vec3 camForward = normalize(vec3(
        -viewMatrix[0][2],
        -viewMatrix[1][2],
        -viewMatrix[2][2]
    ));

    // remove pitch (ignore Y)
    camForward.y = 0.0;
    camForward = normalize(camForward);

    // build billboard basis
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), camForward));
    vec3 up = vec3(0.0, 1.0, 0.0);


    // ----- based on camera
    // vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    // vec3 up    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

    // construct vertex
    vec3 worldPos =
        instancePos +
        right * position.x +
        up * position.y;

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}