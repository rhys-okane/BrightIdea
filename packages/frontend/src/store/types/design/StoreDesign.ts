import type { AnimationFrame } from "@shared/types/AnimationFrame";

export interface BaseStoreDesign {
  name: string;
  frames: AnimationFrame[];
  createdBy: string;
  isMine: boolean;
}

export interface MyStoreDesign extends BaseStoreDesign {
  id: string;
  isMine: true;
  isNew: false;
  editToken: string;
  createdAt: Date;
  updatedAt: Date;
  mediaFileNames: string[];
}

export interface NewStoreDesign extends BaseStoreDesign {
  isMine: true;
  isNew: true;
}
export type EditableStoreDesign = NewStoreDesign | MyStoreDesign;

export interface SomeoneElsesStoreDesign extends BaseStoreDesign {
  id: string;
  isMine: false;
  editToken?: undefined;
  createdAt: Date;
  updatedAt: Date;
  mediaFileNames: string[];
}
export type PlayableDesign = MyStoreDesign | SomeoneElsesStoreDesign;
