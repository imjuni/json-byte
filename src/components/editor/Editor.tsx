import { useCallback, useEffect, useMemo } from 'react';

import MonacoEditor from '@monaco-editor/react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { replaceHref } from '#/components/editor/replaceHref';
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

  const handleUpdate = useCallback(
    (editorContent: string) => {
      const document = safeYamlParse(editorContent);
      const nodes = handleBuildXyFlow(document);
      setFuse(createFuse(nodes));

      setTimeout(() => {
        replaceHref(document);
      }, 10);
    },
    [setFuse, handleBuildXyFlow],
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

      handleUpdate(content);
    },
    [language, content, handleUpdate],
  );

  // Setup RxJS pipe with operators
  useEffect(() => {
    const subscription = content$
      .pipe(
        distinctUntilChanged(), // Only emit when value changes
        filter((value) => value != null),
        debounceTime(500), // Wait 0.5 second after last input
        tap((editorContent) => {
          handleUpdate(editorContent);
        }), // Side effect: perform search
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [content$, handleUpdate]);

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
