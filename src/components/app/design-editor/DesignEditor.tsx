import { ColourPicker } from "@src/components/app/design-editor/colour-picker/ColourPicker";
import { MAX_SAFE_BRIGHTNESS } from "@src/constants/LedGrid";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import {
  rgbCellToColour,
  rgbToCss,
  type RGBBrightnessCell,
} from "@src/store/types/design/frame/Frame";
import { useMemo, useState, type FC } from "react";

interface Props {
  designId: string;
}

export const DesignEditor: FC<Props> = ({ designId }) => {
  const [designs] = useDesignsState();
  const [selectedColour, setSelectedColour] = useState<RGBBrightnessCell>([
    255,
    255,
    255,
    MAX_SAFE_BRIGHTNESS,
  ]);

  const design = useMemo(() => {
    return designs.find((design) => design.id === designId)!;
  }, [designId, designs]);

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col iEtems-center justify-center text-white">
      <div></div>

      <ColourPicker
        selectedColour={selectedColour}
        setSelectedColour={setSelectedColour}
      />
    </main>
  );
};

interface CellProps {
  colour: RGBBrightnessCell;
}

const Cell: FC<CellProps> = () => {
  return (
    <div
      className="w-8 h-8 border border-black"
      style={{
        backgroundColor: rgbToCss(
          rgbCellToColour([255, 0, 0, MAX_SAFE_BRIGHTNESS])
        ),
      }}
    ></div>
  );
};
