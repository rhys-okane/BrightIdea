import {
  type RGBBrightnessCell,
  rgbToCss,
  rgbCellToColour,
} from "@src/store/types/design/frame/Frame";
import type { FC } from "react";
import { cva } from "class-variance-authority";

interface Props {
  cell: RGBBrightnessCell;
  onClick?: () => void;
  onMouseEnter?: () => void;
  className?: string;
  variant?: "default" | "small";
}

const cellClass = cva("border border-black", {
  variants: {
    variant: {
      default: "w-8 h-8",
      small: "w-2 h-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Cell: FC<Props> = ({
  cell,
  onMouseEnter,
  onClick,
  className,
  variant = "default",
}) => {
  return (
    <div
      className={cellClass({ variant, className })}
      style={{
        backgroundColor: rgbToCss(rgbCellToColour(cell)),
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    />
  );
};
