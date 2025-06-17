export type Station = {
	id: string;
	name: string;
	type: "SEA" | "RIVER";
	latitude: number;
	longitude: number;
	distanceKm: number;
};
