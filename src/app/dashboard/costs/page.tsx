// src/app/dashboard/costs/page.tsx
'use client';

import React from "react";
import CostsPage from '@/components/dashboard/costs/page';

// Disable static pre-rendering for this route since it uses client-side React contexts
export const dynamic = 'force-dynamic';

export default function Page(): React.JSX.Element {
  return <CostsPage />;
}