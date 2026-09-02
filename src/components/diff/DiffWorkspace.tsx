import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DiffEditor, Editor } from '@monaco-editor/react';
import { ArrowLeftRight, Braces, RotateCcw, Trash2 } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { formatDiffDocument, parseDiffDocument } from '#/lib/diff/parseDiffDocument';
import { useEditorStore } from '#/stores/editorStore';
import { useThemeStore } from '#/stores/themeStore';

import type { BeforeMount, DiffOnMount } from '@monaco-editor/react';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

const DEFAULT_LEFT = JSON.stringify(
  { name: 'JSON Byte', version: 1, features: ['visualization', 'search'], active: true },
  undefined,
  2,
);
const DEFAULT_RIGHT = JSON.stringify(
  { name: 'JSON Byte', version: 2, features: ['visualization', 'search', 'diff'], active: true },
  undefined,
  2,
);

interface IDiffResult {
  language: TEditorLanguage;
  left: string;
  right: string;
}

const inputLanguage = (language?: TEditorLanguage) => language ?? 'json';
const CONTEXT_LINE_OPTIONS = [0, 1, 2, 3, 5, 10] as const;

export const DiffWorkspace = () => {
  const intl = useIntl();
  const appTheme = useThemeStore((state) => state.theme);
  const indent = useEditorStore((state) => state.indent);
  const [left, setLeft] = useState(DEFAULT_LEFT);
  const [right, setRight] = useState(DEFAULT_RIGHT);
  const [result, setResult] = useState<IDiffResult>();
  const [showResult, setShowResult] = useState(false);
  const [resultStale, setResultStale] = useState(false);
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);
  const [contextLines, setContextLines] = useState(3);
  const diffEditorRef = useRef<Parameters<DiffOnMount>[0] | null>(null);

  const leftDocument = useMemo(() => parseDiffDocument(left), [left]);
  const rightDocument = useMemo(() => parseDiffDocument(right), [right]);
  const languageMismatch =
    leftDocument.error == null && rightDocument.error == null && leftDocument.language !== rightDocument.language;
  const hasError = leftDocument.error != null || rightDocument.error != null || languageMismatch;
  const monacoTheme = appTheme === 'dark' ? 'json-byte-diff-dark' : 'json-byte-diff-light';

  const defineThemes: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme('json-byte-diff-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'diffEditor.insertedTextBackground': '#16a34a26',
        'diffEditor.insertedLineBackground': '#22c55e14',
        'diffEditor.removedTextBackground': '#dc262626',
        'diffEditor.removedLineBackground': '#ef444414',
        'diffEditor.diagonalFill': '#e5e7eb',
      },
    });
    monaco.editor.defineTheme('json-byte-diff-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e293b',
        'diffEditor.insertedTextBackground': '#22c55e33',
        'diffEditor.insertedLineBackground': '#22c55e17',
        'diffEditor.removedTextBackground': '#ef444433',
        'diffEditor.removedLineBackground': '#ef444417',
        'diffEditor.diagonalFill': '#334155',
      },
    });
  }, []);

  const mountDiffEditor: DiffOnMount = useCallback((editor) => {
    diffEditorRef.current = editor;
  }, []);

  useEffect(() => {
    diffEditorRef.current?.updateOptions({
      hideUnchangedRegions: {
        contextLineCount: contextLines,
        enabled: showOnlyChanges,
        minimumLineCount: 3,
        revealLineCount: contextLines,
      },
    });
  }, [contextLines, showOnlyChanges]);

  const format = useCallback(
    (side: 'left' | 'right') => {
      const formatted = formatDiffDocument(side === 'left' ? left : right, indent);
      if (formatted instanceof Error) return;
      if (side === 'left') setLeft(formatted);
      else setRight(formatted);
      if (result != null) setResultStale(true);
    },
    [indent, left, result, right],
  );

  const compare = useCallback(() => {
    if (
      leftDocument.error != null ||
      rightDocument.error != null ||
      leftDocument.language == null ||
      rightDocument.language == null ||
      leftDocument.language !== rightDocument.language
    ) {
      return;
    }
    const formattedLeft = formatDiffDocument(left, indent);
    const formattedRight = formatDiffDocument(right, indent);
    if (formattedLeft instanceof Error || formattedRight instanceof Error) return;
    setResult({ language: leftDocument.language, left: formattedLeft, right: formattedRight });
    setShowResult(true);
    setResultStale(false);
  }, [indent, left, leftDocument, right, rightDocument]);

  return (
    <section
      aria-label={intl.$t({ id: 'diff.title' })}
      className="h-full w-full overflow-y-auto bg-background px-4 py-3"
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4">
        <header className="flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <h1 className="text-lg font-semibold">{intl.$t({ id: 'diff.title' })}</h1>
            <p className="text-sm text-muted-foreground">{intl.$t({ id: 'diff.description' })}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLeft(right);
              setRight(left);
              if (result != null) setResultStale(true);
            }}
          >
            <ArrowLeftRight /> {intl.$t({ id: 'diff.swap' })}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLeft('');
              setRight('');
              setShowResult(false);
            }}
          >
            <Trash2 /> {intl.$t({ id: 'diff.clear' })}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLeft(DEFAULT_LEFT);
              setRight(DEFAULT_RIGHT);
              setShowResult(false);
            }}
          >
            <RotateCcw /> {intl.$t({ id: 'diff.reset' })}
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Input panels are declared below to keep the workspace flow readable. */}
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <DiffInputPanel
            error={leftDocument.error?.message}
            label={intl.$t({ id: 'diff.left' })}
            language={leftDocument.language}
            modelPath="diff-input-left"
            monacoTheme={monacoTheme}
            onBeforeMount={defineThemes}
            onFormat={() => format('left')}
            value={left}
            onChange={(value) => {
              setLeft(value ?? '');
              if (result != null) setResultStale(true);
            }}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <DiffInputPanel
            error={rightDocument.error?.message}
            label={intl.$t({ id: 'diff.right' })}
            language={rightDocument.language}
            modelPath="diff-input-right"
            monacoTheme={monacoTheme}
            onBeforeMount={defineThemes}
            onFormat={() => format('right')}
            value={right}
            onChange={(value) => {
              setRight(value ?? '');
              if (result != null) setResultStale(true);
            }}
          />
        </div>

        {hasError ? (
          <Alert variant="destructive">
            <AlertTitle>{intl.$t({ id: 'diff.invalid-title' })}</AlertTitle>
            <AlertDescription>
              {languageMismatch
                ? intl.$t({ id: 'diff.language-mismatch' })
                : (leftDocument.error?.message ?? rightDocument.error?.message)}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex justify-center py-1">
          <Button disabled={hasError} onClick={compare} size="lg">
            {intl.$t(
              { id: 'diff.compare' },
              { format: (leftDocument.language ?? rightDocument.language ?? 'json').toUpperCase() },
            )}
          </Button>
        </div>

        {result != null ? (
          <section
            aria-label={intl.$t({ id: 'diff.result' })}
            className={showResult ? 'flex flex-col gap-2 pb-4' : 'hidden'}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{intl.$t({ id: 'diff.result' })}</h2>
                {resultStale ? (
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                    {intl.$t({ id: 'diff.result-stale' })}
                  </span>
                ) : null}
              </div>
              <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium uppercase">
                {result.language}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-3 py-2">
              <Button
                aria-pressed={showOnlyChanges}
                onClick={() => setShowOnlyChanges((current) => !current)}
                size="sm"
                variant={showOnlyChanges ? 'default' : 'outline'}
              >
                {intl.$t({ id: showOnlyChanges ? 'diff.show-all' : 'diff.show-diff-only' })}
              </Button>
              {showOnlyChanges ? (
                <label className="flex items-center gap-2 text-sm text-muted-foreground" htmlFor="diff-context-lines">
                  {intl.$t({ id: 'diff.context' })}
                  <select
                    aria-label={intl.$t({ id: 'diff.context-lines' })}
                    className="h-8 rounded-md border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id="diff-context-lines"
                    onChange={(event) => setContextLines(Number(event.target.value))}
                    value={contextLines}
                  >
                    {CONTEXT_LINE_OPTIONS.map((lineCount) => (
                      <option key={lineCount} value={lineCount}>
                        {intl.$t({ id: 'diff.context-line-option' }, { count: lineCount })}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/70" />
                  {intl.$t({ id: 'diff.removed' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-green-600/70 dark:bg-green-400/70" />
                  {intl.$t({ id: 'diff.added' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-muted-foreground/60" />
                  {intl.$t({ id: 'diff.unchanged' })}
                </span>
              </div>
            </div>
            <div className="h-[52vh] min-h-80 overflow-hidden rounded-lg border bg-card">
              <DiffEditor
                keepCurrentModifiedModel
                keepCurrentOriginalModel
                beforeMount={defineThemes}
                height="100%"
                language={result.language}
                modified={result.right}
                modifiedModelPath="diff-result-right"
                onMount={mountDiffEditor}
                original={result.left}
                originalModelPath="diff-result-left"
                theme={monacoTheme}
                options={{
                  automaticLayout: true,
                  fontSize: 14,
                  hideUnchangedRegions: {
                    contextLineCount: contextLines,
                    enabled: showOnlyChanges,
                    minimumLineCount: 3,
                    revealLineCount: contextLines,
                  },
                  minimap: { enabled: false },
                  originalEditable: false,
                  readOnly: true,
                  renderSideBySide: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
};

interface IDiffInputPanelProps {
  error: string | undefined;
  label: string;
  language: TEditorLanguage | undefined;
  modelPath: string;
  monacoTheme: string;
  onBeforeMount: BeforeMount;
  onChange: (value?: string) => void;
  onFormat: () => void;
  value: string;
}

const DiffInputPanel = ({
  error,
  label,
  language,
  modelPath,
  monacoTheme,
  onBeforeMount,
  onChange,
  onFormat,
  value,
}: IDiffInputPanelProps) => {
  const intl = useIntl();
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <header className="flex h-10 items-center gap-2 border-b px-3">
        <h2 className="font-semibold">{label}</h2>
        <span
          className={
            error == null
              ? 'rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium uppercase text-muted-foreground'
              : 'rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive'
          }
        >
          {error == null ? language : intl.$t({ id: 'diff.invalid' })}
        </span>
        <Button className="ml-auto" disabled={error != null} onClick={onFormat} size="sm" variant="ghost">
          <Braces /> {intl.$t({ id: 'diff.format' })}
        </Button>
      </header>
      <div className="h-72">
        <Editor
          beforeMount={onBeforeMount}
          height="100%"
          language={inputLanguage(language)}
          onChange={onChange}
          path={modelPath}
          theme={monacoTheme}
          value={value}
          options={{
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </section>
  );
};
