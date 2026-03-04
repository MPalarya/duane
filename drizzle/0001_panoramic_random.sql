CREATE TABLE `logins_by_country` (
	`country_code` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `research_cache` ADD `doi` text;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `pmc_id` text;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `s2_id` text;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `is_open_access` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `oa_pdf_url` text;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `conclusions` text;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `full_text_source` text;--> statement-breakpoint
ALTER TABLE `research_cache` ADD `source` text DEFAULT 'pubmed';