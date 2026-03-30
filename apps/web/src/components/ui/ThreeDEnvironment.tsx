"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Sun, Moon, Clock } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MATHEMATICAL ARC — smooth continuous positions, no keyframe jitter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function c01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function computePositions(hour: number) {
  const h = ((hour % 24) + 24) % 24;

  // Sun: rises 5:30 left, peaks 12:30 center-high, sets 20:00 right
  const sunT = c01((h - 5.5) / 14.5);
  const sunX = 0.05 + sunT * 0.9;
  const sunY = Math.sin(sunT * Math.PI) * 0.78 + 0.04;
  const sunVis =
    h >= 5.5 && h <= 20.0
      ? c01(Math.min((h - 5.5) / 0.7, (20.0 - h) / 0.7))
      : 0;

  // Moon: rises 18:30 right, peaks ~1:00 center-high, sets 7:30 left
  const hn = h < 7.5 ? h + 24 : h;
  const moonT = c01((hn - 18.5) / 13);
  const moonX = 0.93 - moonT * 0.86;
  const moonY = Math.sin(moonT * Math.PI) * 0.76 + 0.05;
  const moonVis =
    hn >= 18.5 && hn <= 31.5
      ? c01(Math.min((hn - 18.5) / 0.7, (31.5 - hn) / 0.7))
      : 0;

  return { sunX, sunY, sunVis, moonX, moonY, moonVis };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLOR KEYFRAMES — only colors, positions are mathematical
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type CKF = {
  hour: number;
  sky: [string, string, string, string];
  cloudLit: string;
  cloudShadow: string;
  sunColor: string;
  sunGlow: string;
  moonColor: string;
  moonGlow: string;
};

