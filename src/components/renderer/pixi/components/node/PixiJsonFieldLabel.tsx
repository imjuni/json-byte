import { Text, TextStyle } from 'pixi.js';

import { FontColor } from '#/components/renderer/pixi/components/design/palette';

import type { TextStyleFontWeight } from 'pixi.js';

export interface IPixiJsonFieldLabelParams {
  label: string;
  font: {
    size: number;
    weight: TextStyleFontWeight;
  };
}

export function PixiJsonFieldLabel(params: IPixiJsonFieldLabelParams) {
  // Shared TextStyle objects - created once and reused (HUGE performance boost!)
  const labelStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: params.font.size,
    fill: FontColor.label,
    fontWeight: params.font.weight,
  });

  const label = new Text({
    text: params.label,
    style: labelStyle,
    resolution: window.devicePixelRatio * 2 || 2,
  });

  // Prevent texture downscaling
  label.roundPixels = true;

  return label;
}
