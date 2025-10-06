import { type RGBColour, rgbToCss } from "@shared/types/AnimationFrame.js";
import { EraserIcon } from "lucide-react";
import { type FC, useCallback, useRef, type ChangeEventHandler } from "react";

const PRESET_COLOURS: [number, number, number][] = [
  // [0, 0, 0],
  [128, 128, 128],
  [192, 192, 192],
  [255, 255, 255],
  [255, 0, 0],
  [128, 0, 0],
  [255, 165, 0],
  [255, 255, 0],
  [0, 255, 0],
  [0, 128, 0],
  [0, 255, 255],
  [0, 0, 255],
  [0, 0, 128],
  [128, 0, 128],
  [255, 0, 255],
  [139, 69, 19],
  [255, 192, 203],
  [255, 228, 196],
  [173, 216, 230],
  [211, 211, 211],
];

function coloursEqual(a: RGBColour, b: RGBColour): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

type Props = {
  selectedColour: RGBColour;
  setSelectedColour: (colour: RGBColour) => void;
};

export const ColourPicker: FC<Props> = ({
  selectedColour,
  setSelectedColour,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onCustomColourChange: ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        const hex = event.target.value;
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        setSelectedColour([r, g, b]);
      },
      [setSelectedColour]
    );

  const isEraserSelected = coloursEqual([0, 0, 0], selectedColour);

  return (
    <div className="max-w-52 p-4 border border-gray-300 rounded bg-white text-black">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-5 gap-2 p-2">
          <div
            onClick={() => setSelectedColour([0, 0, 0])}
            className={`w-8 h-8 rounded border-2 bg-black text-white flex items-center justify-center ${
              isEraserSelected ? "border-black" : "border-gray-300"
            }`}
          >
            <EraserIcon className="h-5 w-5" />
          </div>
          {PRESET_COLOURS.map((colour, idx) => {
            const isSelected = coloursEqual(colour, selectedColour);
            return (
              <div
                key={idx}
                onClick={() => setSelectedColour([...colour])}
                className={`w-8 h-8 rounded border-2 ${
                  isSelected ? "border-black" : "border-gray-300"
                }`}
                style={{ backgroundColor: rgbToCss(colour) }}
              />
            );
          })}
          <button
            className="col-span-5 border border-gray-400 p-1 rounded text-sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose custom colour
          </button>
          <input
            type="color"
            ref={inputRef}
            onChange={onCustomColourChange}
            className="hidden"
          />
        </div>

        <p className="flex flex-row items-center gap-2 font-semibold text-gray-800">
          Selected:
          <span
            className="inline-block w-8 h-8 rounded border-2 border-black"
            style={{
              backgroundColor: rgbToCss(selectedColour),
            }}
          />
        </p>
      </div>
    </div>
  );
};
