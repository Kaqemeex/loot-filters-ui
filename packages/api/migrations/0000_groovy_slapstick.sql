CREATE TABLE `filters` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_discord_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`public` integer NOT NULL,
	`current_version_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `filter_configurations` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_discord_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`filter_id` text NOT NULL,
	`filter_prefix_rs2f` text NOT NULL,
	`filter_suffix_rs2f` text NOT NULL,
	`macro_overrides` text NOT NULL,
	`public` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `filter_versions` (
	`name` text NOT NULL,
	`version_id` text PRIMARY KEY NOT NULL,
	`filter_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`raw_rs2f` text NOT NULL,
	`precompiled_rs2f` text NOT NULL,
	`parsed_macros` text NOT NULL,
	`settings` text NOT NULL,
	`url` text
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`discord_id` text PRIMARY KEY NOT NULL,
	`discord_username` text NOT NULL,
	`refresh_token` text,
	`auth_token` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
