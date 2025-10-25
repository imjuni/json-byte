import { useCallback, useEffect, useMemo, useState } from 'react';

import { Panel, useReactFlow } from '@xyflow/react';
import { Search, Trash2, X } from 'lucide-react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { LegendPopover } from '#/components/renderer/xyflow/LegendPopover';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { useFuseStore } from '#/stores/fuseStore';
import { useGraphStore } from '#/stores/graphStore';

export const SearchPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { setCenter, getZoom } = useReactFlow();
  const { fuse } = useFuseStore();
  const { setSearcheds } = useGraphStore();

  // Create Subject once using useMemo
  const searchTerm$ = useMemo(() => new Subject<string>(), []);

  const handleSearch = useCallback(
    (term: string) => {
      const trimed = term.trim();

      if (trimed == null || trimed === '' || trimed.length < 3) {
        setSearcheds([]);
        return;
      }

      const foundNodes = fuse.search(trimed);
      const foundNode = foundNodes.at(0);

      if (foundNodes != null && foundNode != null && foundNodes.length === 1) {
        const x = foundNode.item.position.x + (foundNode.item.measured?.width ?? 0) / 2;
        const y = foundNode.item.position.y + (foundNode.item.measured?.height ?? 0) / 2;
        const currentZoom = getZoom();

        setSearcheds([foundNode.item.id]);
        setCenter(x, y, { zoom: currentZoom, duration: 400 });
      } else {
        const ids = foundNodes.map((node) => node.item.id);
        setSearcheds(ids);
      }
    },
    [fuse, setCenter, getZoom, setSearcheds],
  );

  // Setup RxJS pipe with operators
  useEffect(() => {
    const subscription = searchTerm$
      .pipe(
        distinctUntilChanged(), // Only emit when value changes
        filter((term) => term.trim().length > 0), // Only search if not empty
        debounceTime(500), // Wait 0.5 second after last input
        tap((term) => handleSearch(term)), // Side effect: perform search
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchTerm$, handleSearch]);

  const handleClear = useCallback(() => {
    setSearcheds([]);
    setSearchTerm('');
  }, [setSearcheds]);

  return (
    <Panel className="!left-[35px]" position="bottom-left">
      <div className="flex items-center gap-2">
        <LegendPopover />

        {!isOpen && (
          <Button onClick={() => setIsOpen(true)} size="icon" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
        )}

        {Boolean(isOpen) && (
          <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              className="h-7 w-48 border-none shadow-none focus-visible:ring-0"
              placeholder="Search nodes..."
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchTerm$.next(e.target.value);
              }}
            />
            {searchTerm ? (
              <Button className="h-7 w-7" onClick={handleClear} size="icon" variant="ghost">
                <Trash2 className="w-4 h-4" />
              </Button>
            ) : null}
            <Button
              className="h-7 w-7"
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setSearcheds([]);
                handleClear();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
};
