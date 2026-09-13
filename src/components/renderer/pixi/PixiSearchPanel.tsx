import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ArrowDown,
  ArrowRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Focus,
  Minus,
  Plus,
  Radar,
  Route,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useIntl } from 'react-intl';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { LegendPopover } from '#/components/renderer/common/LegendPopover';
import { ToolbarTooltip } from '#/components/renderer/common/ToolbarTooltip';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { TooltipProvider } from '#/components/ui/tooltip';
import { createGraphPathIndex, resolveGraphPath } from '#/lib/graph/graphPathIndex';
import { toGraphSearchMatches } from '#/lib/graph/toGraphSearchMatches';
import { toGraphSearchResultItems } from '#/lib/graph/toGraphSearchResultItems';
import { useFuseStore } from '#/stores/fuseStore';
import { useGraphStore } from '#/stores/graphStore';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IGraphSearchResultItem } from '#/lib/graph/toGraphSearchResultItems';

interface IPixiSearchPanelProps {
  onFocusNode: (node: IGraphNode) => void;
  onRevealNodes: (nodes: IGraphNode[]) => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleDirection: () => void;
  onToggleTracker: () => void;
  onToggleAllBranches: () => void;
  direction: string;
  graphFullyCollapsed: boolean;
  hasCollapsibleBranches: boolean;
  tracker: boolean;
}

type TSearchMode = 'path' | 'text';

const MAX_SEARCH_RESULTS = 200;

