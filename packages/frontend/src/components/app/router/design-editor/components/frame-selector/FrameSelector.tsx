import type {AnimationFrame} from "@shared/types/AnimationFrame";
import {FramePreview} from "@src/components/app/router/shared/components/FramePreview";
import {Carousel, CarouselContent, CarouselItem} from "@src/components/ui/carousel";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@src/components/ui/context-menu";
import {getNewFrame} from "@src/store/types/design/frame/Frame";
import type {EditableStoreDesign} from "@src/store/types/design/StoreDesign";
import {PlusIcon} from "lucide-react";
import {useCallback, type FC, type MouseEvent} from "react";
import {toast} from "react-toastify";

interface Props {
	frames: AnimationFrame[];
	selectedFrameIndex: number;
	onFrameSelect: (index: number) => void;
	updateDesign: (changes: Partial<EditableStoreDesign>) => void;
}

export const FrameSelector: FC<Props> = ({frames, selectedFrameIndex, onFrameSelect, updateDesign}) => {
	const onFrameAdd = useCallback(
		(event: MouseEvent, position: "Start" | "End") => {
			const newFrame: AnimationFrame = event.shiftKey ? frames[frames.length - 1] : getNewFrame();

			const updatedFrames = position === "Start" ? [newFrame, ...frames] : [...frames, newFrame];

			updateDesign({
				frames: updatedFrames,
			});
			onFrameSelect(position === "Start" ? 0 : updatedFrames.length - 1);
		},
		[frames, onFrameSelect, updateDesign],
	);

	const onFrameDelete = useCallback(
		(index: number) => {
			if (frames.length === 1) {
				toast.error("You must have at least one frame in your design");
				return;
			}

			if (selectedFrameIndex === index) {
				onFrameSelect(Math.max(0, index - 1));
				console.log("Selecting", Math.max(0, index - 1));
			}

			const updatedFrames = frames.filter((_, i) => i !== index);
			updateDesign({
				frames: updatedFrames,
			});
		},
		[frames, onFrameSelect, selectedFrameIndex, updateDesign],
	);

	const onFrameDuplicate = useCallback(
		(index: number) => {
			const frameToDuplicate = frames[index];
			const updatedFrames = [...frames];
			updatedFrames.splice(index + 1, 0, frameToDuplicate);
			updateDesign({
				frames: updatedFrames,
			});
			onFrameSelect(index + 1);
		},
		[frames, onFrameSelect, updateDesign],
	);

	return (
		<div className="flex flex-row gap-2 justify-center w-full items-stretch">
			<button
				className="bg-gray-600 hover:bg-gray-500 transition-colors rounded p-1 flex items-center justify-center"
				onClick={event => onFrameAdd(event, "Start")}
			>
				<PlusIcon width={20} />
			</button>

			<div className="flex flex-col items-center justify-center h-full">
				<Carousel className="w-full px-2">
					<CarouselContent>
						{frames.map((frame, index) => (
							<CarouselItem
								className="basis-1/3 ml-2 flex justify-center flex-none"
								onClick={() => onFrameSelect(index)}
								key={index}
							>
								{/* TODO: Investigate problem with click through */}
								<ContextMenu>
									<ContextMenuTrigger>
										<FramePreview frame={frame} selected={index === selectedFrameIndex} />
									</ContextMenuTrigger>
									<ContextMenuContent className="pointer-events-auto">
										<ContextMenuItem onClick={() => onFrameDuplicate(index)}>
											Duplicate Frame
										</ContextMenuItem>
										<ContextMenuItem
											variant="destructive"
											onClick={() => onFrameDelete(index)}
											disabled={frames.length === 1}
										>
											Delete Frame
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			<button
				className="bg-gray-600 hover:bg-gray-500 transition-colors rounded p-1 flex items-center justify-center"
				onClick={event => onFrameAdd(event, "End")}
			>
				<PlusIcon width={20} />
			</button>
		</div>
	);
};
