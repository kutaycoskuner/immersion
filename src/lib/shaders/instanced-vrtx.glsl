precision highp float;

attribute vec3 instancePos;

uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;

uniform sampler2D uGroundTex;
uniform float uTime;
uniform float uGroundHalfSize;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vLeafIllumination;

vec3 quantizeColor(vec3 color, float levels) {
    return floor(color * levels) / levels;
}


void main() {

    // -------------------------------------------------------------
    // billboarding
    // -------------------------------------------------------------
    // ----- based on camera but ignore pitch (y-axis rotation)
    // camera forward direction in world space
    vec3 camForward = normalize(vec3(
        -viewMatrix[0][2],
        -viewMatrix[1][2],
        -viewMatrix[2][2]
    ));

    // remove pitch (ignore Y)
    // camForward.y = 0.0;
    camForward = normalize(camForward);

    // build billboard basis
    // vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), camForward));
    // vec3 up = vec3(0.0, 1.0, 0.0);


    // ----- based on camera
    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(worldUp, camForward));
    vec3 up = normalize(cross(camForward, right));

    // construct vertex
    vec3 worldPos =
        instancePos +
        right * position.x +
        up * position.y;

    // -------------------------------------------------------------
    // pass to fragment directly 1
    // -------------------------------------------------------------
    vUv = uv;

    // -------------------------------------------------------------
    // grass sway animation
    // -------------------------------------------------------------
    float heightMask = vUv.y;          // 0 bottom, 1 top
    float windStrength = .02;

    float wind =
        sin(uTime * 2.0 + instancePos.x * 0.5 + instancePos.z * 0.5)
        * windStrength;

    worldPos += right * wind * heightMask;

    // -------------------------------------------------------------
    // pass to fragment directly 2
    // -------------------------------------------------------------
    // vNormal = normalize(mat3(modelMatrix) * normal);
    vNormal = vec3(0.0, 1.0, 0.0);
    // vNormal = normalize(cross(right, up));

    vWorldPos = worldPos;

    // -------------------------------------------------------------
    // calculate lighting here as we want uniform color on same leaf
    // -------------------------------------------------------------
    float groundSize = uGroundHalfSize * 2.0;

    // uv
    // (0,1) ----------- (1,1)
    // |                 |
    // |                 |
    // |                 |
    // (0,0) ----------- (1,0)
    vec2 groundUV = (instancePos.xz + uGroundHalfSize) / groundSize;
    groundUV.y = 1.0 - groundUV.y;

    // sample base color
    vec3 baseColor = texture2D(uGroundTex, groundUV).rgb;

    float quantizationLevels = 5.0;
    vec3 lightDir = normalize(uPointLightPos - instancePos);
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    vec3 lighting = diffuse * uPointLightColor + uAmbient;

    // // quantize lighting
    vec3 qLighting = quantizeColor(lighting, quantizationLevels);
    if(length(qLighting) <= 0.05) qLighting = uAmbient;

    vLeafIllumination = qLighting * baseColor;


    // -------------------------------------------------------------
    // apply matrices
    // -------------------------------------------------------------
    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
}