// types/order.ts - Updated to match your backend
export interface Order {
  id: string;
  type: 'IMPORT' | 'EXPORT'; // Changed to match backend enum
  fromPoint: string;
  destPoint: string;
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
  start_station?: Station;
  dest_station?: Station;
}

export interface Station {
  id: string;
  name: string;
  type?: 'SEA' | 'RIVER';
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export interface CreateOrderRequest {
  type: 'IMPORT' | 'EXPORT';
  fromPoint: string;
  destPoint: string;
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

export interface UpdateOrderRequest extends CreateOrderRequest {
  id?: string;
}

export interface OrderFormData {
  type: 'IMPORT' | 'EXPORT';
  fromPoint: string;
  destPoint: string;
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