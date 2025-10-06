import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { DesignPreview } from "@src/components/app/router/design-picker/design-carousel/design-preview/DesignPreview";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@src/components/ui/carousel";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import type { FC } from "react";

interface Props {
  designs: PlayableDesign[];
  turnstileRef: React.RefObject<TurnstileInstance | null>;
}

export const DesignCarousel: FC<Props> = ({ designs, turnstileRef }) => {
  return (
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
            <DesignPreview
              design={design}
              key={design.id}
              turnstileRef={turnstileRef}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
