CREATE TABLE `research_engagement` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `research_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
DROP INDEX "research_cache_pubmed_id_unique";--> statement-breakpoint
DROP INDEX "subscribers_email_unique";--> statement-breakpoint
ALTER TABLE `research_cache` ALTER COLUMN "fetched_at" TO "fetched_at" text DEFAULT (CURRENT_TIMESTAMP);--> statement-breakpoint
CREATE UNIQUE INDEX `research_cache_pubmed_id_unique` ON `research_cache` (`pubmed_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
ALTER TABLE `research_cache` ADD `citation_count` integer DEFAULT 0;