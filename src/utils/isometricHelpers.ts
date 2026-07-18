/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const tileW = 88;
export const tileH = 44;
export const cx = 250; // SVG center point horizontally
export const cy = 60;  // SVG start offset vertically

export const getIsoCoords = (x: number, y: number) => {
  const sx = cx + (x - y) * (tileW / 2);
  const sy = cy + (x + y) * (tileH / 2);
  return { x: sx, y: sy };
};

// Construct polygons for flat isometric tiles
export const getTilePoints = (x: number, y: number) => {
  const { x: sx, y: sy } = getIsoCoords(x, y);
  const top = `${sx},${sy - tileH / 2}`;
  const right = `${sx + tileW / 2},${sy}`;
  const bottom = `${sx},${sy + tileH / 2}`;
  const left = `${sx - tileW / 2},${sy}`;
  return `${top} ${right} ${bottom} ${left}`;
};
