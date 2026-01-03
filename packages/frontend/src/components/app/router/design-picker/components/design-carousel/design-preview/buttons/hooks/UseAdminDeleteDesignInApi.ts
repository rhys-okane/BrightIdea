import { useAuth0 } from "@auth0/auth0-react";
import { apiAdminDeleteDesign } from "@src/lib/api/AdminDeleteDesign";
import { DeleteDesignError } from "@src/lib/api/DeleteDesign";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { useHighBrowStore } from "@src/store/ZustandStore";
import { useCallback } from "react";
import { toast } from "react-toastify";

export function useAdminDeleteDesignInApi() {
  const { getAccessTokenSilently } = useAuth0();
  const adminDeleteDesignFromStore = useHighBrowStore(
    (state) => state.adminDeleteDesign
  );

  return useCallback(
    async (design: PlayableDesign) => {
      const loadingId = toast.loading("Deleting design...", {
        autoClose: false,
      });

      try {
        await apiAdminDeleteDesign(design, await getAccessTokenSilently());
        adminDeleteDesignFromStore(design);

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
      }
    },
    [adminDeleteDesignFromStore, getAccessTokenSilently]
  );
}
