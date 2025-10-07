import React, { memo } from 'react';

import { Handle, Position } from '@xyflow/react';

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
        <div className="text-base px-2 font-bold mb-2">{label}</div>

        {/* Primitive fields */}
        {primitiveFields.length > 0 && (
          <div className="text-sm space-y-1">
            {primitiveFields.map((field, index) => (
              <React.Fragment key={field.key}>
                <div className="flex px-2">
                  <div className="flex gap-2">
                    <span className="font-medium">▪</span>
                    <span className="font-medium text-blue-600">{field.key}:</span>
                    <span className="text-gray-600">{String(field.value)}</span>
                  </div>
                </div>

                {index < data.primitiveFields.length - 1 && <hr />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Complex fields with individual handles */}
        {complexFields.length > 0 && (
          <div className="text-sm space-y-1 mt-2 pt-2 border-t border-gray-200">
            {complexFields.map((field) => (
              <React.Fragment key={field.key}>
                <div className="flex px-2 relative">
                  <div className="flex gap-2">
                    <span className="font-medium">▪</span>
                    <span className="font-medium text-blue-800">{field.key}:</span>
                    <span className="text-gray-600">
                      {field.type === 'array' ? `[${field.size} items]` : `{${field.size} keys}`}
                    </span>
                  </div>
                  {/* Individual source handle for each complex field */}
                  <Handle
                    className="!w-3 !h-3 !bg-teal-500 !right-[-6px]"
                    id={`source-${field.key}`}
                    position={Position.Right}
                    type="source"
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="h-[10px]" />
      </div>

      {/* Single target handle at the top for incoming connections */}
      {label !== 'root' && (
        <Handle className="!w-4 !h-4 !bg-teal-500" id="target-top" position={Position.Left} type="target" />
      )}
    </div>
  );
};

export const ObjectNode = memo(RawObjectNode);
