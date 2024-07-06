uniform vec2 uResolution;
uniform float uSize;
uniform float uTime;
uniform vec2 uCursor;
uniform vec3 uCursorDirection;
uniform sampler2D uDisplacementTexture;
uniform vec2 uResolutionDisplacement;
uniform sampler2D uParticlesTexture;
uniform sampler2D uSolarSystemTexture;
uniform float uScroll;
uniform float uTotalSections;
uniform float uNormalizePoints[20];

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vBary;
varying float vSize;
varying vec2 vParticlesUv;
varying mat4 vViewMatrix;


attribute vec3 color;
attribute float a_size;
attribute vec2 aParticlesUv;
attribute vec2 aSolarSystemUv;
attribute vec3 a_offset;
attribute vec3 a_bary;
attribute vec2 a_uv;

#include ../Includes/simplexNoise4d.glsl
#include ../Includes/simplexNoise3d.glsl


float inOutProgress(vec3 position, vec3 target, float scrollProgress) {
    // Mixed position
    float noiseOrigin = simplexNoise3d(position * 0.2);
    float noiseTarget = simplexNoise3d(target * 0.2);
    float noise = mix(noiseOrigin, noiseTarget, scrollProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.3;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = smoothstep(delay, end, scrollProgress);

    return progress;
}

float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax) {
    return outputMin + ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin));
}

vec2 rotate2d(vec2 _st, float _angle){
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

void main() {

    vUv = a_uv;

    vParticlesUv = aParticlesUv;

    vec4 particleSim = texture(uParticlesTexture, aParticlesUv);

    float time = uTime * 0.2;

    // Transform start position
    //transformed.xyz = particleSim.xyz;

    // Rotate on Scroll
    //transformed.xz = rotate2d(transformed.xz, PI2 * uScroll);


    // Circle rotating
//    transformed.x += sin(uTime);
//    transformed.y += cos(uTime);



    // Final position
    //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(particleSim.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;


    // Point size
    float sizeIn = smoothstep(0.0, 0.1, particleSim.a);
    float sizeOut = 1.0 - smoothstep(0.7, 1.0, particleSim.a);
    float size = min(sizeIn, sizeOut);

    viewPosition.xyz += position / 25.0 * uSize * size * a_size * 10.0;
    vec4 projectedPosition = projectionMatrix * viewPosition;


//    // *** Cursor Displacement ***
//    // transformed to screen space x, y in range [0, 1] and z in range [0, 1]
//    vec2 displacementUV = (projectedPosition.xy / projectedPosition.w) * 0.5 + 0.5;
//    float displacementIntensity = texture(uDisplacementTexture, displacementUV).r;
//    displacementIntensity = clamp(displacementIntensity, 0.2, 1.0);
//    if (displacementIntensity <= 0.2) {
//        displacementIntensity = 0.0;
//    }
//    projectedPosition.xyz += displacementIntensity * (normal / 2.0) * cursorPointerActivation;
//    // *** Cursor Displacement END ***

    gl_Position = projectedPosition;

//    // Point size
//    float sizeIn = smoothstep(0.0, 0.1, particleSim.a);
//    float sizeOut = 1.0 - smoothstep(0.7, 1.0, particleSim.a);
//    float size = min(sizeIn, sizeOut);
//
//    gl_PointSize = a_size * uSize * uResolution.y;
//    gl_PointSize *= (1.0 / - viewPosition.z);
//
//
//    #include <worldpos_vertex>
//
    vColor = color;
    vBary = a_bary;
    vSize = size;
    vViewMatrix = viewMatrix;
}
