// src/contexts/customer-context.tsx
"use client";

import { createContext, ReactNode, useState, useContext, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/types/customer";
import { Station } from "@/types/station";

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const CUSTOMERS_ENDPOINT = `${API_BASE}/${API_VERSION}/customers`;
const STATIONS_ENDPOINT = `${API_BASE}/${API_VERSION}/stations`;

export interface CustomerContextType {
  // Data
  data: Customer[];
  stations: Station[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selected?: Customer;
  
  // CRUD Operations
  getCustomerById: (id: string) => Promise<Customer | null>;
  createCustomer: (customer: CreateCustomerRequest) => Promise<Customer>;
  updateCustomer: (id: string, customer: UpdateCustomerRequest) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  checkCustomerExists: (id: string) => Promise<boolean>;
  
  // Station Management
  addStationToCustomer: (customerId: string, stationId: string) => Promise<Customer>;
  removeStationFromCustomer: (customerId: string, stationId: string) => Promise<Customer>;
  
  // UI State Management
  setSelected: (customer: Customer | undefined) => void;
  refetch: () => Promise<void>;
  refreshData: () => void;
  
  // Form helpers
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Customer>();
  const queryClient = useQueryClient();
  const [shouldRefresh, setShouldRefresh] = useState(0);

  const refreshData = useCallback(() => {
    setShouldRefresh(prev => prev + 1);
  }, []);

  // Fetch Customers
  const { 
    data = [], 
    isLoading: isLoadingCustomers, 
    error: customersError,
    refetch: refetchCustomers 
  } = useQuery<Customer[]>({
    queryKey: ["customers", shouldRefresh],
    queryFn: async () => {
      const response = await axios.get(CUSTOMERS_ENDPOINT);
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

  // Create Customer Mutation
  const createMutation = useMutation({
    mutationFn: async (customerData: CreateCustomerRequest): Promise<Customer> => {
      console.log('Creating customer with data:', customerData);
      
      const response = await axios.post(CUSTOMERS_ENDPOINT, customerData);
      return response.data.data || response.data;
    },
    onSuccess: (newCustomer) => {
      queryClient.setQueryData<Customer[]>(["customers", shouldRefresh], (oldData) => {
        return oldData ? [...oldData, newCustomer] : [newCustomer];
      });
      refetchCustomers();
    },
    onError: (error) => {
      console.error('Failed to create customer:', error);
    },
  });

  // Update Customer Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, customerData }: { id: string; customerData: UpdateCustomerRequest }): Promise<Customer> => {
      const response = await axios.put(`${CUSTOMERS_ENDPOINT}/${id}`, customerData);
      return response.data.data || response.data;
    },
    onSuccess: (updatedCustomer) => {
      // Update cache
      queryClient.setQueryData<Customer[]>(["customers", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(customer => 
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          );
        }
        return oldData;
      });

      // Invalidate queries to trigger fresh data fetch
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      // Update selected if it's the same customer
      if (selected?.id === updatedCustomer.id) {
        setSelected(updatedCustomer);
      }
    },
    onError: (error) => {
      console.error('Failed to update customer:', error);
    },
  });

  // Delete Customer Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${CUSTOMERS_ENDPOINT}/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Customer[]>(["customers", shouldRefresh], (oldData) => {
        return oldData ? oldData.filter(customer => customer.id !== deletedId) : [];
      });
      
      // Clear selected if it was the deleted customer
      if (selected?.id === deletedId) {
        setSelected(undefined);
      }
      
      // Refetch for consistency
      refetchCustomers();
    },
    onError: (error) => {
      console.error('Failed to delete customer:', error);
      // Refetch to restore correct state
      refetchCustomers();
    },
  });

  // Station Management Mutations
  const addStationMutation = useMutation({
    mutationFn: async ({ customerId, stationId }: { customerId: string; stationId: string }): Promise<Customer> => {
      const response = await axios.post(`${CUSTOMERS_ENDPOINT}/${customerId}/stations`, { stationId });
      return response.data.data || response.data;
    },
    onSuccess: (updatedCustomer) => {
      // Update cache
      queryClient.setQueryData<Customer[]>(["customers", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(customer => 
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          );
        }
        return oldData;
      });
      
      // Update selected if it's the same customer
      if (selected?.id === updatedCustomer.id) {
        setSelected(updatedCustomer);
      }
    },
  });

  const removeStationMutation = useMutation({
    mutationFn: async ({ customerId, stationId }: { customerId: string; stationId: string }): Promise<Customer> => {
      const response = await axios.delete(`${CUSTOMERS_ENDPOINT}/${customerId}/stations/${stationId}`);
      return response.data.data || response.data;
    },
    onSuccess: (updatedCustomer) => {
      // Update cache
      queryClient.setQueryData<Customer[]>(["customers", shouldRefresh], (oldData) => {
        if (oldData) {
          return oldData.map(customer => 
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          );
        }
        return oldData;
      });
      
      // Update selected if it's the same customer
      if (selected?.id === updatedCustomer.id) {
        setSelected(updatedCustomer);
      }
    },
  });

  // CRUD Functions
  const getCustomerById = async (id: string): Promise<Customer | null> => {
    try {
      // First check cache
      const cached = queryClient.getQueryData<Customer[]>(["customers", shouldRefresh])?.find((customer) => customer.id === id);
      if (cached) {
        setSelected(cached);
        return cached;
      }

      // If not in cache, fetch from API
      const response = await axios.get(`${CUSTOMERS_ENDPOINT}/${id}`);
      const customer = response.data;
      setSelected(customer);
      
      // Update cache
      queryClient.setQueryData<Customer[]>(["customers", shouldRefresh], (oldData) => {
        if (oldData) {
          const existingIndex = oldData.findIndex(c => c.id === id);
          if (existingIndex >= 0) {
            const newData = [...oldData];
            newData[existingIndex] = customer;
            return newData;
          } else {
            return [...oldData, customer];
          }
        }
        return [customer];
      });
      
      return customer;
    } catch (error) {
      console.error(`Failed to get customer ${id}:`, error);
      return null;
    }
  };

  const checkCustomerExists = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${CUSTOMERS_ENDPOINT}/${id}`);
      return !!response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const createCustomer = async (customerData: CreateCustomerRequest): Promise<Customer> => {
    return createMutation.mutateAsync(customerData);
  };

  const updateCustomer = async (id: string, customerData: UpdateCustomerRequest): Promise<Customer> => {
    return updateMutation.mutateAsync({ id, customerData });
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const addStationToCustomer = async (customerId: string, stationId: string): Promise<Customer> => {
    return addStationMutation.mutateAsync({ customerId, stationId });
  };

  const removeStationFromCustomer = async (customerId: string, stationId: string): Promise<Customer> => {
    return removeStationMutation.mutateAsync({ customerId, stationId });
  };

  const refetch = async (): Promise<void> => {
    await refetchCustomers();
  };

  // Context value
  const contextValue: CustomerContextType = {
    data,
    stations,
    isLoading: isLoadingCustomers || isLoadingStations,
    isError: !!customersError,
    error: customersError as Error | null,
    selected,
    setSelected,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    checkCustomerExists,
    addStationToCustomer,
    removeStationFromCustomer,
    refetch,
    refreshData,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
}

// Custom hook to use CustomerContext
export function useCustomerContext(): CustomerContextType {
  const context = useContext(CustomerContext);
  
  if (context === undefined) {
    throw new Error('useCustomerContext must be used within a CustomerProvider');
  }
  
  return context;
}

// Utility hooks
export function useCustomerData(): Customer[] {
  const { data } = useCustomerContext();
  return data;
}

export function useCustomerActions() {
  const { 
    getCustomerById, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer, 
    addStationToCustomer,
    removeStationFromCustomer,
    refetch 
  } = useCustomerContext();
  return { 
    getCustomerById, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer, 
    addStationToCustomer,
    removeStationFromCustomer,
    refetch 
  };
}