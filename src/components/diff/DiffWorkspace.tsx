import { useCallback, useMemo, useState } from 'react';

import { DiffEditor } from '@monaco-editor/react';
import { ArrowLeftRight, Braces, RotateCcw } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { safeJsoncParse } from '#/lib/json/safeJsoncParse';
import { useEditorStore } from '#/stores/editorStore';
import { useThemeStore } from '#/stores/themeStore';

import type { BeforeMount } from '@monaco-editor/react';

const DEFAULT_LEFT = JSON.stringify(
  {
    name: 'JSON Byte',
    version: 1,
    features: ['visualization', 'search'],
    active: true,
  },
  undefined,
  2,
);

const DEFAULT_RIGHT = JSON.stringify(
  {
    name: 'JSON Byte',
    version: 2,
    features: ['visualization', 'search', 'diff'],
    active: true,
  },
  undefined,
  2,
);

interface IValidationState {
  left?: string;
  right?: string;
}

const formatJson = (content: string, indent: number): string | Error => {
  const parsed = safeJsoncParse(content);
  return parsed instanceof Error ? parsed : JSON.stringify(parsed, undefined, indent);
};

export const DiffWorkspace = () => {
  const intl = useIntl();
  const appTheme = useThemeStore((state) => state.theme);
  const indent = useEditorStore((state) => state.indent);
  const [left, setLeft] = useState(DEFAULT_LEFT);
  const [right, setRight] = useState(DEFAULT_RIGHT);
  const [validation, setValidation] = useState<IValidationState>({});

  const monacoTheme = appTheme === 'dark' ? 'json-byte-diff-dark' : 'json-byte-diff-light';
  const hasError = validation.left != null || validation.right != null;
  const status = useMemo(() => {
    if (hasError) return intl.$t({ id: 'diff.status-invalid' });
    return left === right ? intl.$t({ id: 'diff.status-identical' }) : intl.$t({ id: 'diff.status-different' });
  }, [hasError, intl, left, right]);

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

  const validate = useCallback((side: 'left' | 'right', content: string) => {
    const parsed = safeJsoncParse(content);
    setValidation((current) => ({
      ...current,
      [side]: parsed instanceof Error ? parsed.message : undefined,
    }));
  }, []);

  const format = useCallback(
    (side: 'left' | 'right') => {
      const content = side === 'left' ? left : right;
      const formatted = formatJson(content, indent);
      if (formatted instanceof Error) {
        setValidation((current) => ({ ...current, [side]: formatted.message }));
        return;
      }
      if (side === 'left') setLeft(formatted);
      else setRight(formatted);
      setValidation((current) => ({ ...current, [side]: undefined }));
    },
    [indent, left, right],
  );

  return (
    <section aria-label={intl.$t({ id: 'diff.title' })} className="flex h-full w-full flex-col bg-background">
      <header className="flex min-h-11 flex-wrap items-center gap-2 border-b bg-card px-4 py-1.5">
        <div className="mr-auto flex items-center gap-2 text-sm">
          <span className="font-semibold">{intl.$t({ id: 'diff.title' })}</span>
          <span className={hasError ? 'text-destructive' : 'text-muted-foreground'}>{status}</span>
        </div>
        <Button onClick={() => format('left')} size="sm" variant="outline">
          <Braces /> {intl.$t({ id: 'diff.format-left' })}
        </Button>
        <Button onClick={() => format('right')} size="sm" variant="outline">
          <Braces /> {intl.$t({ id: 'diff.format-right' })}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLeft(right);
            setRight(left);
            setValidation({});
          }}
        >
          <ArrowLeftRight /> {intl.$t({ id: 'diff.swap' })}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLeft(DEFAULT_LEFT);
            setRight(DEFAULT_RIGHT);
            setValidation({});
          }}
        >
          <RotateCcw /> {intl.$t({ id: 'diff.reset' })}
        </Button>
      </header>

      {hasError ? (
        <Alert className="m-3 w-auto" variant="destructive">
          <AlertTitle>{intl.$t({ id: 'diff.invalid-title' })}</AlertTitle>
          <AlertDescription>
            {validation.left != null && `${intl.$t({ id: 'diff.left' })}: ${validation.left}`}
            {validation.right != null && `${intl.$t({ id: 'diff.right' })}: ${validation.right}`}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 border-b bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
        <span>{intl.$t({ id: 'diff.left' })}</span>
        <span className="pl-4">{intl.$t({ id: 'diff.right' })}</span>
      </div>

      <div className="min-h-0 flex-1">
        <DiffEditor
          beforeMount={defineThemes}
          height="100%"
          language="json"
          modified={right}
          original={left}
          theme={monacoTheme}
          onMount={(editor) => {
            const originalEditor = editor.getOriginalEditor();
            const modifiedEditor = editor.getModifiedEditor();
            originalEditor.onDidChangeModelContent(() => {
              const value = originalEditor.getValue();
              setLeft(value);
              validate('left', value);
            });
            modifiedEditor.onDidChangeModelContent(() => {
              const value = modifiedEditor.getValue();
              setRight(value);
              validate('right', value);
            });
          }}
          options={{
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            originalEditable: true,
            renderSideBySide: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </section>
  );
};
