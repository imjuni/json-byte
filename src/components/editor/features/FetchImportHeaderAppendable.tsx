import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { useImportStore } from '#/stores/importStore';

export const FetchImportHeaderAppendable = () => {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const { headers, addHeader, updateHeader, removeHeader } = useImportStore();

  return (
    <>
      <Label htmlFor="headers">Header</Label>
      <div className="flex flex-col gap-2 min-h-[5rem] max-h-[10rem] overflow-y-scroll">
        {/* Existing headers list */}
        {headers.map((header, index) => (
          <div key={nanoid()} className="flex flex-row gap-2">
            <div className="flex flex-3">
              <Input
                placeholder="key"
                value={header.key}
                onChange={(event) => {
                  updateHeader(index, { ...header, key: event.target.value });
                }}
              />
            </div>
            <div className="flex flex-6">
              <Input
                placeholder="value"
                value={header.value}
                onChange={(event) => {
                  updateHeader(index, { ...header, value: event.target.value });
                }}
              />
            </div>
            <div className="flex flex-1">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  removeHeader(index);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* New header input */}
        <div className="flex flex-row gap-2" id="headers">
          <div className="flex flex-3">
            <Input
              id="header-key"
              placeholder="key"
              value={newHeaderKey}
              onChange={(event) => {
                setNewHeaderKey(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-6">
            <Input
              id="header-value"
              placeholder="value"
              value={newHeaderValue}
              onChange={(event) => {
                setNewHeaderValue(event.target.value);
              }}
            />
          </div>
          <div className="flex flex-1">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                if (newHeaderKey.trim() !== '' && newHeaderValue.trim() !== '') {
                  addHeader({ key: newHeaderKey, value: newHeaderValue });
                  setNewHeaderKey('');
                  setNewHeaderValue('');
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
