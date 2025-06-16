import axios from "axios";
import type { AxiosResponse } from "axios";

export const API_ENDPOINT = process.env.API_ENDPOINT || "http://localhost:5000";
export const API_VERSION = process.env.API_VERSION || "v1";

export const API_BASE = `${API_ENDPOINT}/${API_VERSION}`;

interface HTTP {
	get: <T>(entry: string, params?: Record<string, unknown>) => Promise<AxiosResponse<T>>;
	post: <T>(entry: string, data?: unknown) => Promise<AxiosResponse<T>>;
	put: <T>(entry: string, data?: unknown) => Promise<AxiosResponse<T>>;
	delete: <T>(entry: string) => Promise<AxiosResponse<T>>;
}

export const http: HTTP = {
	get: function<T>(entry: string, params?: Record<string, unknown>) {
		return axios.get<T>(`${API_BASE}/${entry}`, { params });
	},
	post: function<T>(entry: string, data?: unknown) {
		return axios.post<T>(`${API_BASE}/${entry}`, data);
	},
	put: function<T>(entry: string, data?: unknown) {
		return axios.put<T>(`${API_BASE}/${entry}`, data);
	},
	delete: function<T>(entry: string) {
		return axios.delete<T>(`${API_BASE}/${entry}`);
	}
};
