import {text, sqliteTable, integer} from "drizzle-orm/sqlite-core";
import {ulid} from "ulid";
import type {AnimationFrame} from "@shared/types/AnimationFrame.js";

export const designsTable = sqliteTable("designs", {
	id: text("id")
		.primaryKey()
		.$default(() => ulid()),
	name: text("name").notNull().unique(),

	design: text("design", {
		mode: "json",
	})
		.$type<AnimationFrame[]>()
		.notNull(),
	editToken: text("edit_token").notNull(),
	createdBy: text("created_by").notNull(),
	createdAt: integer({mode: "timestamp"})
		.$default(() => new Date())
		.notNull(),
});
