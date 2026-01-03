import { useEffect, useState, type FC } from "react";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { FramePreviewWithOverlay } from "@src/components/app/router/shared/FramePreviewWIthOverlay";
import { type TurnstileInstance } from "@marsidev/react-turnstile";
import { SomeoneElsesDesignPreviewButtons } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/SomeoneElsesDesignPreview";
import { MyDesignPreviewButtons } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/MyDesignPreviewButtons";

interface Props {
  design: PlayableDesign;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  variant?: "full" | "design only";
  onDesignDelete?: (designId: string) => void;
}

export const DesignPreview: FC<Props> = ({
  design,
  turnstileRef,
  variant = "design only",
  onDesignDelete,
}) => {
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
    <div className="w-fit flex flex-col gap-2">
      <div className="relative inline-block group">
        <FramePreviewWithOverlay frame={currentFrame} selected={false}>
          {design.isMine ? (
            <MyDesignPreviewButtons
              design={design}
              turnstileRef={turnstileRef}
              onDesignDelete={onDesignDelete}
            />
          ) : (
            <SomeoneElsesDesignPreviewButtons
              design={design}
              onDesignDelete={onDesignDelete}
            />
          )}
        </FramePreviewWithOverlay>
      </div>

      {variant === "full" && (
        <div className="items-center flex flex-col">
          <span
            className={
              "font-space-mono text-xl text-white truncate max-w-[180px] text-center text-wrap break-words"
            }
          >
            {design.name}
          </span>
          <hr className="border-t border-gray-400 w-[50%]" />

          <div className="flex flex-row text-xl gap-1">
            <p className="text-gray-400">By </p>
            <span className="text-white truncate max-w-[180px]">
              {design.createdBy}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
