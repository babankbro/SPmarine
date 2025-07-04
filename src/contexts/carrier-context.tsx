// src/contexts/carrier-context.tsx
"use client";

import { createContext, ReactNode, useState, useContext, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Carrier, CreateCarrierRequest, UpdateCarrierRequest } from "@/types/carrier";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const CARRIERS_ENDPOINT = `${API_BASE}/${API_VERSION}/carriers`;

export interface CarrierContextType {
  // Data
  data: Carrier[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selected?: Carrier;
  
  // CRUD Operations
  getCarrierById: (id: string) => Promise<Carrier | null>;
  createCarrier: (carrier: CreateCarrierRequest) => Promise<Carrier>;
  updateCarrier: (id: string, carrier: UpdateCarrierRequest) => Promise<Carrier>;
  deleteCarrier: (id: string) => Promise<void>;
  checkCarrierExists: (id: string) => Promise<boolean>;
  
  // UI State Management
  setSelected: (carrier: Carrier | undefined) => void;
  refetch: () => Promise<void>;
  refreshData: () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const CarrierContext = createContext<CarrierContextType | undefined>(undefined);

export function CarrierProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Carrier>();
  const queryClient = useQueryClient();
  const [shouldRefresh, setShouldRefresh] = useState(0);

  const refreshData = useCallback(() => {
    setShouldRefresh(prev => prev + 1);
  }, []);

  // Fetch Carriers
  const { 
    data = [], 
    isLoading: isLoadingCarriers, 
    error: carriersError,
    refetch: refetchCarriers 
  } = useQuery<Carrier[]>({
    queryKey: ["carriers", shouldRefresh],
    queryFn: async () => {
      const response = await axios.get(CARRIERS_ENDPOINT);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Create Carrier Mutation
  const createMutation = useMutation({
    mutationFn: async (carrierData: CreateCarrierRequest): Promise<Carrier> => {
      console.log('Creating carrier with data:', carrierData);
      
      const response = await axios.post(CARRIERS_ENDPOINT, carrierData);
      return response.data.data || response.data;
    },
    onSuccess: (newCarrier) => {
      queryClient.setQueryData<Carrier[]>(["carriers", shouldRefresh], (oldData) => {
        return oldData ? [...oldData, newCarrier] : [newCarrier];
      });
      refetchCarriers();
    },
    onError: (error) => {
      console.error('Failed to create carrier:', error);
    },
  });

  // Update Carrier Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, carrierData }: { id: string; carrierData: UpdateCarrierRequest }): Promise<Carrier> => {
      console.log('Updating carrier with data:', carrierData);
      const response = await axios.put(`${CARRIERS_ENDPOINT}/${id}`, carrierData);
      return response.data.data || response.data;
    },
    onSuccess: (updatedCarrier) => {
      // Update cache
      queryClient.setQueryData<Carrier[]>(["carriers", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(carrier => 
            carrier.id === updatedCarrier.id ? updatedCarrier : carrier
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      
      // Update selected if it's the same carrier
      if (selected?.id === updatedCarrier.id) {
        setSelected(updatedCarrier);
      }
    },
    onError: (error) => {
      console.error('Failed to update carrier:', error);
    },
  });

  // Delete Carrier Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${CARRIERS_ENDPOINT}/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Carrier[]>(["carriers", shouldRefresh], (oldData) => {
        return oldData ? oldData.filter(carrier => carrier.id !== deletedId) : [];
      });
      
      // Clear selected if it was the deleted carrier
      if (selected?.id === deletedId) {
        setSelected(undefined);
      }
      
      // Refetch for consistency
      refetchCarriers();
    },
    onError: (error) => {
      console.error('Failed to delete carrier:', error);
      // Refetch to restore correct state
      refetchCarriers();
    },
  });

  // CRUD Functions
  const getCarrierById = async (id: string): Promise<Carrier | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Carrier[]>(["carriers", shouldRefresh])?.find((carrier) => carrier.id === id);
      if (cached) {
        setSelected(cached);
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${CARRIERS_ENDPOINT}/${id}`);
      const carrier = response.data;
      setSelected(carrier);
      
      // Update cache
      queryClient.setQueryData<Carrier[]>(["carriers", shouldRefresh], (oldData) => {
        if (oldData) {
          const existingIndex = oldData.findIndex(c => c.id === id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = carrier;
            return newData;
          } else {
            return [...oldData, carrier];
          }
        }
        return [carrier];
      });
      
      return carrier;
    } catch (error) {
      console.error(`Failed to get carrier ${id}:`, error);
      return null;
    }
  };

  const checkCarrierExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${CARRIERS_ENDPOINT}/${id}`);
      return !!response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const createCarrier = async (carrierData: CreateCarrierRequest): Promise<Carrier> => {
    return createMutation.mutateAsync(carrierData);
  };

  const updateCarrier = async (id: string, carrierData: UpdateCarrierRequest): Promise<Carrier> => {
    return updateMutation.mutateAsync({ id, carrierData });
  };

  const deleteCarrier = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const refetch = async (): Promise<void> => {
    await refetchCarriers();
  };

  // Context value
  const contextValue: CarrierContextType = {
    data,
    isLoading: isLoadingCarriers,
    isError: !!carriersError,
    error: carriersError as Error | null,
    selected,
    setSelected,
    getCarrierById,
    createCarrier,
    updateCarrier,
    deleteCarrier,
    checkCarrierExists,
    refetch,
    refreshData,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };

  return (
    <CarrierContext.Provider value={contextValue}>
      {children}
    </CarrierContext.Provider>
  );
}

// Custom hook to use CarrierContext
export function useCarrierContext(): CarrierContextType {
  const context = useContext(CarrierContext);
  
  if (context === undefined) {
    throw new Error('useCarrierContext must be used within a CarrierProvider');
  }
  
  return context;
}