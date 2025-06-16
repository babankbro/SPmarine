// src/contexts/cost-context.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../http';
import type { Cost } from '../types/cost';

interface CostContextType {
  costList: Cost[];
  isLoading: boolean;
  isError: boolean;
  refreshData: () => Promise<void>;
  getByIds: (tugboatId: string, orderId: string) => Cost | undefined;
  getCostsByTugboat: (tugboatId: string) => Cost[];
  getCostsByOrder: (orderId: string) => Cost[];
}

const CostContext = createContext<CostContextType | undefined>(undefined);

export function CostProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { data: costList = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['costs'],
    queryFn: async (): Promise<Cost[]> => {
        //console.log('Fetching costs data...');
        const response = await http.get<Cost[]>('costs');
        //console.log('API response for costs:', response);
        //console.log('Number of costs returned:', response.data.length);
        return response.data;
    }
  });

  const refreshData = async (): Promise<void> => {
    await refetch();
  };

  const getByIds = (tugboatId: string, orderId: string): Cost | undefined => {
    return costList.find((cost) => cost.TugboatId === tugboatId && cost.OrderId === orderId);
  };

  const getCostsByTugboat = (tugboatId: string): Cost[] => {
    return costList.filter((cost) => cost.TugboatId === tugboatId);
  };

  const getCostsByOrder = (orderId: string): Cost[] => {
    return costList.filter((cost) => cost.OrderId === orderId);
  };

  return (
    <CostContext.Provider
      value={{
        costList,
        isLoading,
        isError,
        refreshData,
        getByIds,
        getCostsByTugboat,
        getCostsByOrder,
      }}
    >
      {children}
    </CostContext.Provider>
  );
}

export function useCost(): CostContextType {
  const context = useContext(CostContext);
  
  if (context === undefined) {
    throw new Error('useCost must be used within a CostProvider');
  }
  
  return context;
}