import dayjs from 'dayjs';
import HtmlToReact, { Parser as HtmlToReactParser } from 'html-to-react';
import { observer } from 'mobx-react';
import qs from 'qs';
import React from 'react';
import { useRootStore } from 'src/RootStore';

export default observer(function ItemPage(props) {
  const rootStore = useRootStore();

  const query = qs.parse(props.location.search.slice(1));
  const { id: itemId } = query;
  const item = rootStore.randomItems?.find((item) => item.id === itemId);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  let contentElement = null;
  if (item?.summary?.content) {
    const preprocessingInstructions = [
      {
        shouldPreprocessNode: (node) => node.name === 'img',
        preprocessNode: (node) => {
          node.attribs = {
            ...node.attribs,
            style: `${node.attribs?.style}; max-width: 100%;`,
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

      <div style={{ height: 50 }} />
      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        <button
          onClick={async () => {
            setIsSubmitting(true);
            if (await rootStore.markItemAsRead(item?.id)) {
              props.history.goBack();
            }
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
          style={{ flex: 1 }}
        >
          mark as read
        </button>
        <button onClick={() => props.history.goBack()} disabled={isSubmitting} style={{ flex: 1 }}>
          return
        </button>
      </div>
    </div>
  );
});
