import type {TurnstileInstance} from "@marsidev/react-turnstile";
import {DesignPreview} from "@src/components/app/router/design-picker/design-carousel/design-preview/DesignPreview";
import type {PlayableDesign} from "@src/store/types/design/StoreDesign";
import type {FC} from "react";

interface Props {
	designs: PlayableDesign[];
	turnstileRef: React.RefObject<TurnstileInstance | null>;
}

export const DesignGrid: FC<Props> = ({designs, turnstileRef}) => {
	return (
		<div className="grid grid-cols-7 gap-4">
			{designs.map(design => (
				<DesignPreview design={design} key={design.id} turnstileRef={turnstileRef} variant="full" />
			))}
		</div>
	);
};
