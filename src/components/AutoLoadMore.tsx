'use client';

import { useEffect } from 'react';

export function AutoLoadMore() {
  useEffect(() => {
    function tryLoadMore() {
      if (document.documentElement.scrollHeight > window.innerHeight) return;

      const loadMore = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Load More',
      );
      if (loadMore) {
        loadMore.click();
      }
    }

    // Delay to let sibling React islands (ReloadingButton) hydrate first
    const timer = setTimeout(tryLoadMore, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
