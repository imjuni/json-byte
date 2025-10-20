import React, { memo } from 'react';

import { Handle, Position } from '@xyflow/react';
import { tv } from 'tailwind-variants';

import { FieldValue } from '#/components/renderer/xyflow/FieldValue';
import { TypeDisc } from '#/components/renderer/xyflow/TypeDisc';
import { getOrDefault } from '#/lib/getOrDefault';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const variants = tv({
  slots: {
    node: 'shadow-md h-fit w-[280px] rounded-md bg-card border-2 border-border dark:hover:border-blue-900 hover:border-blue-400',
    heading: 'text-foreground px-4 font-bold mb-2 truncate',
    container: 'text-sm space-y-1',
    line: 'flex px-4 gap-2 min-w-0',
    fieldHeading: 'font-medium text-muted-foreground flex-shrink-0 max-w-[120px] truncate',
    fieldValue: 'truncate min-w-0',
  },
});

const handleVariants = tv({
  base: '!w-3 !h-3',
  variants: {
    type: {
      string: '!bg-amber-500 dark:!bg-amber-400',
      boolean: '!bg-amber-500 dark:!bg-amber-400',
      number: '!bg-amber-500 dark:!bg-amber-400',
      null: '!bg-amber-500 dark:!bg-amber-400',
      object: '!bg-amber-500 dark:!bg-amber-400',
      array: '!bg-red-500 dark:!bg-red-400',
    },
    side: {
      left: '!right-[-2px]',
      right: '!right-[-2px]',
    },
  },
  defaultVariants: {
    type: 'object',
  },
});

const { container, line, fieldHeading, fieldValue, heading, node } = variants();

const RawObjectNode = ({ data }: Omit<IGraphNode, 'position'>) => {
  const label = getOrDefault(data?.label, '');
  const primitiveFields = getOrDefault(data?.primitiveFields, []);
  const complexFields = getOrDefault(data?.complexFields, []);

  return (
    <div className={node()}>
      <div className="h-[10px]" />
      <div className="flex flex-col">
        <div className={heading()}>{label}</div>

        {/* Primitive fields */}
        {primitiveFields.length > 0 && (
          <div className={container()}>
            {primitiveFields.map((field, index) => (
              <React.Fragment key={field.key}>
                <div className={line()}>
                  <TypeDisc type={field.type} />
                  <div className={fieldHeading()}>
                    <span>{field.key}:</span>
                  </div>
                  <div className={fieldValue()}>
                    <FieldValue type={field.type} value={field.value} />
                  </div>
                </div>

                {index < primitiveFields.length - 1 && <hr />}
              </React.Fragment>
            ))}

            {complexFields.length > 0 && <div className="h-[2px]" />}
          </div>
        )}

        {/* Complex fields with individual handles */}
        {complexFields.length > 0 && (
          <div className={container()}>
            {primitiveFields.length > 0 && <hr />}

            {complexFields.map((field, index) => (
              <React.Fragment key={field.key}>
                <div className={line({ class: 'relative' })}>
                  <TypeDisc type={field.type} />
                  <span className={fieldHeading()}>{field.key}:</span>
                  <div className={fieldValue()}>
                    <FieldValue
                      type={field.type}
                      value={field.type === 'array' ? `[${field.size} items]` : `{${field.size} keys}`}
                    />
                  </div>

                  {/* Individual source handle for each complex field */}
                  <Handle
                    className={handleVariants({ type: field.type, side: 'right' })}
                    id={`source-${field.key}`}
                    position={Position.Right}
                    type="source"
                  />
                </div>

                {index < complexFields.length - 1 && <hr />}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="h-[10px]" />
      </div>

      {/* Single target handle at the top for incoming connections */}
      {label !== 'root' && (
        <Handle
          className={handleVariants({ type: data.nodeType, side: 'left' })}
          id="target-top"
          position={Position.Left}
          type="target"
        />
      )}
    </div>
  );
};

export const ObjectNode = memo(RawObjectNode);
