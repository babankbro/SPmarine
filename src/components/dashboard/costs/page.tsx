// src/components/dashboard/costs/page.tsx
// src/components/dashboard/costs/page.tsx
'use client';

import { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { CostTable } from './cost-table';
import { useCost } from '@/contexts/cost-context';

export default function CostsPage() {
  const { costList, isLoading, refreshData } = useCost();
  
  useEffect(() => {
    document.title = 'Cost Analysis | Dashboard';
    refreshData(); // Refresh data when component mounts
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



// 'use client';

// import { useEffect } from 'react';
// import { Box, Container, Typography } from '@mui/material';
// import { CostTable } from './cost-table';
// import { useCost } from '@/contexts/cost-context';

// export default function CostsPage() {
//   const { costList, isLoading, refreshData } = useCost();
  
//   useEffect(() => {
//     document.title = 'Costs | Dashboard';
//     refreshData(); // Refresh data when component mounts
//   }, [refreshData]);
  
//   return (
//     <Container maxWidth="xl">
//       <Box sx={{ py: 3 }}>
//         <Typography variant="h4" sx={{ mb: 3 }}>
//           Operational Costs
//         </Typography>
        
//         <CostTable 
//           costs={costList} 
//           isLoading={isLoading}
//         />
//       </Box>
//     </Container>
//   );
// }