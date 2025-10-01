import { AudioMode } from "@src/components/app/router/audio-mode/AudioMode";
import { DesignEditor } from "@src/components/app/router/design-editor/DesignEditor";
import { DesignPicker } from "@src/components/app/router/design-picker/DesignPicker";
import { useDesignPlayer } from "@src/components/app/router/hooks/UseDesignPlayer";
import { useEditingDesignIdState } from "@src/store/hooks/UseEditingDesignIdState";
import { usePlayingDesignIdState } from "@src/store/hooks/UsePlayingDesignIdState";
import type { FC } from "react";

export const Router: FC = () => {
  const [editingDesignId] = useEditingDesignIdState();
  const [playingDesignId] = usePlayingDesignIdState();

  useDesignPlayer();

  if (editingDesignId) {
    return <DesignEditor designId={editingDesignId} />;
  }

  if (playingDesignId === "audio") {
    return <AudioMode />;
  }

  return <DesignPicker />;
};
