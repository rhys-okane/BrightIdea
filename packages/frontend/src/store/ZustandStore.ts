import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { HighBrow, HighBrowReducers } from "./types/HighBrow";

const initialState: HighBrow = {
  designs: [],
  editingDesignId: undefined,
  playingDesignId: undefined,
  serialPort: undefined,
};

export const useHighBrowStore = create(
  devtools(
    immer(
      persist<HighBrow & HighBrowReducers>(
        (set) => ({
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
          setAudioMode: (payload: boolean) =>
            set({
              playingDesignId: payload ? "audio" : undefined,
            }),
          setSerialPort: (payload: SerialPort | undefined) =>
            set({
              serialPort: payload,
            }),
        }),
        {
          name: "high-brow-storage",

          // @ts-expect-error Their types seem a little wrong according to the docs
          partialize: (state) => {
            return {
              designs: state.designs,
            };
          },
        }
      )
    )
  )
);
