/**
 * TumblingE - Pixel-perfect MOH Uganda E-chart letter.
 *
 * Shape proportions (5×5 grid, measured from physical MOH chart):
 *   Spine  : left column, width = 1/5 of bounding box
 *   Top arm: full width, height = 1/5
 *   Mid arm: full width, height = 1/5  (starts at 2/5 from top)
 *   Bot arm: full width, height = 1/5  (starts at 4/5 from top)
 *   Gaps   : each 1/5 of box (bands 1 and 3)
 *
 * Direction → rotation (open/arms side faces):
 *   "right" →   0°   "down" →  90°   "left" → 180°   "up" → 270°
 *
 * ─── Physical size helper ────────────────────────────────────────────────────
 * Use `physicalDp(targetMM)` to convert a real-world millimetre measurement
 * into React Native logical dp, calibrated to the current device's pixel
 * density via PixelRatio and a screen-diagonal PPI estimate.
 *
 * MOH E-chart specs (3-metre chart, per Snellen standard):
 *   6/60 line : letter height ≈ 43.6 mm  →  use physicalDp(44)
 *   6/12 line : letter height ≈  8.7 mm  →  use physicalDp(8.7)
 *   N8 row    : letter height ≈  3.2 mm at 40 cm arm's length
 *                                         →  use physicalDp(3.2)
 */

import React from "react";
import Svg, { Rect, G } from "react-native-svg";
import { Dimensions, PixelRatio } from "react-native";

export type EDirection = "right" | "down" | "left" | "up";

// ─── Physical size conversion ─────────────────────────────────────────────────
/**
 * Convert a physical millimetre target into React Native logical dp.
 *
 * React Native's PixelRatio.get() returns device pixel ratio (e.g. 2, 3).
 * The baseline density is 160 dpi (1 dp = 1 px at 160 dpi).
 * So physical dpi ≈ 160 × PixelRatio.get().
 * Physical mm per dp = 25.4 / (160 × PixelRatio)
 * → dp = targetMM × (160 × PixelRatio) / 25.4
 *
 * Note: This is an estimate. The 160 × PR formula can be off by ±10-15%
 * on devices where the manufacturer doesn't use standard density buckets.
 * For clinical use a one-time screen calibration would be ideal, but for
 * the VHT workflow this estimate is accurate enough.
 */
export function physicalDp(targetMM: number): number {
  const pr = PixelRatio.get();
  // Clamp PR to a sane range so we don't produce absurd values on unusual devices
  const clampedPr = Math.max(1.5, Math.min(pr, 4));
  return Math.round(targetMM * (160 * clampedPr) / 25.4);
}

// Pre-computed dp sizes for the three MOH E-chart lines.
// Call these at component render time (not module load) so Dimensions are ready.
export function eSize6_60(): number { return physicalDp(44);  }   // 6/60  ~44mm at 3m
export function eSize6_12(): number { return physicalDp(8.7); }   // 6/12  ~8.7mm at 3m
export function eSizeN8():   number { return physicalDp(3.2); }   // N8    ~3.2mm at 40cm

// ─── Component ───────────────────────────────────────────────────────────────
interface TumblingEProps {
  /** Bounding box side length in logical dp.
   *  Use eSize6_60(), eSize6_12(), eSizeN8() for MOH-accurate physical sizes,
   *  or pass an arbitrary number for UI previews / demonstrations. */
  size: number;
  direction: EDirection;
  /** Ink colour - defaults to pure black.
   *  For the vision test screen use "#FFFFFF" (white on black background). */
  color?: string;
  /** Background colour for the SVG canvas.
   *  Defaults to "transparent".
   *  For the vision test screen pass "#000000" so the E is always visible. */
  backgroundColor?: string;
}

export default function TumblingE({
  size,
  direction,
  color = "#000000",
  backgroundColor = "transparent",
}: TumblingEProps) {
  const u = size / 5; // one grid unit

  const cx = size / 2;
  const cy = size / 2;

  const deg =
    direction === "right" ?   0 :
    direction === "down"  ?  90 :
    direction === "left"  ? 180 :
                            270;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Explicit background rect - guarantees colour even if parent clips */}
      {backgroundColor !== "transparent" && (
        <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />
      )}
      <G rotation={deg} origin={`${cx}, ${cy}`}>
        {/* Spine - left column, full height */}
        <Rect x={0}     y={0}     width={u}    height={size} fill={color} />
        {/* Top arm - full width, band 0 */}
        <Rect x={0}     y={0}     width={size} height={u}    fill={color} />
        {/* Middle arm - full width, band 2 */}
        <Rect x={0}     y={u * 2} width={size} height={u}    fill={color} />
        {/* Bottom arm - full width, band 4 */}
        <Rect x={0}     y={u * 4} width={size} height={u}    fill={color} />
      </G>
    </Svg>
  );
}
