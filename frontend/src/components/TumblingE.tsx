/**
 * TumblingE — Pixel-perfect match of the actual MOH Uganda E-chart.
 *
 * Proportions measured directly from the physical MOH E-chart image
 * (image4.png / image5.png in the training manual):
 *
 *   The E fits in a square bounding box divided into a 5×5 grid:
 *
 *     Row band 0  (0/5 → 1/5):  TOP ARM    — full width
 *     Row band 1  (1/5 → 2/5):  GAP        — spine only
 *     Row band 2  (2/5 → 3/5):  MIDDLE ARM — full width (same as top/bottom)
 *     Row band 3  (3/5 → 4/5):  GAP        — spine only
 *     Row band 4  (4/5 → 5/5):  BOTTOM ARM — full width
 *
 *   Spine occupies the full left column, width = 1/5 of total
 *
 *   ALL THREE ARMS ARE EQUAL FULL WIDTH — the middle arm is NOT shorter.
 *   This matches the MOH chart exactly (verified by pixel analysis).
 *
 * Direction → rotation (open side of E faces):
 *   "right"  →   0°  open side right  (standard orientation)
 *   "down"   →  90°  open side down
 *   "left"   → 180°  open side left
 *   "up"     → 270°  open side up
 */

import React from "react";
import Svg, { Rect, G } from "react-native-svg";

export type EDirection = "right" | "down" | "left" | "up";

interface TumblingEProps {
  /** Bounding box side length in logical pixels */
  size: number;
  direction: EDirection;
  /** Ink colour — defaults to pure black */
  color?: string;
}

export default function TumblingE({ size, direction, color = "#000000" }: TumblingEProps) {
  // One unit = size / 5  (the 5×5 grid unit)
  const u = size / 5;

  const cx = size / 2;
  const cy = size / 2;

  const deg =
    direction === "right" ?   0 :
    direction === "down"  ?  90 :
    direction === "left"  ? 180 :
                            270;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G rotation={deg} origin={`${cx}, ${cy}`}>
        {/* Spine — left column, full height */}
        <Rect x={0} y={0}       width={u}    height={size} fill={color} />
        {/* Top arm — full width, band 0 */}
        <Rect x={0} y={0}       width={size} height={u}    fill={color} />
        {/* Middle arm — full width, band 2 (same as top/bottom per MOH chart) */}
        <Rect x={0} y={u * 2}   width={size} height={u}    fill={color} />
        {/* Bottom arm — full width, band 4 */}
        <Rect x={0} y={u * 4}   width={size} height={u}    fill={color} />
      </G>
    </Svg>
  );
}
