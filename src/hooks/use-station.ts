// src/hooks/use-station.ts
"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Station, CreateStationRequest, UpdateStationRequest } from "@/types/station";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const STATIONS_ENDPOINT = `${API_BASE}/${API_VERSION}/stations`;

export interface StationContextType {
  // Data
  data: Station[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selected?: Station;
  
  // CRUD Operations
  getStationById: (id: string) => Promise<Station | null>;
  createStation: (station: CreateStationRequest) => Promise<Station>;
  updateStation: (id: string, station: UpdateStationRequest) => Promise<Station>;
  deleteStation: (id: string) => Promise<void>;
  checkStationExists: (id: string) => Promise<boolean>;
  
  // UI State Management
  setSelected: (station: Station | undefined) => void;
  refetch: () => Promise<void>;
  refreshData: () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useStation(): StationContextType {
  const queryClient = useQueryClient();

  // Fetch Stations
  const { 
    data = [], 
    isLoading: isLoadingStations, 
    error: stationsError,
    refetch: refetchStations 
  } = useQuery<Station[]>({
    queryKey: ["stations"],
    queryFn: async () => {
      const response = await axios.get(STATIONS_ENDPOINT);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Create Station Mutation
  const createMutation = useMutation({
    mutationFn: async (stationData: CreateStationRequest): Promise<Station> => {
      console.log('Creating station with data:', stationData);
      
      const response = await axios.post(STATIONS_ENDPOINT, stationData);
      return response.data.data || response.data;
    },
    onSuccess: (newStation) => {
      queryClient.setQueryData<Station[]>(["stations"], (oldData) => {
        return oldData ? [...oldData, newStation] : [newStation];
      });
      refetchStations();
    },
    onError: (error) => {
      console.error('Failed to create station:', error);
    },
  });

  // Update Station Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, stationData }: { id: string; stationData: UpdateStationRequest }): Promise<Station> => {
      console.log('Updating station with data:', stationData);
      const response = await axios.put(`${STATIONS_ENDPOINT}/${id}`, stationData);
      return response.data.data || response.data;
    },
    onSuccess: (updatedStation) => {
      // Update cache
      queryClient.setQueryData<Station[]>(["stations"], (oldData) => {
        if (oldData) {
          return oldData.map(station => 
            station.id === updatedStation.id ? updatedStation : station
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (error) => {
      console.error('Failed to update station:', error);
    },
  });

  // Delete Station Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${STATIONS_ENDPOINT}/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Station[]>(["stations"], (oldData) => {
        return oldData ? oldData.filter(station => station.id !== deletedId) : [];
      });
      
      // Refetch for consistency
      refetchStations();
    },
    onError: (error) => {
      console.error('Failed to delete station:', error);
      // Refetch to restore correct state
      refetchStations();
    },
  });

  // CRUD Functions
  const getStationById = async (id: string): Promise<Station | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Station[]>(["stations"])?.find((station) => station.id === id);
      if (cached) {
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${STATIONS_ENDPOINT}/${id}`);
      const station = response.data;
      
      // Update cache
      queryClient.setQueryData<Station[]>(["stations"], (oldData) => {
        if (oldData) {
          const existingIndex = oldData.findIndex(s => s.id === id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = station;
            return newData;
          } else {
            return [...oldData, station];
          }
        }
        return [station];
      });
      
      return station;
    } catch (error) {
      console.error(`Failed to get station ${id}:`, error);
      return null;
    }
  };

  const checkStationExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${STATIONS_ENDPOINT}/${id}`);
      return !!response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const createStation = async (stationData: CreateStationRequest): Promise<Station> => {
    return createMutation.mutateAsync(stationData);
  };

  const updateStation = async (id: string, stationData: UpdateStationRequest): Promise<Station> => {
    return updateMutation.mutateAsync({ id, stationData });
  };

  const deleteStation = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const refetch = async (): Promise<void> => {
    await refetchStations();
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["stations"] });
  };

  const setSelected = (station: Station | undefined) => {
    queryClient.setQueryData<Station | undefined>(["selectedStation"], station);
  };

  // Context value
  return {
    data,
    isLoading: isLoadingStations,
    isError: !!stationsError,
    error: stationsError as Error | null,
    getStationById,
    createStation,
    updateStation,
    deleteStation,
    checkStationExists,
    refetch,
    refreshData,
    setSelected,
    selected: queryClient.getQueryData<Station | undefined>(["selectedStation"]),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}