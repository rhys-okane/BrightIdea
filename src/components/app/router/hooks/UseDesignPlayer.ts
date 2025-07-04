import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import { usePlayingDesignIdState } from "@src/store/hooks/UsePlayingDesignIdState";
import { useSerialPortState } from "@src/store/hooks/UseSerialPortState";
import type { Design } from "@src/store/types/design/Design";
import type {
  RGBColour,
  AnimationFrame,
} from "@src/store/types/design/frame/Frame";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface DesignPlayerState {
  isPlaying: boolean;
  currentFrame: number;
  error: string | null;
}

export const useDesignPlayer = (): DesignPlayerState => {
  const [playingDesignId] = usePlayingDesignIdState();
  const [designs] = useDesignsState();
  const [port] = useSerialPortState();

  const [state, setState] = useState<DesignPlayerState>({
    isPlaying: false,
    currentFrame: 0,
    error: null,
  });

  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(
    null
  );
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationStateRef = useRef<{
    design: Design | null;
    frameIndex: number;
    isLooping: boolean;
  }>({
    design: null,
    frameIndex: 0,
    isLooping: false,
  });

  // Get the currently selected design
  const currentDesign = useMemo(() => {
    if (!playingDesignId) return null;
    return designs.find((design) => design.id === playingDesignId) || null;
  }, [designs, playingDesignId]);

  // Function to format LED command
  const formatLedCommand = (index: number, rgb: RGBColour): string => {
    const [r, g, b] = rgb;
    return `${index},${r},${g},${b};`;
  };

  // Function to send a single frame
  const sendFrame = useCallback(
    async (frame: AnimationFrame, previousFrame: AnimationFrame | null) => {
      if (!writerRef.current) return;

      try {
        const commands: string[] = [];

        // Convert 2D grid to serial commands
        frame.grid.forEach((row, rowIndex) => {
          row.forEach((color, colIndex) => {
            const previousColor = previousFrame?.grid[rowIndex][colIndex];

            if (
              !previousColor &&
              color[0] === 0 &&
              color[1] === 0 &&
              color[2] === 0
            ) {
              // Skip sending command for black (off) LEDs if no previous color
              return;
            }

            if (
              previousColor &&
              color[0] === previousColor[0] &&
              color[1] === previousColor[1] &&
              color[2] === previousColor[2]
            ) {
              // Skip sending command if color hasn't changed
              return;
            }

            const ledIndex = gridToLedIndex(rowIndex, colIndex);
            commands.push(formatLedCommand(ledIndex, color));
          });
        });

        console.log(commands);
        // Send all commands for this frame

        for (const command of commands) {
          if (command) {
            console.log(`Sending command: ${command}`);
            const encoder = new TextEncoder();
            await writerRef.current.write(encoder.encode(command));
            await new Promise((resolve) => setTimeout(resolve, 3));
          }
        }

        console.log(
          `Sent frame ${animationStateRef.current.frameIndex} with ${
            frame.grid.length * frame.grid[0].length
          } LEDs`
        );
      } catch (error) {
        console.error("Error sending frame:", error);
        setState((prev) => ({ ...prev, error: `Send error: ${error}` }));
      }
    },
    []
  );

  // Function to play the next frame in sequence
  const playNextFrame = useCallback(async () => {
    const { design, frameIndex } = animationStateRef.current;

    if (!design || !port || !animationStateRef.current.isLooping) return;

    const currentFrame = design.frames[frameIndex];
    if (!currentFrame) return;

    const previousFrame = design.frames[frameIndex - 1] || null;

    // Send the current frame
    await sendFrame(currentFrame, previousFrame);

    // Update state to reflect current frame
    setState((prev) => ({ ...prev, currentFrame: frameIndex }));

    // Schedule next frame
    animationTimeoutRef.current = setTimeout(() => {
      const nextFrameIndex = (frameIndex + 1) % design.frames.length;
      animationStateRef.current.frameIndex = nextFrameIndex;

      // Continue looping if still playing
      if (animationStateRef.current.isLooping) {
        playNextFrame();
      }
    }, currentFrame.duration);
  }, [sendFrame, port]);

  // Function to start playing a design
  const startDesign = useCallback(
    async (design: Design) => {
      if (!port || !design.frames.length) {
        console.warn("Cannot start design - no port or no frames");
        return;
      }

      try {
        // Get writer if not already available
        if (!writerRef.current && port.writable) {
          writerRef.current = port.writable.getWriter();
        }

        if (!writerRef.current) {
          setState((prev) => ({
            ...prev,
            error: "Cannot get serial port writer",
          }));
          return;
        }

        // Stop any current animation
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        // Set up animation state
        animationStateRef.current = {
          design,
          frameIndex: 0,
          isLooping: true,
        };

        setState((prev) => ({
          ...prev,
          isPlaying: true,
          currentFrame: 0,
          error: null,
        }));

        console.log(
          `Starting design: ${design.name} (${design.frames.length} frames)`
        );

        const encoder = new TextEncoder();
        await writerRef.current.write(encoder.encode("OFF;"));
        await new Promise((resolve) => setTimeout(resolve, 3));

        // Start the animation
        await playNextFrame();
      } catch (error) {
        console.error("Error starting design:", error);
        setState((prev) => ({ ...prev, error: `Start error: ${error}` }));
      }
    },
    [port, playNextFrame]
  );

  // Function to stop playing
  const stopDesign = useCallback(async () => {
    try {
      // Stop animation loop
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }

      animationStateRef.current.isLooping = false;

      // Release writer
      if (writerRef.current) {
        await writerRef.current.releaseLock();
        writerRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentFrame: 0,
        error: null,
      }));

      console.log("Design playback stopped");
    } catch (error) {
      console.error("Error stopping design:", error);
      setState((prev) => ({ ...prev, error: `Stop error: ${error}` }));
    }
  }, []);

  // Effect to handle playingDesignId changes
  useEffect(() => {
    if (playingDesignId && currentDesign) {
      // Start playing the selected design
      startDesign(currentDesign);
    } else {
      // Stop playing when no design is selected
      stopDesign();
    }
  }, [playingDesignId, currentDesign, startDesign, stopDesign]);

  // Effect to set up serial port reader for console logging
  useEffect(() => {
    if (!port || !port.readable) return;

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const readSerialData = async () => {
      try {
        reader = port.readable!.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Convert Uint8Array to string and log
          const decoder = new TextDecoder();
          const text = decoder.decode(value);
          console.log("Serial input:", text);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "NetworkError") {
          console.error("Error reading serial data:", error);
        }
      } finally {
        if (reader) {
          try {
            await reader.releaseLock();
          } catch {
            // Ignore release errors
          }
        }
      }
    };

    readSerialData();

    return () => {
      if (reader) {
        reader.cancel().catch(() => {
          // Ignore cancel errors
        });
      }
    };
  }, [port]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (writerRef.current) {
        // @ts-expect-error think the types are wrong lol
        writerRef.current.releaseLock().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, []);

  return state;
};

const indexes = [
  [5, 11, 17, 23, 29, 35, 41, 47, 53, 59],
  [4, 10, 16, 22, 28, 34, 40, 46, 52, 58],
  [3, 9, 15, 21, 27, 33, 39, 45, 51, 57],
  [2, 8, 14, 20, 26, 32, 38, 44, 50, 56],
  [1, 7, 13, 19, 25, 31, 37, 43, 49, 55],
  [0, 6, 12, 18, 24, 30, 36, 42, 48, 54],
] as const;

function gridToLedIndex(row: number, col: number): number {
  return indexes[row]?.[col] ?? -1;
}
