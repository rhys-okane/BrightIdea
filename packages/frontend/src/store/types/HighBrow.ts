import type {ZustandSetFunction} from "./UseZustandState";
import type {
	MyStoreDesign,
	NewStoreDesign,
	PlayableDesign,
	SomeoneElsesStoreDesign,
} from "@src/store/types/design/StoreDesign";

export interface HighBrow {
	isLoadingDesigns: boolean;
	othersDesigns: SomeoneElsesStoreDesign[];
	myDesigns: MyStoreDesign[];
	editingDesign: MyStoreDesign | NewStoreDesign | undefined;
	playingDesign:
		| "audio"
		| {
				id: string;
				isMine: boolean;
		  }
		| undefined;
}

export type CreateReducers<T> = {
	[K in keyof T as `set${Capitalize<string & K>}`]: ZustandSetFunction<T[K]>;
};

export type HighBrowReducers = CreateReducers<HighBrow> & {
	setAudioMode: (payload: boolean) => void;
	getPlayingDesign: () => PlayableDesign | undefined;
	storeMyDesign: (design: MyStoreDesign) => void;
	deleteMyDesign: (designId: string) => void;
};
