// precision highp float
uniform vec3 uColor;
uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;
uniform sampler2D uMap;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

vec3 quantizeColor(vec3 color, float levels) {
    return floor(color * levels) / levels;
}

void main() {

    // variables
    // ----------------------------------------------------------
    float quantizationLevels = 5.0;

    // lighting parameters calculation
    // ----------------------------------------------------------
    vec3    lightDir = normalize(uPointLightPos - vWorldPos);
    float   diffuse = max(dot(vNormal, lightDir), 0.0);
    vec3    lighting = (diffuse * uPointLightColor + uAmbient);

    // sample base color
    // ----------------------------------------------------------
    vec4    baseColor = texture2D(uMap, vUv);



    // quantize lighting
    // ----------------------------------------------------------
    vec3 qLighting = quantizeColor(lighting, quantizationLevels);
    if(length(qLighting) <= 0.05) qLighting = uAmbient;


    // calculate illumination
    // ----------------------------------------------------------
    vec3 illumination = baseColor.xyz * qLighting;
    gl_FragColor = vec4(illumination, 1.0);

}


