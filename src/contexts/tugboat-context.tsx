// src/contexts/tugboat-context.tsx
"use client";

import { createContext, ReactNode, useState, useContext, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Tugboat, CreateTugboatRequest, UpdateTugboatRequest } from "@/types/tugboat";
import { Station } from "@/types/station";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const TUGBOATS_ENDPOINT = `${API_BASE}/${API_VERSION}/tugboats`;
const STATIONS_ENDPOINT = `${API_BASE}/${API_VERSION}/stations`;

export interface TugboatContextType {
  // Data
  data: Tugboat[];
  stations: Station[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selected?: Tugboat;
  
  // CRUD Operations
  getTugboatById: (id: string) => Promise<Tugboat | null>;
  createTugboat: (tugboat: CreateTugboatRequest) => Promise<Tugboat>;
  updateTugboat: (id: string, tugboat: UpdateTugboatRequest) => Promise<Tugboat>;
  deleteTugboat: (id: string) => Promise<void>;
  checkTugboatExists: (id: string) => Promise<boolean>;
  
  // Station Management
  assignStationToTugboat: (tugboatId: string, stationId: string) => Promise<Tugboat>;
  removeStationFromTugboat: (tugboatId: string) => Promise<Tugboat>;
  
  // UI State Management
  setSelected: (tugboat: Tugboat | undefined) => void;
  refetch: () => Promise<void>;
  refreshData: () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const TugboatContext = createContext<TugboatContextType | undefined>(undefined);

export function TugboatProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Tugboat>();
  const queryClient = useQueryClient();
  const [shouldRefresh, setShouldRefresh] = useState(0);

  const refreshData = useCallback(() => {
    setShouldRefresh(prev => prev + 1);
  }, []);

  // Fetch Tugboats
  const { 
    data = [], 
    isLoading: isLoadingTugboats, 
    error: tugboatsError,
    refetch: refetchTugboats 
  } = useQuery<Tugboat[]>({
    queryKey: ["tugboats", shouldRefresh],
    queryFn: async () => {
      const response = await axios.get(TUGBOATS_ENDPOINT);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Fetch Stations (for dropdowns and associations)
  const { 
    data: stations = [], 
    isLoading: isLoadingStations 
  } = useQuery<Station[]>({
    queryKey: ["stations"],
    queryFn: async () => {
      const response = await axios.get(STATIONS_ENDPOINT);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - stations change less frequently
  });

  // Create Tugboat Mutation
  const createMutation = useMutation({
    mutationFn: async (tugboatData: CreateTugboatRequest): Promise<Tugboat> => {
      console.log('Creating tugboat with data:', tugboatData);
      
      const response = await axios.post(TUGBOATS_ENDPOINT, tugboatData);
      return response.data.data || response.data;
    },
    onSuccess: (newTugboat) => {
      queryClient.setQueryData<Tugboat[]>(["tugboats", shouldRefresh], (oldData) => {
        return oldData ? [...oldData, newTugboat] : [newTugboat];
      });
      refetchTugboats();
    },
    onError: (error) => {
      console.error('Failed to create tugboat:', error);
    },
  });

  // Update Tugboat Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, tugboatData }: { id: string; tugboatData: UpdateTugboatRequest }): Promise<Tugboat> => {
      console.log('Updating tugboat with data:', tugboatData);
      const response = await axios.put(`${TUGBOATS_ENDPOINT}/${id}`, tugboatData);
      return response.data.data || response.data;
    },
    onSuccess: (updatedTugboat) => {
      // Update cache
      queryClient.setQueryData<Tugboat[]>(["tugboats", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(tugboat => 
            tugboat.id === updatedTugboat.id ? updatedTugboat : tugboat
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["tugboats"] });
      
      // Update selected if it's the same tugboat
      if (selected?.id === updatedTugboat.id) {
        setSelected(updatedTugboat);
      }
    },
    onError: (error) => {
      console.error('Failed to update tugboat:', error);
    },
  });

  // Delete Tugboat Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${TUGBOATS_ENDPOINT}/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Tugboat[]>(["tugboats", shouldRefresh], (oldData) => {
        return oldData ? oldData.filter(tugboat => tugboat.id !== deletedId) : [];
      });
      
      // Clear selected if it was the deleted tugboat
      if (selected?.id === deletedId) {
        setSelected(undefined);
      }
      
      // Refetch for consistency
      refetchTugboats();
    },
    onError: (error) => {
      console.error('Failed to delete tugboat:', error);
      // Refetch to restore correct state
      refetchTugboats();
    },
  });

  // Station Management Mutations
  const assignStationMutation = useMutation({
    mutationFn: async ({ tugboatId, stationId }: { tugboatId: string; stationId: string }): Promise<Tugboat> => {
      const response = await axios.post(`${TUGBOATS_ENDPOINT}/${tugboatId}/stations`, { stationId });
      return response.data.data || response.data;
    },
    onSuccess: (updatedTugboat) => {
      // Update cache
      queryClient.setQueryData<Tugboat[]>(["tugboats", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(tugboat => 
            tugboat.id === updatedTugboat.id ? updatedTugboat : tugboat
          );
        }
        return oldData;
      });
      
      // Update selected if it's the same tugboat
      if (selected?.id === updatedTugboat.id) {
        setSelected(updatedTugboat);
      }
    },
  });

  const removeStationMutation = useMutation({
    mutationFn: async (tugboatId: string): Promise<Tugboat> => {
      const response = await axios.delete(`${TUGBOATS_ENDPOINT}/${tugboatId}/stations`);
      return response.data.data || response.data;
    },
    onSuccess: (updatedTugboat) => {
      // Update cache
      queryClient.setQueryData<Tugboat[]>(["tugboats", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(tugboat => 
            tugboat.id === updatedTugboat.id ? updatedTugboat : tugboat
          );
        }
        return oldData;
      });
      
      // Update selected if it's the same tugboat
      if (selected?.id === updatedTugboat.id) {
        setSelected(updatedTugboat);
      }
    },
  });

  // CRUD Functions
  const getTugboatById = async (id: string): Promise<Tugboat | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Tugboat[]>(["tugboats", shouldRefresh])?.find((tugboat) => tugboat.id === id);
      if (cached) {
        setSelected(cached);
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${TUGBOATS_ENDPOINT}/${id}`);
      const tugboat = response.data;
      setSelected(tugboat);
      
      // Update cache
      queryClient.setQueryData<Tugboat[]>(["tugboats", shouldRefresh], (oldData) => {
        if (oldData) {
          const existingIndex = oldData.findIndex(t => t.id === id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = tugboat;
            return newData;
          } else {
            return [...oldData, tugboat];
          }
        }
        return [tugboat];
      });
      
      return tugboat;
    } catch (error) {
      console.error(`Failed to get tugboat ${id}:`, error);
      return null;
    }
  };

  const checkTugboatExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${TUGBOATS_ENDPOINT}/${id}`);
      return !!response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const createTugboat = async (tugboatData: CreateTugboatRequest): Promise<Tugboat> => {
    return createMutation.mutateAsync(tugboatData);
  };

  const updateTugboat = async (id: string, tugboatData: UpdateTugboatRequest): Promise<Tugboat> => {
    return updateMutation.mutateAsync({ id, tugboatData });
  };

  const deleteTugboat = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const assignStationToTugboat = async (tugboatId: string, stationId: string): Promise<Tugboat> => {
    return assignStationMutation.mutateAsync({ tugboatId, stationId });
  };

  const removeStationFromTugboat = async (tugboatId: string): Promise<Tugboat> => {
    return removeStationMutation.mutateAsync(tugboatId);
  };

  const refetch = async (): Promise<void> => {
    await refetchTugboats();
  };

  // Context value
  const contextValue: TugboatContextType = {
    data,
    stations,
    isLoading: isLoadingTugboats || isLoadingStations,
    isError: !!tugboatsError,
    error: tugboatsError as Error | null,
    selected,
    setSelected,
    getTugboatById,
    createTugboat,
    updateTugboat,
    deleteTugboat,
    checkTugboatExists,
    assignStationToTugboat,
    removeStationFromTugboat,
    refetch,
    refreshData,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };

  return (
    <TugboatContext.Provider value={contextValue}>
      {children}
    </TugboatContext.Provider>
  );
}

// Custom hook to use TugboatContext
export function useTugboatContext(): TugboatContextType {
  const context = useContext(TugboatContext);
  
  if (context === undefined) {
    throw new Error('useTugboatContext must be used within a TugboatProvider');
  }
  
  return context;
}