import dayjs from 'dayjs';
import HtmlToReact, { Parser as HtmlToReactParser } from 'html-to-react';
import React from 'react';

import { ItemActions } from '@/widgets/ItemActions';

import { loadFeedUnreadsCount, loadItem } from '../api/actions';

export default async function Page({ searchParams }) {
  const { folderId, id: itemId } = searchParams;

  const item = await loadItem({ id: itemId });
  const unreadCount = await loadFeedUnreadsCount(item?.origin?.streamId);

  const contentElement = (() => {
    if (!item?.summary?.content) return null;

    const preprocessingInstructions = [
      {
        shouldPreprocessNode: (node) => node.name === 'img',
        preprocessNode: (node) => {
          node.attribs = {
            ...node.attribs,
            style: `${node.attribs?.style || ''}; max-width: 100%; height: auto;`,
          };
        },
      },
      {
        shouldPreprocessNode: (node) => node.name === 'pre',
        preprocessNode: (node) => {
          node.attribs = {
            ...node.attribs,
            style: `${node.attribs?.style || ''};
              border: 1px solid lightgray;
              padding: 2px;
              overflow-x: auto;
              white-space: pre;
              font-size: 0.8rem;
            `,
          };
        },
      },
    ];
    const processNodeDefinitions = HtmlToReact.ProcessNodeDefinitions();
    const processingInstructions = [
      {
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode,
      },
    ];
    const parser = HtmlToReactParser();
    return parser.parseWithInstructions(
      item.summary.content,
      () => true,
      processingInstructions,
      preprocessingInstructions,
    );
  })();

  // try to reserve scroll position
  if (!item) return null;

  return (
    <div className="flex-column" style={{ overflowX: 'hidden' }}>
      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-column"
        style={{
          position: 'sticky',
          top: 0,
          background: 'lightgray',
          padding: 8,
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{item?.title}</div>
        <div
          className="flex-row align-center"
          style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
        >
          <div>
            ({unreadCount}) {item?.origin?.title} | {item?.author}
          </div>
          <div>{dayjs(item?.updated * 1000).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      </a>

      <div style={{ position: 'relative', margin: 8, overflowX: 'auto' }}>
        {contentElement || <div dangerouslySetInnerHTML={{ __html: item?.summary?.content }} />}
      </div>

      <div style={{ height: 'calc(100px + env(safe-area-inset-bottom))' }} />
      <div
        className="flex-row"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          zIndex: 7,
          width: '100vw',
          height: 'calc(50px + env(safe-area-inset-bottom))',
          paddingBottom: 'calc(env(safe-area-inset-bottom))',
        }}
      >
        <ItemActions folderId={folderId} item={item} buttonStyle={{ flex: 1, height: 44 }} />
      </div>
    </div>
  );
}
