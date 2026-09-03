import { useEffect, useMemo } from 'react';

import { useGraphBuilder } from '#/components/editor/hooks/useGraphBuilder';
import { CE_EDITOR_URL } from '#/contracts/editors/CE_EDITOR_URL';
import { decompressQueryString } from '#/lib/compression/queryStringCodec';
import { useEditorStore } from '#/stores/editorStore';

export const useQueryStringContent = (): void => {
  const setContent = useEditorStore((state) => state.setContent);
  const { updateFromContent } = useGraphBuilder();
  const encoded = useMemo(() => new URLSearchParams(window.location.search).get(CE_EDITOR_URL.CONTENT), []);

  useEffect(() => {
    if (encoded == null) return undefined;

    let active = true;
    decompressQueryString(encoded).then((content) => {
      if (!active) return;
      if (content instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(content.message);
        return;
      }

      setContent(content);
      updateFromContent(content);
    });

    return () => {
      active = false;
    };
  }, [encoded, setContent, updateFromContent]);
};
