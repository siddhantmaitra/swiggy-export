type Variant = {
	variation_id: number;
	group_id: number;
	name: string;
	price: number;
	external_choice_id: string;
	external_group_id: string;
	variant_tax_charges: Record<string, string>; // Example: {"GST": "0.0"}
};

export type OrderItem = {
	item_key: string;
	has_variantv2: boolean;
	item_group_tag_id: string;
	added_by_user_id: number;
	added_by_username: string;
	group_user_item_map: Record<string, unknown>;
	item_id: string;
	external_item_id: string;
	name: string;
	is_veg: "1" | "0";
	variants: Variant[];
	addons: unknown[]; // Can be refined if details are available
	image_id: string;
	quantity: string;
	free_item_quantity: string;
	total: string;
	subtotal: string;
	final_price: string;
	base_price: string;
	effective_item_price: string;
	packing_charges: string;
	category_details: {
		category: string;
		sub_category: string;
	};
	item_charges: Record<string, string>; // Example: {"Vat": "0", "GST": "13"}
	item_total_discount: number;
	item_delivery_fee_reversal: number;
	meal_quantity: string;
	single_variant: boolean;
	attributes: {
		portionSize: string;
		spiceLevel: string | null;
		vegClassifier: string;
		accompaniments: string | null;
	};
	in_stock: number;
};


type VariantOrderItem = {
	name: string;
	price: string;
};

type FlatOrderItem = {
	name: string;
	base_price?: string;
	price?: string;
	quantity?: string;
};

type Rating = {
	restaurant_rating: number;
	delivery_rating: number;
};

export type ExtractedOrder = {
	order_id: string | number;
	order_date: string;
	delivery_date: string;
	restaurant_id: string | number;
	restaurant_name: string;
	restaurant_city: string;
	restaurant_cuisine: string;
	items: (VariantOrderItem | FlatOrderItem)[];
	coupon_applied: boolean;
	order_status: string;
	is_long_distance: boolean;
	on_time: boolean;
	rain_mode: string;
	is_veg: boolean;
	is_gourmet: boolean;
	rating_meta: Rating;
	item_total: string;
	order_packing_charges: string;
	platform_fees: string;
	delivery_charges: string;
	discount_applied: string;
	total_taxes: string;
	order_total_string: string;
	// paymentMethod: string;
	// paymentGateway: string;
};
