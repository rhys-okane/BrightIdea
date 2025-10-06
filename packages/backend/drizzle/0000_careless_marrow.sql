CREATE TABLE `designs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`frames` text NOT NULL,
	`edit_token` text NOT NULL,
	`created_by` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `designs_name_unique` ON `designs` (`name`);