// src/hooks/use-carrier.ts
"use client";

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

export function useCarrier(): CarrierContextType {
  const queryClient = useQueryClient();

  // Fetch Carriers
  const { 
    data = [], 
    isLoading: isLoadingCarriers, 
    error: carriersError,
    refetch: refetchCarriers 
  } = useQuery<Carrier[]>({
    queryKey: ["carriers"],
    queryFn: async () => {
      const response = await axios.get(CARRIERS_ENDPOINT);
      return response.data.data || response.data;
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
      return response.data.data || response.data.data || response.data;
    },
    onSuccess: (newCarrier) => {
      queryClient.setQueryData<Carrier[]>(["carriers"], (oldData) => {
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
      queryClient.setQueryData<Carrier[]>(["carriers"], (oldData) => {
        if (oldData) {
          return oldData.map(carrier => 
            carrier.id === updatedCarrier.id ? updatedCarrier : carrier
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
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
      queryClient.setQueryData<Carrier[]>(["carriers"], (oldData) => {
        return oldData ? oldData.filter(carrier => carrier.id !== deletedId) : [];
      });
      
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
      const cached = queryClient.getQueryData<Carrier[]>(["carriers"])?.find((carrier) => carrier.id === id);
      if (cached) {
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${CARRIERS_ENDPOINT}/${id}`);
      const carrier = response.data;
      
      // Update cache
      queryClient.setQueryData<Carrier[]>(["carriers"], (oldData) => {
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

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["carriers"] });
  };

  const setSelected = (carrier: Carrier | undefined) => {
    queryClient.setQueryData<Carrier | undefined>(["selectedCarrier"], carrier);
  };

  // Context value
  return {
    data,
    isLoading: isLoadingCarriers,
    isError: !!carriersError,
    error: carriersError as Error | null,
    getCarrierById,
    createCarrier,
    updateCarrier,
    deleteCarrier,
    checkCarrierExists,
    refetch,
    refreshData,
    setSelected,
    selected: queryClient.getQueryData<Carrier | undefined>(["selectedCarrier"]),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}