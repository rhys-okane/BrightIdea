import {Cell} from "@src/components/app/router/design-editor/components/frame-editor/cell/Cell";
import {LED_COLUMN_COUNT} from "@shared/constants/LedGrid";
import {useCallback, useEffect, useMemo, useRef, type FC} from "react";
import type {AnimationFrame, Grid, RGBColour} from "@shared/types/AnimationFrame";
import {ShiftButton} from "@src/components/app/router/design-editor/components/frame-editor/shift-button/ShiftButton";

interface Props {
	frame: AnimationFrame;
	selectedColour: RGBColour;

	onFrameChange: (frame: AnimationFrame) => void;
	onDurationChange: (duration: number) => void;
}

export const FrameEditor: FC<Props> = ({frame, selectedColour, onFrameChange, onDurationChange}) => {
	const mouseButtonDown = useRef<"left" | "right" | undefined>(undefined);

	const onCellClick = useCallback(
		(mouseButton: "left" | "right", clickedRowIndex: number, clickedColumnIndex: number) => {
			// Update the selected frame with the new colour
			const updatedGrid: Grid = frame.grid.map((row, rIdx) =>
				row.map((cell, cIdx) => {
					if (rIdx === clickedRowIndex && cIdx === clickedColumnIndex) {
						return mouseButton === "left" ? [...selectedColour] : [0, 0, 0];
					}

					return cell;
				}),
			);

			const updatedFrame: AnimationFrame = {
				...frame,
				grid: updatedGrid,
			};

			onFrameChange(updatedFrame);
		},
		[frame, onFrameChange, selectedColour],
	);

	useEffect(() => {
		const onMouseDown = (event: MouseEvent) => {
			if (event.button === 0) {
				mouseButtonDown.current = "left";
			} else if (event.button === 2) {
				mouseButtonDown.current = "right";
			}
		};

		const onMouseUp = () => {
			mouseButtonDown.current = undefined;
		};

		const onContextMenu = (e: MouseEvent) => {
			e.preventDefault();
		};

		window.addEventListener("contextmenu", onContextMenu);
		window.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mouseup", onMouseUp);

		return () => {
			window.removeEventListener("contextmenu", onContextMenu);
			window.removeEventListener("mousedown", onMouseDown);
			window.removeEventListener("mouseup", onMouseUp);
		};
	}, [mouseButtonDown]);

	const gridCols = useMemo(() => {
		return {
			gridTemplateColumns: `repeat(${LED_COLUMN_COUNT}, minmax(0, 1fr))`,
		};
	}, []);

	const onMouseEnter = useCallback(
		(rowIndex: number, colIndex: number) => {
			if (mouseButtonDown?.current) {
				onCellClick(mouseButtonDown.current, rowIndex, colIndex);
			}
		},
		[mouseButtonDown, onCellClick],
	);

	return (
		<div className="flex flex-col items-center gap-4 w-full select-none">
			<h2 className="text-2xl font-bold text-white">Frame Editor</h2>
			<div className="grid gap-y-2 gap-x-12" style={gridCols}>
				<ShiftButton direction="Up" frame={frame} onFrameChange={onFrameChange} />

				{frame.grid.map((row, rowIndex) =>
					row.map((cell, colIndex) => (
						<Cell
							key={`${rowIndex}-${colIndex}`}
							cell={cell}
							onClick={() => onCellClick("left", rowIndex, colIndex)}
							onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
						/>
					)),
				)}

				<ShiftButton direction="Down" frame={frame} onFrameChange={onFrameChange} />
			</div>

			<div className="flex items-center gap-4 w-full max-w-xs">
				<label className="text-gray-400 font-medium" htmlFor="frame-duration-slider">
					Frame Duration:
				</label>
				<input
					id="frame-duration-slider"
					type="range"
					min={10}
					max={2000}
					step={10}
					value={frame.duration}
					onChange={e => onDurationChange(Number(e.target.value))}
					className="flex-1 accent-blue-500"
				/>
				<input
					type="number"
					min={10}
					max={2000}
					step={10}
					value={frame.duration}
					onChange={e => onDurationChange(Number(e.target.value))}
					className="w-20 bg-gray-800 text-white rounded px-2 py-1 border border-gray-600"
				/>
				<span className="text-gray-400 ml-2">ms</span>
			</div>
		</div>
	);
};
