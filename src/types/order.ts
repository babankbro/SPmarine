// src/types/order.ts - Updated to match tugboat pattern
import { Station } from "./station";

export interface Order {
  id: string;
  type: 'IMPORT' | 'EXPORT';
  fromEntityId: string;
  destEntityId: string;
  startStationId: string;
  destStationId: string;
  productName: string;
  demand: number;
  startDateTime: Date | string;
  dueDateTime: Date | string;
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
  // Relations (optional for frontend)
  startStation?: Station;
  destStation?: Station;
}

export interface CreateOrderRequest {
  id?: string; // Made optional since backend can generate it
  type: 'IMPORT' | 'EXPORT';
  fromEntityId: string;
  destEntityId: string;
  startStationId: string;
  destStationId: string;
  productName: string;
  demand: number;
  startDateTime: Date | string;
  dueDateTime: Date | string;
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
}

export interface UpdateOrderRequest {
  name?: string;
  type?: 'IMPORT' | 'EXPORT';
  fromEntityId?: string;
  destEntityId?: string;
  startStationId?: string;
  destStationId?: string;
  productName?: string;
  demand?: number;
  startDateTime?: Date | string;
  dueDateTime?: Date | string;
  loadingRate?: number;
  cr1?: number;
  cr2?: number;
  cr3?: number;
  cr4?: number;
  cr5?: number;
  cr6?: number;
  cr7?: number;
  timeReadyCR1?: number;
  timeReadyCR2?: number;
  timeReadyCR3?: number;
  timeReadyCR4?: number;
  timeReadyCR5?: number;
  timeReadyCR6?: number;
  timeReadyCR7?: number;
}

export interface OrderFormData {
  id: string;
  type: 'IMPORT' | 'EXPORT';
  fromEntityId?: string;
  destEntityId?: string;
  startStationId: string;
  destStationId: string;
  productName: string;
  demand: string;
  startDateTime: string;
  dueDateTime: string;
  loadingRate: string;
  cr1: string;
  cr2: string;
  cr3: string;
  cr4: string;
  cr5: string;
  cr6: string;
  cr7: string;
  timeReadyCR1: string;
  timeReadyCR2: string;
  timeReadyCR3: string;
  timeReadyCR4: string;
  timeReadyCR5: string;
  timeReadyCR6: string;
  timeReadyCR7: string;
}