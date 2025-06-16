"use client";

import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Order } from "@/types/order";

export interface OrderContextType {
  data?: Order[];
  isError?: unknown;
  isLoading: boolean;
  selectedOrder?: Order;
  getById?: (id: string) => Promise<void>;
}

export const OrderContext = createContext<OrderContextType>({ 
  isLoading: true,
});

export function useOrder(): OrderContextType {
  const context = useContext(OrderContext);
  
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  
  return context;
}

export function OrderProvider({ children }: { children: ReactNode }): React.JSX.Element | null {
  const [selectedOrder, setSelectedOrder] = useState<Order>();

  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const response = await axios.get<Order[]>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders`);
      return response.data;
    },
  });

  const getById = async (id: string): Promise<void> => {
    const cached = data?.find((t) => t.id === id);
    if (cached) {
      setSelectedOrder(cached);
      return;
    }

    const res = await axios.get<Order>(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/orders/${id}`);
    setSelectedOrder(res.data);
  };

  if (!data) return null;

  return (
    <OrderContext.Provider
      value={{
        data,
        isLoading,
        selectedOrder,
        getById
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
