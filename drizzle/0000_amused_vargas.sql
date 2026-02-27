CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`page_slug` text NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`parent_id` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`approved` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `legal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`country` text NOT NULL,
	`topic` text NOT NULL,
	`content` text NOT NULL,
	`sources_json` text,
	`locale` text DEFAULT 'en',
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`approved` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mentor_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`bio` text NOT NULL,
	`contact_method` text,
	`anonymous` integer DEFAULT false,
	`locale` text DEFAULT 'en',
	`active` integer DEFAULT true,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `research_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`pubmed_id` text,
	`title` text NOT NULL,
	`abstract` text,
	`authors` text,
	`journal` text,
	`published_date` text,
	`ai_summary_simple` text,
	`ai_summary_adult` text,
	`ai_summary_professional` text,
	`fetched_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `research_cache_pubmed_id_unique` ON `research_cache` (`pubmed_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`specialist_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`text` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`approved` integer DEFAULT false,
	FOREIGN KEY (`specialist_id`) REFERENCES `specialists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `specialists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`city` text,
	`type` text,
	`specialty` text,
	`website` text,
	`phone` text,
	`verified` integer DEFAULT false,
	`rating_avg` real DEFAULT 0,
	`rating_count` integer DEFAULT 0,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`profession` text,
	`content` text NOT NULL,
	`locale` text DEFAULT 'en',
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`approved` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`data_json` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`locale` text DEFAULT 'en',
	`preferences_json` text,
	`confirmed` integer DEFAULT false,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`image` text,
	`provider` text,
	`anonymous_alias` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
