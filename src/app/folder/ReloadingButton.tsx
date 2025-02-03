'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { loadMoreRandomItems } from '../api/actions';

export function ReloadingButton({ folderId, isReloading }) {
  let [isLoading, setIsLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          setIsLoading(true);
          await loadMoreRandomItems({ folderId, isReloading });
        } catch (ex) {
          console.warn('ReloadingButton.onClick error:', ex);
          toast.error(ex.message);
        } finally {
          setIsLoading(false);
        }
      }}
      disabled={isLoading}
      className="button"
      style={{ height: 44, opacity: isLoading ? 0.5 : 1, flex: 1 }}
    >
      {isReloading ? 're' : ''}load random items
    </button>
  );
}
