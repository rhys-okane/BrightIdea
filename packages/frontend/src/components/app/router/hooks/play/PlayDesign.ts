import type {Design} from "@src/store/types/design/Design";
import {LED_ROW_COUNT, LED_COLUMN_COUNT} from "@shared/constants/LedGrid";
import type {RGBColour} from "@shared/types/AnimationFrame";

type SerialWriter = WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>;

// Track current LED states to avoid unnecessary updates
let currentLedStates: RGBColour[][] = [];
let isInitialized = false;

/**
 * Initialize LED states tracking array
 */
const initializeLedStates = (): void => {
	currentLedStates = Array(LED_ROW_COUNT)
		.fill(null)
		.map(() => Array(LED_COLUMN_COUNT).fill([0, 0, 0] as RGBColour));
	isInitialized = true;
};

/**
 * Send a command string to the Arduino via serial
 */
const sendCommand = async (writer: SerialWriter, command: string): Promise<void> => {
	try {
		const encoder = new TextEncoder();
		const data = encoder.encode(command);
		await writer.write(data);
	} catch (error) {
		console.error("Failed to send command:", error);
	}
};

/**
 * Initialize all LEDs to off state
 */
const initializeLeds = async (writer: SerialWriter): Promise<void> => {
	await sendCommand(writer, "OFF;");
	initializeLedStates();
};

/**
 * Check if two LED states are identical
 */
const areStatesEqual = (state1: RGBColour, state2: RGBColour): boolean => {
	return state1[0] === state2[0] && state1[1] === state2[1] && state1[2] === state2[2];
};

const indexes = [
	[5, 11, 17, 23, 29, 35, 41, 47, 53, 59],
	[4, 10, 16, 22, 28, 34, 40, 46, 52, 58],
	[3, 9, 15, 21, 27, 33, 39, 45, 51, 57],
	[2, 8, 14, 20, 26, 32, 38, 44, 50, 56],
	[1, 7, 13, 19, 25, 31, 37, 43, 49, 55],
	[0, 6, 12, 18, 24, 30, 36, 42, 48, 54],
] as const;

export function getIndex(row: number, col: number): number {
	return indexes[row]?.[col] ?? -1;
}

/**
 * Update LEDs with new frame data, only sending changes
 */
const updateLeds = async (writer: SerialWriter, newGrid: RGBColour[][]): Promise<void> => {
	for (let row = 0; row < LED_ROW_COUNT; row++) {
		for (let col = 0; col < LED_COLUMN_COUNT; col++) {
			const newState = newGrid[row]?.[col] ?? ([0, 0, 0] as RGBColour);
			const currentState = currentLedStates[row][col];

			// Only send update if state has changed
			if (!areStatesEqual(currentState, newState)) {
				const [r, g, b] = newState;

				const index = getIndex(row, col);
				const command = `${index},${r},${g},${b};`;

				await sendCommand(writer, command);

				// Update our tracking state
				currentLedStates[row][col] = [...newState];
			}
		}
	}
};

/**
 * Play a design animation on the LED grid with cancellation support
 */
export const playDesign = async (writer: SerialWriter, design: Design, abortSignal?: AbortSignal): Promise<void> => {
	console.log("Playing design:", design.id);
	if (!writer || !design) {
		console.error("Invalid writer or design");
		return;
	}

	// Check if already cancelled
	if (abortSignal?.aborted) {
		console.log("Play operation was cancelled before starting");
		return;
	}

	try {
		// Initialize LEDs if not already done
		if (!isInitialized) {
			console.log("Initializing LEDs for design playback");
			await initializeLeds(writer);
		}

		// Check cancellation after initialization
		if (abortSignal?.aborted) {
			console.log("Aborting design playback due to cancellation signal");
			return;
		}

		// Play each frame in sequence, looping until cancelled
		while (!abortSignal?.aborted) {
			for (const frame of design.frames) {
				console.log("Playing frame with duration:", frame.duration);
				// Check cancellation before each frame
				if (abortSignal?.aborted) {
					return;
				}

				await updateLeds(writer, frame.grid);

				// Wait for frame duration with cancellation support
				if (frame.duration > 0) {
					await new Promise<void>((resolve, reject) => {
						const timeoutId = setTimeout(resolve, frame.duration);

						// Handle cancellation during timeout
						const onAbort = () => {
							clearTimeout(timeoutId);
							reject(new DOMException("Operation was aborted", "AbortError"));
						};

						if (abortSignal?.aborted) {
							clearTimeout(timeoutId);
							reject(new DOMException("Operation was aborted", "AbortError"));
							return;
						}

						abortSignal?.addEventListener("abort", onAbort, {once: true});
					});
				}
			}
		}
	} catch (error) {
		// Don't log abort errors as they're expected
		if (error instanceof DOMException && error.name === "AbortError") {
			return;
		}
		console.error("Error playing design:", error);
	}
};

/**
 * Reset all LEDs to off state
 */
export const stopDesign = async (writer: SerialWriter): Promise<void> => {
	if (!writer) {
		console.error("Invalid writer");
		return;
	}

	try {
		await initializeLeds(writer);
		isInitialized = false;
	} catch (error) {
		console.error("Error stopping design:", error);
	}
};
