export type Tugboat = {
	id: string;
	name: string;
	maxCapacity: number;
	maxBarge: number;
	maxFuelCon: number;
	type: "SEA" | "RIVER";
	minSpeed: number;
	maxSpeed: number;
	engineRpm: number;
	horsePower: number;
	latitude: number;
	longitude: number;
	waterStatus: "SEA" | "RIVER";
	distanceKm: number;
	readyDatetime: string;
};
