/* eslint-disable no-continue, no-restricted-syntax, no-underscore-dangle */
import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export interface IVisibleGraph {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
}

export const getDirectChildIds = (node: IGraphNode): string[] => node.data._children.map((child) => child.id);

export const toggleCollapsedBranch = (collapsedBranchIds: ReadonlySet<string>, childId: string): Set<string> => {
  const next = new Set(collapsedBranchIds);
  if (next.has(childId)) next.delete(childId);
  else next.add(childId);
  return next;
};

export const toggleCollapsedNode = (collapsedBranchIds: ReadonlySet<string>, node: IGraphNode): Set<string> => {
  const childIds = getDirectChildIds(node);
  const next = new Set(collapsedBranchIds);
  const allCollapsed = childIds.length > 0 && childIds.every((id) => next.has(id));
  for (const childId of childIds) {
    if (allCollapsed) next.delete(childId);
    else next.add(childId);
  }
  return next;
};

export const collapseAllBranches = (nodes: IGraphNode[]): Set<string> =>
  new Set(nodes.filter((node) => node.data._parent != null).map((node) => node.id));

export const isGraphFullyCollapsed = (nodes: IGraphNode[], collapsedBranchIds: ReadonlySet<string>): boolean => {
  const rootChildIds = nodes.filter((node) => node.data._parent == null).flatMap((node) => getDirectChildIds(node));
  return rootChildIds.length > 0 && rootChildIds.every((id) => collapsedBranchIds.has(id));
};

export const revealNodeBranches = (
  collapsedBranchIds: ReadonlySet<string>,
  targets: Iterable<IGraphNode>,
): Set<string> => {
  const next = new Set(collapsedBranchIds);
  for (const target of targets) {
    let current: IGraphNode | undefined = target;
    const visited = new Set<string>();
    while (current?.data._parent != null && !visited.has(current.id)) {
      visited.add(current.id);
      next.delete(current.id);
      current = current.data._parent;
    }
  }
  return next;
};

export const getVisibleGraph = (
  nodes: IGraphNode[],
  edges: IGraphEdge[],
  collapsedBranchIds: ReadonlySet<string>,
): IVisibleGraph => {
  const roots = nodes.filter((node) => node.data._parent == null);
  const visibleIds = new Set<string>();
  const visibleNodes: IGraphNode[] = [];
  const stack = [...roots].reverse();

  while (stack.length > 0) {
    const node = stack.pop();
    if (node == null || visibleIds.has(node.id)) continue;
    visibleIds.add(node.id);
    visibleNodes.push(node);
    for (const child of [...node.data._children].reverse()) {
      if (!collapsedBranchIds.has(child.id)) stack.push(child);
    }
  }

  return {
    nodes: visibleNodes,
    edges: edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
  };
};
