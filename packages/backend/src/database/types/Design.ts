import type {AnimationFrame} from "@shared/types/AnimationFrame";

export interface DesignDataModel {
	id: string;
	name: string;
	frames: AnimationFrame[];
	editToken: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}
