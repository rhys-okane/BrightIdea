import { LED_ROW_COUNT, LED_COLUMN_COUNT } from "@src/constants/LedGrid";

export interface AnimationFrame {
  /**
   * 2D array representing the LED grid state for this frame.
   * Each value is an rgb array (e.g., [255, 0, 0]) or black ([0,0,0]) for off.
   */
  grid: Grid;
  /**
   * Duration in milliseconds this frame is displayed (for animation)
   */
  duration: number;
}

// Red, Green, Blue, Brightness
// Each value is in the range 0-255, with brightness as a percentage (0-100).
export type Grid = RGBBrightnessCell[][];
export type RGBColour = [number, number, number];
export type RGBBrightnessCell = [...RGBColour, number];

export function rgbToCss([r, g, b]: RGBColour): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function rgbCellToColour(cell: RGBBrightnessCell): RGBColour {
  return [cell[0], cell[1], cell[2]];
}

export const getNewFrame = (): AnimationFrame => {
  return {
    grid: Array.from({ length: LED_ROW_COUNT }, () =>
      Array.from(
        { length: LED_COLUMN_COUNT },
        () => [0, 0, 0, 255] as RGBBrightnessCell
      )
    ),
    duration: 500,
  };
};
