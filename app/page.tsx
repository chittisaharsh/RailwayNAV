"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import AdminAuth from '@/components/admin-auth';
import StationNavigation from '@/components/navigation-interface';
import { nodeFriendlyNames } from "@/components/navigation-interface";

const HomePage = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);

  const handleAdminSubmit = (enabledNodes: string[]) => {
    console.log('Enabled nodes:', enabledNodes);
    setNavigationData(enabledNodes);
    setShowAdmin(false);
  };

  return (
    <div>
      <Button 
        className="fixed top-4 right-4 z-50" 
        onClick={() => setShowAdmin(true)}
      >
        Admin Access
      </Button>

      {showAdmin && (
        <AdminAuth 
          nodes={nodeFriendlyNames} 
          onLogin={handleAdminSubmit} 
          onCancel={() => setShowAdmin(false)} 
        />
      )}

      <StationNavigation initialData={navigationData} />
    </div>
  );
};

export default HomePage;
