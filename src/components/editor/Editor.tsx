import '@xyflow/react/dist/style.css';

import { EditorConfigDialog } from '#/components/editor/EditorConfigDialog';
import { ExportDialog } from '#/components/editor/ExportDialog';
import { ImportDialog } from '#/components/editor/ImportDialog';
import { JsonByteEditor } from '#/components/editor/JsonByteEditor';

export const Editor = () => (
  <div className="flex flex-col h-full w-full">
    <div className="h-10 px-4 bg-card flex justify-end items-center space-x-1">
      <ImportDialog />

      <ExportDialog />

      <EditorConfigDialog />
    </div>

    <div className="flex-1 overflow-hidden">
      <JsonByteEditor />
    </div>
  </div>
);
