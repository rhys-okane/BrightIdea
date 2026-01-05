import {faPlay, faEdit, faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";
import type {TurnstileInstance} from "@marsidev/react-turnstile";
import {CautionDialog} from "@src/components/app/router/design-editor/components/CautionDialog";
import {useDeleteDesignInApi} from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/hooks/UseDeleteDesignInApi";
import {useOnDesignPlay} from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/hooks/UseOnDesignPlay";
import {FramePreviewOverlayButton} from "@src/components/app/router/shared/button/FramePreviewOverlayButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import {useEditingDesignState} from "@src/store/hooks/UseEditingDesignState";
import {useViewingMediaForDesignState} from "@src/store/hooks/UseViewingMediaForDesignState";
import type {MyStoreDesign} from "@src/store/types/design/StoreDesign";
import {useCallback, useState, type FC} from "react";

interface Props {
	design: MyStoreDesign;
	turnstileRef: React.RefObject<TurnstileInstance | null>;
	onDesignDelete?: (designId: string) => void;
}

export const MyDesignPreviewButtons: FC<Props> = ({design, turnstileRef, onDesignDelete}) => {
	const [, setEditingDesign] = useEditingDesignState();
	const [open, setOpen] = useState(false);
	const [, setViewingMediaForDesign] = useViewingMediaForDesignState();
	const onDesignPlay = useOnDesignPlay();

	const deleteDesignInApi = useDeleteDesignInApi(turnstileRef);

	const onDesignEdit = useCallback(
		(design: MyStoreDesign) => {
			setEditingDesign(design);
		},
		[setEditingDesign],
	);

	return (
		<>
			<FramePreviewOverlayButton
				ariaLabel="Play design"
				tooltip="Play this design. Requires helmet connection"
				icon={faPlay}
				variant={"positive"}
				onClick={() => onDesignPlay(design)}
			/>

			<FramePreviewOverlayButton
				ariaLabel="Edit design"
				tooltip="Edit this design"
				icon={faEdit}
				variant={"warning"}
				onClick={() => onDesignEdit(design)}
			/>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<FramePreviewOverlayButton
						ariaLabel="More options"
						tooltip="More options"
						icon={faEllipsisVertical}
						variant={"info"}
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => setViewingMediaForDesign(design)}>Manage media</DropdownMenuItem>

					<DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
						Delete Design
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<CautionDialog
				title="Delete design"
				description="Are you sure you want to delete this design? This action cannot be undone."
				open={open}
				onConfirm={() => {
					deleteDesignInApi(design);
					onDesignDelete?.(design.id);
					setOpen(false);
				}}
				onOpenChange={setOpen}
			/>
		</>
	);
};
