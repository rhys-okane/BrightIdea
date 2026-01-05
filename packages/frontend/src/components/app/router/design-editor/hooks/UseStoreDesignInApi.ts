import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { APICreateDesignResponse } from "@shared/models/api/APICreateDesignRequest";
import type { APIUpdateDesignResponse } from "@shared/models/api/APIUpdateDesignRequestSchema";
import { apiCreateDesign, CreateDesignError } from "@src/lib/api/CreateDesign";
import { apiUpdateDesign, UpdateDesignError } from "@src/lib/api/UpdateDesign";
import { useEditingDesignState } from "@src/store/hooks/UseEditingDesignState";
import type { EditableStoreDesign, MyStoreDesign, NewStoreDesign } from "@src/store/types/design/StoreDesign";
import { useHighBrowStore } from "@src/store/ZustandStore";
import { useCallback, type RefObject } from "react";
import { toast } from "react-toastify";

async function doApiCall(design: NewStoreDesign, turnstileToken: string): Promise<APICreateDesignResponse>;
async function doApiCall(design: MyStoreDesign, turnstileToken: string): Promise<APIUpdateDesignResponse>;
async function doApiCall(
  design: EditableStoreDesign,
  turnstileToken: string
): Promise<APICreateDesignResponse | APIUpdateDesignResponse> {
  if (design.isNew) {
    return apiCreateDesign({
      name: design.name,
      createdBy: design.createdBy,
      frames: design.frames,
      turnstileToken,
    });
  }

  return apiUpdateDesign(design.id, design.editToken, {
    name: design.name,
    createdBy: design.createdBy,
    frames: design.frames,
    turnstileToken,
  });
}

export const useStoreDesignInApi = (turnstileRef: RefObject<TurnstileInstance | null>) => {
  const storeMyDesign = useHighBrowStore((state) => state.storeMyDesign);
  const [, setEditingDesignId] = useEditingDesignState();

  return useCallback(
    (design: EditableStoreDesign) => {
      (async () => {
        if (!turnstileRef.current) return;
        const loadingId = toast.loading("Publishing design...", {
          theme: "dark",
          autoClose: false,
        });

        const turnstileToken = turnstileRef.current.getResponse();
        if (!turnstileToken) {
          toast.update(loadingId, {
            render: "CAPTCHA was not ready. Try again in a few seconds.",
            type: "error",
            autoClose: 3000,
            isLoading: false,
          });
          return;
        }

        try {
          console.log("Storing design in API", design);
          const newDesign = design.isNew
            ? await doApiCall(design, turnstileToken)
            : await doApiCall(design, turnstileToken);

          storeMyDesign({
            updatedAt: new Date(),
            ...newDesign,
            isMine: true,
            isNew: false,
            editToken: design.isNew ? (newDesign as APICreateDesignResponse).editToken : design.editToken,
            mediaFileNames: [],
          });

          toast.update(loadingId, {
            render: "Design published successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setEditingDesignId(undefined);
        } catch (error) {
          console.error("Error storing design in API", error);
          if (error instanceof CreateDesignError || error instanceof UpdateDesignError) {
            if (error.type === "conflict") {
              return void toast.update(loadingId, {
                render: "A design with that name already exists. Please choose a different name.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
              });
            }

            if (error.type === "captcha") {
              return void toast.update(loadingId, {
                render: "CAPTCHA validation failed. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
              });
            }

            if (error.type === "notFound") {
              return void toast.update(loadingId, {
                render: "Design not found. It may have been deleted.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
              });
            }

            if (error.type === "network") {
              return void toast.update(loadingId, {
                render: "Network error. Please check your connection and try again.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
              });
            }
          }

          toast.update(loadingId, {
            render: "Failed to publish design. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        } finally {
          turnstileRef.current.reset();
        }
      })();
    },
    [setEditingDesignId, storeMyDesign, turnstileRef]
  );
};
