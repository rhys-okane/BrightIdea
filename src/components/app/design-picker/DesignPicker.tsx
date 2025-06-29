import { DesignPreview } from "@src/components/app/design-picker/design-preview/DesignPreview";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import { useEditingDesignIdState } from "@src/store/hooks/UseEditingDesignIdState";
// import {usePlayingDesignIdState} from "@src/store/hooks/UsePlayingDesignIdState";
import { useCallback, type FC } from "react";
import { ulid } from "ulid";

export const DesignPicker: FC = () => {
  const [designs, setDesigns] = useDesignsState();
  // const [playingDesignId, setPlayingDesignId] = usePlayingDesignIdState();
  const [, setEditingDesignId] = useEditingDesignIdState();

  const onCreateNewDesign = useCallback(() => {
    const newDesignId = ulid();
    setDesigns([
      ...designs,
      {
        id: newDesignId,
        name: "New Design",
        frames: [],
      },
    ]);
    setEditingDesignId(newDesignId);
  }, [designs, setDesigns, setEditingDesignId]);

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          HighBrow
        </h1>
        <p className="text-lg text-gray-400">
          Create designs and animations for your helmet visor LEDs
        </p>
      </header>
      <section className="flex flex-col items-center gap-6">
        {designs.length === 0 && (
          <div className="text-center text-gray-400">
            <p className="mb-4">
              No designs found. Create a new design to get started!
            </p>
          </div>
        )}
        {designs.map((design) => (
          <DesignPreview design={design} key={design.id} />
        ))}

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={onCreateNewDesign}
        >
          Create New Design
        </button>
      </section>
    </main>
  );
};
