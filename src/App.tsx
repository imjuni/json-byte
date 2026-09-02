import { BrowserView, MobileView } from 'react-device-detect';

import { Editor } from '#/components/editor/Editor';
import { AppShell } from '#/components/layout/AppShell';
import { Resizer } from '#/components/layout/Resizer';
import { PixiGraphRenderer } from '#/components/renderer/pixi/PixiGraphRenderer';
import { useAppStore } from '#/stores/appStore';

import './App.css';

export const App = () => {
  const { editorWidthPercent, editorHeightPercent } = useAppStore();

  return (
    <AppShell activePage="visualization">
      <BrowserView className="flex flex-col md:flex-row h-full">
        <div
          className="flex w-full h-full md:w-auto"
          id="editor-control-container"
          style={{ width: `${editorWidthPercent}%` }}
        >
          <Editor />
        </div>

        <Resizer orientation="vertical" />

        <div
          className="flex w-full h-full md:w-auto"
          id="graph-tree-control-container"
          style={{ width: `${100 - editorWidthPercent}%` }}
        >
          <PixiGraphRenderer />
        </div>
      </BrowserView>

      <MobileView className="flex flex-col md:flex-row h-full">
        <div
          className="flex w-full h-full md:w-auto"
          id="editor-control-container"
          style={{ height: `${editorHeightPercent}%` }}
        >
          <Editor />
        </div>

        <Resizer orientation="horizontal" />

        <div
          className="flex w-full h-full md:w-auto"
          id="graph-tree-control-container"
          style={{ height: `${100 - editorHeightPercent}%` }}
        >
          <PixiGraphRenderer />
        </div>
      </MobileView>
    </AppShell>
  );
};
