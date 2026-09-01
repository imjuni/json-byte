import { useCallback, useEffect, useMemo, useState } from 'react';

import { Search, Trash2, X } from 'lucide-react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { LegendPopover } from '#/components/renderer/xyflow/LegendPopover';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { useFuseStore } from '#/stores/fuseStore';
import { useGraphStore } from '#/stores/graphStore';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

interface IPixiSearchPanelProps {
  onFocusNode: (node: IGraphNode) => void;
}

export const PixiSearchPanel = ({ onFocusNode }: IPixiSearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchTerm$ = useMemo(() => new Subject<string>(), []);
  const { fuse } = useFuseStore();
  const { setSearcheds } = useGraphStore();

  const search = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 3) {
        setSearcheds([]);
        return;
      }

      const results = fuse.search(trimmed);
      setSearcheds(results.map((result) => result.item.id));
      if (results.length === 1 && results[0] != null) onFocusNode(results[0].item);
    },
    [fuse, onFocusNode, setSearcheds],
  );

  useEffect(() => {
    const subscription = searchTerm$.pipe(distinctUntilChanged(), debounceTime(350)).subscribe(search);
    return () => subscription.unsubscribe();
  }, [search, searchTerm$]);

  const clear = useCallback(() => {
    setSearchTerm('');
    setSearcheds([]);
  }, [setSearcheds]);

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
      <LegendPopover />
      {!isOpen && (
        <Button aria-label="Search nodes" onClick={() => setIsOpen(true)} size="icon" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      )}
      {Boolean(isOpen) && (
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5 shadow-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            className="h-7 w-48 border-none shadow-none focus-visible:ring-0"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              searchTerm$.next(event.target.value);
            }}
          />
          {searchTerm !== '' && (
            <Button aria-label="Clear search" className="h-7 w-7" onClick={clear} size="icon" variant="ghost">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            aria-label="Close search"
            className="h-7 w-7"
            size="icon"
            variant="ghost"
            onClick={() => {
              clear();
              setIsOpen(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
