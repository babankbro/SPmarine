// src/types/barge.ts
import { Station } from "./station";

export interface Barge {
  id: string;
  name: string;
  weight: number;
  capacity: number;
  waterStatus: 'SEA' | 'RIVER';
  stationId?: string;
  station?: Station;
  setupTime: number;
  readyDatetime: Date | string;
  distanceKm?: number;
}

export interface CreateBargeRequest {
  id: string;
  name: string;
  weight: number;
  capacity: number;
  waterStatus: 'SEA' | 'RIVER';
  stationId?: string;
  setupTime: number;
  readyDatetime: Date | string;
  distanceKm?: number;
}

export interface UpdateBargeRequest {
  name?: string;
  weight?: number;
  capacity?: number;
  waterStatus?: 'SEA' | 'RIVER';
  stationId?: string;
  setupTime?: number;
  readyDatetime?: Date | string;
  distanceKm?: number;
}

export interface BargeFormData {
  id: string;
  name: string;
  weight: string;
  capacity: string;
  waterStatus: 'SEA' | 'RIVER';
  stationId: string;
  setupTime: string;
  readyDatetime: string;
  distanceKm: string;
}