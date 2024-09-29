CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`order_id` text,
	`name` text NOT NULL,
	`price` real NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`order_date` integer NOT NULL,
	`delivery_date` integer,
	`restaurant_id` text,
	`coupon_applied` text,
	`order_status` text NOT NULL,
	`is_long_distance` integer NOT NULL,
	`on_time` integer NOT NULL,
	`rain_mode` text NOT NULL,
	`is_veg` integer NOT NULL,
	`is_gourmet` integer NOT NULL,
	`item_total` real NOT NULL,
	`order_packing_charges` real NOT NULL,
	`partial_platform_fees` real NOT NULL,
	`delivery_charges` text NOT NULL,
	`discount_applied` real NOT NULL,
	`total_taxes` real NOT NULL,
	`order_total_string` real NOT NULL,
	`payment_method` text NOT NULL,
	`payment_gateway` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY NOT NULL,
	`order_id` text,
	`restaurant_rating` integer,
	`delivery_rating` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`cuisine` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_id_unique` ON `orders` (`order_id`);