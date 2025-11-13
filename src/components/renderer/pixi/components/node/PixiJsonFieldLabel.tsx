import { Text } from 'pixi.js';

import { JsonNodeTextStyles } from '#/components/renderer/pixi/components/node/TextStyles';

import type { TextStyleFontWeight } from 'pixi.js';

export interface IPixiJsonFieldLabelParams {
  label: string;
  font: {
    size: number;
    weight: TextStyleFontWeight;
  };
}

export function PixiJsonFieldLabel(params: IPixiJsonFieldLabelParams) {
  const label = new Text({
    text: params.label,
    style: JsonNodeTextStyles.rootLabel,
    resolution: window.devicePixelRatio * 2 || 2,
  });

  // Prevent texture downscaling
  label.roundPixels = true;

  return label;
}
