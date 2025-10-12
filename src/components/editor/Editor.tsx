import { useCallback } from 'react';

import { Maximize2, Minimize2 } from 'lucide-react';

import { EditorConfigDialog } from '#/components/editor/EditorConfigDialog';
import { ExportDialog } from '#/components/editor/ExportDialog';
import { ImportDialog } from '#/components/editor/ImportDialog';
import { JsonByteEditor } from '#/components/editor/JsonByteEditor';
import { Button } from '#/components/ui/button';
import { useEditorStore } from '#/stores/editorStore';

export const Editor = () => {
  const { language } = useEditorStore();

  const handlePretty = useCallback(() => {}, []);

  const handleCompact = useCallback(() => {}, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-10 px-4 bg-card flex justify-end items-center space-x-1">
        <Button disabled={language === 'yaml'} onClick={handlePretty} size="sm" variant="outline">
          <Maximize2 /> Pretty
        </Button>

        <Button disabled={language === 'yaml'} onClick={handleCompact} size="sm" variant="outline">
          <Minimize2 /> Compact
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
