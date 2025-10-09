import { useCallback, useEffect, useMemo, useState } from 'react';

import { Panel, useReactFlow } from '@xyflow/react';
import { Search, Trash2, X } from 'lucide-react';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { useFuseStore } from '#/stores/fuseStore';

export const SearchPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { setCenter, getZoom } = useReactFlow();
  const { fuse } = useFuseStore();

  // Create Subject once using useMemo
  const searchTerm$ = useMemo(() => new Subject<string>(), []);

  const handleSearch = useCallback(
    (term: string) => {
      if (!term.trim()) {
        return;
      }

      const foundNodes = fuse.search(term);
      const foundNode = foundNodes.at(0);

      if (foundNode) {
        const x = foundNode.item.position.x + (foundNode.item.measured?.width ?? 0) / 2;
        const y = foundNode.item.position.y + (foundNode.item.measured?.height ?? 0) / 2;
        const currentZoom = getZoom();

        setCenter(x, y, { zoom: currentZoom, duration: 400 });
      }
    },
    [fuse, setCenter, getZoom],
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
    setSearchTerm('');
  }, []);

  return (
    <Panel className="!bottom-[50px] !left-[35px]" position="bottom-left">
      <div className="flex items-center gap-2">
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
