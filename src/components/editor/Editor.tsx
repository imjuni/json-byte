import { useCallback, useEffect, useMemo } from 'react';

import MonacoEditor from '@monaco-editor/react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { getOrDefault } from '#/lib/getOrDefault';
import { safeYamlParse } from '#/lib/json/safeYamlParse';
import { createXyFlowNodesWithEdges } from '#/lib/xyflow/createXyFlowNodesWithEdges';
import { useEditorStore } from '#/stores/editorStore';
import { createFuse, useFuseStore } from '#/stores/fuseStore';
import { useXyFlowStore } from '#/stores/xyflowStore';

import type { BeforeMount } from '@monaco-editor/react';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

export const Editor = () => {
  const { content, language, setContent } = useEditorStore();
  const { direction, setNodesAndEdges } = useXyFlowStore();
  const { setFuse } = useFuseStore();

  // Create Subject once using useMemo
  const content$ = useMemo(() => new Subject<string | undefined | null>(), []);

  const handleBuildXyFlow = useCallback(
    (value: ReturnType<typeof safeYamlParse>): IXyFlowNode[] => {
      if (!(value instanceof Error)) {
        const { nodes, edges } = createXyFlowNodesWithEdges(value, direction);
        setNodesAndEdges(nodes, edges);
        return nodes;
      }

      return [];
    },
    [direction, setNodesAndEdges],
  );

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

      const nodes = handleBuildXyFlow(safeYamlParse(content));
      setFuse(createFuse(nodes));
    },
    [language, content, handleBuildXyFlow, setFuse],
  );

  // Setup RxJS pipe with operators
  useEffect(() => {
    const subscription = content$
      .pipe(
        distinctUntilChanged(), // Only emit when value changes
        filter((value) => value != null),
        debounceTime(500), // Wait 0.5 second after last input
        tap((value) => {
          const nodes = handleBuildXyFlow(safeYamlParse(value));
          setFuse(createFuse(nodes));
        }), // Side effect: perform search
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [content$, handleBuildXyFlow, setFuse]);

  return (
    <MonacoEditor
      beforeMount={handleEditorWillMount}
      height="100%"
      language={language === 'jsonc' ? 'json' : language}
      value={content}
      width="100%"
      onChange={(value) => {
        setContent(getOrDefault(value, '{}'));
        content$.next(value);
      }}
    />
  );
};
