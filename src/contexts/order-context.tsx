"use client";

import { createContext, ReactNode, useState, useContext, useCallback } from "react";
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
  getById: (id: string) => Promise<Order | null>;
  createOrder: (order: CreateOrderRequest) => Promise<Order>;
  updateOrder: (id: string, order: UpdateOrderRequest) => Promise<Order>;
  deleteById: (id: string) => Promise<void>;
  
  // UI State Management
  setSelected: (order: Order | undefined) => void;
  refetch: () => Promise<void>;
  refreshData : () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface OrderProvidrProps {}


export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
	const [selected, setSelected] = useState<Order>();
	const queryClient = useQueryClient();
	const [shouldRefresh, setShouldRefresh] = useState(0);

	const refreshData = useCallback(() => {
		setShouldRefresh(prev => prev + 1);
	}, []);

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

	// Fetch Stations (for dropdowns)
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
		
		// Convert type to uppercase for backend
		const backendData = {
			...orderData,
			type: orderData.type.toUpperCase() as 'IMPORT' | 'EXPORT',
		};
		
		const response = await axios.post(ORDERS_ENDPOINT, backendData);
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

		// Option 1: Invalidate queries to trigger fresh data fetch
		queryClient.invalidateQueries({ queryKey: ["orders"] });
		
		// Also invalidate the specific order query if you have one
		queryClient.invalidateQueries({ queryKey: ["order", updatedOrder.id] });

		
		
		// Update selected if it's the same order
		if (selected?.id === updatedOrder.id) {
			setSelected(updatedOrder);
		}
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
		
		// Clear selected if it was the deleted order
		if (selected?.id === deletedId) {
			setSelected(undefined);
		}
		
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
  const getById = async (id: string): Promise<Order | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Order[]>(["orders"])?.find((order) => order.id === id);
      if (cached) {
        setSelected(cached);
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${ORDERS_ENDPOINT}/${id}`);
      const order = response.data;
      setSelected(order);
      
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

	// const deleteById = async (id: string) => {
	// 	try {
	// 	await axios.delete(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders/${id}`);
		
	// 	// Remove the deleted order from the cache
	// 	queryClient.setQueryData<Order[]>(["orders"], (oldData) => {
	// 		if (oldData) {
	// 		return oldData.filter(order => order.id !== id);
	// 		}
	// 		return oldData;
	// 	});
		
	// 	// Optionally refetch to ensure data consistency
	// 	//refetch();
	// 	//await refresh
	// 	await queryRefetch();

	
	// 	} catch (error) {
	// 		console.error('Failed to delete order:', error);
	// 		throw error;
	// 	}
	// };


	const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
		return createMutation.mutateAsync(orderData);
	};

	const updateOrder = async (id: string, orderData: UpdateOrderRequest): Promise<Order> => {
		return updateMutation.mutateAsync({ id, orderData });
	};

	const deleteById = async (id: string): Promise<void> => {
		return deleteMutation.mutateAsync(id);
	};

	const refetch = async (): Promise<void> => {
		await refetchOrders();
	};


	if (!data) return <></>;

	// Context value
	const contextValue: OrderContextType = {
		data,
		stations,
		isLoading: isLoadingOrders || isLoadingStations,
		isError: !!ordersError,
		error: ordersError as Error | null,
		selected,
		setSelected,
		getById,
		createOrder,
		updateOrder,
		deleteById,
		refetch,
		refreshData,
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

// Custom hook to use OrderContext
export function useOrderContext(): OrderContextType {
  const context = useContext(OrderContext);
  
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  
  return context;
}

// Utility hooks
export function useOrderData(): Order[] {
  const { data } = useOrderContext();
  return data;
}

export function useOrderActions() {
  const { getById, createOrder, updateOrder, deleteById, refetch } = useOrderContext();
  return { getById, createOrder, updateOrder, deleteById, refetch };
}

export function useStations(): Station[] {
  const { stations } = useOrderContext();
  return stations;
}
