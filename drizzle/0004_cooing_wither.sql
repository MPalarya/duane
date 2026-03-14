CREATE TABLE `blog_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`author_name` text NOT NULL,
	`author_bio` text,
	`title` text NOT NULL,
	`excerpt` text,
	`body_markdown` text NOT NULL,
	`body_html` text NOT NULL,
	`tags` text,
	`featured_image_url` text,
	`status` text DEFAULT 'pending',
	`admin_note` text,
	`sanity_doc_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `scan_progress` (
	`source` text PRIMARY KEY NOT NULL,
	`offset_value` integer DEFAULT 0,
	`cursor_token` text,
	`completed_at` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
