import { cookies } from 'next/headers';
import Link from 'next/link';
import React, { Fragment } from 'react';
import { useQuery } from 'react-query';
import { useFolders, useFolderUnreadsCount, useRecentlyReadItems, useToken } from 'src/data';
import { useToast } from 'src/utils/useToast';

import { getToken } from '@/utils/token';

export default function Page() {
  const token = getToken();

  if (!token) {
    return <Link href="/login">Sign in</Link>;
  }

  return (
    <div className="flex-column" style={{ minHeight: '100vh' }}>
      <div
        className="flex-row align-center"
        style={{ margin: '0 4px', justifyContent: 'space-between' }}
      >
        {/* <TotalUnreadsCount /> */}
        <a href="/broken-feeds">Broken Feeds</a>
      </div>
      {/* <Folders />
      <RecentlyReadItems /> */}
    </div>
  );
}

// async function TotalUnreadsCount() {
//   const [token] = useToken();
//   const { data, error } = useQuery('/reader/api/0/unread-count?output=json', { enabled: !!token });
//   useToast(error);
//   const totalUnreadsCount = data?.bq_total_unreads;

//   return <div style={{}}>未读：{totalUnreadsCount}</div>;
// }

// function Folders() {
//   const { folders, isFetching } = useFolders();

//   if (isFetching) return <div>loading...</div>;

//   return (
//     <Fragment>
//       {folders?.map((folder) => (
//         <Folder key={folder.id} folder={folder} />
//       ))}
//     </Fragment>
//   );
// }

// function Folder({ folder }) {
//   const { unreadsCount, error } = useFolderUnreadsCount(folder);
//   useToast(error);

//   return (
//     <Link
//       href={`/folder?id=${folder.id}`}
//       style={{ margin: '4px 4px 0', border: '1px solid black', borderRadius: 4, padding: 8 }}
//     >
//       {folder.id?.replace(/.*\//g, '')} ({unreadsCount})
//     </Link>
//   );
// }

// function RecentlyReadItems() {
//   const [recentlyReadItems] = useRecentlyReadItems();

//   return (
//     <Fragment>
//       {recentlyReadItems?.length > 0 && (
//         <Fragment>
//           <div style={{ flex: 1, minHeight: 16 }} />
//           <Link
//             href="/recently"
//             style={{ margin: '4px 4px', border: '1px solid black', borderRadius: 4, padding: 8 }}
//           >
//             最近已读文章 ({recentlyReadItems.length})
//           </Link>
//         </Fragment>
//       )}
//     </Fragment>
//   );
// }
