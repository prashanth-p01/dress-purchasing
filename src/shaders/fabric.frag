precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

uniform float uTime;
uniform vec3 uColorBase;
uniform vec3 uColorShadow;
uniform vec3 uColorHighlight;

void main() {
    // Light direction
    vec3 lightPos = vec3(1.5, 2.5, 3.0);
    vec3 lightDir = normalize(lightPos - vPosition);
    vec3 viewDir = normalize(-vPosition);
    
    // Ambient + Diffuse
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // Silky Fresnel Sheen
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    
    // Sub-surface scatter simulation for raw silk/linen
    float sss = pow(max(dot(-lightDir, viewDir), 0.0), 2.0) * 0.3;
    
    // Color blending: Shadows to Midtones to Highlights
    vec3 col = mix(uColorShadow, uColorBase, smoothstep(-0.25, 0.25, vElevation));
    col = mix(col, uColorHighlight, diff * 0.45 + fresnel * 0.65 + sss);
    
    // Subtle thread/weave grain simulation
    float weave = sin(vUv.x * 600.0) * sin(vUv.y * 600.0) * 0.025;
    col += weave;
    
    // Edge vignette fade for soft boundary
    float distFromCenter = distance(vUv, vec2(0.5));
    float vignette = smoothstep(0.75, 0.2, distFromCenter);
    
    gl_FragColor = vec4(col, 0.94 * vignette + 0.06);
}
