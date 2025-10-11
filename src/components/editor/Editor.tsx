import { useCallback, useEffect, useMemo } from 'react';

import MonacoEditor from '@monaco-editor/react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { useXyFlowBuilder } from '#/hooks/useXyFlowBuilder';
import { getOrDefault } from '#/lib/getOrDefault';
import { useEditorStore } from '#/stores/editorStore';

import type { BeforeMount, OnMount } from '@monaco-editor/react';

export const Editor = () => {
  const { content, language, setContent, setEditorInstance } = useEditorStore();
  const { updateFromContent } = useXyFlowBuilder();

  // Create Subject once using useMemo
  const content$ = useMemo(() => new Subject<string | undefined | null>(), []);

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

      updateFromContent(content);
    },
    [language, content, updateFromContent],
  );

  const handleEditorMount: OnMount = useCallback(
    (editor) => {
      setEditorInstance(editor);
    },
    [setEditorInstance],
  );

  // Setup RxJS pipe with operators
  useEffect(() => {
    const subscription = content$
      .pipe(
        distinctUntilChanged(), // Only emit when value changes
        filter((value) => value != null),
        debounceTime(500), // Wait 0.5 second after last input
        tap((editorContent) => {
          updateFromContent(editorContent);
        }), // Side effect: perform search
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [content$, updateFromContent]);

  return (
    <MonacoEditor
      beforeMount={handleEditorWillMount}
      height="100%"
      language={language === 'jsonc' ? 'json' : language}
      onMount={handleEditorMount}
      value={content}
      width="100%"
      onChange={(value) => {
        setContent(getOrDefault(value, '{}'));
        content$.next(value);
      }}
    />
  );
};
