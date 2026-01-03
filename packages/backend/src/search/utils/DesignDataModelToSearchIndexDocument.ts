import type { DesignDataModel } from "@src/database/types/Design";
import type { AISearchIndexDocument } from "../types/AISearchIndexDocument";
import type { AnimationFrame } from "@shared/types/AnimationFrame";

export function designDataModelToSearchIndexDocument(
  design: DesignDataModel
): AISearchIndexDocument {
  const dominantColors = extractDominantColors(design.frames);
  const totalDuration = design.frames.reduce(
    (sum, frame) => sum + frame.duration,
    0
  );

  return {
    id: design.id,
    name: design.name,
    createdBy: design.createdBy,
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
    frameCount: design.frames.length,
    totalDuration: totalDuration,
    dominantColors: dominantColors,
    framesJson: design.frames,
  };
}

function extractDominantColors(frames: AnimationFrame[]): string[] {
  const colorSet = new Set<string>();

  frames.forEach((frame) => {
    frame.grid.forEach((row) => {
      row.forEach((rgb) => {
        // Skip black/off pixels
        if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) return;

        // Convert to hex
        const hex = `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1]
          .toString(16)
          .padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`;
        colorSet.add(hex);
      });
    });
  });

  return Array.from(colorSet).slice(0, 10);
}
