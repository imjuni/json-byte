import { useCallback } from 'react';

import { Maximize2, Minimize2 } from 'lucide-react';
import { useIntl } from 'react-intl';

import { EditorConfigDialog } from '#/components/editor/EditorConfigDialog';
import { ExportDialog } from '#/components/editor/ExportDialog';
import { useGraphBuilder } from '#/components/editor/hooks/useGraphBuilder';
import { ImportDialog } from '#/components/editor/ImportDialog';
import { JsonByteEditor } from '#/components/editor/JsonByteEditor';
import { Button } from '#/components/ui/button';
import { multiParse } from '#/lib/json/multiParse';
import { safeStringify } from '#/lib/json/safeStringify';
import { useEditorStore } from '#/stores/editorStore';

export const Editor = () => {
  const intl = useIntl();
  const { language, content, indent, setContent } = useEditorStore();
  const { updateFromContent } = useGraphBuilder();

  const handlePretty = useCallback(() => {
    const parsed = multiParse(content);

    if (parsed instanceof Error) {
      return false;
    }

    const stringified = safeStringify(parsed.data, undefined, indent);

    if (stringified instanceof Error) {
      return false;
    }

    setContent(stringified);
    updateFromContent(stringified);

    return true;
  }, [content, indent, setContent, updateFromContent]);

  const handleCompact = useCallback(() => {
    const parsed = multiParse(content);

    if (parsed instanceof Error) {
      return false;
    }

    const stringified = safeStringify(parsed.data);

    if (stringified instanceof Error) {
      return false;
    }

    setContent(stringified);
    updateFromContent(stringified);

    return true;
  }, [content, setContent, updateFromContent]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-10 px-4 bg-card flex justify-end items-center space-x-1">
        <Button disabled={language === 'yaml'} onClick={handlePretty} size="sm" variant="outline">
          <Maximize2 />
          <span className="hidden workspace-wide:inline">{intl.$t({ id: 'editor.pretty' })}</span>
        </Button>

        <Button disabled={language === 'yaml'} onClick={handleCompact} size="sm" variant="outline">
          <Minimize2 />
          <span className="hidden workspace-wide:inline">{intl.$t({ id: 'editor.compact' })}</span>
        </Button>

        <ImportDialog />

        <ExportDialog />

        <EditorConfigDialog />
      </div>

      <div className="flex-1 overflow-hidden">
        <JsonByteEditor />
      </div>
    </div>
  );
};
