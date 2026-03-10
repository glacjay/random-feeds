'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

interface ReloadingButtonProps {
  folderId: string;
  isReloading: boolean;
}

export function ReloadingButton({ folderId, isReloading }: ReloadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/load-random-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId, isReloading }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reload items');
      }
      
      // A successful call should trigger a page reload to show the new items
      // that were stored in the cookie by the API route.
      window.location.reload();

    } catch (ex) {
        const error = ex instanceof Error ? ex.message : 'An unknown error occurred';
        console.warn('ReloadingButton.onClick error:', ex);
        toast.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className="h-14 flex-1 rounded-none"
    >
      {isLoading ? 'Loading...' : (isReloading ? 'Reload All' : 'Load More')}
    </Button>
  );
}
