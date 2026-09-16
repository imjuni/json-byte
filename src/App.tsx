import { Editor } from '#/components/editor/Editor';
import { useQueryStringContent } from '#/components/editor/hooks/useQueryStringContent';
import { AppShell } from '#/components/layout/AppShell';
import { Resizer } from '#/components/layout/Resizer';
import { PixiGraphRenderer } from '#/components/renderer/pixi/PixiGraphRenderer';
import { useAppStore } from '#/stores/appStore';

import './App.css';

import type { CSSProperties } from 'react';

export const App = () => {
  const { editorWidthPercent, editorHeightPercent } = useAppStore();
  useQueryStringContent();

  const workspaceStyle = {
    '--editor-height': `${editorHeightPercent}%`,
    '--editor-width': `${editorWidthPercent}%`,
    '--graph-height': `${100 - editorHeightPercent}%`,
    '--graph-width': `${100 - editorWidthPercent}%`,
  } as CSSProperties;

  return (
    <AppShell activePage="visualization">
      <div className="flex h-full flex-col workspace-wide:flex-row" style={workspaceStyle}>
        <div
          className="flex h-(--editor-height) w-full workspace-wide:h-full workspace-wide:w-(--editor-width)"
          id="editor-control-container"
        >
          <Editor />
        </div>

        <Resizer orientation="horizontal" />
        <Resizer orientation="vertical" />

        <div
          className="flex h-(--graph-height) w-full workspace-wide:h-full workspace-wide:w-(--graph-width)"
          id="graph-tree-control-container"
        >
          <PixiGraphRenderer />
        </div>
      </div>
    </AppShell>
  );
};
