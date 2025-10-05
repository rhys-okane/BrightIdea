import {Tooltip, TooltipContent, TooltipTrigger} from "@src/components/ui/tooltip";
import type {ReactNode, FC} from "react";

interface Props {
	children: ReactNode;
	content: ReactNode;
}

export const TooltipWrapper: FC<Props> = ({children, content}) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent>{content}</TooltipContent>
		</Tooltip>
	);
};
