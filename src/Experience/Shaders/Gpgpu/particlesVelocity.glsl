uniform sampler2D uPrevPositions;
uniform sampler2D uCurrPositions;
uniform float uDeltaTime;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticlesVelocity, uv);

    vec4 prevPositions = texture(uPrevPositions, uv);
    vec4 currPositions = texture(uCurrPositions, uv);

    vec4 velocity = ( prevPositions - currPositions ) / uDeltaTime;

    gl_FragColor = velocity;
    gl_FragColor.a = 1.0;
}
