import type {AnimationFrame} from "@shared/types/AnimationFrame";
import {FramePreview} from "@src/components/app/router/shared/FramePreview";
import {Carousel, CarouselContent, CarouselItem} from "@src/components/ui/carousel";
import {PlusIcon} from "lucide-react";
import {type FC} from "react";

interface Props {
	frames: AnimationFrame[];
	selectedFrameIndex: number;
	onFrameSelect: (index: number) => void;
	onFrameAdd: (position: "Start" | "End") => void;
}

export const FrameSelector: FC<Props> = ({frames, selectedFrameIndex, onFrameSelect, onFrameAdd}) => {
	return (
		<div className="flex flex-row gap-2 justify-center w-full items-stretch">
			<button
				className="bg-gray-600 hover:bg-gray-500 transition-colors rounded p-1 flex items-center justify-center"
				onClick={() => onFrameAdd("Start")}
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
								<FramePreview frame={frame} key={index} selected={selectedFrameIndex === index} />
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			<button
				className="bg-gray-600 hover:bg-gray-500 transition-colors rounded p-1 flex items-center justify-center"
				onClick={() => onFrameAdd("End")}
			>
				<PlusIcon width={20} />
			</button>
		</div>
	);
};
