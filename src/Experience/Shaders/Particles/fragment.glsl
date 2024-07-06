varying vec3 vColor;
varying vec2 vUv;
varying vec3 vBary;
varying float vSize;
varying vec2 vParticlesUv;
varying mat4 vViewMatrix;

uniform vec2 uResolution;
uniform sampler2D uParticlesVelocityTexture;
uniform float uTime;
uniform float uSampleRadius;
uniform float uVelocityScale;


float directionalBlur(vec2 uv, vec2 direction, float radius) {
    float sum = 0.0;
    float total = 0.0;
    for (float i = -radius; i <= radius; i += 1.0) {
        vec2 offset = uv + direction * i / radius;
        float dist = length(offset - vec2(0.5, 0.5));
        float circle = smoothstep(0.4, 0.5, dist);
        sum += circle;
        total += 1.0;
    }
    return sum / total;
}

vec2 scaleWithCenter(vec2 uv, vec2 scale, vec2 center) {
    return center + (uv - center) * scale;
}

void main() {
    vec4 particleVelocity = texture2D(uParticlesVelocityTexture, vParticlesUv);

    vec2 uvA = vec2(0.0, 0.0);
    vec2 uvB = vec2(1.0, 0.0);
    vec2 uvC = vec2(0.5, 1.0);

    vec2 uv = (vBary.x * uvA + vBary.y * uvB + vBary.z * uvC) * 1.7;
    uv.x = (uv.x * 1.2) - 0.501;
    uv.y -= 0.1;

    vec3 velocityInCameraSpace = (vViewMatrix * vec4(particleVelocity.xyz, 0.0)).xyz;

    vec2 direction = velocityInCameraSpace.xy * uVelocityScale;
    float radius = uSampleRadius; // Sample Radius

    // Calculate blurred circle
    float blurredCircle = directionalBlur(scaleWithCenter(uv, vec2(3.0), vec2(0.5, 0.5)), direction, radius);

    // Final color
    gl_FragColor = vec4(vec3(vColor), 1.0 - blurredCircle);

    if( gl_FragColor.a < 0.01 ) discard;


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
