CREATE TABLE `designs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`design` text NOT NULL,
	`edit_token` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
