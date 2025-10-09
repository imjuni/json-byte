import React, { memo } from 'react';

import { Handle, Position } from '@xyflow/react';

import { FieldValue } from '#/components/renderer/xyflow/FieldValue';
import { TypeDisc } from '#/components/renderer/xyflow/TypeDisc';
import { getOrDefault } from '#/lib/getOrDefault';

import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

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
          <div className="text-sm space-y-1">
            {primitiveFields.map((field, index) => (
              <React.Fragment key={field.key}>
                <div className="flex px-2">
                  <div className="flex gap-2">
                    <TypeDisc type={field.type} />
                    <span className="font-medium text-gray-600">{field.key}:</span>
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
          <div className="text-sm space-y-1">
            {primitiveFields.length > 0 && <hr />}

            {complexFields.map((field, index) => (
              <React.Fragment key={field.key}>
                <div className="flex px-2 relative">
                  <div className="flex gap-2">
                    <TypeDisc type={field.type} />
                    <span className="font-medium text-gray-600">{field.key}:</span>
                    <FieldValue
                      type={field.type}
                      value={field.type === 'array' ? `[${field.size} items]` : `{${field.size} keys}`}
                    />
                  </div>

                  {/* Individual source handle for each complex field */}
                  <Handle
                    className="!w-3 !h-3 !bg-teal-500 !right-[-2px]"
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
          className="!w-3 !h-3 !bg-teal-500 !right-[-6px]"
          id="target-top"
          position={Position.Left}
          type="target"
        />
      )}
    </div>
  );
};

export const ObjectNode = memo(RawObjectNode);
