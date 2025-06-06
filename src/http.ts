import axios, { AxiosResponse } from "axios";

export const API_BASE: string = `${API_ENDPOINT}/${API_VERSION}`;

interface HTTP {
	get<T>(entry: string, params?: Record<string, any>): Promise<AxiosResponse<T, any>>;
	post<T>(entry: string, data?: any): Promise<AxiosResponse<T, any>>;
	put<T>(entry: string, data?: any): Promise<AxiosResponse<T, any>>;
	delete<T>(entry: string): Promise<AxiosResponse<T, any>>;
}

export const http: HTTP = {
	get: <T>(entry: string, params?: Record<string, any>) => axios.get<T>(`${API_BASE}/${entry}`, { params }),
	post: <T>(entry: string, data?: any) => axios.post<T>(`${API_BASE}/${entry}`, data),
	put: <T>(entry: string, data?: any) => axios.put<T>(`${API_BASE}/${entry}`, data),
	delete: <T>(entry: string) => axios.delete<T>(`${API_BASE}/${entry}`),
};
