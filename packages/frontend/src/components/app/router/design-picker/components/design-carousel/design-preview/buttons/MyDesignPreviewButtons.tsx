import { faPlay, faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { CautionDialog } from "@src/components/app/router/design-editor/components/CautionDialog";
import { useDeleteDesignInApi } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/hooks/UseDeleteDesignInApi";
import { useOnDesignPlay } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/hooks/UseOnDesignPlay";
import { FramePreviewOverlayButton } from "@src/components/app/router/shared/button/FramePreviewOverlayButton";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import type { MyStoreDesign } from "@src/store/types/design/StoreDesign";
import { useCallback, type FC } from "react";

interface Props {
  design: MyStoreDesign;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  onDesignDelete?: (designId: string) => void;
}

export const MyDesignPreviewButtons: FC<Props> = ({
  design,
  turnstileRef,
  onDesignDelete,
}) => {
  const [, setEditingDesign] = useEditingDesignState();
  const onDesignPlay = useOnDesignPlay();

  const deleteDesignInApi = useDeleteDesignInApi(turnstileRef);

  const onDesignEdit = useCallback(
    (design: MyStoreDesign) => {
      setEditingDesign(design);
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
        ariaLabel="Edit design"
        tooltip="Edit this design"
        icon={faEdit}
        variant={"warning"}
        onClick={() => onDesignEdit(design)}
      />

      <CautionDialog
        title="Delete design"
        description="Are you sure you want to delete this design? This action cannot be undone."
        onConfirm={() => {
          deleteDesignInApi(design);
          onDesignDelete?.(design.id);
        }}
      >
        <FramePreviewOverlayButton
          ariaLabel="Delete Design?"
          tooltip="Delete and unpublish your design"
          icon={faTrashCan}
          variant={"danger"}
        />
      </CautionDialog>
    </>
  );
};
