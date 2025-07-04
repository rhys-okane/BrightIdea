import { ColourPicker } from "@src/components/app/router/design-editor/colour-picker/ColourPicker";
import { FrameEditor } from "@src/components/app/router/design-editor/frame-editor/FrameEditor";
import { FrameSelector } from "@src/components/app/router/design-editor/frame-selector/FrameSelector";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import { useEditingDesignIdState } from "@src/store/hooks/UseEditingDesignIdState";
import {
  getNewFrame,
  type AnimationFrame,
  type Grid,
  type RGBColour,
} from "@src/store/types/design/frame/Frame";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

interface Props {
  designId: string;
}

export const DesignEditor: FC<Props> = ({ designId }) => {
  const [designs, setDesigns] = useDesignsState();
  const [selectedColour, setSelectedColour] = useState<RGBColour>([
    255, 255, 255,
  ]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [, setEditingDesignId] = useEditingDesignIdState();

  const isMouseDown = useRef<boolean>(false);

  useEffect(() => {
    const onMouseDown = () => {
      isMouseDown.current = true;
    };

    const onMouseUp = () => {
      isMouseDown.current = false;
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isMouseDown]);

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

  const onFrameAdd = useCallback(
    (position: "Start" | "End") => {
      const newFrame: AnimationFrame = getNewFrame();

      const updatedFrames =
        position === "Start"
          ? [newFrame, ...design.frames]
          : [...design.frames, newFrame];

      const updatedDesign = {
        ...design,
        frames: updatedFrames,
      };

      setDesigns(designs.map((d) => (d.id === designId ? updatedDesign : d)));
      setSelectedFrameIndex(
        position === "Start" ? 0 : updatedFrames.length - 1
      );
    },
    [design, designId, designs, setDesigns]
  );

  const onDurationChange = useCallback(
    (duration: number) => {
      const updatedFrame: AnimationFrame = {
        ...selectedFrame,
        duration,
      };

      const updatedDesign = {
        ...design,
        frames: design.frames.map((frame, idx) =>
          idx === selectedFrameIndex ? updatedFrame : frame
        ),
      };

      setDesigns(designs.map((d) => (d.id === designId ? updatedDesign : d)));
    },
    [design, designId, designs, selectedFrame, selectedFrameIndex, setDesigns]
  );

  return (
    <main className="min-h-screen bg-neutral-950 flex text-white w-full py-4 flex-col justify-between items-stretch">
      <nav className="flex items-center w-full justify-center">
        <div className="flex flex-col mb-4 gap-4">
          <div className="flex items-center justify-between w-full flex-col">
            <h1 className="text-3xl font-bold mb-2">Design Editor</h1>
            <p className="text-gray-400">
              Editing Design: {design.name} (ID: {design.id})
            </p>
          </div>
          <div className="items-center flex justify-center">
            <button
              className="justify-self-end bg-blue-500 hover:bg-blue-600 transition-colors rounded py-2 px-4"
              onClick={() => setEditingDesignId(undefined)}
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="top-0 bottom-0 left-0 z-10 absolute min-w-52 h-full">
        <div className="flex items-center justify-center h-full">
          <ColourPicker
            selectedColour={selectedColour}
            setSelectedColour={setSelectedColour}
          />
        </div>
      </div>

      <FrameEditor
        frame={selectedFrame}
        onCellClick={onCellClick}
        isMouseDown={isMouseDown}
        onDurationChange={onDurationChange}
      />

      <FrameSelector
        frames={design.frames}
        selectedFrameIndex={selectedFrameIndex}
        onFrameSelect={setSelectedFrameIndex}
        onFrameAdd={onFrameAdd}
      />
    </main>
  );
};
