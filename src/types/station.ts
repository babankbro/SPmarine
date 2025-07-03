export type Station = {
	id: string;
	name: string;
	type: "SEA" | "RIVER";
	latitude: number;
	longitude: number;
	distanceKm: number;
};

export type CreateStationRequest  = {
	id: string;
	name: string;
	type: "SEA" | "RIVER";
	latitude: number;
	longitude: number;
	distanceKm: number;
};


export type UpdateStationRequest  = {
	id: string;
	name: string;
	type: "SEA" | "RIVER";
	latitude: number;
	longitude: number;
	distanceKm: number;
};

export type StationFormData  = {
	id: string;
	name: string;
	type: "SEA" | "RIVER";
	latitude: number;
	longitude: number;
	distanceKm: number;
};

