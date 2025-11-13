import { NodeColor } from '#/components/renderer/pixi/components/design/palette';
import { getPixiJsonValue } from '#/components/renderer/pixi/components/node/getPixiJsonValue';
import { PixiJsonFieldHeadingDisc } from '#/components/renderer/pixi/components/node/PixiJsonFieldHeadingDisc';
import { PixiJsonFieldKey } from '#/components/renderer/pixi/components/node/PixiJsonFieldKey';
import { PixiJsonFieldLabel } from '#/components/renderer/pixi/components/node/PixiJsonFieldLabel';
import { PixiJsonFieldPort } from '#/components/renderer/pixi/components/node/PixiJsonFieldPort';
import { PixiJsonFieldValue } from '#/components/renderer/pixi/components/node/PixiJsonFieldValue';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import { isPrimitiveKind } from '#/lib/parser/json/isPrimitiveKind';
import type { TextStyleFontWeight } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';

export interface IPixiJsonFieldProps {
  node: IGraphNode;

  offset: {
    y: number;
  };

  size: {
    // height: number;
    width: number;
    headerHeight: number;
  };

  font: {
    size: number;
    weight: TextStyleFontWeight;
    line: {
      height: number;
    };
  };

  padding: {
    t: number;
    b: number;
    l: number;
    r: number;
  };

  border: {
    radious: number;
    width: number;
  };
}

export function PixiJsonField(props: IPixiJsonFieldProps) {
  const nodeContainer = new Container();

  nodeContainer.x = props.node.position.x;
  nodeContainer.y = props.node.position.y;

  // Calculate dynamic height based on number of fields
  const totalFields = props.node.data.primitiveFields.length + props.node.data.complexFields.length;
  const contentHeight = totalFields * props.font.line.height;
  const height = props.size.headerHeight + contentHeight + props.padding.t + props.padding.b;

  // Draw node background with rounded corners
  const bg = new Graphics();

  bg.roundRect(0, 0, props.size.width, height, props.border.radious);
  bg.fill({ color: NodeColor.background });
  bg.stroke({ color: NodeColor.stroke, width: props.border.width });
  nodeContainer.addChild(bg);

  // Draw node label - use shared style for better performance
  const label = PixiJsonFieldLabel({
    label: props.node.data.label,
    font: {
      size: props.font.size,
      weight: props.font.weight,
    },
  });
  label.position.set(props.padding.l, 10);
  nodeContainer.addChild(label);

  const nodeType = props.node.type;

  // Draw target handle on the left side (only if node has a parent)
  // eslint-disable-next-line no-underscore-dangle
  if (props.node.data._parent != null && nodeType != null && !isPrimitiveKind(nodeType)) {
    // Position at left edge, vertically centered
    const handleY = height / 2;

    const targetHandle = PixiJsonFieldPort({
      size: {
        radious: 5,
      },
      offset: {
        x: 0,
        y: handleY,
      },
      type: nodeType,
    });

    nodeContainer.addChild(targetHandle);
  }

  // Draw primitive fields
  let yOffset = props.size.headerHeight + props.padding.t; // Start with top padding

  for (let i = 0; i < props.node.data.primitiveFields.length; i += 1) {
    const field = props.node.data.primitiveFields[i];
    // Draw key (bold)
    const fieldKey = PixiJsonFieldKey({ text: `${field.key}:` });

    // Draw value (normal weight) - position after key
    const fieldValue = PixiJsonFieldValue({
      text: ` ${getPixiJsonValue(field)}`,
      type: field.type,
    });

    // Calculate vertical center position based on text height
    const textHeight = Math.max(fieldKey.height, fieldValue.height);
    const textYOffset = yOffset + (props.font.line.height - textHeight) / 2;
    const discYOffset = yOffset + props.font.line.height / 2;

    // Draw bullet point (disc) - vertically centered
    const discX = props.padding.l;
    const textX = props.padding.l + 8;

    const disc = PixiJsonFieldHeadingDisc({
      offset: { x: discX, y: discYOffset },
      radious: 3,
      type: field.type,
    });

    nodeContainer.addChild(disc);

    // Position text vertically centered
    fieldKey.position.set(textX, textYOffset);
    nodeContainer.addChild(fieldKey);

    fieldValue.position.set(textX + fieldKey.width, textYOffset);
    nodeContainer.addChild(fieldValue);

    yOffset += props.font.line.height;

    // Draw separator after each field (except the last one if no complex fields)
    if (i < props.node.data.primitiveFields.length - 1 || props.node.data.complexFields.length > 0) {
      const separator = new Graphics();
      separator.moveTo(props.padding.l, yOffset);
      separator.lineTo(props.size.width - props.padding.r, yOffset);
      separator.stroke({ color: 0x333333, width: 1 });
      nodeContainer.addChild(separator);
    }
  }

  // Draw complex fields
  for (let i = 0; i < props.node.data.complexFields.length; i += 1) {
    const field = props.node.data.complexFields[i];

    // Draw key (bold)
    const fieldKey = PixiJsonFieldKey({ text: `${field.key}:` });

    // Draw value (normal weight) - position after key
    const fieldValue = PixiJsonFieldValue({
      text: ` ${field.type === 'array' ? `[ ${field.size} ]` : `{ ${field.size} }`}`,
      type: field.type,
    });

    // Calculate vertical center position based on text height
    const textHeight = Math.max(fieldKey.height, fieldValue.height);
    const textYOffset = yOffset + (props.font.line.height - textHeight) / 2;
    const discYOffset = yOffset + props.font.line.height / 2;
    const handleYOffset = yOffset + props.font.line.height / 2;

    // Draw bullet point (disc) with field type color - vertically centered
    const discX = props.padding.l;
    const textX = props.padding.l + 8;

    const disc = PixiJsonFieldHeadingDisc({
      offset: { x: discX, y: discYOffset },
      radious: 3,
      type: field.type,
    });
    nodeContainer.addChild(disc);

    // Position text vertically centered
    fieldKey.position.set(textX, textYOffset);
    nodeContainer.addChild(fieldKey);

    fieldValue.position.set(textX + fieldKey.width, textYOffset);
    nodeContainer.addChild(fieldValue);

    // Draw connection point (handle) - outside the node border, vertically centered
    const handle = PixiJsonFieldPort({
      size: {
        radious: 5,
      },
      offset: {
        x: props.size.width,
        y: handleYOffset,
      },
      type: field.type,
    });

    nodeContainer.addChild(handle);

    yOffset += props.font.line.height;

    // Draw separator after each field (except the last one)
    if (i < props.node.data.complexFields.length - 1) {
      const separator = new Graphics();
      separator.moveTo(props.padding.l, yOffset);
      separator.lineTo(props.size.width - props.padding.r, yOffset);
      separator.stroke({ color: 0x333333, width: 1 });
      nodeContainer.addChild(separator);
    }
  }

  return nodeContainer;
}
