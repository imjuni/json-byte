import { tv } from 'tailwind-variants';

import type { JsonValue } from 'type-fest';

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

const span = tv({
  variants: {
    color: {
      string: 'text-[#1565C0]',
      number: 'text-[#6A1B9A]',
      boolean: 'text-[#2E7D32]',
      null: 'text-[#616161]',
      object: 'text-[#EF6C00]',
      array: 'text-[#C62828]',
    },
  },
});

export const FieldValue = ({ type, value }: { type: TPrimitiveTypeString | TComplexTypeString; value: JsonValue }) => (
  <span className={span({ color: type })}>{`${value}`}</span>
);
