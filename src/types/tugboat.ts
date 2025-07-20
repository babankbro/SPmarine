// src/types/tugboat.ts
import { Station } from "./station";

export interface Tugboat {
  id: string;
  name: string;
  maxCapacity: number;
  maxBarge: number;
  maxFuelCon: number;
  type: 'SEA' | 'RIVER';
  minSpeed: number;
  maxSpeed: number;
  engineRpm: number;
  horsePower: number;
  waterStatus: 'SEA' | 'RIVER';
  readyDatetime: Date | string;
  stationId?: string;
station?: Station;
}

export interface CreateTugboatRequest {
  id: string;
  name: string;
  maxCapacity: number;
  maxBarge: number;
  maxFuelCon: number;
  type: 'SEA' | 'RIVER';
  minSpeed: number;
  maxSpeed: number;
  engineRpm: number;
  horsePower: number;
  waterStatus: 'SEA' | 'RIVER';
  readyDatetime: Date | string;
  stationId?: string;
}

export interface UpdateTugboatRequest {
  name?: string;
  maxCapacity?: number;
  maxBarge?: number;
  maxFuelCon?: number;
  type?: 'SEA' | 'RIVER';
  minSpeed?: number;
  maxSpeed?: number;
  engineRpm?: number;
  horsePower?: number;
  waterStatus?: 'SEA' | 'RIVER';
  readyDatetime?: Date | string;
  stationId?: string;
}

export interface TugboatFormData {
  id: string;
  name: string;
  maxCapacity: string;
  maxBarge: string;
  maxFuelCon: string;
  type: 'SEA' | 'RIVER';
  minSpeed: string;
  maxSpeed: string;
  engineRpm: string;
  horsePower: string;
  waterStatus: 'SEA' | 'RIVER';
  readyDatetime: string;
  stationId: string;
}