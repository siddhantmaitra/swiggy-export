


each order obj: 

{
	order_id,
	order_date,
	delivery_date,
	restaurant_id
	restaurant_name
	restaurant_city
	restaurant_cuisine
	items [  (remember to check has_variantv2 then take each variant as single item and add to items array)
		{
			name,
			base_price / price (if variant)
		}
	],
	coupon_applied
	order_status
	is_long_distance
	on_time
	rain_mode
	is_veg
	is_gourmet
	ordered_time_in_seconds
	delivery_time_in_seconds
	rating_meta.restaurant_rating
	rating_meta.delivery_rating
	
	item_total (rendering_details.type should be display and key should be the key of the final obj, value should be value)
	order_packing_charges
	partial_platform_fees
	delivery_charges (should contain delivery_charges)
	total_taxes
	order_total_string
	paymentTransactions.paymentMethod (UPIIntent)
	paymentTransactions.paymentGateway (googlepay)
}


Tables: 
order table
item table
restaurant table

Issues: Franchise restaurants that have similar name  / different restaurant id