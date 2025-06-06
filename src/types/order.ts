export type Order = {
	id: string;
	type: string;
	fromPoint: string;
	destPoint: string;
	productName: string;
	demand: number;
	startDateTime: string; // ISO date string
	dueDateTime: string; // ISO date string
	loadingRate: number;
	cr1: number;
	cr2: number;
	cr3: number;
	cr4: number;
	cr5: number;
	cr6: number;
	cr7: number;
	timeReadyCR1: number;
	timeReadyCR2: number;
	timeReadyCR3: number;
	timeReadyCR4: number;
	timeReadyCR5: number;
	timeReadyCR6: number;
	timeReadyCR7: number;
};
