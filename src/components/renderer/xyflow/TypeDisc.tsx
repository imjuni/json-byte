import { tv } from 'tailwind-variants';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

/**
 * boolean #4CAF50 #2E7D32 자연스럽고 신뢰감 있는 초록, 진한 톤으로 테두리 강조
 * number #2196F3 #1565C0 시원한 파랑, 수치의 정확함. 어두운 블루로 경계 강조
 * string #9C27B0 #6A1B9A 언어적 감각의 보라색, 톤 다운된 보라로 테두리 균형
 * null #9E9E9E #616161 ‘없음’의 중립적 회색, 살짝 어두운 그레이로 깊이감
 * object #FF9800 #EF6C00 구조적 의미의 주황, 진한 톤으로 덩어리감 강조
 * array #F44336 #C62828 반복성과 강렬함을 표현하는 붉은색, 경계 명확
 */

const disc = tv({
  base: 'w-[6px] h-[6px] border-[1px] rounded-md',
  variants: {
    color: {
      string: 'border-[#1565C0] bg-[#2196F3]',
      number: 'border-[#6A1B9A] bg-[#9C27B0]',
      boolean: 'border-[#2E7D32] bg-[#4CAF50]',
      null: 'border-[#616161] bg-[#9C27B0]',
      object: 'border-[#EF6C00] bg-[#FF9800]',
      array: 'border-[#C62828] bg-[#F44336]',
    },
  },
});

export const TypeDisc = ({ type }: { type: TPrimitiveTypeString | TComplexTypeString }) => (
  <div className="flex justify-items-center items-center">
    <div className={disc({ color: type })} />
  </div>
);
