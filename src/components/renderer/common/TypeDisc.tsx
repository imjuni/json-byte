import { tv } from 'tailwind-variants';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

const disc = tv({
  base: 'w-[6px] h-[6px] border-[1px] rounded-md',
  variants: {
    color: {
      string: 'border-[#1565C0] bg-[#2196F3]',
      number: 'border-[#6A1B9A] bg-[#9C27B0]',
      boolean: 'border-[#2E7D32] bg-[#4CAF50]',
      null: 'border-[#616161] bg-[#9E9E9E]',
      object: 'border-[#EF6C00] bg-[#FF9800]',
      array: 'border-[#C62828] bg-[#F44336]',
    },
  },
});

export const TypeDisc = ({ type }: { type: TPrimitiveTypeString | TComplexTypeString }) => (
  <div className="flex justify-center items-center">
    <div className={disc({ color: type })} />
  </div>
);
