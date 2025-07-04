// src/types/carrier.ts
export interface Carrier {
  id: string;
  name: string;
  maxCapacity?: number;
  holder?: string; // Company name
  numberOfBulks?: number; // Number of compartments
  maxCrane?: number; // Maximum number of cranes
}

export interface CreateCarrierRequest {
  id: string;
  name: string;
  maxCapacity?: number;
  holder?: string;
  numberOfBulks?: number;
  maxCrane?: number;
}

export interface UpdateCarrierRequest {
  name?: string;
  maxCapacity?: number;
  holder?: string;
  numberOfBulks?: number;
  maxCrane?: number;
}

export interface CarrierFormData {
  id: string;
  name: string;
  maxCapacity: string;
  holder: string;
  numberOfBulks: string;
  maxCrane: string;
}