import type {AnimationFrame} from "@shared/types/AnimationFrame";
import {FramePreview} from "@src/components/app/router/shared/components/FramePreview";
import type {FC} from "react";

interface Props {
	frame: AnimationFrame;
	selected: boolean;
	children: React.ReactNode;
}

export const FramePreviewWithOverlay: FC<Props> = ({frame, selected, children}) => {
	return (
		<div>
			<FramePreview frame={frame} selected={selected} />
			<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
				{children}
			</div>
		</div>
	);
};
