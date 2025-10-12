import '@xyflow/react/dist/style.css';
import { BrowserView, MobileView } from 'react-device-detect';

import { Editor } from '#/components/editor/Editor';
import { Resizer } from '#/components/layout/Resizer';
import { Nav } from '#/components/nav/Nav';
import { Notification } from '#/components/nav/Notification';
import { XYFlowRenderer } from '#/components/renderer/xyflow/XYFlowRenderer';
import { useAppStore } from '#/stores/appStore';

import './App.css';

export const App = () => {
  const { editorWidthPercent, editorHeightPercent } = useAppStore();

  return (
    <div className="flex flex-col w-full h-full">
      <Nav />
      <Notification />

      <main className="flex-1 mt-13 overflow-y-scroll md:overflow-hidden">
        <BrowserView className="flex flex-col md:flex-row h-full">
          {/* editor control container */}
          <div
            className="flex w-full h-full md:w-auto"
            id="editor-control-container"
            style={{ width: `${editorWidthPercent}%` }}
          >
            <Editor />
          </div>

          <Resizer orientation="vertical" />

          {/* graph control container */}
          <div
            className="flex w-full h-full md:w-auto"
            id="graph-tree-control-container"
            style={{ width: `${100 - editorWidthPercent}%` }}
          >
            <XYFlowRenderer />
          </div>
        </BrowserView>

        <MobileView className="flex flex-col md:flex-row h-full">
          {/* editor control container */}
          <div
            className="flex w-full h-full md:w-auto"
            id="editor-control-container"
            style={{ height: `${editorHeightPercent}%` }}
          >
            <Editor />
          </div>

          <Resizer orientation="horizontal" />

          {/* graph control container */}
          <div
            className="flex w-full h-full md:w-auto"
            id="graph-tree-control-container"
            style={{ height: `${100 - editorHeightPercent}%` }}
          >
            <XYFlowRenderer />
          </div>
        </MobileView>
      </main>

      <footer className="h-6 px-4 bg-card border-t flex items-center justify-between text-xs text-muted-foreground">
        <div>JSON</div>
        <div className="flex gap-4">
          <span>© 2025 JSON Byte</span>

          <a className="hover:text-foreground transition-colors" href="https://rovinjsoft.com/" target="_blink">
            <span className="font-bold">Rovinj Soft Co.</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
