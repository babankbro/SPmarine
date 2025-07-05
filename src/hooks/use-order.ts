// src/hooks/use-order.ts - Updated to match tugboat pattern
"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Order, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";
import { Station } from "@/types/station";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const ORDERS_ENDPOINT = `${API_BASE}/${API_VERSION}/orders`;
const STATIONS_ENDPOINT = `${API_BASE}/${API_VERSION}/stations`;

export interface OrderContextType {
  // Data
  data: Order[];
  stations: Station[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selected?: Order;
  
  // CRUD Operations
  getOrderById: (id: string) => Promise<Order | null>;
  createOrder: (order: CreateOrderRequest) => Promise<Order>;
  updateOrder: (id: string, order: UpdateOrderRequest) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  checkOrderExists: (id: string) => Promise<boolean>;
  
  // UI State Management
  setSelected: (order: Order | undefined) => void;
  refetch: () => Promise<void>;
  refreshData: () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useOrder(): OrderContextType {
  const queryClient = useQueryClient();

  // Fetch Orders
  const { 
    data = [], 
    isLoading: isLoadingOrders, 
    error: ordersError,
    refetch: refetchOrders 
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get(ORDERS_ENDPOINT);
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

  // Create Order Mutation
  const createMutation = useMutation({
    mutationFn: async (orderData: CreateOrderRequest): Promise<Order> => {
      console.log('Creating order with data:', orderData);
      
      const response = await axios.post(ORDERS_ENDPOINT, orderData);
      return response.data;
    },
    onSuccess: (newOrder) => {
      queryClient.setQueryData<Order[]>(["orders"], (oldData) => {
        return oldData ? [...oldData, newOrder] : [newOrder];
      });
      refetchOrders();
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });

  // Update Order Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, orderData }: { id: string; orderData: UpdateOrderRequest }): Promise<Order> => {
      console.log('Updating order with data:', orderData);
      const response = await axios.put(`${ORDERS_ENDPOINT}/${id}`, orderData);
      return response.data;
    },
    onSuccess: (updatedOrder) => {
      // Update cache
      queryClient.setQueryData<Order[]>(["orders"], (oldData) => {
        if (oldData) {
          return oldData.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    },
  });

  // Delete Order Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${ORDERS_ENDPOINT}/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Order[]>(["orders"], (oldData) => {
        return oldData ? oldData.filter(order => order.id !== deletedId) : [];
      });
      
      // Refetch for consistency
      refetchOrders();
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
      // Refetch to restore correct state
      refetchOrders();
    },
  });

  // CRUD Functions
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Order[]>(["orders"])?.find((order) => order.id === id);
      if (cached) {
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${ORDERS_ENDPOINT}/${id}`);
      const order = response.data;
      
      // Update cache
      queryClient.setQueryData<Order[]>(["orders"], (oldData) => {
        if (oldData) {
          const existingIndex = oldData.findIndex(o => o.id === id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = order;
            return newData;
          } else {
            return [...oldData, order];
          }
        }
        return [order];
      });
      
      return order;
    } catch (error) {
      console.error(`Failed to get order ${id}:`, error);
      return null;
    }
  };

  const checkOrderExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${ORDERS_ENDPOINT}/${id}`);
      return !!response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
    return createMutation.mutateAsync(orderData);
  };

  const updateOrder = async (id: string, orderData: UpdateOrderRequest): Promise<Order> => {
    return updateMutation.mutateAsync({ id, orderData });
  };

  const deleteOrder = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const refetch = async (): Promise<void> => {
    await refetchOrders();
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const setSelected = (order: Order | undefined) => {
    queryClient.setQueryData<Order | undefined>(["selectedOrder"], order);
  };

  // Context value
  return {
    data,
    stations,
    isLoading: isLoadingOrders || isLoadingStations,
    isError: !!ordersError,
    error: ordersError as Error | null,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    checkOrderExists,
    refetch,
    refreshData,
    setSelected,
    selected: queryClient.getQueryData<Order | undefined>(["selectedOrder"]),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}