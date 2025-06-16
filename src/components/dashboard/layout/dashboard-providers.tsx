'use client';

import React from 'react';
import { CostProvider } from '@/contexts/cost-context';
import { TugboatProvider } from '@/contexts/tugboat-context';
import { BargeProvider } from '@/contexts/barge-context';
import { StationProvider } from '@/contexts/station-context';
import { CarrierProvider } from '@/contexts/carrier-context';
import { OrderProvider } from '@/contexts/order-context';

interface DashboardProvidersProps {
  children: React.ReactNode;
}

export function DashboardProviders({ children }: DashboardProvidersProps): React.JSX.Element {
  return (
    <OrderProvider>
      <TugboatProvider>
        <BargeProvider>
          <StationProvider>
            <CarrierProvider>
              <CostProvider>
                {children}
              </CostProvider>
            </CarrierProvider>
          </StationProvider>
        </BargeProvider>
      </TugboatProvider>
    </OrderProvider>
  );
}
