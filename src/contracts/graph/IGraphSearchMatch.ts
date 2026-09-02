export interface IGraphFieldSearchMatch {
  key: boolean;
  value: boolean;
}

export interface IGraphSearchMatch {
  heading: boolean;
  primitiveFields: Record<number, IGraphFieldSearchMatch>;
  complexFields: Record<number, IGraphFieldSearchMatch>;
}
