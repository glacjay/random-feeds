export interface UnreadCount {
  id: string;
  count: number;
}

export interface UnreadSummary {
  unreadcounts: UnreadCount[];
  bq_total_unreads?: number;
}

export interface Category {
  id: string;
}

export interface Subscription {
  id: string;
  title?: string;
  categories?: Category[];
}

export interface Folder {
  id: string;
  title: string;
}

export interface FolderWithUnread extends Folder {
    unreadCount: number;
}

export interface Item {
  id: string;
  title: string;
  author: string;
  updated: number;
  feedId?: string;
  crawlTimeMsec?: string;
  canonical?: Array<{ href: string }>;
  summary?: { content: string };
  origin?: {
    streamId: string;
    title: string;
  };
}
