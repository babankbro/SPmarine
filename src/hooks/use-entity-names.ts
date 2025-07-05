// src/hooks/use-entity-names.ts
"use client";

import { useStation } from "@/hooks/use-station";
import { useCustomer } from "@/hooks/use-customer";
import { useCarrier } from "@/hooks/use-carrier";
import { Station } from "@/types/station";
import { Customer } from "@/types/customer";
import { Carrier } from "@/types/carrier";

export interface EntityNamesHook {
  // Name getters
  getStationName: (stationId: string) => string;
  getCustomerName: (customerId: string) => string;
  getCarrierName: (carrierId: string) => string;
  
  // Full object getters
  getStationInfo: (stationId: string) => Station | null;
  getCustomerInfo: (customerId: string) => Customer | null;
  getCarrierInfo: (carrierId: string) => Carrier | null;
  
  // Batch getters for performance
  getStationNames: (stationIds: string[]) => Record<string, string>;
  getCustomerNames: (customerIds: string[]) => Record<string, string>;
  getCarrierNames: (carrierIds: string[]) => Record<string, string>;
  
  // Loading and data states
  isLoading: boolean;
  hasData: boolean;
  
  // Raw data access (for advanced use cases)
  stations: Station[];
  customers: Customer[];
  carriers: Carrier[];
}

/**
 * Custom hook for converting entity IDs to human-readable names
 * 
 * @description
 * This hook provides utility functions to convert IDs to names for:
 * - Stations (with location info)
 * - Customers (with contact info) 
 * - Carriers (with capacity info)
 * 
 * @example
 * ```typescript
 * const { getStationName, getCustomerName, getCarrierName } = useEntityNames();
 * 
 * // In your component
 * <Typography>{getStationName(order.startStationId)}</Typography>
 * <Typography>{getCustomerName(order.fromEntityId)}</Typography>
 * <Typography>{getCarrierName(order.destEntityId)}</Typography>
 * ```
 * 
 * @example
 * // For batch operations
 * ```typescript
 * const { getStationNames } = useEntityNames();
 * const stationNames = getStationNames([station1Id, station2Id, station3Id]);
 * ```
 */
export function useEntityNames(): EntityNamesHook {
  const { data: stations = [], isLoading: isStationsLoading } = useStation();
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomer();
  const { data: carriers = [], isLoading: isCarriersLoading } = useCarrier();

  // Single entity name getters
  const getStationName = (stationId: string): string => {
    if (!stationId) return '';
    const station = stations.find(s => s.id === stationId);
    return station?.name || stationId;
  };

  const getCustomerName = (customerId: string): string => {
    if (!customerId) return '';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || customerId;
  };

  const getCarrierName = (carrierId: string): string => {
    if (!carrierId) return '';
    const carrier = carriers.find(c => c.id === carrierId);
    return carrier?.name || carrierId;
  };

  // Full object getters
  const getStationInfo = (stationId: string): Station | null => {
    if (!stationId) return null;
    return stations.find(s => s.id === stationId) || null;
  };

  const getCustomerInfo = (customerId: string): Customer | null => {
    if (!customerId) return null;
    return customers.find(c => c.id === customerId) || null;
  };

  const getCarrierInfo = (carrierId: string): Carrier | null => {
    if (!carrierId) return null;
    return carriers.find(c => c.id === carrierId) || null;
  };

  // Batch getters for performance (when you need multiple lookups)
  const getStationNames = (stationIds: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    stationIds.forEach(id => {
      if (id) {
        result[id] = getStationName(id);
      }
    });
    return result;
  };

  const getCustomerNames = (customerIds: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    customerIds.forEach(id => {
      if (id) {
        result[id] = getCustomerName(id);
      }
    });
    return result;
  };

  const getCarrierNames = (carrierIds: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    carrierIds.forEach(id => {
      if (id) {
        result[id] = getCarrierName(id);
      }
    });
    return result;
  };

  // Loading and data states
  const isLoading = isStationsLoading || isCustomersLoading || isCarriersLoading;
  const hasData = stations.length > 0 || customers.length > 0 || carriers.length > 0;

  return {
    // Name getters
    getStationName,
    getCustomerName,
    getCarrierName,
    
    // Full object getters
    getStationInfo,
    getCustomerInfo,
    getCarrierInfo,
    
    // Batch getters
    getStationNames,
    getCustomerNames,
    getCarrierNames,
    
    // States
    isLoading,
    hasData,
    
    // Raw data
    stations,
    customers,
    carriers,
  };
}