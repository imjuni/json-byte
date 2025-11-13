import Color from 'color';
import { Graphics } from 'pixi.js';

import { TypeColor } from '#/components/renderer/pixi/components/design/palette';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';

export interface IPixiJsonFieldPort {
  size: {
    radious: number;
  };

  offset: {
    x: number;
    y: number;
  };

  type: TComplexTypeString;

  stroke?: {
    color?: string;
    width?: number;
  };
}

export function PixiJsonFieldPort(params: IPixiJsonFieldPort) {
  // color by json types
  const bgColor = Color(TypeColor[params.type]);

  // Draw port (connection port) - outside the node border, vertically centered
  const port = new Graphics();

  port.circle(params.offset.x, params.offset.y, params.size.radious);
  port.fill({ color: bgColor.hex() });
  port.stroke({
    color: params?.stroke?.color ?? bgColor.darken(0.1).saturate(0.05).hex(),
    width: params?.stroke?.width ?? 1,
  });

  return port;
}
