import { useCallback } from 'react';

import MonacoEditor from '@monaco-editor/react';

import { getOrDefault } from '#/lib/getOrDefault';
import { safeParse } from '#/lib/json/safeParse';
import { createXyFlowNodesWithEdges } from '#/lib/xyflow/createXyFlowNodes';
import { useEditorStore } from '#/stores/editorStore';
import { useXyFlowStore } from '#/stores/xyflowStore';

import type { BeforeMount } from '@monaco-editor/react';

export const Editor = () => {
  const { content, language, setContent, setDocument } = useEditorStore();
  const { direction, setNodesAndEdges } = useXyFlowStore();

  const handleEditorWillMount: BeforeMount = useCallback(
    (monaco) => {
      if (language === 'jsonc') {
        // Configure JSON language to allow comments and trailing commas
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: true,
          trailingCommas: 'ignore',
          schemas: [],
          enableSchemaRequest: false,
        });
      }
    },
    [language],
  );

  return (
    <MonacoEditor
      beforeMount={handleEditorWillMount}
      height="100%"
      language={language === 'jsonc' ? 'json' : language}
      value={content}
      width="100%"
      onChange={(value) => {
        const editorContent = getOrDefault(value, '{}');
        const parsedContent = safeParse(editorContent);

        setContent(editorContent);
        setDocument(parsedContent);

        if (!(parsedContent instanceof Error)) {
          const { nodes, edges } = createXyFlowNodesWithEdges(parsedContent, direction);
          setNodesAndEdges(nodes, edges);
        }
      }}
    />
  );
};
