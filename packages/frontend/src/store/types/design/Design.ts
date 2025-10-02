import type {AnimationFrame} from "@shared/types/AnimationFrame";

export interface EditingDesign {
	id: string;
	name: string;
	createdBy: string;
	frames: AnimationFrame[];
}
