import { Text } from 'pixi.js';

import { JsonNodeTextStyles } from '#/components/renderer/pixi/components/node/TextStyles';

import type { TextStyleFontWeight } from 'pixi.js';

export interface IPixiJsonFieldKeyParams {
  textStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    fontWeight?: TextStyleFontWeight;
  };

  text: string;
}

export function PixiJsonFieldKey(params: IPixiJsonFieldKeyParams): Text {
  const fieldKey = new Text({
    text: params.text,
    style: JsonNodeTextStyles.key,
    resolution: window.devicePixelRatio * 2 || 2,
  });

  // Prevent texture downscaling
  fieldKey.roundPixels = true;

  return fieldKey;
}
