import type { AnimationFrame } from "@shared/types/AnimationFrame";
import { useMemo, type FC } from "react";

interface Props {
  direction: "Up" | "Down" | "Left" | "Right";
  frame: AnimationFrame;
  onFrameChange: (frame: AnimationFrame) => void;
}

export const ShiftButton: FC<Props> = ({ direction, frame, onFrameChange }) => {
  const handleClick = () => {
    const shiftedFrame = {
      ...frame,
      grid: doShift(frame.grid, direction),
    };
    console.log(shiftedFrame);

    onFrameChange(shiftedFrame);
  };

  function doShift(
    grid: AnimationFrame["grid"],
    direction: Props["direction"]
  ): AnimationFrame["grid"] {
    switch (direction) {
      case "Up":
        return shiftUp(grid);
      case "Down":
        return shiftDown(grid);
      case "Left":
        return shiftLeft(grid);
      case "Right":
        return shiftRight(grid);
    }
  }

  const shiftUp = (grid: AnimationFrame["grid"]): AnimationFrame["grid"] => {
    return [...grid.slice(1), grid[0]];
  };

  const shiftDown = (grid: AnimationFrame["grid"]): AnimationFrame["grid"] => {
    return [grid[grid.length - 1], ...grid.slice(0, -1)];
  };

  const shiftLeft = (grid: AnimationFrame["grid"]): AnimationFrame["grid"] => {
    return grid.map((row) => {
      return [...row.slice(1), row[0]];
    });
  };

  const shiftRight = (grid: AnimationFrame["grid"]): AnimationFrame["grid"] => {
    return grid.map((row) => {
      return [row[row.length - 1], ...row.slice(0, -1)];
    });
  };

  const axis = useMemo(() => {
    return direction === "Up" || direction === "Down"
      ? "Vertical"
      : "Horizontal";
  }, [direction]);

  const outerDivClass = useMemo(() => {
    if (axis === "Vertical") {
      return `col-span-full ${direction === "Up" ? "mb-2" : "mt-2"}`;
    }
  }, [axis, direction]);

  return (
    <div className={outerDivClass}>
      <div className="flex w-full items-center justify-center">
        <button
          className="bg-gray-600 hover:bg-gray-500 transition-colors rounded py-1 px-4 flex items-center justify-center"
          onClick={handleClick}
        >
          Shift{axis === "Horizontal" ? <br /> : " "}
          {direction}
        </button>
      </div>
    </div>
  );
};
