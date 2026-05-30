CREATE TABLE `payment_methods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`logo_url` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `purchases` ADD `address` text NOT NULL;--> statement-breakpoint
ALTER TABLE `purchases` ADD `payment_method_id` integer NOT NULL REFERENCES payment_methods(id);