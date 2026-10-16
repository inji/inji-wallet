import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface Art {
  petals: string;
  core: string;
  border: string;
  rings: string;
  meshA: string;
  meshB: string;
  hair: string;
}

const cache = new Map<string, Art>();

/** The banknote-style rosette and mesh from the design, built once per size and centre. */
function art(w: number, h: number, cx: number, cy: number, R: number): Art {
  const key = [w, h, cx, cy, R].join(',');
  const hit = cache.get(key);
  if (hit) return hit;

  const TAU = Math.PI * 2;
  const f = (n: number) => n.toFixed(1);
  const pt = (first: boolean, x: number, y: number) =>
    (first ? 'M' : 'L') + f(x) + ' ' + f(y);

  let petals = '';
  const N = 36,
    rIn = 0.3 * R,
    rOut = 0.78 * R,
    k = 2.4,
    ps = N * 48;
  for (let s = 0; s <= ps; s++) {
    const u = (s / ps) * TAU;
    const sn = Math.sin((N * u) / 2);
    const r = rIn + (rOut - rIn) * sn * sn;
    const th = u + (k * Math.sin(N * u)) / N;
    petals += pt(s === 0, cx + r * Math.cos(th), cy + r * Math.sin(th));
  }

  let core = '';
  const kc = 14,
    cc = 10,
    cs = kc * 8;
  for (let i = 0; i < cc; i++) {
    const ph = (i / cc) * (TAU / kc);
    for (let s = 0; s <= cs; s++) {
      const t = (s / cs) * TAU;
      const r = 0.18 * R + 0.075 * R * Math.sin(kc * (t - ph));
      core += pt(s === 0, cx + r * Math.cos(t), cy + r * Math.sin(t));
    }
  }

  let border = '';
  for (let j = 0; j < 4; j++) {
    const base = (0.27 + j * 0.012) * R,
      bs = 36 * 6;
    for (let s = 0; s <= bs; s++) {
      const t = (s / bs) * TAU;
      const r = base + 0.006 * R * Math.sin(36 * t + j * 0.8);
      border += pt(s === 0, cx + r * Math.cos(t), cy + r * Math.sin(t));
    }
  }

  let rings = '';
  for (let j = 0; j < 8; j++) {
    const base = (0.82 + j * 0.032) * R,
      rs = 40 * 6;
    for (let s = 0; s <= rs; s++) {
      const t = (s / rs) * TAU;
      const r = base + 0.022 * R * Math.sin(40 * t);
      rings += pt(s === 0, cx + r * Math.cos(t), cy + r * Math.sin(t));
    }
  }

  let meshA = '',
    meshB = '';
  const amp = Math.min(w, h) * 0.075,
    lam = w / 2.1,
    gap = h / 13;
  for (let j = -3; j < 17; j++) {
    const y0 = j * gap;
    for (let x = 0; x <= w + 8; x += 8) {
      meshA += pt(x === 0, x, y0 + amp * Math.sin((TAU * x) / lam + j * 0.55));
      meshB += pt(
        x === 0,
        x,
        y0 +
          gap / 2 +
          amp * Math.sin((TAU * x) / (lam * 1.25) - j * 0.55 + 1.3),
      );
    }
  }

  let hair = '';
  for (let y = 1.5; y < h; y += 3) hair += 'M0 ' + f(y) + 'H' + w;

  const result = {petals, core, border, rings, meshA, meshB, hair};
  cache.set(key, result);
  return result;
}

const palettes = {
  dark: {
    petals: ['#2ed9e8', 0.5],
    core: ['#c3d3e6', 0.45],
    rings: ['#1a92c1', 0.8],
    mesh: ['#c3d3e6', 0.2],
    hair: ['#c3d3e6', 0.07],
  },
  light: {
    petals: ['#157398', 0.55],
    core: ['#0a3970', 0.32],
    rings: ['#1a92c1', 0.6],
    mesh: ['#0a3970', 0.15],
    hair: ['#0a3970', 0.05],
  },
} as const;

interface GuillocheProps {
  w: number;
  h: number;
  cx: number;
  cy: number;
  r: number;
  tone: 'dark' | 'light';
  opacity?: number;
}

const GuillocheArt: React.FC<GuillocheProps> = ({
  w,
  h,
  cx,
  cy,
  r,
  tone,
  opacity = 0.8,
}) => {
  const a = art(w, h, cx, cy, r);
  const p = palettes[tone];
  return (
    <Svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{position: 'absolute', left: 0, top: 0, opacity}}
      pointerEvents="none">
      <Path
        d={a.hair}
        fill="none"
        stroke={p.hair[0]}
        strokeWidth={0.35}
        opacity={p.hair[1]}
      />
      <Path
        d={a.meshA}
        fill="none"
        stroke={p.mesh[0]}
        strokeWidth={0.6}
        opacity={p.mesh[1]}
      />
      <Path
        d={a.meshB}
        fill="none"
        stroke={p.mesh[0]}
        strokeWidth={0.6}
        opacity={p.mesh[1]}
      />
      <Path
        d={a.rings}
        fill="none"
        stroke={p.rings[0]}
        strokeWidth={0.6}
        opacity={p.rings[1]}
      />
      <Path
        d={a.petals}
        fill="none"
        stroke={p.petals[0]}
        strokeWidth={0.7}
        opacity={p.petals[1]}
      />
      <Path
        d={a.core}
        fill="none"
        stroke={p.core[0]}
        strokeWidth={0.5}
        opacity={p.core[1]}
      />
      <Path
        d={a.border}
        fill="none"
        stroke={p.rings[0]}
        strokeWidth={0.6}
        opacity={p.rings[1]}
      />
    </Svg>
  );
};

export const Guilloche = React.memo(GuillocheArt);
