import * as THREE from 'three';

/**
 * Procedural equirectangular Earth texture.
 * ----------------------------------------------------------------------------
 * Generates a 2048×1024 canvas painted as a stylized "command center" globe:
 *  - deep-ocean gradient with subtle latitude bands
 *  - simplified continents (low-poly silhouettes) so the globe reads as Earth
 *  - high-detail Caribbean landmasses (PR, Hispaniola, Cuba, Bahamas, Florida)
 *  - a luminous coastline glow
 *  - a faint lat/long graticule grid
 *
 * Returns a THREE.CanvasTexture. No external imagery is loaded.
 * ----------------------------------------------------------------------------
 */

const W = 2048;
const H = 1024;

function lonLatToPx(lon: number, lat: number): [number, number] {
  // equirectangular: x = (lon+180)/360 * W, y = (90-lat)/180 * H
  return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
}

/** Plot a closed polygon of [lon,lat] points and fill it. */
function fillPolygon(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  fillStyle: string | CanvasGradient,
) {
  ctx.beginPath();
  points.forEach(([lon, lat], i) => {
    const [x, y] = lonLatToPx(lon, lat);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

/** Stroke a polygon outline (coastline). */
function strokePolygon(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  strokeStyle: string,
  width: number,
) {
  ctx.beginPath();
  points.forEach(([lon, lat], i) => {
    const [x, y] = lonLatToPx(lon, lat);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = width;
  ctx.stroke();
}

// ---- Simplified global continents (very low detail, just for "Earth from space" reading) ----
const CONTINENTS: [number, number][][] = [
  // North America (rough)
  [
    [-168, 66], [-140, 70], [-95, 73], [-75, 78], [-60, 70], [-55, 50], [-70, 45],
    [-75, 35], [-80, 30], [-82, 26], [-80, 24], [-78, 25], [-83, 29], [-90, 29],
    [-97, 26], [-104, 22], [-110, 23], [-117, 32], [-124, 40], [-125, 48],
    [-135, 55], [-150, 60], [-165, 60],
  ],
  // South America (rough)
  [
    [-80, 12], [-72, 12], [-60, 8], [-50, 0], [-42, -8], [-38, -15], [-40, -25],
    [-50, -35], [-58, -38], [-65, -45], [-70, -53], [-74, -50], [-72, -40],
    [-75, -30], [-78, -20], [-80, -10], [-80, 0], [-78, 6],
  ],
  // Africa (rough)
  [
    [-17, 14], [-10, 22], [0, 30], [10, 33], [20, 32], [32, 31], [35, 22],
    [40, 12], [45, 12], [51, 11], [50, 0], [45, -8], [40, -16], [35, -23],
    [28, -32], [20, -35], [15, -28], [12, -18], [8, -5], [2, 5], [-8, 8], [-15, 12],
  ],
  // Europe (rough)
  [
    [-9, 36], [-9, 43], [2, 48], [8, 54], [15, 55], [22, 60], [30, 64], [38, 66],
    [45, 60], [40, 52], [35, 47], [28, 45], [22, 44], [16, 46], [10, 44], [3, 43],
    [-5, 40],
  ],
  // Asia (rough)
  [
    [45, 60], [60, 66], [80, 70], [100, 72], [130, 72], [160, 68], [175, 65],
    [170, 60], [150, 58], [140, 52], [135, 45], [128, 40], [120, 32], [110, 22],
    [105, 12], [100, 8], [95, 16], [88, 22], [80, 20], [75, 24], [70, 28],
    [62, 30], [55, 40], [50, 48], [48, 55],
  ],
  // Australia (rough)
  [
    [113, -22], [120, -20], [130, -12], [140, -12], [145, -16], [150, -24],
    [148, -32], [140, -36], [130, -34], [120, -34], [115, -30],
  ],
  // Greenland
  [
    [-50, 82], [-30, 83], [-22, 78], [-25, 70], [-40, 66], [-52, 70], [-55, 76],
  ],
  // Antarctica band
  [],
];

// ---- High-detail Caribbean polygons ----
const CARIBBEAN: { name: string; pts: [number, number][] }[] = [
  // Puerto Rico
  {
    name: 'PR',
    pts: [
      [-67.2, 18.52], [-66.6, 18.55], [-66.1, 18.5], [-65.75, 18.42], [-65.6, 18.27],
      [-65.9, 18.12], [-66.3, 17.95], [-66.7, 17.95], [-67.0, 18.05], [-67.2, 18.25],
    ],
  },
  // Hispaniola (DR + Haiti)
  {
    name: 'HI',
    pts: [
      [-71.1, 19.7], [-70.2, 19.8], [-69.2, 19.6], [-68.6, 19.3], [-68.4, 18.85],
      [-68.9, 18.45], [-69.5, 18.25], [-70.1, 18.05], [-70.7, 17.95], [-71.4, 18.0],
      [-72.0, 18.2], [-73.0, 18.55], [-73.6, 18.85], [-74.0, 19.2], [-73.8, 19.6],
      [-73.0, 19.85], [-72.0, 19.95],
    ],
  },
  // Cuba
  {
    name: 'CU',
    pts: [
      [-84.9, 22.65], [-83.8, 22.9], [-82.5, 23.1], [-81.2, 23.1], [-79.9, 22.7],
      [-78.5, 22.4], [-77.2, 21.9], [-76.2, 21.3], [-75.2, 20.7], [-74.3, 20.2],
      [-74.8, 20.95], [-76.0, 21.5], [-77.5, 21.85], [-78.8, 22.25], [-80.1, 22.65],
      [-81.6, 22.95], [-83.0, 23.05], [-84.3, 22.85],
    ],
  },
  // Jamaica
  {
    name: 'JM',
    pts: [
      [-78.4, 18.5], [-77.7, 18.55], [-76.2, 18.05], [-76.7, 17.75], [-78.1, 17.95],
      [-78.4, 18.25],
    ],
  },
  // Bahamas (cluster of small islands as one blob)
  {
    name: 'BH',
    pts: [
      [-79.6, 26.8], [-78.6, 26.9], [-77.7, 26.5], [-77.2, 25.6], [-77.5, 24.7],
      [-77.3, 24.0], [-77.6, 23.2], [-78.0, 22.9], [-78.4, 23.4], [-78.2, 24.2],
      [-78.5, 25.0], [-79.0, 25.7], [-79.4, 26.3],
    ],
  },
  // Florida (southern tip)
  {
    name: 'FL',
    pts: [
      [-83.5, 30.5], [-82.7, 29.0], [-82.5, 27.8], [-82.7, 26.5], [-81.0, 25.2],
      [-80.6, 25.2], [-80.1, 25.4], [-80.5, 26.2], [-81.2, 26.6], [-81.7, 27.5],
      [-82.0, 28.3], [-82.6, 29.4], [-82.9, 30.4],
    ],
  },
  // Yucatán (partial)
  {
    name: 'YU',
    pts: [
      [-92.2, 18.5], [-90.3, 21.5], [-88.3, 21.6], [-87.0, 21.0], [-86.8, 20.0],
      [-87.6, 19.4], [-89.5, 19.0], [-91.0, 18.6],
    ],
  },
  // Northern South America (Venezuela/Colombia coast, partial)
  {
    name: 'SA',
    pts: [
      [-78.0, 11.0], [-74.0, 11.5], [-71.5, 11.8], [-68.5, 11.5], [-65.0, 10.5],
      [-62.0, 10.5], [-60.8, 9.5], [-60.5, 8.0], [-62.5, 7.5], [-66.0, 7.5],
      [-70.0, 8.0], [-74.0, 9.0], [-77.0, 9.8],
    ],
  },
  // Central America (partial)
  {
    name: 'CA',
    pts: [
      [-92.5, 18.0], [-88.5, 18.5], [-86.0, 17.5], [-84.0, 16.0], [-82.5, 14.5],
      [-81.0, 12.5], [-79.5, 9.5], [-79.0, 8.0], [-79.5, 7.5], [-81.0, 8.5],
      [-83.0, 10.0], [-85.0, 12.0], [-87.0, 13.5], [-89.5, 14.5], [-91.5, 16.0],
    ],
  },
];

export function createEarthTexture(satelliteView = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ---- Ocean gradient (deep navy) ----
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  if (satelliteView) {
    ocean.addColorStop(0, '#0a1a2e');
    ocean.addColorStop(0.5, '#0d2240');
    ocean.addColorStop(1, '#0a1a2e');
  } else {
    ocean.addColorStop(0, '#040a1a');
    ocean.addColorStop(0.45, '#06122a');
    ocean.addColorStop(0.5, '#081833');
    ocean.addColorStop(0.55, '#06122a');
    ocean.addColorStop(1, '#040a1a');
  }
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);

  // ---- Subtle latitude bands (energy-field feel) ----
  ctx.globalAlpha = satelliteView ? 0.04 : 0.06;
  for (let i = 0; i < H; i += 24) {
    ctx.fillStyle = i % 48 === 0 ? '#1b6cff' : '#0b2a55';
    ctx.fillRect(0, i, W, 1);
  }
  ctx.globalAlpha = 1;

  // ---- Land fill ----
  const landFill = satelliteView ? '#1e7a46' : '#13331f';
  for (const poly of CONTINENTS) {
    if (poly.length === 0) continue;
    fillPolygon(ctx, poly, landFill);
  }
  for (const { pts } of CARIBBEAN) {
    fillPolygon(ctx, pts, satelliteView ? '#2b9d5e' : '#1a4d2c');
  }

  // ---- Coastline glow (luminous) ----
  if (!satelliteView) {
    ctx.save();
    ctx.shadowColor = '#39e6ff';
    ctx.shadowBlur = 6;
    for (const poly of CONTINENTS) {
      if (poly.length === 0) continue;
      strokePolygon(ctx, poly, 'rgba(80,220,255,0.55)', 1.2);
    }
    for (const { pts } of CARIBBEAN) {
      strokePolygon(ctx, pts, 'rgba(120,240,255,0.9)', 1.6);
    }
    ctx.restore();
  } else {
    for (const poly of CONTINENTS) {
      if (poly.length === 0) continue;
      strokePolygon(ctx, poly, 'rgba(20,40,30,0.6)', 1);
    }
  }

  // ---- Graticule grid ----
  ctx.strokeStyle = satelliteView ? 'rgba(255,255,255,0.05)' : 'rgba(80,170,255,0.10)';
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const [x] = lonLatToPx(lon, 0);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = lonLatToPx(0, lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // ---- Subtle Caribbean "energy corridor" arc from impact to Miami (decorative) ----
  if (!satelliteView) {
    const [ix, iy] = lonLatToPx(-66.6, 18.6);
    const [mx, my] = lonLatToPx(-80.2, 25.76);
    const grad = ctx.createLinearGradient(ix, iy, mx, my);
    grad.addColorStop(0, 'rgba(255,90,60,0.0)');
    grad.addColorStop(0.5, 'rgba(255,180,80,0.10)');
    grad.addColorStop(1, 'rgba(60,200,255,0.0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.quadraticCurveTo((ix + mx) / 2 - 30, (iy + my) / 2 - 40, mx, my);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** A small radial "glow" sprite texture for city markers and the impact flash. */
export function createGlowTexture(
  innerColor = 'rgba(255,255,255,1)',
  outerColor = 'rgba(120,200,255,0)',
): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, innerColor);
  g.addColorStop(0.4, innerColor.replace(/[\d.]+\)$/, '0.6)'));
  g.addColorStop(1, outerColor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
