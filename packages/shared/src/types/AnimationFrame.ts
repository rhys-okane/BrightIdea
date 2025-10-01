import {z} from "zod";
import {LED_COLUMN_COUNT, LED_ROW_COUNT} from "../constants/LedGrid";

const rgbColourSchema = z.tuple([z.number().min(0).max(255), z.number().min(0).max(255), z.number().min(0).max(255)]);
const gridSchema = z.array(z.array(rgbColourSchema).length(LED_COLUMN_COUNT)).length(LED_ROW_COUNT);

export const animationFrameSchema = z.object({
	/**
	 * 2D array representing the LED grid state for this frame.
	 * Each value is an rgb array (e.g., [255, 0, 0]) or black ([0,0,0]) for off.
	 */
	grid: gridSchema,
	/**
	 * Duration in milliseconds this frame is displayed (for animation)
	 */
	duration: z.number().min(0),
});

export type AnimationFrame = z.infer<typeof animationFrameSchema>;

// Red, Green, Blue
// Each value is in the range 0-255.
export type Grid = z.infer<typeof gridSchema>;
export type RGBColour = z.infer<typeof rgbColourSchema>;

export function rgbToCss([r, g, b]: RGBColour): string {
	return `rgb(${r}, ${g}, ${b})`;
}
