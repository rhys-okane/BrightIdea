import type {Design} from "./design/Design";
import type {ZustandSetFunction} from "./UseZustandState";

export interface HighBrow {
  designs: Design[];
  editingDesignId: string | undefined;
  playingDesignId: string | undefined;
}

export type CreateReducers<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: ZustandSetFunction<T[K]>
};

export type HighBrowReducers = CreateReducers<HighBrow>;