const CKF_TABLE: CKF[] = [
  {
    // 00:00 — midnight
    hour: 0,
    sky: ["#01030B", "#03081A", "#040F26", "#081520"],
    cloudLit: "#0C1928",
    cloudShadow: "#030508",
    sunColor: "#FFF6CC",
    sunGlow: "#FF6600",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 04:30 — deep night, stars peak
    hour: 4.5,
    sky: ["#01030B", "#03081A", "#040F26", "#081520"],
    cloudLit: "#0C1928",
    cloudShadow: "#030508",
    sunColor: "#FFF6CC",
    sunGlow: "#8B1500",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 05:00 — astronomical dawn, whisper of warmth
    hour: 5.0,
    sky: ["#020408", "#06080E", "#0E0A1C", "#1E0C08"],
    cloudLit: "#180A0E",
    cloudShadow: "#040305",
    sunColor: "#FF8830",
    sunGlow: "#8B1500",
    moonColor: "#C8DDF8",
    moonGlow: "#1A2B50",
  },
  {
    // 05:30 — civil dawn: purple sky, orange horizon ignites
    hour: 5.5,
    sky: ["#07031A", "#1A082E", "#501038", "#A82010"],
    cloudLit: "#300E1A",
    cloudShadow: "#0A060C",
    sunColor: "#FFA050",
    sunGlow: "#CC2800",
    moonColor: "#C8DDF8",
    moonGlow: "#152240",
  },
  {
    // 06:30 — SUNRISE: blazing orange-red, deep purple zenith
    hour: 6.5,
    sky: ["#0A041E", "#200A48", "#721840", "#FF4200"],
    cloudLit: "#FF9038",
    cloudShadow: "#561022",
    sunColor: "#FFF0C0",
    sunGlow: "#FF2800",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 07:30 — golden hour: amber floods the world
    hour: 7.5,
    sky: ["#0E1C42", "#1C3272", "#5C2A18", "#FF8A00"],
    cloudLit: "#FFBA48",
    cloudShadow: "#3C1A2C",
    sunColor: "#FFF8D0",
    sunGlow: "#FF7200",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 09:00 — morning: transitioning to clear blue
    hour: 9.0,
    sky: ["#0B2260", "#164298", "#2E68AA", "#82BEDA"],
    cloudLit: "#EDE8CC",
    cloudShadow: "#324C68",
    sunColor: "#FFF8E8",
    sunGlow: "#FFA828",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 12:00 — noon: vivid deep blue, brilliant white clouds
    hour: 12.0,
    sky: ["#08185C", "#0E309A", "#1A60BA", "#58AADC"],
    cloudLit: "#FFFFFF",
    cloudShadow: "#3A5072",
    sunColor: "#FFFEFC",
    sunGlow: "#FFE060",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 15:00 — afternoon: slightly warmer blue
    hour: 15.0,
    sky: ["#0A1A5A", "#143498", "#2268B2", "#7AB8D8"],
    cloudLit: "#FFF2D8",
    cloudShadow: "#3A4C62",
    sunColor: "#FFFCE4",
    sunGlow: "#FFD048",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 17:30 — golden hour PM: amber warmth returns
    hour: 17.5,
    sky: ["#0C1242", "#221060", "#742018", "#FF6800"],
    cloudLit: "#FFA038",
    cloudShadow: "#421820",
    sunColor: "#FFE8A0",
    sunGlow: "#FF7600",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
  {
    // 18:50 — SUNSET PEAK: jaw-dropping red-orange
    hour: 18.8,
    sky: ["#08021A", "#280840", "#821820", "#FF3600"],
    cloudLit: "#FF7820",
    cloudShadow: "#541018",
    sunColor: "#FFD080",
    sunGlow: "#FF1E00",
    moonColor: "#D8E8FF",
    moonGlow: "#2A3A70",
  },
  {
    // 19:30 — post-sunset: deep purples, last embers
    hour: 19.5,
    sky: ["#050112", "#160326", "#400C14", "#CC2800"],
    cloudLit: "#C04418",
    cloudShadow: "#38080E",
    sunColor: "#FF8030",
    sunGlow: "#AA1800",
    moonColor: "#D0E4FF",
    moonGlow: "#253D6A",
  },
  {
    // 20:00 — blue hour: magical deep blue transition
    hour: 20.0,
    sky: ["#030610", "#08101E", "#101838", "#202870"],
    cloudLit: "#182238",
    cloudShadow: "#050710",
    sunColor: "#FF6020",
    sunGlow: "#881800",
    moonColor: "#D0E4FF",
    moonGlow: "#2C428C",
  },
  {
    // 21:00 — night: deep dark, moon takes over
    hour: 21.0,
    sky: ["#01030B", "#03081A", "#040F26", "#081520"],
    cloudLit: "#0C1928",
    cloudShadow: "#030508",
    sunColor: "#FFF6CC",
    sunGlow: "#FF6600",
    moonColor: "#C8DDF8",
    moonGlow: "#253D6A",
  },
];

// Pre-parse hex → [r,g,b] at module load (zero allocation in hot path)
function h2r(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

type PCKF = {
  hour: number;
  sky: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ];
  cloudLit: [number, number, number];
  cloudShadow: [number, number, number];
  sunColor: [number, number, number];
  sunGlow: [number, number, number];
  moonColor: [number, number, number];
  moonGlow: [number, number, number];
};

const PKFS: PCKF[] = CKF_TABLE.map((k) => ({
  hour: k.hour,
  sky: k.sky.map(h2r) as PCKF["sky"],
  cloudLit: h2r(k.cloudLit),
  cloudShadow: h2r(k.cloudShadow),
  sunColor: h2r(k.sunColor),
  sunGlow: h2r(k.sunGlow),
  moonColor: h2r(k.moonColor),
  moonGlow: h2r(k.moonGlow),
}));
const PKFS_W: PCKF[] = [...PKFS, { ...PKFS[0]!, hour: 24.0 }];

function lerpC(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}
function easeT(t: number) {
  return t * t * (3 - 2 * t);
}

type ColorState = Omit<PCKF, "hour">;

function computeColors(h: number): ColorState {
  const hour = ((h % 24) + 24) % 24;
  let aIdx = PKFS_W.length - 2;
  for (let i = 0; i < PKFS_W.length - 1; i++) {
    if (hour >= PKFS_W[i]!.hour && hour < PKFS_W[i + 1]!.hour) {
      aIdx = i;
      break;
    }
  }
  const a = PKFS_W[aIdx]!,
    b = PKFS_W[aIdx + 1]!;
  const t = easeT((hour - a.hour) / (b.hour - a.hour));
  return {
    sky: [
      lerpC(a.sky[0], b.sky[0], t),
      lerpC(a.sky[1], b.sky[1], t),
      lerpC(a.sky[2], b.sky[2], t),
      lerpC(a.sky[3], b.sky[3], t),
    ],
    cloudLit: lerpC(a.cloudLit, b.cloudLit, t),
    cloudShadow: lerpC(a.cloudShadow, b.cloudShadow, t),
    sunColor: lerpC(a.sunColor, b.sunColor, t),
    sunGlow: lerpC(a.sunGlow, b.sunGlow, t),
    moonColor: lerpC(a.moonColor, b.moonColor, t),
    moonGlow: lerpC(a.moonGlow, b.moonGlow, t),
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERTEX SHADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FRAGMENT SHADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3  uColor1;        // sky zenith
  uniform vec3  uColor2;        // sky upper
  uniform vec3  uColor3;        // sky mid
  uniform vec3  uColor4;        // sky horizon
  uniform vec3  uCloudLit;
  uniform vec3  uCloudShadow;
  uniform vec3  uSunColor;
  uniform vec3  uSunGlow;
  uniform float uSunVisible;
  uniform vec2  uSunPos;
  uniform vec3  uMoonColor;
  uniform vec3  uMoonGlow;
  uniform float uMoonVisible;
  uniform vec2  uMoonPos;
  uniform vec2  uMouse;

  varying vec2 vUv;

  // ── Simplex 3D noise ──────────────────────────────────────────────────────
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x,289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159-0.85373472095314*r; }
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod(i,289.0);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  float fbm2(vec3 p){ float v=0.0,a=0.5,f=1.0; for(int i=0;i<2;i++){v+=a*snoise(p*f);f*=2.1;a*=0.5;} return v; }
  float fbm3(vec3 p){ float v=0.0,a=0.5,f=1.0; for(int i=0;i<3;i++){v+=a*snoise(p*f);f*=2.0;a*=0.5;} return v; }
  float fbm4(vec3 p){ float v=0.0,a=0.5,f=1.0; for(int i=0;i<4;i++){v+=a*snoise(p*f);f*=2.1;a*=0.5;} return v; }

  float hash1(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  vec2  hash2(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p.yx+19.19); return fract((p.xx+p.yx)*p.xy); }

  float starLayer(vec2 uv, float scale, float seed, float radius){
    vec2 grid=floor(uv*scale); vec2 fr=fract(uv*scale);
    vec2 pos=hash2(grid+seed)*0.80+0.10;
    float raw=hash1(grid*0.37+seed*0.11);
    float bright=pow(raw,2.0);
    float tPhase=dot(grid,vec2(2.3,5.9))+bright*6.7+seed*3.1;
    float twinkle=0.25+0.75*(sin(uTime*(0.18+bright*0.35)+tPhase)*0.5+0.5);
    float d=length(fr-pos);
    float core=smoothstep(radius,0.0,d);
    float halo=smoothstep(radius*5.5,0.0,d)*0.32*bright;
    return (core+halo)*bright*twinkle;
  }

  // ACES filmic tone mapping — prevents blow-out, gives cinematic richness
  vec3 aces(vec3 x){
    return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 mi = uMouse * 0.045;
    float t  = uTime * 0.08;

    // ── 1. SKY GRADIENT — power-eased for smooth deep-to-pale transition ───
    float yP = pow(uv.y, 0.72);   // compress mid tones → richer zenith colour
    vec3 sky = uColor4;
    sky = mix(sky, uColor3, smoothstep(0.00, 0.28, yP));
    sky = mix(sky, uColor2, smoothstep(0.28, 0.58, yP));
    sky = mix(sky, uColor1, smoothstep(0.58, 1.00, yP));

    // ── 2. ATMOSPHERIC SCATTER ─────────────────────────────────────────────
    float sunElev   = clamp(uSunPos.y * 3.0, 0.0, 1.0);
    float sunElevSq = sunElev * sunElev;
    float lowSun    = 1.0 - sunElevSq;   // 1 = sun at horizon, 0 = sun high

    // PRIMARY fan — wide warm blaze spreading from sun along horizon
    float hFanX  = exp(-pow(abs(uv.x - uSunPos.x) * 1.8, 1.1));
    float hFanY  = exp(-uv.y * 4.2);
    float hFan   = hFanX * hFanY * lowSun * uSunVisible;
    sky = mix(sky, uSunGlow * 3.2, clamp(hFan * 1.10, 0.0, 0.85));

    // SECONDARY fan — pinkish-purple bloom above the primary orange
    float hFanY2 = exp(-uv.y * 2.2) * (1.0 - exp(-uv.y * 9.0));
    float hFan2  = hFanX * hFanY2 * lowSun * uSunVisible;
    vec3  pinkHue = mix(uSunGlow, vec3(0.85, 0.28, 0.55), 0.55);
    sky = mix(sky, pinkHue * 2.0, clamp(hFan2 * 0.52, 0.0, 0.42));

    // TWILIGHT ARCH — soft glowing arc above horizon
    vec2  archPt = vec2(uSunPos.x, 0.0);
    float archR  = length((uv - archPt) * vec2(0.55, 1.0));
    float twArch = exp(-pow(abs(archR - 0.20) * 5.5, 2.0)) * lowSun;
    sky = mix(sky, uSunGlow * 2.0, clamp(twArch * uSunVisible * 0.75, 0.0, 0.58));

    // WIDE SCATTER — entire sky warms, deeper atmospheric Mie effect
    float lowScatter = exp(-uv.y * 1.8) * lowSun * uSunVisible;
    sky = mix(sky, uSunGlow * 0.55, clamp(lowScatter * 0.45, 0.0, 0.32));

    // GOLDEN OVERLAY — whole sky tints amber during golden hour
    float warmth = lowSun * uSunVisible;
    sky *= mix(vec3(1.0), vec3(1.14, 1.04, 0.76), warmth * 0.32);

    // RAYLEIGH BLUE BOOST — zenith deepens at noon
    sky *= mix(vec3(1.0), vec3(0.88, 0.93, 1.12), sunElevSq * uSunVisible * 0.22);

    // ── 3. DOMAIN-WARPED CLOUDS ────────────────────────────────────────────
    float wx  = fbm2(vec3(uv*1.6 + vec2(t*0.16,0.0),      t*0.10));
    float wy  = fbm2(vec3(uv*1.6 + vec2(4.1,1.5) + vec2(-t*0.13,t*0.08), t*0.10+2.6));
    vec2 wUV  = uv + vec2(wx,wy)*0.26 + mi;

    float rawC    = fbm4(vec3(wUV*1.25 + vec2(t*0.20,0.0), t*0.13)) * 0.5 + 0.5;
    float cumulus = smoothstep(0.46, 0.82, rawC);
    float rawW    = fbm3(vec3(uv*3.9 + vec2(t*0.44,t*0.07) - mi*0.4, t*0.26+6.8)) * 0.5 + 0.5;
    float cirrus  = smoothstep(0.51, 0.73, rawW) * 0.45;
    float cloudMask = clamp(cumulus + cirrus*0.4, 0.0, 1.0);

    // Cloud edge detection — for silver lining
    float rawCsoft  = fbm4(vec3(wUV*1.25 + vec2(t*0.20,0.0), t*0.13)) * 0.5 + 0.5;
    float cloudEdge = smoothstep(0.38, 0.52, rawCsoft) * (1.0 - smoothstep(0.52, 0.76, rawCsoft));

    float shadowN = fbm2(vec3(uv*2.1 + vec2(t*0.17+0.35,0.12), t*0.10+2.4)) * 0.5 + 0.5;
    float litAmt  = smoothstep(0.22, 0.82, shadowN);
    float dirLight = mix(1.0 - uv.y, uv.y, uMoonVisible);
    litAmt = mix(litAmt, dirLight, 0.45);

    vec3 cloudCol = mix(uCloudShadow, uCloudLit, litAmt);

    // Undersides catch warm glow from low sun
    float sunWarmth = smoothstep(0.75, 0.0, uv.y) * uSunVisible * 0.75;
    float goldenAmt = sunWarmth * lowSun * 0.70;
    cloudCol = mix(cloudCol, uSunGlow * 1.8, (sunWarmth + goldenAmt) * (1.0 - litAmt));
    cloudCol = mix(cloudCol, cloudCol * vec3(1.14, 1.05, 0.76), goldenAmt * litAmt * 0.6);

    // SILVER LINING — bright rim on cloud edges facing the sun
    float sunProx  = exp(-pow(abs(uv.x - uSunPos.x) * 3.0, 1.4));
    float rimDay   = cloudEdge * sunProx * uSunVisible * (0.5 + lowSun * 1.2);
    vec3  rimColor = mix(uCloudLit * 2.2, uSunGlow * 3.0, lowSun * 0.7);
    cloudCol = mix(cloudCol, rimColor, clamp(rimDay * 0.85, 0.0, 0.80));

    // Moonlit silver edge at night
    float moonProx = exp(-pow(abs(uv.x - uMoonPos.x) * 3.5, 1.4));
    float rimNight = cloudEdge * moonProx * uMoonVisible * 0.45;
    cloudCol = mix(cloudCol, vec3(0.60, 0.72, 0.95) * 1.4, clamp(rimNight, 0.0, 0.50));

    // ── 4. SKY + CLOUDS ────────────────────────────────────────────────────
    vec3 color = mix(sky, cloudCol, cloudMask * 0.92);

    // ── 5. SUN ─────────────────────────────────────────────────────────────
    vec2  sDiff  = uv - uSunPos;
    float sDist  = length(sDiff);
    float sAngle = atan(sDiff.y, sDiff.x);
    float sunR   = 0.028;
    float sunN   = clamp(sDist / sunR, 0.0, 1.0);
    float inSun  = step(sDist, sunR);

    float sLimb   = sqrt(max(0.0, 1.0 - sunN*sunN));
    vec3  sunDisc = mix(vec3(1.00,0.52,0.06), vec3(1.00,0.98,0.88), sLimb*sLimb) * (1.6 - sunN*0.5);

    float chromoM = smoothstep(sunR*1.35, sunR*1.0, sDist) * (1.0 - inSun);
    vec3  chromo  = vec3(1.0,0.35,0.05) * chromoM * 0.9;

    vec2  cDir   = sDist > 0.001 ? sDiff / sDist : vec2(1.0, 0.0);
    float sRot   = uTime * 0.05;
    vec2  cDirR  = vec2(cDir.x*cos(sRot)-cDir.y*sin(sRot), cDir.x*sin(sRot)+cDir.y*cos(sRot));
    float cNoise = fbm2(vec3(cDirR*1.8, uTime*0.025)) * 0.28;
    float cDist2 = sDist * (1.0 + cNoise);
    float iCor   = exp(-cDist2 * 9.0) * 0.85;
    float oCor   = exp(-cDist2 * 3.0) * 0.42;

    float rayA = sin(sAngle* 6.0 + uTime*0.032) * 0.5 + 0.5;
    float rayB = sin(sAngle*11.0 - uTime*0.048) * 0.5 + 0.5;
    float rayC = sin(sAngle*17.0 + uTime*0.020) * 0.5 + 0.5;
    float rays  = pow(rayA*0.50 + rayB*0.32 + rayC*0.18, 3.0);
    rays *= exp(-sDist*4.5) * smoothstep(0.02,0.11,sDist) * (1.0-cloudMask*0.72);

    // When sun is near horizon, extend god rays dramatically outward
    float lowRays = exp(-sDist * 1.8) * smoothstep(0.10, 0.50, sDist)
                  * (1.0 - sunElev) * 0.55 * (1.0 - cloudMask*0.55);
    rays += lowRays * (rayA*0.5 + rayB*0.5);

    float cOcc   = 1.0 - cloudMask*0.92;
    vec3 celDay  = sunDisc * inSun * cOcc;
    celDay += chromo * cOcc;
    celDay += uSunColor * iCor * cOcc * 0.90;
    celDay += uSunGlow  * oCor * (1.0 - cloudMask*0.38);
    celDay += uSunGlow  * 0.80 * rays;
    celDay *= uSunVisible;

    // ── 6. MOON ────────────────────────────────────────────────────────────
    vec2  mDiff = uv - uMoonPos;
    float mDist = length(mDiff);
    float moonR = 0.030;
    float moonN = clamp(mDist / moonR, 0.0, 1.0);

    vec2  mUV   = mDiff / moonR;
    float mZ    = sqrt(max(0.0, 1.0 - dot(mUV,mUV)));
    vec3  mSph  = vec3(mUV, mZ);

    float mRot   = uTime * 0.03;
    vec2  mRotXY = vec2(mSph.x*cos(mRot)-mSph.y*sin(mRot), mSph.x*sin(mRot)+mSph.y*cos(mRot));
    vec3  mSphR  = vec3(mRotXY, mSph.z);

    float mLimb = mix(0.62, 1.0, pow(mZ, 0.22));
    float mDisc = smoothstep(1.02, 0.88, moonN) * mLimb;

    vec3  mSun   = normalize(vec3(0.50, 0.28, 0.82));
    float mNdotL = dot(mSph, mSun);
    float mLit   = smoothstep(-0.06, 0.22, mNdotL);
    float mDiff2 = clamp(mNdotL * 1.30 + 0.28, 0.0, 1.0);

    float mBase  = fbm2(vec3(mSphR * 1.1)) * 0.5 + 0.5;
    float mMaria = smoothstep(0.68, 0.80, mBase);
    float mGrain = fbm2(vec3(mSphR * 9.0 + 2.7)) * 0.5 + 0.5;
    vec3  mTex   = mix(vec3(0.72,0.70,0.68), vec3(0.52,0.51,0.50), mMaria);
    mTex += (mGrain - 0.5) * 0.04;

    vec3 moonColor  = mix(vec3(0.65,0.72,0.88), vec3(0.95,0.95,0.93), mLit);
    moonColor       = mix(moonColor, mTex, 0.38 * mDisc);
    moonColor      *= mDiff2 * mDisc * 1.30;
    moonColor      += vec3(0.06,0.12,0.28) * (1.0-mLit) * smoothstep(1.0,0.55,moonN);

    float moonOcc  = 1.0 - cloudMask * 0.78;
    vec3  celNight = moonColor * moonOcc;
    celNight += uMoonColor * exp(-mDist * 6.0) * 0.72 * (1.0 - cloudMask*0.50);
    celNight += uMoonGlow  * exp(-mDist * 1.8) * 0.46 * (1.0 - cloudMask*0.36);
    celNight += uMoonGlow  * exp(-mDist * 0.6) * 0.18 * (1.0 - cloudMask*0.20);
    celNight *= uMoonVisible;

    color += celDay + celNight;

    // ── 7. MOONBEAM ────────────────────────────────────────────────────────
    float mbDown  = max(0.0, uMoonPos.y - uv.y);
    float mbHoriz = uv.x - uMoonPos.x;
    float coneW   = 0.028 + mbDown * 0.44;
    float mbRound = exp(-(mbHoriz*mbHoriz) / (coneW*coneW*0.50));
    float mbFade  = mbDown * exp(-mbDown * 2.2);
    float mbNoise = fbm2(vec3(uv*3.0 + vec2(uTime*0.014,0.0), uTime*0.016));
    mbNoise = smoothstep(0.22, 0.78, mbNoise*0.5+0.5);
    float beam = clamp(mbRound * mbFade * mbNoise * 3.2, 0.0, 1.0);
    beam *= uMoonVisible * (1.0 - cloudMask*0.48);
    color += vec3(0.88,0.95,1.00) * beam * 0.65;
    color += vec3(0.40,0.60,1.00) * beam*beam * 0.30;

    // ── 8. STAR FIELD ──────────────────────────────────────────────────────
    float clearSky    = 1.0 - clamp(cloudMask*1.5, 0.0, 1.0);
    float skyExposure = (1.0 - uSunVisible) * clearSky * smoothstep(0.14, 0.48, uv.y);
    float s1 = starLayer(uv, 38.0,  0.00, 0.022);
    float s2 = starLayer(uv, 80.0,  4.70, 0.015);
    float s3 = starLayer(uv,148.0,  9.30, 0.010);
    float s4 = starLayer(uv,235.0, 16.10, 0.007) * 0.60;
    float sBright = clamp(s1*1.4 + s2*1.1 + s3*0.85 + s4*0.40, 0.0, 1.6);
    float hueVar  = hash1(floor(uv*105.0+7.3));
    float isBlue  = step(0.86, hueVar);
    float isWarm  = step(0.72, hueVar)*(1.0-isBlue);
    vec3  starHue = vec3(0.92,0.95,1.00);
    starHue = mix(starHue, vec3(0.60,0.74,1.00), isBlue);
    starHue = mix(starHue, vec3(1.00,0.88,0.68), isWarm);
    color += starHue * sBright * skyExposure * 1.15;

    // ── 9. MILKY WAY ───────────────────────────────────────────────────────
    float mwA   = 0.48;
    vec2  mwUV  = vec2(uv.x*cos(mwA)-uv.y*sin(mwA), uv.x*sin(mwA)+uv.y*cos(mwA));
    float mwB   = smoothstep(0.20, 0.0, abs(mwUV.y-0.18));
    float mwD   = fbm3(vec3(mwUV*vec2(0.65,2.8), uTime*0.006))*0.5+0.5;
    color += vec3(0.52,0.64,0.90) * mwB * mwD * (1.0-cloudMask) * (1.0-uSunVisible) * 0.10;

    // ── 10. VIGNETTE ───────────────────────────────────────────────────────
    float vig = 1.0 - smoothstep(0.22, 1.35, length(uv-0.5)*1.90);
    color *= mix(0.48, 1.0, vig);

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FluidAura
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FluidAura({ phaseOverride }: { phaseOverride: number | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  // Reusable tmp objects — avoids GC pressure at 60fps
  const tmp = useMemo(
    () => ({
      c: Array.from({ length: 10 }, () => new THREE.Color()),
      v: Array.from({ length: 2 }, () => new THREE.Vector2()),
    }),
    [],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0.004, 0.012, 0.043) },
      uColor2: { value: new THREE.Color(0.012, 0.031, 0.102) },
      uColor3: { value: new THREE.Color(0.016, 0.059, 0.149) },
      uColor4: { value: new THREE.Color(0.031, 0.082, 0.125) },
      uCloudLit: { value: new THREE.Color(0.047, 0.098, 0.157) },
      uCloudShadow: { value: new THREE.Color(0.012, 0.02, 0.031) },
      uSunColor: { value: new THREE.Color(1.0, 0.965, 0.8) },
      uSunGlow: { value: new THREE.Color(1.0, 0.4, 0.0) },
      uSunVisible: { value: 0 },
      uSunPos: { value: new THREE.Vector2(-0.2, 0.4) },
      uMoonColor: { value: new THREE.Color(0.784, 0.867, 0.973) },
      uMoonGlow: { value: new THREE.Color(0.145, 0.239, 0.416) },
      uMoonVisible: { value: 1 },
      uMoonPos: { value: new THREE.Vector2(0.5, 0.82) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    // uniforms are mutated in-place by useFrame — empty deps is intentional
    [],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const u = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
    const ls = 1.8 * delta;

    const now = new Date();
    const hour =
      phaseOverride ??
      now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

    const col = computeColors(hour);
    const pos = computePositions(hour);

    if (u.uTime) u.uTime.value += delta;

    if (u.uColor1) u.uColor1.value.lerp(tmp.c[0]!.setRGB(...col.sky[0]), ls);
    if (u.uColor2) u.uColor2.value.lerp(tmp.c[1]!.setRGB(...col.sky[1]), ls);
    if (u.uColor3) u.uColor3.value.lerp(tmp.c[2]!.setRGB(...col.sky[2]), ls);
    if (u.uColor4) u.uColor4.value.lerp(tmp.c[3]!.setRGB(...col.sky[3]), ls);
    if (u.uCloudLit)
      u.uCloudLit.value.lerp(tmp.c[4]!.setRGB(...col.cloudLit), ls);
    if (u.uCloudShadow)
      u.uCloudShadow.value.lerp(tmp.c[5]!.setRGB(...col.cloudShadow), ls);
    if (u.uSunColor)
      u.uSunColor.value.lerp(tmp.c[6]!.setRGB(...col.sunColor), ls);
    if (u.uSunGlow) u.uSunGlow.value.lerp(tmp.c[7]!.setRGB(...col.sunGlow), ls);
    if (u.uMoonColor)
      u.uMoonColor.value.lerp(tmp.c[8]!.setRGB(...col.moonColor), ls);
    if (u.uMoonGlow)
      u.uMoonGlow.value.lerp(tmp.c[9]!.setRGB(...col.moonGlow), ls);

    if (u.uSunVisible)
      u.uSunVisible.value += (pos.sunVis - u.uSunVisible.value) * ls;
    if (u.uMoonVisible)
      u.uMoonVisible.value += (pos.moonVis - u.uMoonVisible.value) * ls;

    if (u.uSunPos) u.uSunPos.value.lerp(tmp.v[0]!.set(pos.sunX, pos.sunY), ls);
    if (u.uMoonPos)
      u.uMoonPos.value.lerp(tmp.v[1]!.set(pos.moonX, pos.moonY), ls);
    if (u.uMouse) u.uMouse.value.lerp(mouseRef.current, 3.0 * delta);
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exported wrapper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEV_PHASES = [
  { h: 0.0, label: "Gece Yarısı" },
  { h: 5.0, label: "Şafak Öncesi" },
  { h: 5.5, label: "Şafak" },
  { h: 6.5, label: "Gün Doğumu" },
  { h: 7.5, label: "Altın Saat" },
  { h: 9.0, label: "Sabah" },
  { h: 12.0, label: "Öğle" },
  { h: 15.0, label: "Öğleden Sonra" },
  { h: 17.5, label: "Akşam Altın" },
  { h: 18.8, label: "Gün Batımı" },
  { h: 19.5, label: "Akşam Kızıllığı" },
  { h: 20.0, label: "Mavi Saat" },
  { h: 21.0, label: "Gece" },
];

export function ThreeDEnvironment() {
  const [phaseOverride, setPhaseOverride] = useState<number | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devHour, setDevHour] = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Shift+T → toggle dev timeline (invisible to visitors)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "T") setDevMode((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // When dev mode is active, slider controls the phase
  useEffect(() => {
    if (devMode) setPhaseOverride(devHour);
  }, [devMode, devHour]);

  if (!mounted) return <div className="absolute inset-0 z-0 bg-[#09090b]" />;

  const btnClass = (active: boolean, glow: string) =>
    `flex items-center justify-center rounded-full p-2.5 transition-all duration-300 ${
      active ? glow : "text-slate-400 hover:text-white"
    }`;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 1] }}
          gl={{ antialias: false, alpha: false }}
          style={{ position: "absolute", inset: 0 }}
        >
          <FluidAura phaseOverride={phaseOverride} />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/10 via-[#09090b]/40 to-[#09090b]" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay" />

      {/* DEV — Shift+T ile açılır, ziyaretçi göremez */}
      {devMode && (
        <div className="absolute bottom-28 left-1/2 z-[999] w-[min(92vw,680px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Dev · Saat Önizleme
            </span>
            <span className="font-mono text-sm text-white/70">
              {String(Math.floor(devHour)).padStart(2, "0")}:
              {String(Math.round((devHour % 1) * 60)).padStart(2, "0")}
            </span>
          </div>
          {/* Slider */}
          <input
            type="range"
            min={0}
            max={23.99}
            step={0.05}
            value={devHour}
            onChange={(e) => setDevHour(Number(e.target.value))}
            className="mb-3 w-full accent-white/60"
          />
          {/* Hızlı aşama butonları */}
          <div className="flex flex-wrap gap-1.5">
            {DEV_PHASES.map((p) => (
              <button
                key={p.h}
                onClick={() => setDevHour(p.h)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                  Math.abs(devHour - p.h) < 0.1
                    ? "bg-white/20 text-white"
                    : "hover:bg-white/12 bg-white/5 text-white/50 hover:text-white/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zaman seçici */}
      <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-xl">
        <button
          onClick={() => setPhaseOverride((p) => (p === 8.0 ? null : 8.0))}
          className={btnClass(
            phaseOverride === 8.0,
            "bg-[#f97316]/20 text-[#f97316] shadow-[0_0_20px_rgba(249,115,22,0.3)]",
          )}
          title="Sabah"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPhaseOverride(null)}
          className={btnClass(
            phaseOverride === null,
            "bg-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]",
          )}
          title="Gerçek Saat"
        >
          <Clock className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPhaseOverride((p) => (p === 1.0 ? null : 1.0))}
          className={btnClass(
            phaseOverride === 1.0,
            "bg-[#3b82f6]/20 text-[#93c5fd] shadow-[0_0_20px_rgba(59,130,246,0.3)]",
          )}
          title="Gece"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
