/* eslint-disable no-continue, no-restricted-syntax */

import type { IGraphSearchMatch } from '#/contracts/graph/IGraphSearchMatch';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';

type TPathSegment = string | number;

export interface IGraphPathTarget {
  match: IGraphSearchMatch;
  node: IGraphNode;
  path: string;
  title: string;
}

export interface IGraphPathIndex {
  fieldPaths: ReadonlyMap<string, string>;
  targets: ReadonlyMap<string, IGraphPathTarget>;
}

const createNodeMatch = (heading: boolean): IGraphSearchMatch => ({
  heading,
  primitiveFields: {},
  complexFields: {},
});

const readQuotedSegment = (value: string, start: number): { next: number; segment: string } | undefined => {
  const quote = value[start];
  if (quote !== "'" && quote !== '"') return undefined;
  let segment = '';
  let index = start + 1;
  while (index < value.length) {
    const character = value[index];
    if (character === '\\') {
      const escaped = value[index + 1];
      if (escaped == null) return undefined;
      segment += escaped;
      index += 2;
    } else if (character === quote) {
      return { next: index + 1, segment };
    } else {
      segment += character;
      index += 1;
    }
  }
  return undefined;
};

const readBracketSegment = (value: string, start: number): { next: number; segment: TPathSegment } | undefined => {
  if (value[start] !== '[') return undefined;
  const quoted = readQuotedSegment(value, start + 1);
  if (quoted != null) {
    if (value[quoted.next] !== ']') return undefined;
    return { next: quoted.next + 1, segment: quoted.segment };
  }

  const closing = value.indexOf(']', start + 1);
  if (closing < 0) return undefined;
  const raw = value.slice(start + 1, closing);
  if (!/^\d+$/.test(raw)) return undefined;
  return { next: closing + 1, segment: Number(raw) };
};

const readIdentifier = (value: string, start: number): { next: number; segment: string } | undefined => {
  const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(value.slice(start));
  return match?.[0] == null ? undefined : { next: start + match[0].length, segment: match[0] };
};

export const parseJsonPath = (value: string): TPathSegment[] | undefined => {
  if (!value.startsWith('$')) return undefined;
  const segments: TPathSegment[] = [];
  let index = 1;
  while (index < value.length) {
    if (value[index] === '.') {
      const identifier = readIdentifier(value, index + 1);
      if (identifier == null) return undefined;
      segments.push(identifier.segment);
      index = identifier.next;
    } else {
      const bracket = readBracketSegment(value, index);
      if (bracket == null) return undefined;
      segments.push(bracket.segment);
      index = bracket.next;
    }
  }
  return segments;
};

export const parseJqPath = (value: string): TPathSegment[] | undefined => {
  if (!value.startsWith('.')) return undefined;
  const segments: TPathSegment[] = [];
  let index = 1;
  while (index < value.length) {
    if (value[index] === '.') index += 1;
    if (value[index] === '[') {
      const bracket = readBracketSegment(value, index);
      if (bracket == null) return undefined;
      segments.push(bracket.segment);
      index = bracket.next;
    } else {
      const identifier = readIdentifier(value, index);
      if (identifier == null) return undefined;
      segments.push(identifier.segment);
      index = identifier.next;
    }
  }
  return segments;
};

export const segmentsToJsonPath = (segments: readonly TPathSegment[]): string =>
  segments.reduce<string>(
    (path, segment) =>
      typeof segment === 'number'
        ? `${path}[${segment}]`
        : `${path}['${segment.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}']`,
    '$',
  );

const fieldCoordinate = (nodeId: string, fieldIndex: number): string => `${nodeId}\u0000${fieldIndex}`;

const findPrimitiveFieldIndex = (node: IGraphNode, segment: TPathSegment): number => {
  if (typeof segment === 'number') {
    return node.data.primitiveFields.findIndex((field) => field.key.endsWith(`[${segment}]`));
  }
  return node.data.primitiveFields.findIndex((field) => field.key === segment);
};

export const createGraphPathIndex = (nodes: IGraphNode[], locMap: IPathLoCIndexMap): IGraphPathIndex => {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const targets = new Map<string, IGraphPathTarget>();
  const fieldPaths = new Map<string, string>();

  for (const path of Object.keys(locMap)) {
    const directNode = nodeById.get(path);
    if (directNode != null) {
      targets.set(path, { match: createNodeMatch(true), node: directNode, path, title: directNode.data.label });
      continue;
    }

    const segments = parseJsonPath(path);
    const fieldSegment = segments?.at(-1);
    if (segments == null || fieldSegment == null) continue;
    const parentPath = segmentsToJsonPath(segments.slice(0, -1));
    const parentNode = nodeById.get(parentPath);
    if (parentNode == null) continue;
    const fieldIndex = findPrimitiveFieldIndex(parentNode, fieldSegment);
    if (fieldIndex < 0) continue;
    const match = createNodeMatch(false);
    match.primitiveFields[fieldIndex] = { key: true, value: true };
    targets.set(path, {
      match,
      node: parentNode,
      path,
      title: parentNode.data.primitiveFields[fieldIndex]?.key ?? String(fieldSegment),
    });
    fieldPaths.set(fieldCoordinate(parentNode.id, fieldIndex), path);
  }

  return { fieldPaths, targets };
};

export const resolveGraphPath = (index: IGraphPathIndex, value: string): IGraphPathTarget | undefined => {
  const trimmed = value.trim();
  const jsonSegments = parseJsonPath(trimmed);
  if (jsonSegments != null) return index.targets.get(segmentsToJsonPath(jsonSegments));

  const jqSegments = parseJqPath(trimmed);
  if (jqSegments == null) return undefined;
  return index.targets.get(segmentsToJsonPath(jqSegments));
};

export const getGraphFieldPath = (index: IGraphPathIndex, nodeId: string, fieldIndex: number): string | undefined =>
  index.fieldPaths.get(fieldCoordinate(nodeId, fieldIndex));
