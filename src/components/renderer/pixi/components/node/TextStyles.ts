import { TextStyle } from 'pixi.js';

import { FontColor, TypeColor } from '#/components/renderer/pixi/components/design/palette';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

const JsonFieldRootLabelStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: FontColor.label,
  fontWeight: 'bold',
});

const JsonFieldKeyStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: FontColor.key,
  fontWeight: 'bold',
});

const JsonFieldValueArrayStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: TypeColor.array,
  fontWeight: 'normal',
});

const JsonFieldValueObjectStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: TypeColor.object,
  fontWeight: 'normal',
});

const JsonFieldValueNullStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: TypeColor.null,
  fontWeight: 'normal',
});

const JsonFieldValueNumberStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: TypeColor.number,
  fontWeight: 'normal',
});

const JsonFieldValueStringStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: TypeColor.string,
  fontWeight: 'normal',
});

const JsonFieldValueBooleanStyle = new TextStyle({
  fontFamily: 'DejaVu Sans Mono',
  fontSize: 13,
  fill: TypeColor.boolean,
  fontWeight: 'normal',
});

export const JsonNodeTextStyles = {
  key: JsonFieldKeyStyle,
  rootLabel: JsonFieldRootLabelStyle,
};

export const JsonNodeValueTextStyles: Record<TPrimitiveTypeString | TComplexTypeString, TextStyle> = {
  object: JsonFieldValueObjectStyle,
  array: JsonFieldValueArrayStyle,
  null: JsonFieldValueNullStyle,
  number: JsonFieldValueNumberStyle,
  string: JsonFieldValueStringStyle,
  boolean: JsonFieldValueBooleanStyle,
};
