precision highp float;

uniform sampler2D uTexColor;        // color render target
uniform sampler2D uTexScrDepth;
uniform sampler2D uTexObjDepth;
uniform sampler2D uTexNormal;

uniform float uCameraNear;
uniform float uCameraFar;

uniform vec2 uResolution;           // screen size
uniform float uOutlineThickness;    // e.g., 1.0..3.0 pixels
uniform float uOutlineStrength;     // intensity of the outline

varying vec2 vUv;

// --------------------------------------------
// depth linearization
// --------------------------------------------
// Converts non-linear depth to linear [0..1]
float linearizeDepth(float depth) {
    float z = depth * 2.0 - 1.0;
    return (2.0 * uCameraNear * uCameraFar) /
           (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
}

// --------------------------------------------
// read normal
// --------------------------------------------
vec3 getNormal(vec2 uv){
    vec3 n = texture2D(uTexNormal, uv).rgb;
    return n * 2.0 - 1.0;
}

// --------------------------------------------
// depth edge detection
// --------------------------------------------
float detectDepthEdge(vec2 uv, vec2 texel){

    float centerDepth = linearizeDepth(texture2D(uTexScrDepth, uv).r);
    float diff = 0.0;
    float d;

    d = linearizeDepth(texture2D(uTexScrDepth, uv + vec2(texel.x,0.0)).r);
    diff = max(diff, abs(centerDepth - d));

    d = linearizeDepth(texture2D(uTexScrDepth, uv - vec2(texel.x,0.0)).r);
    diff = max(diff, abs(centerDepth - d));

    d = linearizeDepth(texture2D(uTexScrDepth, uv + vec2(0.0,texel.y)).r);
    diff = max(diff, abs(centerDepth - d));

    d = linearizeDepth(texture2D(uTexScrDepth, uv - vec2(0.0,texel.y)).r);
    diff = max(diff, abs(centerDepth - d));

    // Apply tolerance
    // todo: uniformize outline tolerance
    if(diff < 1.5) {
        diff = 0.0;
    }

    return diff;
}

// --------------------------------------------
// normal edge detection
// --------------------------------------------
float detectNormalEdge(vec2 uv, vec2 texel){

    vec3 center = getNormal(uv);
    float diff = 0.0;

    vec2 offsets[4];
    offsets[0] = vec2(texel.x,0.0);
    offsets[1] = vec2(-texel.x,0.0);
    offsets[2] = vec2(0.0,texel.y);
    offsets[3] = vec2(0.0,-texel.y);

    for(int i=0;i<4;i++){

        vec2 uvOffset = uv + offsets[i];

       float objectDepth = linearizeDepth(texture2D(uTexObjDepth, vUv).r);
       float sceneDepth  = linearizeDepth(texture2D(uTexScrDepth, vUv).r); 

        // discard outlines where object is fully behind scene
        if(objectDepth - sceneDepth > 0.001){
            continue;
        }

        vec3 n = getNormal(uvOffset);
        diff = max(diff, 1.0 - dot(center,n));
    }

    return diff;
}


void main() {
    //      assign variables
    // -------------------------------------------------------------
    vec4 color = texture2D(uTexColor, vUv);

    vec2 texel = uOutlineThickness / uResolution;

    float depthEdge  = detectDepthEdge(vUv, texel);
    float normalEdge = detectNormalEdge(vUv, texel);

        // Assign colors for edges
    // vec3 depthColor  = vec3(1.0, 0.0, 0.0); // red for depth edges (outer)
    // vec3 normalColor = vec3(0.0, 1.0, 0.0); // green for normal edges (inner)

    // Combine edges: depth outer, normal inner
    // vec3 edgeColor = max(depthEdge * depthColor, normalEdge * normalColor);
    vec3 outlineColor = vec3(1.0); 

    depthEdge  = clamp(depthEdge  * uOutlineStrength, 0.0, .8);
    normalEdge = clamp(normalEdge * uOutlineStrength, 0.0, 1.0);

    float edge = max(depthEdge, normalEdge);


    //      debug finals
    // -------------------------------------------------------------
    //  print color
    // ------------------------------------------
    // gl_FragColor = color;


    //  print obj depth
    // ------------------------------------------
    // float centerObjDepth = linearizeDepth(texture2D(uTexObjDepth, vUv).r);
    // float normalizedDepth = (centerObjDepth - uCameraNear) / (uCameraFar - uCameraNear);
    // normalizedDepth = 1.0 - normalizedDepth;  // invert: closest → white, farthest → black
    // gl_FragColor = vec4(vec3(normalizedDepth), 1.0);
    
    
    //  print screen depth
    // ------------------------------------------
    // float centerDepth = linearizeDepth(texture2D(uTexScrDepth, vUv).r);
    // float normalizedDepth = (centerDepth - uCameraNear) / (uCameraFar - uCameraNear);
    // normalizedDepth = 1.0 - normalizedDepth;  // invert: closest → white, farthest → black
    // gl_FragColor = vec4(vec3(normalizedDepth), 1.0);


    // print obj normals
    // ------------------------------------------
    // // read stored normal (0..1)
    // vec3 normal = texture2D(uTexNormal, vUv).rgb;
    // // decode to [-1..1]
    // normal = normal * 2.0 - 1.0;
    // // visualize: map back to [0..1]
    // normal = normal * 0.5 + 0.5;
    // gl_FragColor = vec4(normal, 1.0);

    // final color
    // ------------------------------------------
    // Blend outline with original color
    // vec3 finalColor = mix(vec3(0.1), edgeColor, edge);
    vec3 finalColor = mix(color.rgb, outlineColor, edge);
    gl_FragColor = vec4(finalColor, 1.0);
}