import { FramePreview } from "@src/components/app/router/shared/FramePreview";
import type { Design } from "@src/store/types/design/Design";
import { useCallback, useEffect, useState, type FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlay, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import { useEditingDesignIdState } from "@src/store/hooks/UseEditingDesignIdState";
import { usePlayingDesignIdState } from "@src/store/hooks/UsePlayingDesignIdState";

interface Props {
  design: Design;
}

export const DesignPreview: FC<Props> = ({ design }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const currentFrame = design.frames[currentFrameIndex];

  const [designs, setDesigns] = useDesignsState();
  const [, setEditingDesignId] = useEditingDesignIdState();
  const [, setPlayingDesignId] = usePlayingDesignIdState();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrameIndex(
        (prevIndex) => (prevIndex + 1) % design.frames.length
      );
    }, currentFrame.duration);

    return () => clearInterval(interval);
  });

  const onDesignPlay = useCallback(() => {
    setPlayingDesignId(design.id);
  }, [design.id, setPlayingDesignId]);

  const onDesignEdit = useCallback(() => {
    setEditingDesignId(design.id);
  }, [design.id, setEditingDesignId]);

  const onDesignDelete = useCallback(() => {
    setDesigns(designs.filter((d) => d.id !== design.id));
  }, [design.id, designs, setDesigns]);

  return (
    <div
      className="relative inline-block group"
      style={{ width: "fit-content" }}
    >
      <FramePreview frame={currentFrame} key={design.id} selected={false} />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        <button
          className="mx-2 p-2 bg-green-500 text-white rounded hover:bg-green-400 transition"
          aria-label="Play design"
          onClick={onDesignPlay}
        >
          <FontAwesomeIcon icon={faPlay} />
        </button>
        <button
          className="mx-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition"
          aria-label="Edit design"
          onClick={onDesignEdit}
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button
          className="mx-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          aria-label="Delete design"
          onClick={onDesignDelete}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </div>
  );
};
