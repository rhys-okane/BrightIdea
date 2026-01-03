import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { apiDeleteDesign, DeleteDesignError } from "@src/lib/api/DeleteDesign";
import type { MyStoreDesign } from "@src/store/types/design/StoreDesign";
import { useHighBrowStore } from "@src/store/ZustandStore";
import { useCallback } from "react";
import { toast } from "react-toastify";

export function useDeleteDesignInApi(
  turnstileRef: React.RefObject<TurnstileInstance | null>
) {
  const deleteDesignFromStore = useHighBrowStore(
    (state) => state.deleteMyDesign
  );

  return useCallback(
    async (design: MyStoreDesign) => {
      if (!turnstileRef.current) return;

      const loadingId = toast.loading("Deleting design...", {
        autoClose: false,
      });

      try {
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

        await apiDeleteDesign(design, turnstileToken);
        deleteDesignFromStore(design.id);

        toast.update(loadingId, {
          render: "Design deleted successfully.",
          type: "success",
          autoClose: 3000,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof DeleteDesignError
            ? error.message
            : "Failed to delete design.";
        toast.update(loadingId, {
          render: errorMessage,
          type: "error",
          autoClose: 3000,
          isLoading: false,
        });
        console.error("Failed to delete design", error);
      } finally {
        turnstileRef.current.reset();
      }
    },
    [deleteDesignFromStore, turnstileRef]
  );
}
