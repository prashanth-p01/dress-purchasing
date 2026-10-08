varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

uniform float uTime;
uniform vec2 uMouse;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Slow, organic, gentle silk drape wave
    float dist = distance(uv, uMouse);
    float mouseWave = sin(dist * 6.0 - uTime * 0.8) * exp(-dist * 2.2) * 0.12;
    
    float wave1 = sin(pos.x * 1.8 + uTime * 0.35) * cos(pos.y * 1.4 + uTime * 0.25) * 0.16;
    float wave2 = sin(pos.x * 3.2 - pos.y * 2.2 + uTime * 0.4) * 0.06;
    float wave3 = cos(pos.y * 4.0 + uTime * 0.5 + pos.x * 1.5) * 0.03;
    
    float totalElevation = wave1 + wave2 + wave3 + mouseWave;
    pos.z += totalElevation;
    vElevation = totalElevation;
    
    // Smooth normal approximation
    vec3 modifiedNormal = normal;
    modifiedNormal.x -= (sin(pos.x * 1.8 + uTime * 0.35) * 0.15);
    modifiedNormal.y -= (cos(pos.y * 1.4 + uTime * 0.25) * 0.15);
    vNormal = normalize(normalMatrix * modifiedNormal);
    
    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
