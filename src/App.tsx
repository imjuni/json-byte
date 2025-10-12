import '@xyflow/react/dist/style.css';
import { Settings } from 'lucide-react';

import { Editor } from '#/components/editor/Editor';
import { ExportDialog } from '#/components/editor/ExportDialog';
import { ImportDialog } from '#/components/editor/ImportDialog';
import { Nav } from '#/components/nav/Nav';
import { Notification } from '#/components/nav/Notification';
import { XYFlowRenderer } from '#/components/renderer/xyflow/XYFlowRenderer';
import { Button } from '#/components/ui/button';

import './App.css';

export const App = () => (
  <div className="flex flex-col w-full h-full">
    <Nav />
    <Notification />

    <main className="flex-1 mt-13 overflow-y-scroll md:overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        <div className="flex w-full h-[30rem] md:flex-2 md:h-full">
          <div className="flex flex-col h-full w-full">
            <div className="h-10 px-4 bg-card flex justify-end items-center space-x-1">
              <ImportDialog />

              <ExportDialog />

              <Button size="sm" variant="outline">
                <Settings />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor />
            </div>
          </div>
        </div>
        <div className="flex w-full h-[60rem] md:flex-8 md:h-full">
          <XYFlowRenderer />
        </div>
      </div>
    </main>

    <footer className="h-6 px-4 bg-card border-t flex items-center justify-between text-xs text-muted-foreground">
      <div>© 2025 JSON Byte</div>
      <div className="flex gap-4">
        {/* <a className="hover:text-foreground transition-colors" href="https://github.com">
          GitHub
        </a> */}
        <button className="hover:text-foreground transition-colors" type="button">
          Rovinj Soft Co.
        </button>
      </div>
    </footer>
  </div>
);
