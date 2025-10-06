import { useEffect, useState, type FC } from "react";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { FramePreviewWithOverlay } from "@src/components/app/router/shared/FramePreviewWIthOverlay";
import { type TurnstileInstance } from "@marsidev/react-turnstile";
import { SomeoneElsesDesignPreviewButtons } from "@src/components/app/router/design-picker/design-carousel/design-preview/buttons/SomeoneElsesDesignPreview";
import { MyDesignPreviewButtons } from "@src/components/app/router/design-picker/design-carousel/design-preview/buttons/MyDesignPreviewButtons";

interface Props {
  design: PlayableDesign;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
}

export const DesignPreview: FC<Props> = ({ design, turnstileRef }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const currentFrame = design.frames[currentFrameIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrameIndex(
        (prevIndex) => (prevIndex + 1) % design.frames.length
      );
    }, currentFrame.duration);

    return () => clearInterval(interval);
  });

  return (
    <div
      className="relative inline-block group"
      style={{ width: "fit-content" }}
    >
      <FramePreviewWithOverlay frame={currentFrame} selected={false}>
        {design.isMine ? (
          <MyDesignPreviewButtons design={design} turnstileRef={turnstileRef} />
        ) : (
          <SomeoneElsesDesignPreviewButtons design={design} />
        )}
      </FramePreviewWithOverlay>
    </div>
  );
};
