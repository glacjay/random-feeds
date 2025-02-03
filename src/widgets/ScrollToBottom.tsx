'use client';

import { useEffect } from 'react';

export function ScrollToBottom() {
  useEffect(() => {
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 888);
  }, []);

  return null;
}
