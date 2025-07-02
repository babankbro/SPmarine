// src/types/customer.ts
import { Station } from "./station";

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  stationId?: string;
  station?: Station;
}

export interface CreateCustomerRequest {
  id: string;
  name: string;
  email: string;
  address: string;
  stationId?: string;
  station?: Station;

}

export interface UpdateCustomerRequest {
  id?: string;
  name: string;
  email: string;
  address: string;
  stationId?: string;
  station?: Station;
}

export interface CustomerFormData {
  id: string;
  name: string;
  email: string;
  address: string;
  stationId?: string;
  station?: Station;
}