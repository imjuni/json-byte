import { Text } from 'pixi.js';

import { JsonNodeValueTextStyles } from '#/components/renderer/pixi/components/node/TextStyles';

import type { TextStyleFontWeight } from 'pixi.js';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export interface IPixiJsonFieldKeyParams {
  textStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    fontWeight?: TextStyleFontWeight;
  };

  text: string;

  type: TComplexTypeString | TPrimitiveTypeString;
}

export function PixiJsonFieldValue(params: IPixiJsonFieldKeyParams): Text {
  const fieldValue = new Text({
    text: params.text,
    style: JsonNodeValueTextStyles[params.type],
    resolution: window.devicePixelRatio * 2 || 2,
  });

  // Prevent texture downscaling
  fieldValue.roundPixels = true;

  return fieldValue;
}
