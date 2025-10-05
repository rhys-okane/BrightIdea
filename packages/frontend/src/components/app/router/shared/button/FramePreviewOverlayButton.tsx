import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {TooltipWrapper} from "@src/components/ui/derived/TooltipWrapper";
import {cn} from "@src/lib/utils";
import {cva, type VariantProps} from "class-variance-authority";
import type {FC} from "react";

const buttonVariants = cva("mx-2 p-2 text-white rounded transition", {
	variants: {
		variant: {
			warning: "bg-yellow-500 hover:bg-yellow-400",
			danger: "bg-red-500 hover:bg-red-400",
			positive: "bg-green-500 hover:bg-green-400",
		},
	},
});

interface Props {
	onClick?: () => void;
	ariaLabel: string;
	className?: string;
	tooltip: string;
	icon: IconDefinition;
	variant: VariantProps<typeof buttonVariants>["variant"];
}

export const FramePreviewOverlayButton: FC<Props> = ({onClick, ariaLabel, tooltip, className, variant, icon}) => {
	return (
		<TooltipWrapper content={tooltip}>
			<button className={cn(buttonVariants({variant}), className)} aria-label={ariaLabel} onClick={onClick}>
				<FontAwesomeIcon icon={icon} />
			</button>
		</TooltipWrapper>
	);
};
