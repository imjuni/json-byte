import clsx from 'clsx';

import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { useImportStore } from '#/stores/importStore';

export const FetchImportMethodDropdown = () => {
  const { method, setMethod } = useImportStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {method.slice(0, 1).toUpperCase()}
          {method.slice(1)}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-30">
        <DropdownMenuLabel>Method</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            data-test-id={method}
            disabled={method === 'get'}
            onClick={() => setMethod('get')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'get',
                'text-blue-500': method === 'get',
              })}
            >
              Get
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'post'}
            onClick={() => setMethod('post')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'post',
                'text-blue-500': method === 'post',
              })}
            >
              Post
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'put'}
            onClick={() => setMethod('put')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'put',
                'text-blue-500': method === 'put',
              })}
            >
              Put
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'patch'}
            onClick={() => setMethod('patch')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'patch',
                'text-blue-500': method === 'patch',
              })}
            >
              Patch
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'delete'}
            onClick={() => setMethod('delete')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'delete',
                'text-blue-500': method === 'delete',
              })}
            >
              Delete
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'search'}
            onClick={() => setMethod('search')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'search',
                'text-blue-500': method === 'search',
              })}
            >
              Search
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'head'}
            onClick={() => setMethod('head')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'head',
                'text-blue-500': method === 'head',
              })}
            >
              Head
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'options'}
            onClick={() => setMethod('options')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'options',
                'text-blue-500': method === 'options',
              })}
            >
              Options
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'purge'}
            onClick={() => setMethod('purge')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'purge',
                'text-blue-500': method === 'purge',
              })}
            >
              Purge
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'link'}
            onClick={() => setMethod('link')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'link',
                'text-blue-500': method === 'link',
              })}
            >
              Link
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="data-[disabled]:pointer-events-none"
            disabled={method === 'unlink'}
            onClick={() => setMethod('unlink')}
            style={{ opacity: 1 }}
          >
            <span
              className={clsx({
                'font-bold': method === 'unlink',
                'text-blue-500': method === 'unlink',
              })}
            >
              Unlink
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
