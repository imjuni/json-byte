import React, { memo } from 'react';

import { Handle, Position } from '@xyflow/react';
import { tv } from 'tailwind-variants';

import { FieldValue } from '#/components/renderer/xyflow/FieldValue';
import { TypeDisc } from '#/components/renderer/xyflow/TypeDisc';
import { getOrDefault } from '#/lib/getOrDefault';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

const variants = tv({
  variants: {
    'handle-position': {
      left: '!right-[-2px]',
      right: '!right-[-6px]',
    },
  },
  slots: {
    container: 'text-sm space-y-1',
    line: 'flex px-2 gap-2',
    heading: 'font-medium text-gray-600',
    hanlde: '!w-3 !h-3 !bg-indigo-500',
  },
});

const { container, line, heading, hanlde } = variants();

const RawObjectNode = ({ data }: Omit<IXyFlowNode, 'position'>) => {
  const label = getOrDefault(data?.label, '');
  const primitiveFields = getOrDefault(data?.primitiveFields, []);
  const complexFields = getOrDefault(data?.complexFields, []);

  return (
    <div className="shadow-md h-fit rounded-md bg-white border-2 border-stone-400">
      <div className="h-[10px]" />
      <div className="flex flex-col">
        <div className="text-gray-700 px-2 font-bold mb-2">{label}</div>

        {/* Primitive fields */}
        {primitiveFields.length > 0 && (
          <div className={container()}>
            {primitiveFields.map((field, index) => (
              <React.Fragment key={field.key}>
                <div className={line()}>
                  <TypeDisc type={field.type} />
                  <span className={heading()}>{field.key}:</span>
                  <FieldValue type={field.type} value={field.value} />
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
                <div className={line()}>
                  <TypeDisc type={field.type} />
                  <span className={heading()}>{field.key}:</span>
                  <FieldValue
                    type={field.type}
                    value={field.type === 'array' ? `[${field.size} items]` : `{${field.size} keys}`}
                  />
                </div>

                {/* Individual source handle for each complex field */}
                <Handle
                  className={hanlde({ 'handle-position': 'right' })}
                  id={`source-${field.key}`}
                  position={Position.Right}
                  type="source"
                />

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
          className={hanlde({ 'handle-position': 'left' })}
          id="target-top"
          position={Position.Left}
          type="target"
        />
      )}
    </div>
  );
};

export const ObjectNode = memo(RawObjectNode);
