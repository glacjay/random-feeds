import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { usePrevious } from './usePrevious';

export function useToast(error) {
  const prevError = usePrevious(error);
  useEffect(() => {
    if (error && !prevError) {
      toast(String(error));
    }
  }, [error, prevError]);
}
