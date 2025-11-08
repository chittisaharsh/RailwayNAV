"use client";

import React, { useState } from 'react';
import StationNavigation from '@/components/navigation-interface';

const HomePage = () => {
  const [navigationData, setNavigationData] = useState<any>(null);

  const handleAdminSubmit = (enabledNodes: string[]) => {
    console.log('Enabled nodes:', enabledNodes);
    setNavigationData(enabledNodes);
    setShowAdmin(false);
  };

  return (
    <div>

      <StationNavigation initialData={navigationData} />
    </div>
  );
};

export default HomePage;
