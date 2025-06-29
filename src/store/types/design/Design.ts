import type {AnimationFrame} from "./frame/Frame";

export interface Design {
  id: string;
  name: string;
  frames: AnimationFrame[];
}
