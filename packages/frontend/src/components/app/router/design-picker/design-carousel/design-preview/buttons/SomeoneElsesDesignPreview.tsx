import { faPlay, faClone } from "@fortawesome/free-solid-svg-icons";
import { useOnDesignPlay } from "@src/components/app/router/design-picker/design-carousel/design-preview/buttons/hooks/UseOnDesignPlay";
import { FramePreviewOverlayButton } from "@src/components/app/router/shared/button/FramePreviewOverlayButton";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import type {
  NewStoreDesign,
  SomeoneElsesStoreDesign,
} from "@src/store/types/design/StoreDesign";
import { useCallback, type FC } from "react";

interface Props {
  design: SomeoneElsesStoreDesign;
}

export const SomeoneElsesDesignPreviewButtons: FC<Props> = ({ design }) => {
  const [, setEditingDesign] = useEditingDesignState();
  const onDesignPlay = useOnDesignPlay();

  const onDesignClone = useCallback(
    (designToClone: SomeoneElsesStoreDesign) => {
      const clonedDesign: NewStoreDesign = {
        ...designToClone,
        createdBy: "",
        isMine: true,
        isNew: true,
      };

      setEditingDesign(clonedDesign);
    },
    [setEditingDesign]
  );

  return (
    <>
      <FramePreviewOverlayButton
        ariaLabel="Play design"
        tooltip="Play this design. Requires helmet connection"
        icon={faPlay}
        variant={"positive"}
        onClick={() => onDesignPlay(design)}
      />

      <FramePreviewOverlayButton
        ariaLabel="Clone design"
        tooltip="Clone this design"
        icon={faClone}
        variant={"warning"}
        onClick={() => onDesignClone(design)}
      />
    </>
  );
};
