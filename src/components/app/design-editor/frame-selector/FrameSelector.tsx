import type { AnimationFrame } from "@src/store/types/design/frame/Frame";
import type { FC } from "react";

interface Props {
  frames: AnimationFrame[];
  selectedFrameIndex: number;
  onFrameSelect: (index: number) => void;
}

export const FrameSelector: FC<Props> = ({
  frames,
  selectedFrameIndex,
  onFrameSelect,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full"></div>
  );
};
