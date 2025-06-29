import { Cell } from "@src/components/app/design-editor/frame-editor/cell/Cell";
import { LED_COLUMN_COUNT } from "@src/constants/LedGrid";
import { type AnimationFrame } from "@src/store/types/design/frame/Frame";
import { useMemo, type FC } from "react";

interface Props {
  frame: AnimationFrame;

  onCellClick: (rowIndex: number, colIndex: number) => void;
}

export const FrameEditor: FC<Props> = ({ frame, onCellClick }) => {
  const gridCols = useMemo(() => {
    return {
      gridTemplateColumns: `repeat(${LED_COLUMN_COUNT}, minmax(0, 1fr))`,
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="text-2xl font-bold text-white">Frame Editor</h2>
      <div className="grid gap-2" style={gridCols}>
        {frame.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      <p className="text-white">
        Total Cells: {frame.grid.length * frame.grid[0].length}
      </p>
    </div>
  );
};
