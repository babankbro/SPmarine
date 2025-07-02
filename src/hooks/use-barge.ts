// src/hooks/use-barge.ts
"use client";

import { useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Barge, CreateBargeRequest, UpdateBargeRequest } from "@/types/barge";
import { Station } from "@/types/station";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const BARGES_ENDPOINT = `${API_BASE}/${API_VERSION}/barges`;
const STATIONS_ENDPOINT = `${API_BASE}/${API_VERSION}/stations`;

export interface BargeContextType {
  // Data
  data: Barge[];
  stations: Station[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selected?: Barge;
  
  // CRUD Operations
  getBargeById: (id: string) => Promise<Barge | null>;
  createBarge: (barge: CreateBargeRequest) => Promise<Barge>;
  updateBarge: (id: string, barge: UpdateBargeRequest) => Promise<Barge>;
  deleteBarge: (id: string) => Promise<void>;
  checkBargeExists: (id: string) => Promise<boolean>;
  
  // Station Management
  assignStationToBarge: (bargeId: string, stationId: string) => Promise<Barge>;
  removeStationFromBarge: (bargeId: string) => Promise<Barge>;
  
  // UI State Management
  setSelected: (barge: Barge | undefined) => void;
  refetch: () => Promise<void>;
  refreshData: () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useBarge(): BargeContextType {
  const queryClient = useQueryClient();

  // Fetch Barges
  const { 
    data = [], 
    isLoading: isLoadingBarges, 
    error: bargesError,
    refetch: refetchBarges 
  } = useQuery<Barge[]>({
    queryKey: ["barges"],
    queryFn: async () => {
      const response = await axios.get(BARGES_ENDPOINT);
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

  // Create Barge Mutation
  const createMutation = useMutation({
    mutationFn: async (bargeData: CreateBargeRequest): Promise<Barge> => {
      console.log('Creating barge with data:', bargeData);
      
      const response = await axios.post(BARGES_ENDPOINT, bargeData);
      return response.data.data || response.data;
    },
    onSuccess: (newBarge) => {
      queryClient.setQueryData<Barge[]>(["barges"], (oldData) => {
        return oldData ? [...oldData, newBarge] : [newBarge];
      });
      refetchBarges();
    },
    onError: (error) => {
      console.error('Failed to create barge:', error);
    },
  });

  // Update Barge Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, bargeData }: { id: string; bargeData: UpdateBargeRequest }): Promise<Barge> => {
      console.log('Updating barge with data:', bargeData);
      const response = await axios.put(`${BARGES_ENDPOINT}/${id}`, bargeData);
      return response.data.data || response.data;
    },
    onSuccess: (updatedBarge) => {
      // Update cache
      queryClient.setQueryData<Barge[]>(["barges"], (oldData) => {
        if (oldData) {
          return oldData.map(barge => 
            barge.id === updatedBarge.id ? updatedBarge : barge
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["barges"] });
    },
    onError: (error) => {
      console.error('Failed to update barge:', error);
    },
  });

  // Delete Barge Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${BARGES_ENDPOINT}/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Barge[]>(["barges"], (oldData) => {
        return oldData ? oldData.filter(barge => barge.id !== deletedId) : [];
      });
      
      // Refetch for consistency
      refetchBarges();
    },
    onError: (error) => {
      console.error('Failed to delete barge:', error);
      // Refetch to restore correct state
      refetchBarges();
    },
  });

  // Station Management Mutations
  const assignStationMutation = useMutation({
    mutationFn: async ({ bargeId, stationId }: { bargeId: string; stationId: string }): Promise<Barge> => {
      const response = await axios.post(`${BARGES_ENDPOINT}/${bargeId}/stations`, { stationId });
      return response.data.data || response.data;
    },
    onSuccess: (updatedBarge) => {
      // Update cache
      queryClient.setQueryData<Barge[]>(["barges"], (oldData) => {
        if (oldData) {
          return oldData.map(barge => 
            barge.id === updatedBarge.id ? updatedBarge : barge
          );
        }
        return oldData;
      });
    },
  });

  const removeStationMutation = useMutation({
    mutationFn: async (bargeId: string): Promise<Barge> => {
      const response = await axios.delete(`${BARGES_ENDPOINT}/${bargeId}/stations`);
      return response.data.data || response.data;
    },
    onSuccess: (updatedBarge) => {
      // Update cache
      queryClient.setQueryData<Barge[]>(["barges"], (oldData) => {
        if (oldData) {
          return oldData.map(barge => 
            barge.id === updatedBarge.id ? updatedBarge : barge
          );
        }
        return oldData;
      });
    },
  });

  // CRUD Functions
  const getBargeById = async (id: string): Promise<Barge | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Barge[]>(["barges"])?.find((barge) => barge.id === id);
      if (cached) {
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${BARGES_ENDPOINT}/${id}`);
      const barge = response.data;
      
      // Update cache
      queryClient.setQueryData<Barge[]>(["barges"], (oldData) => {
        if (oldData) {
          const existingIndex = oldData.findIndex(b => b.id === id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = barge;
            return newData;
          } else {
            return [...oldData, barge];
          }
        }
        return [barge];
      });
      
      return barge;
    } catch (error) {
      console.error(`Failed to get barge ${id}:`, error);
      return null;
    }
  };

  const checkBargeExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${BARGES_ENDPOINT}/${id}`);
      return !!response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const createBarge = async (bargeData: CreateBargeRequest): Promise<Barge> => {
    return createMutation.mutateAsync(bargeData);
  };

  const updateBarge = async (id: string, bargeData: UpdateBargeRequest): Promise<Barge> => {
    return updateMutation.mutateAsync({ id, bargeData });
  };

  const deleteBarge = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const assignStationToBarge = async (bargeId: string, stationId: string): Promise<Barge> => {
    return assignStationMutation.mutateAsync({ bargeId, stationId });
  };

  const removeStationFromBarge = async (bargeId: string): Promise<Barge> => {
    return removeStationMutation.mutateAsync(bargeId);
  };

  const refetch = async (): Promise<void> => {
    await refetchBarges();
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["barges"] });
  };

  const setSelected = (barge: Barge | undefined) => {
	queryClient.setQueryData<Barge | undefined>(["selectedBarge"], barge);
  }



  // Context value
  return {
    data,
    stations,
    isLoading: isLoadingBarges || isLoadingStations,
    isError: !!bargesError,
    error: bargesError as Error | null,
    getBargeById,
    createBarge,
    updateBarge,
    deleteBarge,
    checkBargeExists,
    assignStationToBarge,
    removeStationFromBarge,
    refetch,
    refreshData,
	setSelected,
	selected: queryClient.getQueryData<Barge | undefined>(["selectedBarge"]),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}