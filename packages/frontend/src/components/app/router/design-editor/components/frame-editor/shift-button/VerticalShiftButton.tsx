import type {AnimationFrame} from "@shared/types/AnimationFrame";
import type {FC} from "react";

interface Props {
	direction: "Up" | "Down";
	frame: AnimationFrame;
	onFrameChange: (frame: AnimationFrame) => void;
}

export const VerticalShiftButton: FC<Props> = ({direction, frame, onFrameChange}) => {
	const handleClick = () => {
		const shiftedFrame = {
			...frame,
			grid:
				direction === "Up"
					? // Move first row to the end
					  [...frame.grid.slice(1), frame.grid[0]]
					: [frame.grid[frame.grid.length - 1], ...frame.grid.slice(0, -1)],
		};
		console.log(shiftedFrame);

		onFrameChange(shiftedFrame);
	};

	return (
		<div className={`col-span-full ${direction === "Up" ? "mb-2" : "mt-2"}`}>
			<div className="flex w-full items-center justify-center">
				<button
					className="bg-gray-600 hover:bg-gray-500 transition-colors rounded py-1 px-4 flex items-center justify-center"
					onClick={handleClick}
				>
					Shift {direction}
				</button>
			</div>
		</div>
	);
};
