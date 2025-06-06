
export type Barge = {
  id: string;
  name: string;
  weight: number;
  capacity: number;
  latitude: number;
  longitude: number;
  waterStatus: "SEA" | "RIVER";
  stationId: string;
  distanceKm: number;
  setupTime: number;
  readyDatetime: string;
};
