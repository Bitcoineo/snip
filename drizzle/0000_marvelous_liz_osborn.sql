CREATE TABLE `clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`link_id` text NOT NULL,
	`clicked_at` integer DEFAULT (unixepoch()) NOT NULL,
	`referrer` text,
	`country` text,
	`device` text,
	`browser` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_clicks_link_id` ON `clicks` (`link_id`);--> statement-breakpoint
CREATE INDEX `idx_clicks_link_date` ON `clicks` (`link_id`,`clicked_at`);--> statement-breakpoint
CREATE INDEX `idx_clicks_link_referrer` ON `clicks` (`link_id`,`referrer`);--> statement-breakpoint
CREATE INDEX `idx_clicks_link_country` ON `clicks` (`link_id`,`country`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`short_code` text NOT NULL,
	`original_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_links_short_code` ON `links` (`short_code`);