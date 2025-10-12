import '@xyflow/react/dist/style.css';
import { Settings } from 'lucide-react';

import { ExportDialog } from '#/components/editor/ExportDialog';
import { ImportDialog } from '#/components/editor/ImportDialog';
import { JsonByteEditor } from '#/components/editor/JsonByteEditor';
import { Button } from '#/components/ui/button';

export const Editor = () => (
  <div className="flex flex-col h-full w-full">
    <div className="h-10 px-4 bg-card flex justify-end items-center space-x-1">
      <ImportDialog />

      <ExportDialog />

      <Button size="sm" variant="outline">
        <Settings />
      </Button>
    </div>

    <div className="flex-1 overflow-hidden">
      <JsonByteEditor />
    </div>
  </div>
);
