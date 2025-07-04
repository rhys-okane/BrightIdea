import { Cell } from "@src/components/app/router/design-editor/frame-editor/cell/Cell";
import { LED_COLUMN_COUNT } from "@src/constants/LedGrid";
import { type AnimationFrame } from "@src/store/types/design/frame/Frame";
import { useCallback, useMemo, type FC, type RefObject } from "react";

interface Props {
  frame: AnimationFrame;

  isMouseDown: RefObject<boolean>;
  onCellClick: (rowIndex: number, colIndex: number) => void;
  onDurationChange: (duration: number) => void;
}

export const FrameEditor: FC<Props> = ({
  frame,
  onCellClick,
  isMouseDown,
  onDurationChange,
}) => {
  const gridCols = useMemo(() => {
    return {
      gridTemplateColumns: `repeat(${LED_COLUMN_COUNT}, minmax(0, 1fr))`,
    };
  }, []);

  const onMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (isMouseDown?.current) {
        onCellClick(rowIndex, colIndex);
      }
    },
    [isMouseDown, onCellClick]
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <h2 className="text-2xl font-bold text-white">Frame Editor</h2>
      <div className="grid gap-y-2 gap-x-6" style={gridCols}>
        {frame.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
              onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      <p className="text-white">
        Total Cells: {frame.grid.length * frame.grid[0].length}
      </p>

      <div className="flex items-center gap-4 w-full max-w-xs">
        <label
          className="text-gray-400 font-medium"
          htmlFor="frame-duration-slider"
        >
          Frame Duration:
        </label>
        <input
          id="frame-duration-slider"
          type="range"
          min={10}
          max={2000}
          step={10}
          value={frame.duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <input
          type="number"
          min={10}
          max={2000}
          step={10}
          value={frame.duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-20 bg-gray-800 text-white rounded px-2 py-1 border border-gray-600"
        />
        <span className="text-gray-400 ml-2">ms</span>
      </div>
    </div>
  );
};
