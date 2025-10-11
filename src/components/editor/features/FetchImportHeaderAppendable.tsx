import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';

import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';

import type { UseFormReturn } from 'react-hook-form';

import type { TApiFetchFormSchema } from '#/components/editor/schemas/apiFetchFormSchema';

export const FetchImportHeaderAppendable = ({ form }: { form: UseFormReturn<TApiFetchFormSchema> }) => {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'headers',
  });

  return (
    <>
      <Label htmlFor="headers">Header</Label>
      <div className="flex flex-col gap-2 min-h-[5rem] max-h-[10rem] overflow-y-scroll">
        {/* Existing headers list */}
        {fields.map((headerField, index) => (
          <div key={headerField.id} className="flex flex-row gap-2">
            <div className="flex flex-3">
              <Controller
                control={form.control}
                name={`headers.${index}.key`}
                render={({ field }) => <Input {...field} placeholder="key" />}
              />
            </div>
            <div className="flex flex-6">
              <Controller
                control={form.control}
                name={`headers.${index}.value`}
                render={({ field }) => <Input {...field} placeholder="value" />}
              />
            </div>
            <div className="flex flex-1">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  remove(index);
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
                  append({ key: newHeaderKey, value: newHeaderValue });
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
