// src/contexts/order-context.tsx
"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Order, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";
import { Station } from "@/types/station";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const orderApi = {
  // Get all orders
  getAll: async (): Promise<Order[]> => {
    const response = await axios.get(`${API_BASE_URL}/orders`);
    return response.data;
  },

  // Get order by ID
  getById: async (id: string): Promise<Order> => {
    const response = await axios.get(`${API_BASE_URL}/orders/${id}`);
    return response.data;
  },

  // Create new order
  create: async (order: CreateOrderRequest): Promise<Order> => {
    const response = await axios.post(`${API_BASE_URL}/orders`, order);
    return response.data;
  },

  // Update existing order
  update: async (id: string, order: UpdateOrderRequest): Promise<Order> => {
    const response = await axios.put(`${API_BASE_URL}/orders/${id}`, order);
    return response.data;
  },

  // Delete order
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/orders/${id}`);
  },

  // Check if order exists
  exists: async (id: string): Promise<boolean> => {
    try {
      await axios.head(`${API_BASE_URL}/orders/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Station API for order form
const stationApi = {
  getAll: async (): Promise<Station[]> => {
    const response = await axios.get(`${API_BASE_URL}/stations`);
    return response.data;
  },
};

export interface OrderContextType {
  // Data
  data: Order[] | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // CRUD Operations
  getById: (id: string) => Promise<Order | null>;
  createOrder: (order: CreateOrderRequest) => Promise<Order>;
  updateOrder: (id: string, order: UpdateOrderRequest) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  checkOrderExists: (id: string) => Promise<boolean>;

  // Utility functions
  refreshData: () => Promise<void>;
  refetch: () => Promise<void>;

  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: React.ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const queryClient = useQueryClient();

  // Main query for all orders
  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: orderApi.create,
    onSuccess: (newOrder) => {
      // Update the cache with the new order
      queryClient.setQueryData(['orders'], (oldData: Order[] | undefined) => {
        return oldData ? [...oldData, newOrder] : [newOrder];
      });
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });

  // Update order mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: UpdateOrderRequest }) =>
      orderApi.update(id, order),
    onSuccess: (updatedOrder) => {
      // Update the cache with the updated order
      queryClient.setQueryData(['orders'], (oldData: Order[] | undefined) => {
        return oldData
          ? oldData.map((order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            )
          : [updatedOrder];
      });
      
      // Update individual order cache if it exists
      queryClient.setQueryData(['orders', updatedOrder.id], updatedOrder);
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    },
  });

  // Delete order mutation
  const deleteMutation = useMutation({
    mutationFn: orderApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove the order from the cache
      queryClient.setQueryData(['orders'], (oldData: Order[] | undefined) => {
        return oldData ? oldData.filter((order) => order.id !== deletedId) : [];
      });
      
      // Remove individual order cache
      queryClient.removeQueries({ queryKey: ['orders', deletedId] });
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
    },
  });

  // Get order by ID with caching
  const getById = useCallback(
    async (id: string): Promise<Order | null> => {
      try {
        // Try to get from cache first
        const cachedOrder = queryClient.getQueryData<Order>(['orders', id]);
        if (cachedOrder) {
          return cachedOrder;
        }

        // If not in cache, fetch from API
        const order = await orderApi.getById(id);
        
        // Cache the individual order
        queryClient.setQueryData(['orders', id], order);
        
        return order;
      } catch (error) {
        console.error('Failed to fetch order:', error);
        return null;
      }
    },
    [queryClient]
  );

  // Check if order exists
  const checkOrderExists = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        return await orderApi.exists(id);
      } catch (error) {
        console.error('Failed to check order existence:', error);
        return false;
      }
    },
    []
  );

  // Create order function
  const createOrder = useCallback(
    async (order: CreateOrderRequest): Promise<Order> => {
      return createMutation.mutateAsync(order);
    },
    [createMutation]
  );

  // Update order function
  const updateOrder = useCallback(
    async (id: string, order: UpdateOrderRequest): Promise<Order> => {
      return updateMutation.mutateAsync({ id, order });
    },
    [updateMutation]
  );

  // Delete order function
  const deleteOrder = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  // Refresh data function
  const refreshData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const contextValue: OrderContextType = {
    // Data
    data: orders || null,
    isLoading,
    isError,
    error: error as Error | null,

    // CRUD Operations
    getById,
    createOrder,
    updateOrder,
    deleteOrder,
    checkOrderExists,

    // Utility functions
    refreshData,
    refetch: refreshData,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
}

// Hook to use the OrderContext
export function useOrderContext(): OrderContextType {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
}

// Separate hook for stations (used in order forms)
export function useStations(): Station[] {
  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: stationApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes (stations don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return stations || [];
}

// Export the context for direct usage if needed
export { OrderContext };