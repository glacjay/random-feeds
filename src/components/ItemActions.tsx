'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import type { Item } from '@/lib/types';

interface ItemActionsProps {
  folderId?: string;
  item: Item;
}

export function ItemActions({ folderId, item }: ItemActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const goBackWithFolderRefresh = () => {
    if (folderId) {
      try {
        sessionStorage.setItem('refresh-folder-on-back', '1');
      } catch (error) {
        console.warn('Failed to set refresh-folder-on-back flag:', error);
      }
    }

    window.history.back();
  };

  const markAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: item.id, folderId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to mark as read');
      }

      goBackWithFolderRefresh();
    } catch (ex) {
      const error = ex instanceof Error ? ex.message : 'An unknown error occurred';
      console.warn('ItemActions.markAsRead error:', ex);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/remove-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: item.id, folderId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove item');
      }

      toast.success('Item removed.');
      goBackWithFolderRefresh();
    } catch (ex) {
      const error = ex instanceof Error ? ex.message : 'An unknown error occurred';
      console.warn('ItemActions.removeItem error:', ex);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const originalUrl = item?.canonical?.[0]?.href;

  return (
    <>
      <Button
        onClick={markAsRead}
        disabled={isLoading}
        variant="outline"
        className="h-14 flex-1 rounded-none"
      >
        已读
      </Button>

      <a
        href={originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-14 flex-1 flex items-center justify-center border bg-background hover:bg-gray-100"
        style={{ opacity: isLoading ? 0.5 : 1 }}
      >
        原文
      </a>

      <Button
        onClick={async () => {
          if (originalUrl) {
            window.open(originalUrl, '_blank');
          }

          await markAsRead();
        }}
        disabled={isLoading}
        variant="outline"
        className="h-14 flex-1 rounded-none"
      >
        读&开
      </Button>

      <Button
        onClick={removeItem}
        disabled={isLoading}
        variant="outline"
        className="h-14 flex-1 rounded-none"
      >
        稍后
      </Button>
    </>
  );
}
