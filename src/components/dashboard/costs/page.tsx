// src/components/dashboard/costs/page.tsx
'use client';

import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { CostTable } from './cost-table';
import { useCost } from '@/contexts/cost-context';

export default function CostsPage(): React.JSX.Element {
  const { costList, isLoading, refreshData } = useCost();
  
  useEffect(() => {
    document.title = 'Cost Analysis | Dashboard';
    void refreshData(); // Explicitly mark the promise as ignored
  }, [refreshData]);
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <CostTable 
          costs={costList} 
          isLoading={isLoading}
        />
      </Box>
    </Container>
  );
}