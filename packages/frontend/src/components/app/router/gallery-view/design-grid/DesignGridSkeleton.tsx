import { Skeleton } from "@src/components/ui/skeleton";
import type { FC } from "react";

export const DesignGridSkeleton: FC = () => {
  return (
    <div className="grid grid-cols-5 gap-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className="border border-slate-600 p-3">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 60 }, (_, j) => (
                <div key={j} className={`h-2 w-2 bg-slate-700}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};
