import {useEffect, useState, type FC} from "react";
import type {PlayableDesign} from "@src/store/types/design/StoreDesign";
import {FramePreviewWithOverlay} from "@src/components/app/router/shared/FramePreviewWIthOverlay";
import {type TurnstileInstance} from "@marsidev/react-turnstile";
import {SomeoneElsesDesignPreviewButtons} from "@src/components/app/router/design-picker/design-carousel/design-preview/buttons/SomeoneElsesDesignPreview";
import {MyDesignPreviewButtons} from "@src/components/app/router/design-picker/design-carousel/design-preview/buttons/MyDesignPreviewButtons";
import {FramePreview} from "@src/components/app/router/shared/components/FramePreview";
import {ContextMenu, ContextMenuContent, ContextMenuTrigger} from "@src/components/ui/context-menu";

interface Props {
	design: PlayableDesign;
	turnstileRef: React.RefObject<TurnstileInstance | null>;
}

export const DesignPreview: FC<Props> = ({design, turnstileRef}) => {
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
	const currentFrame = design.frames[currentFrameIndex];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentFrameIndex(prevIndex => (prevIndex + 1) % design.frames.length);
		}, currentFrame.duration);

		return () => clearInterval(interval);
	});

	return (
		<div className="relative inline-block group" style={{width: "fit-content"}}>
			<FramePreviewWithOverlay className="hidden lg:block" frame={currentFrame} selected={false}>
				{design.isMine ? (
					<MyDesignPreviewButtons design={design} turnstileRef={turnstileRef} />
				) : (
					<SomeoneElsesDesignPreviewButtons design={design} />
				)}
			</FramePreviewWithOverlay>

			<div className="flex lg:hidden">
				<ContextMenu>
					<ContextMenuTrigger>
						<FramePreview frame={currentFrame} selected={false} />
					</ContextMenuTrigger>
					<ContextMenuContent className="pointer-events-auto">
						{design.isMine ? (
							<MyDesignPreviewButtons design={design} turnstileRef={turnstileRef} />
						) : (
							<SomeoneElsesDesignPreviewButtons design={design} />
						)}
					</ContextMenuContent>
				</ContextMenu>
			</div>
		</div>
	);
};
