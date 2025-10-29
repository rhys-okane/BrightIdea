import {usePlayingDesignState} from "@src/store/hooks/UsePlayingDesignState";
import type {PlayableDesign} from "@src/store/types/design/StoreDesign";
import {useCallback} from "react";
import {toast} from "react-toastify";

export const useOnDesignPlay = () => {
	const [, setPlayingDesignId] = usePlayingDesignState();

	return useCallback(
		(design: PlayableDesign) => {
			toast.info(`Playing ${design.name} by ${design.createdBy}`);

			setPlayingDesignId({
				id: design.id,
				isMine: design.isMine,
			});
		},
		[setPlayingDesignId],
	);
};
