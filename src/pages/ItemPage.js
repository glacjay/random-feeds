import dayjs from 'dayjs';
import HtmlToReact, { Parser as HtmlToReactParser } from 'html-to-react';
import { observer } from 'mobx-react';
import qs from 'qs';
import React, { useMemo } from 'react';
import { useItem } from 'src/data';
import { useToast } from 'src/utils/useToast';
import ItemActions from 'src/widgets/ItemActions';

export default observer(function ItemPage(props) {
  const query = qs.parse(props.location.search.slice(1));
  const { id: itemId } = query;

  const { item, error } = useItem({ id: itemId });
  useToast(error);

  const contentElement = useMemo(() => {
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
    const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
    const processingInstructions = [
      {
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode,
      },
    ];
    const parser = new HtmlToReactParser();
    return parser.parseWithInstructions(
      item.summary.content,
      () => true,
      processingInstructions,
      preprocessingInstructions,
    );
  }, [item]);

  // try to reserve scroll position
  if (!item) return null;

  return (
    <div className="flex-column">
      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-column"
        style={{
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
            {item?.origin?.title} | {item?.author}
          </div>
          <div>{dayjs(item?.updated * 1000).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      </a>

      <div style={{ margin: 8 }}>
        {contentElement || <div dangerouslySetInnerHTML={{ __html: item?.summary?.content }} />}
      </div>

      <div style={{ height: 100 }} />
      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        <ItemActions
          folderId={query.folderId}
          item={item}
          history={props.history}
          buttonStyle={{ flex: 1, height: 44 }}
        />
      </div>
    </div>
  );
});
