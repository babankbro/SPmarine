import { useState, useEffect } from "react";
import { TugboatSchedule, TugboatScheduleFilters } from "@/types/tugboat-schedule";
import { API_BASE } from "@/http";

export function useTugboatSchedule(filters?: TugboatScheduleFilters) {
	const [schedules, setSchedules] = useState<TugboatSchedule[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSchedules = async () => {
			if (!filters) return;

			setLoading(true);
			setError(null);

			try {
				// Build query parameters
				const params = new URLSearchParams();
				const queryParams = new URLSearchParams();
				if (filters.tugboat_id) {
					params.append('tugboat_id', filters.tugboat_id);
				}

				if (filters.order_id) {
					params.append('order_id', filters.order_id);
				}

				if (filters.type_point) {
					queryParams.append('type_point', filters.type_point);
				}


				if (filters.enter_datetime) {
					queryParams.append('enter_datetime', filters.enter_datetime);
				}

				if (filters.exit_datetime) {
					queryParams.append('exit_datetime', filters.exit_datetime);
				}

				if (filters.type) {
					params.append('type', filters.type);
				}

				// if (filters.status) {
				// 	params.append('status', filters.status);
				// }
				console.log(params.toString());
				// Fetch data from API
				if (filters.tugboat_id && filters.order_id) {
					// const response = await fetch(`${API_BASE}/schedules?${params.toString()}`);
					const response = await fetch(`${API_BASE}/schedules/tugboat/${filters.tugboat_id}/order/${filters.order_id}?${queryParams.toString()}`);

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					const data = await response.json();
					console.log(data);
					setSchedules(data.data as TugboatSchedule[]);
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
			if (filters) {
				// Trigger re-fetch by updating a dependency
				setSchedules([]);
			}
		}
	};
}