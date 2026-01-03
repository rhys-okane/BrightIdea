import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { daftPunkOneLiners } from "@src/components/app/router/design-picker/constants/DaftPunkOneLiners";
import { DesignCarousel } from "@src/components/app/router/design-picker/components/design-carousel/DesignCarousel";
import { useApiDesignSync } from "@src/components/app/router/design-picker/hooks/UseApiDesignSync";
import { Spinner } from "@src/components/ui/spinner";
import { CLOUDFLARE_TURNSTILE_SITE_KEY } from "@src/lib/api/constants/ApiConstants";
import {
  useMyDesignsState,
  useOthersDesignsState,
} from "@src/store/hooks/UseDesignsState";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import { useGalleryViewState } from "@src/store/hooks/UseGalleryViewState";
import { useIsLoadingDesignsState } from "@src/store/hooks/UseIsLoadingDesignsState";
import { getNewFrame } from "@src/store/types/design/frame/Frame";
import { useCallback, useMemo, useRef, type FC } from "react";
import { AuthComponent } from "@src/components/app/router/design-picker/components/auth/AuthComponent";

export const DesignPicker: FC = () => {
  const [myDesigns] = useMyDesignsState();
  const [othersDesigns] = useOthersDesignsState();
  const [, setEditingDesign] = useEditingDesignState();
  const [isLoadingDesigns] = useIsLoadingDesignsState();
  const [, setIsInGalleryView] = useGalleryViewState();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const showLoadingSpinner = useMemo(() => {
    return (
      isLoadingDesigns &&
      myDesigns.length === 0 &&
      othersDesigns.length === 0 &&
      window.navigator.onLine
    );
  }, [isLoadingDesigns, myDesigns.length, othersDesigns.length]);

  const onCreateNewDesign = useCallback(() => {
    setEditingDesign({
      isMine: true,
      isNew: true,
      createdBy: "",
      frames: [getNewFrame()],
      name: "",
    });
  }, [setEditingDesign]);

  const goToGallery = useCallback(() => {
    setIsInGalleryView(true);
  }, [setIsInGalleryView]);

  useApiDesignSync();

  const oneLiner = useMemo(() => {
    return daftPunkOneLiners[
      Math.floor(Math.random() * daftPunkOneLiners.length)
    ];
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
      <AuthComponent />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Bright Idea
        </h1>
        <p className="text-lg text-gray-400">{oneLiner}</p>
      </header>
      <section className="flex flex-col items-center gap-6 w-full">
        <div className="w-full flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-white">My Designs</h2>

          {!showLoadingSpinner && myDesigns.length === 0 && (
            <div className="text-center text-gray-400">
              <p className="mb-4">
                No designs found. Create a new design to get started!
              </p>
            </div>
          )}

          {showLoadingSpinner && <Spinner />}

          <DesignCarousel designs={myDesigns} turnstileRef={turnstileRef} />
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Downloaded Designs</h2>
          {!showLoadingSpinner && othersDesigns.length === 0 && (
            <div className="text-center text-gray-400">
              <p className="mb-4">
                No-one has created a design yet :-(<br></br> Be the first!
              </p>
            </div>
          )}

          <DesignCarousel designs={othersDesigns} turnstileRef={turnstileRef} />
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
          onClick={onCreateNewDesign}
        >
          Create New Design
        </button>

        <button
          className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition cursor-pointer"
          onClick={goToGallery}
        >
          Gallery
        </button>
      </section>

      <Turnstile ref={turnstileRef} siteKey={CLOUDFLARE_TURNSTILE_SITE_KEY} />
    </main>
  );
};
