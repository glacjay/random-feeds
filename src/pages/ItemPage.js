import dayjs from 'dayjs';
import HtmlToReact, { Parser as HtmlToReactParser } from 'html-to-react';
import { observer } from 'mobx-react';
import qs from 'qs';
import React from 'react';
import { useRootStore } from 'src/RootStore';
import ItemActions from 'src/widgets/ItemActions';

export default observer(function ItemPage(props) {
  const rootStore = useRootStore();

  const query = qs.parse(props.location.search.slice(1));
  const { folderId, id: itemId } = query;

  React.useEffect(() => {
    rootStore.loadItems({ folderId });
  }, [rootStore, rootStore.token, folderId]);

  const folder = rootStore.folders?.find((f) => f.id === folderId);
  const item = folder?.randomItems?.find((item) => item.id === itemId);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  let contentElement = null;
  if (item?.summary?.content) {
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
        shouldProcessNode: (node) => true,
        processNode: processNodeDefinitions.processDefaultNode,
      },
    ];
    const parser = new HtmlToReactParser();
    contentElement = parser.parseWithInstructions(
      item.summary.content,
      () => true,
      processingInstructions,
      preprocessingInstructions,
    );
  }

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
          folderId={folderId}
          item={item}
          history={props.history}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          buttonStyle={{ flex: 1 }}
        />
      </div>
    </div>
  );
});
