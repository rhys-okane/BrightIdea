import type { Design } from "@src/store/types/design/Design";
import type { RGBBrightnessCell } from "@src/store/types/design/frame/Frame";
import {
  LED_ROW_COUNT,
  LED_COLUMN_COUNT,
  MAX_SAFE_BRIGHTNESS,
} from "@src/constants/LedGrid";

type SerialWriter = WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>;

// Track current LED states to avoid unnecessary updates
let currentLedStates: RGBBrightnessCell[][] = [];
let isInitialized = false;

/**
 * Initialize LED states tracking array
 */
const initializeLedStates = (): void => {
  currentLedStates = Array(LED_ROW_COUNT)
    .fill(null)
    .map(() => Array(LED_COLUMN_COUNT).fill([0, 0, 0, 0] as RGBBrightnessCell));
  isInitialized = true;
};

/**
 * Send a command string to the Arduino via serial
 */
const sendCommand = async (
  writer: SerialWriter,
  command: string
): Promise<void> => {
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
const areStatesEqual = (
  state1: RGBBrightnessCell,
  state2: RGBBrightnessCell
): boolean => {
  return (
    state1[0] === state2[0] &&
    state1[1] === state2[1] &&
    state1[2] === state2[2] &&
    state1[3] === state2[3]
  );
};

/**
 * Update LEDs with new frame data, only sending changes
 */
const updateLeds = async (
  writer: SerialWriter,
  newGrid: RGBBrightnessCell[][]
): Promise<void> => {
  for (let row = 0; row < LED_ROW_COUNT; row++) {
    for (let col = 0; col < LED_COLUMN_COUNT; col++) {
      const newState =
        newGrid[row]?.[col] ?? ([0, 0, 0, 0] as RGBBrightnessCell);
      const currentState = currentLedStates[row][col];

      // Only send update if state has changed
      if (!areStatesEqual(currentState, newState)) {
        const [r, g, b, brightnessPercentage] = newState;

        const realBrightness = Math.round(
          (brightnessPercentage / 100) * MAX_SAFE_BRIGHTNESS
        );

        const command = `${r},${g},${b},${realBrightness};`;
        await sendCommand(writer, command);

        // Update our tracking state
        currentLedStates[row][col] = [...newState] as RGBBrightnessCell;
      }
    }
  }
};

/**
 * Play a design animation on the LED grid with cancellation support
 */
export const playDesign = async (
  writer: SerialWriter,
  design: Design,
  abortSignal?: AbortSignal
): Promise<void> => {
  if (!writer || !design) {
    console.error("Invalid writer or design");
    return;
  }

  // Check if already cancelled
  if (abortSignal?.aborted) {
    return;
  }

  try {
    // Initialize LEDs if not already done
    if (!isInitialized) {
      await initializeLeds(writer);
    }

    // Check cancellation after initialization
    if (abortSignal?.aborted) {
      return;
    }

    // Play each frame in sequence
    for (const frame of design.frames) {
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

          abortSignal?.addEventListener("abort", onAbort, { once: true });
        });
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
