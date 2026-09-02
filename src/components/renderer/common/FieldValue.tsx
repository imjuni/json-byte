import { tv } from 'tailwind-variants';

import type { JsonValue } from 'type-fest';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

const span = tv({
  variants: {
    color: {
      string: 'text-[#1565C0] dark:text-[#2196F3]',
      number: 'text-[#6A1B9A] dark:text-[#B52DCC]',
      boolean: 'text-[#2E7D32] dark:text-[#4CAF50]',
      null: 'text-[#616161] dark:text-[#9E9E9E]',
      object: 'text-[#EF6C00] dark:text-[#FF9800]',
      array: 'text-[#C62828] dark:text-[#F44336]',
    },
  },
});

export const FieldValue = ({ type, value }: { type: TPrimitiveTypeString | TComplexTypeString; value: JsonValue }) => (
  <span className={span({ color: type })}>{`${value}`}</span>
);
