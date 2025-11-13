import Color from 'color';
import { Graphics } from 'pixi.js';

import { TypeColor } from '#/components/renderer/pixi/components/design/palette';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export interface IPixiNodeFieldDiscParam {
  // json type
  type: TComplexTypeString | TPrimitiveTypeString;

  // disc offset
  offset: {
    x: number;
    y: number;
  };

  radious: number;

  // disc stroke configuration
  stroke?: {
    color?: string;
    width?: number;
  };
}

export function PixiJsonFieldHeadingDisc(params: IPixiNodeFieldDiscParam): Graphics {
  // Draw bullet point (disc)s
  const disc = new Graphics();

  // Small disc on the left
  disc.circle(params.offset.x, params.offset.y, params.radious);

  // color by json types
  const bgColor = Color(TypeColor[params.type]);

  disc.fill({ color: bgColor.hex() });
  disc.stroke({
    color: params?.stroke?.color ?? bgColor.darken(0.1).saturate(0.05).hex(),
    width: params?.stroke?.width ?? 1,
  });

  return disc;
}
