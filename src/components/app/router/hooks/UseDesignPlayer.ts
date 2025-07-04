import { LED_COLUMN_COUNT } from "@src/constants/LedGrid";
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
  const animationTimeoutRef = useRef<number | null>(null);
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

  // Function to convert 2D grid index to 1D LED index
  const gridToLedIndex = (row: number, col: number): number => {
    return row * LED_COLUMN_COUNT + col; // Assuming 97 columns based on 0-96 range
  };

  // Function to format LED command
  const formatLedCommand = (index: number, rgb: RGBColour): string => {
    const [r, g, b] = rgb;
    return `${index},${r},${g},${b};`;
  };

  // Function to send a single frame
  const sendFrame = useCallback(async (frame: AnimationFrame) => {
    if (!writerRef.current) return;

    try {
      let commands = "";

      // Convert 2D grid to serial commands
      frame.grid.forEach((row, rowIndex) => {
        row.forEach((color, colIndex) => {
          const ledIndex = gridToLedIndex(rowIndex, colIndex);
          commands += formatLedCommand(ledIndex, color);
        });
      });

      console.log(commands);
      // Send all commands for this frame
      const encoder = new TextEncoder();
      await writerRef.current.write(encoder.encode(commands));

      console.log(
        `Sent frame ${animationStateRef.current.frameIndex} with ${
          frame.grid.length * frame.grid[0].length
        } LEDs`
      );
    } catch (error) {
      console.error("Error sending frame:", error);
      setState((prev) => ({ ...prev, error: `Send error: ${error}` }));
    }
  }, []);

  // Function to play the next frame in sequence
  const playNextFrame = useCallback(async () => {
    const { design, frameIndex } = animationStateRef.current;

    if (!design || !port || !animationStateRef.current.isLooping) return;

    const currentFrame = design.frames[frameIndex];
    if (!currentFrame) return;

    // Send the current frame
    await sendFrame(currentFrame);

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
