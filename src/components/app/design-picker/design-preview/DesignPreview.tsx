import type {Design} from "@src/store/types/design/Design";
import type {FC} from "react";

interface Props {
  design: Design;
}

export const DesignPreview: FC<Props> = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      
    </div>
  );
}