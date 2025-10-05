import {create} from "zustand";
import {devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import type {HighBrow, HighBrowReducers} from "./types/HighBrow";
import type {MyStoreDesign, PlayableDesign} from "@src/store/types/design/StoreDesign";

const initialState: HighBrow = {
	isLoadingDesigns: false,
	othersDesigns: [],
	myDesigns: [],
	editingDesign: undefined,
	playingDesign: undefined,
};

export const useHighBrowStore = create(
	devtools(
		immer(
			persist<HighBrow & HighBrowReducers>(
				(set, get) => ({
					...initialState,
					setIsLoadingDesigns: (payload: HighBrow["isLoadingDesigns"]) =>
						set({
							isLoadingDesigns: payload,
						}),
					setMyDesigns: (payload: HighBrow["myDesigns"]) =>
						set({
							myDesigns: payload,
						}),
					setOthersDesigns: (payload: HighBrow["othersDesigns"]) =>
						set({
							othersDesigns: payload,
						}),
					setPlayingDesign: (payload: HighBrow["playingDesign"]) =>
						set({
							playingDesign: payload,
						}),
					setEditingDesign: (payload: HighBrow["editingDesign"]) => {
						set({
							editingDesign: payload,
						});
					},
					setAudioMode: (payload: boolean) =>
						set({
							playingDesign: payload ? "audio" : undefined,
						}),

					storeMyDesign: (design: MyStoreDesign) => {
						set(() => ({
							myDesigns: [...get().myDesigns.filter(d => d.id !== design.id), design],
						}));
					},

					getPlayingDesign: (): PlayableDesign | undefined => {
						const designInfo = get().playingDesign;
						if (!designInfo || designInfo === "audio") {
							return undefined;
						}

						if (designInfo.isMine) {
							return get().myDesigns.find(d => d.id === designInfo.id);
						}

						return get().othersDesigns.find(d => d.id === designInfo.id);
					},
				}),
				{
					name: "bright-idea-storage",

					// @ts-expect-error Their types seem a little wrong according to the docs
					partialize: state => {
						return {
							othersDesigns: state.othersDesigns,
							myDesigns: state.myDesigns,
						};
					},
				},
			),
		),
	),
);
