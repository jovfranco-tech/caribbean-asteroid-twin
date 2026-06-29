import * as THREE from 'three';

/**
 * Glow texture utilities.
 * ----------------------------------------------------------------------------
 * The realistic Earth now uses NASA Blue Marble textures (see Earth.tsx), so
 * the old procedural canvas texture has been removed. This module keeps the
 * radial glow-sprite generator used by city markers and impact flash effects.
 * ----------------------------------------------------------------------------
 */

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
