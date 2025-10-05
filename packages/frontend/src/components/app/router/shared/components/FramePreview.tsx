import {Cell} from "@src/components/app/router/design-editor/components/frame-editor/cell/Cell";
import {LED_COLUMN_COUNT} from "@shared/constants/LedGrid";
import type {FC} from "react";
import type {AnimationFrame} from "@shared/types/AnimationFrame";

interface Props {
	frame: AnimationFrame;
	selected: boolean;
}
export const FramePreview: FC<Props> = ({frame, selected = false}) => {
	return (
		<div className="flex flex-col items-center justify-center h-full">
			<div
				className={`grid gap-1 border border-white bg-gray-900 w-fit p-3 ${selected ? "border-2" : ""}`}
				style={{
					gridTemplateColumns: `repeat(${LED_COLUMN_COUNT}, minmax(0, 1fr))`,
				}}
			>
				{frame.grid.map((row, rowIndex) =>
					row.map((cell, colIndex) => <Cell key={`${rowIndex}-${colIndex}`} cell={cell} variant="small" />),
				)}
			</div>
		</div>
	);
};
