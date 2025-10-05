import {AudioMode} from "@src/components/app/router/audio-mode/AudioMode";
import {DesignEditor} from "@src/components/app/router/design-editor/DesignEditor";
import {DesignPicker} from "@src/components/app/router/design-picker/DesignPicker";
import {useDesignPlayer} from "@src/components/app/router/hooks/UseDesignPlayer";
import {useEditingDesignState} from "@src/store/hooks/UseEditingDesignState";
import {usePlayingDesignState} from "@src/store/hooks/UsePlayingDesignState";
import type {FC} from "react";

export const Router: FC = () => {
	const [editingDesign, setEditingDesign] = useEditingDesignState();
	const [playingDesignId] = usePlayingDesignState();

	useDesignPlayer();

	if (editingDesign) {
		return <DesignEditor design={editingDesign} setEditingDesign={setEditingDesign} />;
	}

	if (playingDesignId === "audio") {
		return <AudioMode />;
	}

	return <DesignPicker />;
};
