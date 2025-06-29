import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { HighBrow, HighBrowReducers } from "./types/HighBrow";

const initialState: HighBrow = {
  designs: [],
  editingDesignId: undefined,
  playingDesignId: undefined,
};

export const useHighBrowStore = create(
  devtools(
    immer<HighBrow & HighBrowReducers>((set) => ({
      ...initialState,
      setDesigns: (payload: HighBrow["designs"]) =>
        set({
          designs: payload,
        }),
      setPlayingDesignId: (payload: HighBrow["editingDesignId"]) =>
        set({
          playingDesignId: payload,
        }),
      setEditingDesignId: (payload: HighBrow["playingDesignId"]) =>
        set({
          editingDesignId: payload,
        }),
    }))
  )
);
