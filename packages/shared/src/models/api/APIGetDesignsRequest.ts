import z from "zod";
import {designSchema} from "../app/Design";

export const apiGetDesignsResponseSchema = z.array(designSchema);
