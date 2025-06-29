import { Cell } from "@src/components/app/design-editor/frame-editor/cell/Cell";
import { LED_COLUMN_COUNT } from "@src/constants/LedGrid";
import { type AnimationFrame } from "@src/store/types/design/frame/Frame";
import { useCallback, useMemo, type FC, type RefObject } from "react";

interface Props {
  frame: AnimationFrame;

  isMouseDown: RefObject<boolean>;
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

export const FrameEditor: FC<Props> = ({ frame, onCellClick, isMouseDown }) => {
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
      <div className="grid gap-2" style={gridCols}>
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
    </div>
  );
};
