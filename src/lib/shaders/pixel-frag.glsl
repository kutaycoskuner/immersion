precision highp float;

uniform vec3 uPointLightPos;
uniform vec3 uPointLightColor;
uniform vec3 uAmbient;
uniform vec3 uBaseColor;

varying vec3 vWorldPos;
varying vec3 vNormal;

vec3 quantizeColor(vec3 color, float levels) {
    return floor(color * levels) / levels;
}

void main() {
    // variables
    // -------------------------------------------------------------
    float quantLevels = 4.0;

    // lighting parameteres
    // -------------------------------------------------------------
    vec3 lightDir = normalize(uPointLightPos - vWorldPos);
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);

    // illumination
    // -------------------------------------------------------------
    vec3 lighting = diffuse * uPointLightColor + uAmbient;


    // color quantization
    // -------------------------------------------------------------
    vec3 qLighting = quantizeColor(lighting, quantLevels);
    // fallback if quantized lighting is too low
    if(length(qLighting) <= 0.05) {
        qLighting = uAmbient;
    }
    qLighting = lighting;

    // final color
    vec3 illumination = uBaseColor * qLighting;

    gl_FragColor = vec4(illumination, 1.0);
}