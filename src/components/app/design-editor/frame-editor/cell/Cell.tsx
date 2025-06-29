import {
  type RGBBrightnessCell,
  rgbToCss,
  rgbCellToColour,
} from "@src/store/types/design/frame/Frame";
import type { FC } from "react";

interface Props {
  cell: RGBBrightnessCell;
  onClick?: () => void;
}

export const Cell: FC<Props> = ({ cell, onClick }) => {
  return (
    <div
      className="w-8 h-8 border border-black"
      style={{
        backgroundColor: rgbToCss(rgbCellToColour(cell)),
      }}
      onClick={() => onClick?.()}
    />
  );
};
