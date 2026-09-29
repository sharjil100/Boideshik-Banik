/**
 * Shared sky GLSL.
 *
 * Both the sky dome and the sea need the same function: the dome samples it
 * along the view ray, the sea samples it along the *reflected* ray. Sharing
 * one implementation means the water reflects the actual sky — the same
 * clouds, the same sun, the same time-of-day grade — rather than an
 * approximation that drifts out of step as the mood changes.
 */
export const SKY_GLSL = /* glsl */ `
  float bb_hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float bb_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(bb_hash(i), bb_hash(i + vec2(1.0, 0.0)), u.x),
      mix(bb_hash(i + vec2(0.0, 1.0)), bb_hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float bb_fbm(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * bb_noise(p);
      p = rot * p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  vec3 bb_sunDirection(float mood) {
    return normalize(vec3(-0.42, 0.10 + mood * 0.22, -1.0));
  }

  /**
   * dir     normalised ray direction
   * time    seconds, drives the cloud drift
   * mood    0 dawn, 1 midday, 2 dusk
   * octaves cloud detail; the sea can afford fewer than the dome
   */
  vec3 bb_skyColor(vec3 dir, float time, float mood, int octaves) {
    float h = clamp(dir.y, -1.0, 1.0);

    vec3 zenithDawn  = vec3(0.055, 0.130, 0.310);
    vec3 horizDawn   = vec3(0.925, 0.640, 0.370);
    vec3 zenithNoon  = vec3(0.120, 0.330, 0.640);
    vec3 horizNoon   = vec3(0.760, 0.860, 0.940);
    vec3 zenithDusk  = vec3(0.045, 0.075, 0.190);
    vec3 horizDusk   = vec3(0.780, 0.330, 0.240);

    float m = clamp(mood, 0.0, 2.0);
    vec3 zenith = m < 1.0
      ? mix(zenithDawn, zenithNoon, m)
      : mix(zenithNoon, zenithDusk, m - 1.0);
    vec3 horizon = m < 1.0
      ? mix(horizDawn, horizNoon, m)
      : mix(horizNoon, horizDusk, m - 1.0);

    // Non-linear falloff keeps the warm band tight to the horizon.
    float t = pow(clamp(h * 1.15 + 0.06, 0.0, 1.0), 0.55);
    vec3 col = mix(horizon, zenith, t);

    vec3 sunDir = bb_sunDirection(m);
    float sd = max(dot(dir, sunDir), 0.0);
    vec3 sunTint = mix(vec3(1.0, 0.82, 0.55), vec3(1.0, 0.94, 0.86), m * 0.5);
    col += sunTint * pow(sd, 220.0) * 1.6;   // disc
    col += sunTint * pow(sd, 7.0) * 0.30;    // bloom
    col += sunTint * pow(sd, 1.8) * 0.06;    // wide haze

    // Cloud deck, projected onto a plane so it carries real perspective.
    if (h > 0.005) {
      vec2 plane = dir.xz / h;
      vec2 drift = vec2(time * 0.0065, time * 0.0022);
      vec2 q = plane * 0.55 + drift;
      vec2 warp = vec2(bb_fbm(q, octaves), bb_fbm(q + vec2(5.2, 1.3), octaves));
      float d = bb_fbm(q + warp * 0.9, octaves);

      float coverage = mix(0.62, 0.40, clamp(h * 1.6, 0.0, 1.0));
      float cloud = smoothstep(coverage, coverage + 0.26, d);
      cloud *= smoothstep(0.0, 0.16, h);

      float lit = clamp(warp.x * 0.8 + 0.35 + sd * 0.5, 0.0, 1.0);
      vec3 cloudLit = mix(vec3(0.99, 0.90, 0.80), vec3(1.0, 0.98, 0.95), m * 0.5);
      vec3 cloudDark = mix(vec3(0.30, 0.31, 0.44), vec3(0.46, 0.50, 0.62), m * 0.5);
      col = mix(col, mix(cloudDark, cloudLit, lit), cloud * 0.88);
    }

    // Haze band below the horizon.
    float below = smoothstep(0.02, -0.14, h);
    vec3 haze = mix(vec3(0.045, 0.105, 0.215), vec3(0.06, 0.16, 0.30), m * 0.4);
    col = mix(col, haze, below * 0.85);

    return col;
  }
`;
