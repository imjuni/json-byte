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

        {/* Complex fields */}
        {complexFields.length > 0 && (
          <div className="text-sm space-y-1 mt-2 pt-2 border-t border-gray-200">
            {complexFields.map((field) => (
              <React.Fragment key={field.key}>
                <div className="flex px-2">
                  <div className="flex gap-2">
                    <span className="font-medium">▪</span>
                    <span className="font-medium text-blue-800">{field.key}:</span>
                    <span className="text-gray-600">
                      {field.type === 'array' ? `[${field.size} items]` : `{${field.size} keys}`}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="h-[10px]" />
      </div>

      <Handle className="w-16 !bg-teal-500" position={Position.Top} type="target" />
      <Handle className="w-16 !bg-teal-500" position={Position.Bottom} type="source" />
    </div>
  );
};

export const ObjectNode = memo(RawObjectNode);
