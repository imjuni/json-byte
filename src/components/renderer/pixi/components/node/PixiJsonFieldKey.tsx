import { Text, TextStyle } from 'pixi.js';

import { FontColor } from '#/components/renderer/pixi/components/design/palette';

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
  const style = new TextStyle({
    fontFamily: params?.textStyle?.fontFamily ?? 'Arial',
    fontSize: params?.textStyle?.fontSize ?? 13,
    fill: params?.textStyle?.fill ?? FontColor.key,
    fontWeight: params?.textStyle?.fontWeight ?? 'bold',
  });

  const fieldKey = new Text({
    text: params.text,
    style,
    resolution: window.devicePixelRatio * 2 || 2,
  });

  // Prevent texture downscaling
  fieldKey.roundPixels = true;

  return fieldKey;
}
