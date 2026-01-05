import type { User } from "@auth0/auth0-react";
import type { ZustandSetFunction } from "./UseZustandState";
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
  playingDesign: "audio" | PlayableDesign | undefined;
  // TODO: Really should just be react router at this point but that's a lot of conversion work
  isInGalleryView: boolean;
  user: (User & { role: "Admin" | "User" }) | undefined;
  viewingMediaForDesign: PlayableDesign | undefined;
}

export type CreateReducers<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: ZustandSetFunction<T[K]>;
};

export type HighBrowReducers = CreateReducers<HighBrow> & {
  setAudioMode: (payload: boolean) => void;
  storeMyDesign: (design: MyStoreDesign) => void;
  deleteMyDesign: (designId: string) => void;
  adminDeleteDesign: (design: PlayableDesign) => void;
};
