// src/types/customer.ts
import { Station } from "./station";

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  stations?: Station[];
}

export interface CreateCustomerRequest {
  id: string;
  name: string;
  email: string;
  address: string;
  stationIds: string[];
}

export interface UpdateCustomerRequest {
  id?: string;
  name: string;
  email: string;
  address: string;
  stationIds: string[];
}

export interface CustomerFormData {
  id: string;
  name: string;
  email: string;
  address: string;
  stationIds: string[];
}