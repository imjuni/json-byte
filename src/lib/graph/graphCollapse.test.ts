/* eslint-disable no-restricted-syntax, no-underscore-dangle */
import { describe, expect, it } from 'vitest';

import {
  collapseAllBranches,
  getVisibleGraph,
  isGraphFullyCollapsed,
  revealNodeBranches,
  toggleCollapsedBranch,
  toggleCollapsedNode,
} from '#/lib/graph/graphCollapse';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const createNode = (id: string, parent?: IGraphNode): IGraphNode => {
  const node: IGraphNode = {
    id,
    draggable: false,
    position: { x: 0, y: 0 },
    data: {
      label: id,
      stringify: '{}',
      origin: {},
      nodeType: 'object',
      primitiveFields: [],
      complexFields: [],
      _children: [],
      _parent: parent,
    },
  };
  if (parent != null) {
    parent.data._children.push(node);
    parent.data.complexFields.push({ key: id, nodeId: id, size: 0, type: 'object' });
  }
  return node;
};

const createEdge = (parent: IGraphNode, child: IGraphNode): IGraphEdge => ({
  id: `${parent.id}-${child.id}`,
  label: child.id,
  source: parent.id,
  target: child.id,
  data: { parent, child },
});

describe('graphCollapse', () => {
  it('should hide a collapsed branch recursively', () => {
    const root = createNode('root');
    const left = createNode('left', root);
    const leaf = createNode('leaf', left);
    const right = createNode('right', root);
    const nodes = [root, left, leaf, right];
    const edges = [createEdge(root, left), createEdge(left, leaf), createEdge(root, right)];

    const visible = getVisibleGraph(nodes, edges, new Set(['left']));

    expect(visible.nodes.map((node) => node.id)).toEqual(['root', 'right']);
    expect(visible.edges.map((edge) => edge.id)).toEqual(['root-right']);
  });

  it('should support multiple roots and preserve sibling branches', () => {
    const firstRoot = createNode('first-root');
    const firstChild = createNode('first-child', firstRoot);
    const secondRoot = createNode('second-root');
    const secondChild = createNode('second-child', secondRoot);
    const nodes = [firstRoot, firstChild, secondRoot, secondChild];
    const edges = [createEdge(firstRoot, firstChild), createEdge(secondRoot, secondChild)];

    const visible = getVisibleGraph(nodes, edges, new Set(['first-child']));

    expect(visible.nodes.map((node) => node.id)).toEqual(['first-root', 'second-root', 'second-child']);
    expect(visible.edges.map((edge) => edge.id)).toEqual(['second-root-second-child']);
  });

  it('should toggle a field and all direct node branches', () => {
    const root = createNode('root');
    const left = createNode('left', root);
    createNode('leaf', left);
    createNode('right', root);

    expect([...toggleCollapsedBranch(new Set(), left.id)]).toEqual(['left']);
    const collapsed = toggleCollapsedNode(new Set(['leaf']), root);
    expect([...collapsed]).toEqual(['leaf', 'left', 'right']);
    expect([...toggleCollapsedNode(collapsed, root)]).toEqual(['leaf']);
  });

  it('should collapse and expand the whole graph', () => {
    const root = createNode('root');
    const child = createNode('child', root);
    const leaf = createNode('leaf', child);
    const nodes = [root, child, leaf];
    const collapsed = collapseAllBranches(nodes);

    expect([...collapsed]).toEqual(['child', 'leaf']);
    expect(isGraphFullyCollapsed(nodes, collapsed)).toBe(true);
    expect(isGraphFullyCollapsed(nodes, new Set(['leaf']))).toBe(false);
  });

  it('should reveal every ancestor branch without changing unrelated branches', () => {
    const root = createNode('root');
    const child = createNode('child', root);
    const leaf = createNode('leaf', child);
    createNode('sibling', root);

    const revealed = revealNodeBranches(new Set(['child', 'leaf', 'sibling']), [leaf]);

    expect([...revealed]).toEqual(['sibling']);
  });

  it('should traverse a deeply nested graph without recursion', () => {
    const nodes: IGraphNode[] = [];
    const edges: IGraphEdge[] = [];
    let parent = createNode('node-0');
    nodes.push(parent);
    for (let index = 1; index <= 20_000; index += 1) {
      const child = createNode(`node-${index}`, parent);
      nodes.push(child);
      edges.push(createEdge(parent, child));
      parent = child;
    }

    const visible = getVisibleGraph(nodes, edges, new Set(['node-10']));

    expect(visible.nodes).toHaveLength(10);
    expect(visible.edges).toHaveLength(9);
  });
});
