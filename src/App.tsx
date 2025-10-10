import '@xyflow/react/dist/style.css';
import { Settings } from 'lucide-react';

import { Editor } from '#/components/editor/Editor';
import { ExportDialog } from '#/components/editor/ExportDialog';
import { ImportDialog } from '#/components/editor/ImportDialog';
import { Nav } from '#/components/nav/Nav';
import { XYFlowRenderer } from '#/components/renderer/xyflow/XYFlowRenderer';
import { Button } from '#/components/ui/button';

import './App.css';

export const App = () => (
  <div className="w-full h-full">
    <Nav />

    <main className="mt-13 h-full">
      <div className="flex flex-row h-full">
        <div className="flex flex-3 h-full">
          <div className="flex flex-col h-full w-full">
            <div className="h-10 px-4 bg-card flex justify-end items-center space-x-1">
              <ImportDialog />

              <ExportDialog />

              <Button size="sm" variant="outline">
                <Settings />
              </Button>
            </div>
            <div className="h-full">
              <Editor />
            </div>
          </div>
        </div>
        <div className="flex flex-7 h-full">
          <XYFlowRenderer />
        </div>
      </div>
    </main>
  </div>
);
