import {
  faPlay,
  faClone,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { CautionDialog } from "@src/components/app/router/design-editor/components/CautionDialog";
import { useAdminDeleteDesignInApi } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/hooks/UseAdminDeleteDesignInApi";
import { useOnDesignPlay } from "@src/components/app/router/design-picker/components/design-carousel/design-preview/buttons/hooks/UseOnDesignPlay";
import { FramePreviewOverlayButton } from "@src/components/app/router/shared/button/FramePreviewOverlayButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import { useUserState } from "@src/store/hooks/UseUserState";
import { useViewingMediaForDesignState } from "@src/store/hooks/UseViewingMediaForDesignState";
import type {
  NewStoreDesign,
  SomeoneElsesStoreDesign,
} from "@src/store/types/design/StoreDesign";
import { useCallback, useState, type FC } from "react";

interface Props {
  design: SomeoneElsesStoreDesign;
  onDesignDelete?: (designId: string) => void;
}

export const SomeoneElsesDesignPreviewButtons: FC<Props> = ({
  design,
  onDesignDelete,
}) => {
  const [, setEditingDesign] = useEditingDesignState();
  const [open, setOpen] = useState(false);
  const [user] = useUserState();
  const [, setViewingMediaForDesign] = useViewingMediaForDesignState();
  const onDesignPlay = useOnDesignPlay();
  const adminDeleteDesignInApi = useAdminDeleteDesignInApi();

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

  const onDesignViewMedia = useCallback(
    (designToView: SomeoneElsesStoreDesign) => {
      setViewingMediaForDesign(designToView);
    },
    [setViewingMediaForDesign]
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

      {(!user || user.role === "User") && (
        <FramePreviewOverlayButton
          ariaLabel="View videos"
          tooltip="View videos of this design"
          icon={faClone}
          variant={"info"}
          onClick={() => onDesignViewMedia(design)}
        />
      )}

      {user?.role === "Admin" && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <FramePreviewOverlayButton
                ariaLabel="Admin Actions"
                tooltip="Perform administrative actions on this design"
                icon={faEllipsisVertical}
                variant={"danger"}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDesignViewMedia(design)}>
                Manage media
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setOpen(true)}
              >
                Delete Design
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CautionDialog
            title="Delete Design?"
            description="Are you sure you want to use your admin powers to delete this design? This action cannot be undone."
            onConfirm={async () => {
              await adminDeleteDesignInApi(design);
              onDesignDelete?.(design.id);
            }}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      )}
    </>
  );
};
