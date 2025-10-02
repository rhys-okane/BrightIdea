import type {EditingDesign} from "./design/Design";
import type {ZustandSetFunction} from "./UseZustandState";

export interface HighBrow {
	designs: EditingDesign[];
	editingDesignId: string | undefined;
	playingDesignId: "audio" | string | undefined;
	serialPort: SerialPort | undefined;
}

export type CreateReducers<T> = {
	[K in keyof T as `set${Capitalize<string & K>}`]: ZustandSetFunction<T[K]>;
};

export type HighBrowReducers = CreateReducers<HighBrow> & {
	setAudioMode: (payload: boolean) => void;
};
