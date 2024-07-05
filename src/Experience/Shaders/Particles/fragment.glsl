varying vec3 vColor;
varying vec2 vUv;
varying vec3 vBary;
varying float vSize;
varying vec2 vParticlesUv;

uniform vec2 uResolution;
uniform sampler2D uParticlesVelocityTexture;
uniform float uTime;


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
//    vec4 particleVelocity = texture2D(uParticlesVelocityTexture, vParticlesUv);
//
//    // Центр круга в барицентрических координатах
//    vec3 centerBarycentric = vec3(1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0);
//
//
//    // Вычисление расстояния от текущей точки до центра круга
//    float dist = length(vBary - centerBarycentric);
//
//    // Радиус круга
//    float radius = 0.4;

    vec2 uvA = vec2(0.0, 0.0);
    vec2 uvB = vec2(1.0, 0.0);
    vec2 uvC = vec2(0.5, 1.0);

    vec2 uv = (vBary.x * uvA + vBary.y * uvB + vBary.z * uvC) * 1.7;
    uv.x = (uv.x * 1.2) - 0.501;
    uv.y -= 0.1;


    //uv.y += sin(uTime);

    float dist = length(uv - vec2(0.5));
    dist = step(0.3, dist);

    gl_FragColor = vec4(vec3(dist), 1.0);



    vec2 direction = vec2(0.0, 1.0); // Измените направление по желанию
    float radius = 20.0; // Радиус размытия

    // Вычисление размытого круга
    float blurredCircle = directionalBlur(scaleWithCenter(uv, vec2(3.0), vec2(0.5, 0.5)), direction, radius);

    // Результирующий цвет
    gl_FragColor = vec4(vec3(1.0 - blurredCircle), 1.0);

//    // Если расстояние меньше радиуса, то точка внутри круга
//    if (dist < radius) {
//        float alpha = smoothstep(radius, radius - 0.2, dist); // Плавное изменение альфа-канала
//
//        gl_FragColor = vec4(vec3(vColor), vSize * alpha); // Белый цвет для круга
//
//        //gl_FragColor = vec4(length(particleVelocity));
//        //gl_FragColor = vec4(vec3(length(particleVelocity.xyz)), 1.0);
//    } else {
//        //discard;
//        gl_FragColor = vec4(1.0);
//    }


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
