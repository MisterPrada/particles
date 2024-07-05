varying vec3 vColor;
varying vec2 vUv;
varying vec3 vBary;
varying float vSize;
varying vec2 vParticlesUv;

uniform vec2 uResolution;
uniform sampler2D uParticlesVelocityTexture;
uniform float uTime;


void main() {
    vec4 particleVelocity = texture2D(uParticlesVelocityTexture, vParticlesUv);

    // Центр круга в барицентрических координатах
    vec3 centerBarycentric = vec3(1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0);


    // Вычисление расстояния от текущей точки до центра круга
    float dist = length(vBary - centerBarycentric);

    // Радиус круга
    float radius = 0.4;


    // Если расстояние меньше радиуса, то точка внутри круга
    if (dist < radius) {
        float alpha = smoothstep(radius, radius - 0.2, dist); // Плавное изменение альфа-канала

        gl_FragColor = vec4(vec3(vColor), vSize * alpha); // Белый цвет для круга

        //gl_FragColor = vec4(length(particleVelocity));
        //gl_FragColor = vec4(vec3(length(particleVelocity.xyz)), 1.0);
    } else {
        discard;
        //gl_FragColor = vec4(1.0);
    }


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
