import type {RGBColour, AnimationFrame} from "@shared/types/AnimationFrame";
import type {PlayableDesign} from "@src/store/types/design/StoreDesign";
import {useHighBrowStore} from "@src/store/ZustandStore";
import {useState, useEffect, useCallback, useRef} from "react";

interface DesignPlayerState {
	isPlaying: boolean;
	currentFrame: number;
	error: string | null;
}

const WLED_URL = "http://4.3.2.1/json";

const indexes = [
	[54, 53, 42, 41, 30, 29, 18, 17, 6, 5],
	[55, 52, 43, 40, 31, 28, 19, 16, 7, 4],
	[56, 51, 44, 39, 32, 27, 20, 15, 8, 3],
	[57, 50, 45, 38, 33, 26, 21, 14, 9, 2],
	[58, 49, 46, 37, 34, 25, 22, 13, 10, 1],
	[59, 48, 47, 36, 35, 24, 23, 12, 11, 0],
] as const;

type LedCommand = [number, [number, number, number]];

async function setLeds(commands: LedCommand[]) {
	const orderedCommands = commands.sort((a, b) => a[0] - b[0]).map(cmd => cmd[1]);

	try {
		console.log("Setting WLED LEDs");
		const response = await fetch(`${WLED_URL}/si`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				seg: {
					i: orderedCommands,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		console.log("WLED response:", data);
	} catch (error) {
		console.error("Error setting WLED LEDs:", error);
	}
}

export const useDesignPlayer = (): DesignPlayerState => {
	const playingDesign = useHighBrowStore(state => state.getPlayingDesign)();

	const [state, setState] = useState<DesignPlayerState>({
		isPlaying: false,
		currentFrame: 0,
		error: null,
	});

	const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const animationStateRef = useRef<{
		design: PlayableDesign | null;
		frameIndex: number;
		isLooping: boolean;
	}>({
		design: null,
		frameIndex: 0,
		isLooping: false,
	});

	// Function to format LED command
	const formatLedCommand = (index: number, rgb: RGBColour): [number, [number, number, number]] => {
		const [r, g, b] = rgb;
		return [index, [r, g, b]];
	};

	// Function to send a single frame
	const sendFrame = useCallback(async (frame: AnimationFrame) => {
		try {
			const commands: [number, [number, number, number]][] = [];

			// Convert 2D grid to serial commands
			frame.grid.forEach((row, rowIndex) => {
				row.forEach((color, colIndex) => {
					const ledIndex = gridToLedIndex(rowIndex, colIndex);
					commands.push(formatLedCommand(ledIndex, color));
				});
			});

			console.log(commands);
			await setLeds(commands);

			console.log(
				`Sent frame ${animationStateRef.current.frameIndex} with ${
					frame.grid.length * frame.grid[0].length
				} LEDs`,
			);
		} catch (error) {
			console.error("Error sending frame:", error);
			setState(prev => ({...prev, error: `Send error: ${error}`}));
		}
	}, []);

	// Function to play the next frame in sequence
	const playNextFrame = useCallback(async () => {
		console.log("Playing frame");
		const {design, frameIndex} = animationStateRef.current;

		if (!design || !animationStateRef.current.isLooping) return;

		const currentFrame = design.frames[frameIndex];
		if (!currentFrame) return;

		// Send the current frame
		await sendFrame(currentFrame);

		// Update state to reflect current frame
		setState(prev => ({...prev, currentFrame: frameIndex}));

		// Schedule next frame
		animationTimeoutRef.current = setTimeout(() => {
			const nextFrameIndex = (frameIndex + 1) % design.frames.length;
			animationStateRef.current.frameIndex = nextFrameIndex;

			// Continue looping if still playing
			if (animationStateRef.current.isLooping) {
				playNextFrame();
			}
		}, currentFrame.duration);
	}, [sendFrame]);

	// Function to start playing a design
	const startDesign = useCallback(
		async (design: PlayableDesign) => {
			if (!design.frames.length) {
				console.warn("Cannot start design - no frames");
				return;
			}

			try {
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

				setState(prev => ({
					...prev,
					isPlaying: true,
					currentFrame: 0,
					error: null,
				}));

				console.log(`Starting design: ${design.name} (${design.frames.length} frames)`);

				// Start the animation
				await playNextFrame();
			} catch (error) {
				console.error("Error starting design:", error);
				setState(prev => ({...prev, error: `Start error: ${error}`}));
			}
		},
		[playNextFrame],
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

			setState(prev => ({
				...prev,
				isPlaying: false,
				currentFrame: 0,
				error: null,
			}));

			console.log("Design playback stopped");
		} catch (error) {
			console.error("Error stopping design:", error);
			setState(prev => ({...prev, error: `Stop error: ${error}`}));
		}
	}, []);

	// Effect to handle playingDesignId changes
	useEffect(() => {
		if (playingDesign) {
			// Start playing the selected design
			startDesign(playingDesign);
		} else {
			// Stop playing when no design is selected
			stopDesign();
		}
	}, [playingDesign, startDesign, stopDesign]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
			}
		};
	}, []);

	return state;
};

function gridToLedIndex(row: number, col: number): number {
	return indexes[row]?.[col] ?? -1;
}
