import { Text, TextStyle } from 'pixi.js';

import { TypeColor } from '#/components/renderer/pixi/components/design/palette';

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
  const style = new TextStyle({
    fontFamily: params?.textStyle?.fontFamily ?? 'Arial',
    fontSize: params?.textStyle?.fontSize ?? 13,
    fill: params?.textStyle?.fill ?? TypeColor[params.type],
    fontWeight: params?.textStyle?.fontWeight ?? 'normal',
  });

  const fieldValue = new Text({
    text: params.text,
    style,
    resolution: window.devicePixelRatio * 2 || 2,
  });

  // Prevent texture downscaling
  fieldValue.roundPixels = true;

  return fieldValue;
}
