import type {AnimationFrame, RGBColour} from "@shared/types/AnimationFrame";
import {LED_ROW_COUNT, LED_COLUMN_COUNT} from "@shared/constants/LedGrid";

export const getNewFrame = (): AnimationFrame => {
	return {
		grid: Array.from({length: LED_ROW_COUNT}, () =>
			Array.from({length: LED_COLUMN_COUNT}, () => [0, 0, 0] as RGBColour),
		),
		duration: 500,
	};
};
