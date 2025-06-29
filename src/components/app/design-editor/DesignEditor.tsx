import { ColourPicker } from "@src/components/app/design-editor/colour-picker/ColourPicker";
import { FrameEditor } from "@src/components/app/design-editor/frame-editor/FrameEditor";
import { FrameSelector } from "@src/components/app/design-editor/frame-selector/FrameSelector";
import { MAX_SAFE_BRIGHTNESS } from "@src/constants/LedGrid";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import {
  type AnimationFrame,
  type Grid,
  type RGBBrightnessCell,
} from "@src/store/types/design/frame/Frame";
import { useMemo, useState, type FC } from "react";

interface Props {
  designId: string;
}

export const DesignEditor: FC<Props> = ({ designId }) => {
  const [designs, setDesigns] = useDesignsState();
  const [selectedColour, setSelectedColour] = useState<RGBBrightnessCell>([
    255,
    255,
    255,
    MAX_SAFE_BRIGHTNESS,
  ]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  const design = useMemo(() => {
    return designs.find((design) => design.id === designId)!;
  }, [designId, designs]);

  const selectedFrame = useMemo(() => {
    return design.frames[selectedFrameIndex];
  }, [design.frames, selectedFrameIndex]);

  const onCellClick = (rowIndex: number, colIndex: number) => {
    // Update the selected frame with the new colour
    const updatedGrid: Grid = selectedFrame.grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex
          ? [...selectedColour] // Update the clicked cell with the selected colour
          : cell
      )
    );

    // designs is an array of design objects, each with a frames array, update the designs array
    const updatedFrame: AnimationFrame = {
      ...selectedFrame,
      grid: updatedGrid,
    };
    const updatedDesign = {
      ...design,
      frames: design.frames.map((frame, idx) =>
        idx === selectedFrameIndex ? updatedFrame : frame
      ),
    };
    setDesigns(designs.map((d) => (d.id === designId ? updatedDesign : d)));
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex justify-center text-white flex-row w-full">
      <div className="top-0 bottom-0 left-0 z-10 absolute min-w-52 h-full">
        <div className="flex items-center justify-center h-full">
          <ColourPicker
            selectedColour={selectedColour}
            setSelectedColour={setSelectedColour}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <FrameEditor frame={selectedFrame} onCellClick={onCellClick} />

        <FrameSelector
          frames={design.frames}
          selectedFrameIndex={selectedFrameIndex}
          onFrameSelect={setSelectedFrameIndex}
        />
      </div>
    </main>
  );
};
