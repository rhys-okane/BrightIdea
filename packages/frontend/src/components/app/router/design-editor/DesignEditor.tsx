import type { RGBColour, AnimationFrame } from "@shared/types/AnimationFrame";
import { ColourPicker } from "@src/components/app/router/design-editor/components/colour-picker/ColourPicker";
import { FrameEditor } from "@src/components/app/router/design-editor/components/frame-editor/FrameEditor";
import { FrameSelector } from "@src/components/app/router/design-editor/components/frame-selector/FrameSelector";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import { useCallback, useMemo, useRef, useState, type FC } from "react";
import { daftPunkSongs } from "@src/components/app/router/design-editor/constants/DaftPunkSongs";
import { InputWithTypingPlaceholder } from "@src/components/app/router/design-editor/components/InputWIthTypingPlaceholder";
import { songwriters } from "@src/components/app/router/design-editor/constants/Songwriters";
import { CautionDialog } from "@src/components/app/router/design-editor/components/CautionDialog";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type {
  BaseStoreDesign,
  EditableStoreDesign,
} from "@src/store/types/design/StoreDesign";
import { TooltipWrapper } from "@src/components/ui/derived/TooltipWrapper";
import { useStoreDesignInApi } from "@src/components/app/router/design-editor/hooks/UseStoreDesignInApi";
import { HelpCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@src/components/ui/dialog";

interface Props {
  design: EditableStoreDesign;
  setEditingDesign: (design: EditableStoreDesign | undefined) => void;
}

export const DesignEditor: FC<Props> = ({ design, setEditingDesign }) => {
  const [selectedColour, setSelectedColour] = useState<RGBColour>([
    255, 255, 255,
  ]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [, setEditingDesignId] = useEditingDesignState();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const storeDesignInApi = useStoreDesignInApi(turnstileRef);

  const selectedFrame = useMemo(() => {
    return design.frames[selectedFrameIndex];
  }, [design.frames, selectedFrameIndex]);

  const updateDesign = useCallback(
    (changes: Omit<Partial<BaseStoreDesign>, "isMine">) => {
      const updatedDesign = { ...design, ...changes };
      setEditingDesign(updatedDesign);
    },
    [design, setEditingDesign]
  );

  const onFrameChange = useCallback(
    (frame: AnimationFrame) => {
      updateDesign({
        frames: design.frames.map((f, i) =>
          i === selectedFrameIndex ? frame : f
        ),
      });
    },
    [design.frames, selectedFrameIndex, updateDesign]
  );

  const onDurationChange = useCallback(
    (duration: number) => {
      const updatedFrame: AnimationFrame = {
        ...selectedFrame,
        duration,
      };

      const updatedDesign = {
        ...design,
        frames: design.frames.map((frame, idx) =>
          idx === selectedFrameIndex ? updatedFrame : frame
        ),
      };

      setEditingDesign(updatedDesign);
    },
    [design, selectedFrame, selectedFrameIndex, setEditingDesign]
  );

  const isValid = useMemo(() => {
    return (
      design.name.trim().length > 0 &&
      design.createdBy.trim().length > 0 &&
      design.frames.length > 0
    );
  }, [design]);

  const onDialogConfirm = useCallback(() => {
    if (!isValid) return;

    storeDesignInApi(design);
  }, [storeDesignInApi, design, isValid]);

  return (
    <main className="min-h-screen bg-neutral-900 flex text-white w-full py-4 flex-col justify-between items-stretch h-full">
      <nav className="flex items-center w-full justify-center">
        <div className="flex flex-col mb-4 gap-4">
          <div className="flex items-center justify-between w-full flex-row gap-5">
            <div className="flex flex-col gap-2 items-center">
              <InputWithTypingPlaceholder
                defaultPlaceholder={"Give me a name..."}
                placeholders={daftPunkSongs}
                value={design.name}
                onChange={(e) => updateDesign({ name: e.target.value })}
              />

              <hr className="border-t border-gray-400 w-[50%]" />

              <div className="flex flex-row text-xl gap-[1ch]">
                <p className="text-gray-400">By </p>
                <InputWithTypingPlaceholder
                  defaultPlaceholder={"Daft Punk"}
                  placeholders={songwriters}
                  value={design.createdBy}
                  onChange={(e) => updateDesign({ createdBy: e.target.value })}
                  className="text-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="top-0 bottom-0 left-0 z-10 absolute min-w-52 h-full">
        <div className="flex items-center justify-center h-full">
          <ColourPicker
            selectedColour={selectedColour}
            setSelectedColour={setSelectedColour}
          />
        </div>
      </div>

      <FrameEditor
        frame={selectedFrame}
        selectedColour={selectedColour}
        onFrameChange={onFrameChange}
        onDurationChange={onDurationChange}
      />

      <div className="flex flex-col gap-4 pb-4">
        <FrameSelector
          frames={design.frames}
          selectedFrameIndex={selectedFrameIndex}
          onFrameSelect={setSelectedFrameIndex}
          updateDesign={updateDesign}
        />

        <div className="items-center flex justify-center gap-4">
          <button
            className="hover:cursor-pointer justify-self-end bg-red-500 hover:bg-red-600 transition-colors rounded py-2 px-4"
            onClick={() => setEditingDesignId(undefined)}
          >
            Abort
          </button>

          <TooltipWrapper
            content={
              "Make sure you have given your design a name, author, and at least one frame before publishing!"
            }
          >
            <CautionDialog
              title={"Are you sure?"}
              description={
                design.isNew
                  ? "This will publish your design to the repository and make it available for all to see. You will still be able to edit it later."
                  : "This will update your design in the repository. You will still be able to edit it later."
              }
              onConfirm={onDialogConfirm}
            >
              <button
                className="disabled:cursor-not-allowed hover:cursor-pointer justify-self-end bg-blue-500 hover:bg-blue-600 transition-colors rounded py-2 px-4 disabled:bg-blue-400"
                disabled={!isValid}
              >
                {design.isNew ? "Publish" : "Update"}
              </button>
            </CautionDialog>
          </TooltipWrapper>
        </div>
      </div>

      <Turnstile
        ref={turnstileRef}
        className="absolute"
        siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
      />

      <Dialog>
        <DialogTrigger className="h-16 w-16 rounded-md absolute bottom-8 right-8 bg-neutral-950 items-center justify-center flex hover:opacity-80 transition-colors cursor-pointer">
          <TooltipWrapper content="Help">
            <HelpCircleIcon className="h-10 w-10" />
          </TooltipWrapper>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Help</h1>
            <blockquote className="italic text-md">
              We're up all night to get some
            </blockquote>

            <p>
              This is the design editor, where you can create and edit your LED
              designs. Here are some quick tips to get you started:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Drawing</h3>
                <ul className="list-disc list-outside pl-6 space-y-1">
                  <li>
                    Pick a colour on the left. Click the eraser to remove.
                  </li>
                  <li>Click or drag on the canvas to draw.</li>
                  <li>Right-click to quick-erase.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Frames & Animation</h3>
                <ul className="list-disc list-outside pl-6 space-y-1">
                  <li>
                    Use the frame selector at the bottom to add, remove, and
                    switch between frames.
                  </li>
                  <li>
                    Hold{" "}
                    <b className="text-orange-400 font-mono text-sm">shift</b>{" "}
                    when clicking + to duplicate the current frame.
                  </li>
                  <li>Right-click frames for more options.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Publishing</h3>
                <ul className="list-disc list-outside pl-6 space-y-1">
                  <li>Give your design a name and author at the top.</li>
                  <li>Click "Publish" to submit to the repository.</li>
                  <li>Click "Abort" to exit without saving.</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};
