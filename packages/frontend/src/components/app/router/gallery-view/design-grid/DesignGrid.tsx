import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { DesignPreview } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/DesignPreview";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import type { FC } from "react";

interface Props {
  designs: PlayableDesign[];
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  onDesignDelete?: (designId: string) => void;
}

export const DesignGrid: FC<Props> = ({
  designs,
  turnstileRef,
  onDesignDelete,
}) => {
  return (
    <div className="flex flex-row flex-wrap grow-0 gap-4 max-w-[1400px] px-4 2xl:px-0 justify-center">
      {designs.map((design) => (
        <DesignPreview
          design={design}
          key={design.id}
          turnstileRef={turnstileRef}
          variant="full"
          onDesignDelete={onDesignDelete}
        />
      ))}
    </div>
  );
};
