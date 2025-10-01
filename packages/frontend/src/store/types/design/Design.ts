import type {AnimationFrame} from "@shared/types/AnimationFrame";

export interface Design {
	id: string;
	name: string;
	frames: AnimationFrame[];
}
