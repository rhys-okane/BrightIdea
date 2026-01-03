import { AudioMode } from "@src/components/app/router/audio-mode/AudioMode";
import { DesignEditor } from "@src/components/app/router/design-editor/DesignEditor";
import { DesignPicker } from "@src/components/app/router/design-picker/DesignPicker";
import { useDesignPlayer } from "@src/components/app/router/hooks/UseDesignPlayer";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import { useGalleryViewState } from "@src/store/hooks/UseGalleryViewState";
import { usePlayingDesignState } from "@src/store/hooks/UsePlayingDesignState";
import type { FC } from "react";
import { GalleryView } from "./gallery-view/GalleryView";
import { useAuthSync } from "@src/components/app/router/hooks/UseAuthSync";

export const Router: FC = () => {
  const [editingDesign, setEditingDesign] = useEditingDesignState();
  const [playingDesignId] = usePlayingDesignState();
  const [showingGallery] = useGalleryViewState();

  useDesignPlayer();
  useAuthSync();

  if (editingDesign) {
    return (
      <DesignEditor
        design={editingDesign}
        setEditingDesign={setEditingDesign}
      />
    );
  }

  if (playingDesignId === "audio") {
    return <AudioMode />;
  }

  if (showingGallery) {
    return <GalleryView />;
  }

  return <DesignPicker />;
};
