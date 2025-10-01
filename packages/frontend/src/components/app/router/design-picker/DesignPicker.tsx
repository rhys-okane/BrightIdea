import { DesignPreview } from "@src/components/app/router/design-picker/design-preview/DesignPreview";
import { setLeds } from "@src/components/app/router/wled/Wled";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@src/components/ui/carousel";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import { useEditingDesignIdState } from "@src/store/hooks/UseEditingDesignIdState";
import { getNewFrame } from "@src/store/types/design/frame/Frame";
import { useHighBrowStore } from "@src/store/ZustandStore";
import { useCallback, type FC } from "react";
import { ulid } from "ulid";

export const DesignPicker: FC = () => {
  const [designs, setDesigns] = useDesignsState();
  // const [playingDesignId, setPlayingDesignId] = usePlayingDesignIdState();
  const [, setEditingDesignId] = useEditingDesignIdState();

  const setAudioMode = useHighBrowStore((state) => state.setAudioMode);

  const onCreateNewDesign = useCallback(() => {
    const newDesignId = ulid();
    setDesigns([
      ...designs,
      {
        id: newDesignId,
        name: "New Design",
        frames: [getNewFrame()],
      },
    ]);
    setEditingDesignId(newDesignId);
  }, [designs, setDesigns, setEditingDesignId]);

  const enableAudioMode = useCallback(() => {
    setAudioMode(true);
  }, [setAudioMode]);

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Bright Idea
        </h1>
        <p className="text-lg text-gray-400">
          Create designs and animations for your helmet visor LEDs
        </p>
      </header>
      <section className="flex flex-col items-center gap-6 w-full">
        {designs.length === 0 && (
          <div className="text-center text-gray-400">
            <p className="mb-4">
              No designs found. Create a new design to get started!
            </p>
          </div>
        )}

        <Carousel
          className="w-full px-2"
          opts={{ align: "center", loop: true, containScroll: "trimSnaps" }}
        >
          <CarouselContent>
            {designs.map((design) => (
              <CarouselItem
                className="basis-1/3 ml-2 flex justify-center flex-none"
                key={design.id}
              >
                <DesignPreview design={design} key={design.id} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
          onClick={onCreateNewDesign}
        >
          Create New Design
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
          onClick={enableAudioMode}
        >
          Audio Mode
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
          onClick={setLeds}
        >
          Test
        </button>
      </section>
    </main>
  );
};
