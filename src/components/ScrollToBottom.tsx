'use client';

import { useEffect } from 'react';

export function ScrollToBottom() {
  useEffect(() => {
    const scrollToBottom = () => {
      // Try multiple times to ensure page is fully loaded
      const doScroll = () => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'auto'
        });
      };
      
      // First try immediately
      doScroll();
      
      // Then try a few more times with increasing delays
      setTimeout(doScroll, 100);
      setTimeout(doScroll, 500);
      setTimeout(doScroll, 1000);
    };
    
    scrollToBottom();
  }, []);

  return null;
}
