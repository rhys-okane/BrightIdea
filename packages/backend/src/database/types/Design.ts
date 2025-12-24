import type {AnimationFrame} from "@shared/types/AnimationFrame";

export interface DesignDataModel {
	designId: string;
	name: string;
	frames: AnimationFrame[];
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}