export const PixiSearchPanel = ({
  onFocusNode,
  onRevealNodes,
  onFitView,
  onZoomIn,
  onZoomOut,
  onToggleDirection,
  onToggleTracker,
  onToggleAllBranches,
  direction,
  graphFullyCollapsed,
  hasCollapsibleBranches,
  tracker,
}: IPixiSearchPanelProps) => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<TSearchMode>();
  const [searchTerm, setSearchTerm] = useState('');
  const [pathTerm, setPathTerm] = useState('');
  const [results, setResults] = useState<IGraphSearchResultItem[]>([]);
  const searchTerm$ = useMemo(() => new Subject<string>(), []);
  const { fuse } = useFuseStore();
  const { locMap, nodes, setSearchMatches } = useGraphStore();
  const pathIndex = useMemo(() => createGraphPathIndex(nodes, locMap), [locMap, nodes]);

  const search = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 3) {
        setResults([]);
        setSearchMatches({});
        return;
      }

      const fuseResults = fuse.search(trimmed, { limit: MAX_SEARCH_RESULTS });
      const nextResults = toGraphSearchResultItems(fuseResults, pathIndex);
      setResults(nextResults);
      setSearchMatches(toGraphSearchMatches(fuseResults));
      onRevealNodes(nextResults.map((result) => resolveGraphPath(pathIndex, result.path)?.node ?? result.node));
    },
    [fuse, onRevealNodes, pathIndex, setSearchMatches],
  );

  const searchPath = useCallback(
    (term: string) => {
      setPathTerm(term);
      const target = resolveGraphPath(pathIndex, term);
      if (target == null) {
        setResults([]);
        setSearchMatches({});
        return;
      }
      setResults([{ node: target.node, path: target.path, title: target.title }]);
      setSearchMatches({ [target.node.id]: target.match });
      onRevealNodes([target.node]);
    },
    [onRevealNodes, pathIndex, setSearchMatches],
  );

  useEffect(() => {
    const subscription = searchTerm$.pipe(distinctUntilChanged(), debounceTime(350)).subscribe(search);
    return () => subscription.unsubscribe();
  }, [search, searchTerm$]);

  useEffect(() => {
    if (mode != null) inputRef.current?.focus();
  }, [mode]);

  const clear = useCallback(() => {
    setSearchTerm('');
    setPathTerm('');
    setResults([]);
    setSearchMatches({});
  }, [setSearchMatches]);

  const toggleMode = useCallback(
    (nextMode: TSearchMode) => {
      clear();
      setMode((current) => (current === nextMode ? undefined : nextMode));
    },
    [clear],
  );

  const activeTerm = mode === 'path' ? pathTerm : searchTerm;
  const collapseLabel = intl.formatMessage({
    id: graphFullyCollapsed ? 'graph.toolbar.expand-all' : 'graph.toolbar.collapse-all',
  });

  return (
    <TooltipProvider disableHoverableContent delayDuration={1000} skipDelayDuration={0}>
      <div className="absolute bottom-4 left-1/2 z-10 flex w-max max-w-[calc(100%-1rem)] -translate-x-1/2 flex-col items-center gap-2">
        <div
          aria-label="Graph controls"
          className="order-2 flex max-w-full flex-wrap justify-center items-center gap-1 rounded-2xl border border-border bg-card p-2 shadow-lg"
          role="toolbar"
        >
          <LegendPopover />
          <ToolbarTooltip label={collapseLabel}>
            <Button
              aria-label={collapseLabel}
              disabled={!hasCollapsibleBranches}
              onClick={onToggleAllBranches}
              size="icon"
              variant="ghost"
            >
              {graphFullyCollapsed ? <ChevronsUpDown className="w-4 h-4" /> : <ChevronsDownUp className="w-4 h-4" />}
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Fit graph to view">
            <Button aria-label="Fit graph to view" onClick={onFitView} size="icon" variant="ghost">
              <Focus className="w-4 h-4" />
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Zoom out">
            <Button aria-label="Zoom out" onClick={onZoomOut} size="icon" variant="ghost">
              <Minus className="w-4 h-4" />
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Zoom in">
            <Button aria-label="Zoom in" onClick={onZoomIn} size="icon" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Search nodes">
            <Button
              aria-label="Search nodes"
              aria-pressed={mode === 'text'}
              onClick={() => toggleMode('text')}
              size="icon"
              variant={mode === 'text' ? 'secondary' : 'ghost'}
            >
              <Search className="w-4 h-4" />
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Find by JSONPath or jq path">
            <Button
              aria-label="Find by JSONPath or jq path"
              aria-pressed={mode === 'path'}
              onClick={() => toggleMode('path')}
              size="icon"
              variant={mode === 'path' ? 'secondary' : 'ghost'}
            >
              <Route className="w-4 h-4" />
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label={direction === 'LR' ? 'Direction: left to right' : 'Direction: top to bottom'}>
            <Button
              aria-label={direction === 'LR' ? 'Direction: left to right' : 'Direction: top to bottom'}
              onClick={onToggleDirection}
              size="icon"
              variant="ghost"
            >
              {direction === 'LR' ? <ArrowRight className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Tracker mode">
            <Button
              aria-label="Tracker mode"
              aria-pressed={tracker}
              className={tracker ? 'text-orange-600 dark:text-orange-400' : undefined}
              onClick={onToggleTracker}
              size="icon"
              variant={tracker ? 'secondary' : 'ghost'}
            >
              <Radar className="w-4 h-4" />
            </Button>
          </ToolbarTooltip>
        </div>
        {mode != null ? (
          <div className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-1.5 shadow-md">
            {mode === 'path' ? (
              <Route className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
            <Input
              ref={inputRef}
              aria-label={mode === 'path' ? 'JSONPath or jq path' : 'Search nodes'}
              className="h-7 min-w-0 flex-1 border-none shadow-none focus-visible:ring-0"
              placeholder={mode === 'path' ? '$.items[0] or .items[0]' : 'Search nodes...'}
              value={activeTerm}
              onChange={(event) => {
                if (mode === 'path') searchPath(event.target.value);
                else {
                  setSearchTerm(event.target.value);
                  searchTerm$.next(event.target.value);
                }
              }}
            />
            {activeTerm !== '' ? (
              <Button aria-label="Clear search" className="h-7 w-7" onClick={clear} size="icon" variant="ghost">
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : null}
            <Button
              aria-label="Close search"
              className="h-7 w-7"
              onClick={() => toggleMode(mode)}
              size="icon"
              variant="ghost"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {mode != null && activeTerm.trim() !== '' ? (
        <aside className="absolute right-4 top-14 z-10 flex max-h-[60%] w-[240px] flex-col overflow-hidden rounded-lg border bg-card shadow-lg max-md:left-2 max-md:right-2 max-md:top-2 max-md:max-h-52 max-md:w-auto">
          <div className="flex h-10 shrink-0 items-center justify-between border-b px-3 text-sm font-semibold">
            <span>Search results</span>
            <span className="text-xs font-normal text-muted-foreground">{results.length}</span>
          </div>
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              {mode === 'path' ? 'Enter an existing JSONPath or jq path.' : 'No matching nodes.'}
            </p>
          ) : (
            <div className="overflow-y-auto p-1.5">
              {results.map((result) => (
                <button
                  key={result.path}
                  className="group flex w-full flex-col rounded-md px-2.5 py-2 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  onClick={() => onFocusNode(result.node)}
                  title={`${result.title} - ${result.path}`}
                  type="button"
                >
                  <span className="w-full truncate text-sm font-medium">
                    {result.title} <span className="text-muted-foreground">-</span>{' '}
                    <span className="font-mono text-xs font-normal text-muted-foreground">{result.path}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
      ) : null}
    </TooltipProvider>
  );
};
