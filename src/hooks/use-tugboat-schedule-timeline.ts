import { useState, useEffect } from "react";
import { TugboatSchedule, TugboatScheduleFilters } from "@/types/tugboat-schedule";
import { API_BASE } from "@/http";

export function useTugboatScheduleTimeline(filters: TugboatScheduleFilters) {
	const [schedules, setSchedules] = useState<TugboatSchedule[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		
		const fetchSchedules = async () => {
			
			setLoading(true);
			setError(null);
			try {
				// Build query parameters
				const params = new URLSearchParams();
				const queryParams = new URLSearchParams();
				console.log(filters)
				if (filters.tugboat_id) {
					queryParams.append('tugboatId', filters.tugboat_id);
				}
				if (filters.order_id) {
					queryParams.append('orderId', filters.order_id);
				}
				if (filters.enter_datetime) {
					queryParams.append('enter_datetime', filters.enter_datetime);
				}
				if (filters.exit_datetime) {
					queryParams.append('exit_datetime', filters.exit_datetime);
				}
				if (filters.type) {
					queryParams.append('type', filters.type);
				}
				// if (filters.status) {
				//   params.append('status', filters.status);
				// }
				let url = `${API_BASE}/schedules/timeline`;
				// if (filters.tugboat_id && filters.order_id) {
				// 	url += `/tugboat/${filters.tugboat_id}/order/${filters.order_id}`;
				// }
				if (queryParams.toString()) {
					url += `?${queryParams.toString()}`;
				}
				if (  filters.order_id) {
					const response = await fetch(url);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					const data = await response.json();
					setSchedules(data as TugboatSchedule[]);
				} else {
					setSchedules([] as TugboatSchedule[]);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
				console.error('Error fetching tugboat schedules:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchSchedules();
	}, [filters]);

	return {
		schedules,
		loading,
		error,
		refetch: () => {
			setSchedules([]);
		}
	};
}
