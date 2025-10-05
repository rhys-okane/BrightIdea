import {useCallback, useEffect, useState, type FC} from "react";
import {faClone, faEdit, faPlay, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import type {
	MyStoreDesign,
	NewStoreDesign,
	PlayableDesign,
	SomeoneElsesStoreDesign,
} from "@src/store/types/design/StoreDesign";
import {usePlayingDesignState} from "@src/store/hooks/UsePlayingDesignState";
import {useEditingDesignState} from "@src/store/hooks/UseEditingDesignState";
import {FramePreviewWithOverlay} from "@src/components/app/router/shared/FramePreviewWIthOverlay";
import {FramePreviewOverlayButton} from "@src/components/app/router/shared/button/FramePreviewOverlayButton";

interface Props {
	design: PlayableDesign;
}

export const DesignPreview: FC<Props> = ({design}) => {
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
	const currentFrame = design.frames[currentFrameIndex];

	const [, setEditingDesign] = useEditingDesignState();
	const [, setPlayingDesignId] = usePlayingDesignState();

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentFrameIndex(prevIndex => (prevIndex + 1) % design.frames.length);
		}, currentFrame.duration);

		return () => clearInterval(interval);
	});

	const onDesignPlay = useCallback(() => {
		setPlayingDesignId({
			id: design.id,
			isMine: design.isMine,
		});
	}, [design.id, design.isMine, setPlayingDesignId]);

	const onDesignEdit = useCallback(
		(myDesign: MyStoreDesign) => {
			setEditingDesign(myDesign);
		},
		[setEditingDesign],
	);

	const onDesignClone = useCallback(
		(designToClone: SomeoneElsesStoreDesign) => {
			const clonedDesign: NewStoreDesign = {
				...designToClone,
				createdBy: "",
				isMine: true,
				isNew: true,
			};

			setEditingDesign(clonedDesign);
		},
		[setEditingDesign],
	);

	const onDesignDelete = useCallback((design: MyStoreDesign) => {
		// setDesigns(designs.filter(d => d.id !== design.id));
	}, []);

	return (
		<div className="relative inline-block group" style={{width: "fit-content"}}>
			<FramePreviewWithOverlay frame={currentFrame} selected={false}>
				<FramePreviewOverlayButton
					ariaLabel="Play design"
					tooltip="Play this design. Requires helmet connection"
					icon={faPlay}
					variant={"positive"}
					onClick={onDesignPlay}
				/>

				{design.isMine && (
					<>
						<FramePreviewOverlayButton
							ariaLabel="Edit design"
							tooltip="Edit this design"
							icon={faEdit}
							variant={"warning"}
							onClick={() => onDesignEdit(design)}
						/>

						<FramePreviewOverlayButton
							ariaLabel="Delete design"
							tooltip="Delete and unpublish your design"
							icon={faTrashCan}
							variant={"danger"}
							onClick={() => onDesignDelete(design)}
						/>
					</>
				)}
				{!design.isMine && (
					<FramePreviewOverlayButton
						ariaLabel="Clone design"
						tooltip="Clone this design"
						icon={faClone}
						variant={"warning"}
						onClick={() => onDesignClone(design)}
					/>
				)}
			</FramePreviewWithOverlay>
		</div>
	);
};
