export interface TugboatSchedule {
	id: number;
	type: string;
	name: string;
	enter_datetime: string;
	exit_datetime: string;
	distance: number;
	time: number;
	speed: number;
	type_point: string;
	order_trip: string;
	total_load: number;
	barge_ids: string;
	order_distance: number;
	order_time: number;
	barge_speed: number;
	order_arrival_time: string;
	tugboat_id: string;
	order_id: string;
	water_type: string;
}

export interface TugboatScheduleFilters {
	tugboat_id: string;
	order_id: string;
	enter_datetime: string;
	exit_datetime: string;
	type: string;
	type_point: string;
}