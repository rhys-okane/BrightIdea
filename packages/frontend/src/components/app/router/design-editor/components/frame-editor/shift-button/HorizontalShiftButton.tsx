import type {AnimationFrame} from "@shared/types/AnimationFrame";
import type {FC} from "react";

interface Props {
	direction: "Left" | "Right";
	frame: AnimationFrame;
	onFrameChange: (frame: AnimationFrame) => void;
}

export const HorizontalShiftButton: FC<Props> = ({direction, frame, onFrameChange}) => {
	const handleClick = () => {
		const shiftedFrame = {
			...frame,
			grid:
				direction === "Left"
					? // Move first column to the end
					  frame.grid.map(row => [...row.slice(1), row[0]])
					: frame.grid.map(row => [row[row.length - 1], ...row.slice(0, -1)]),
		};
		console.log(shiftedFrame);

		onFrameChange(shiftedFrame);
	};

	return (
		<div className={`col-span-full ${direction === "Left" ? "mr-2" : "ml-2"}`}>
			<div className="flex w-full items-center justify-center">
				<button
					className="bg-gray-600 hover:bg-gray-500 transition-colors rounded py-1 px-4 flex items-center justify-center"
					onClick={handleClick}
				>
					Shift
					<br />
					{direction}
				</button>
			</div>
		</div>
	);
};
