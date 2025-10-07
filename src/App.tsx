import '@xyflow/react/dist/style.css';

import { Editor } from '#/components/editor/Editor';
import { Nav } from '#/components/nav/Nav';
// import { ObjectNode } from '#/components/renderer/xyflow/ObjectNode';
import { XYFlowRenderer } from '#/components/renderer/xyflow/XYFlowRenderer';

import './App.css';

export const App = () => (
  <div className="w-full h-full">
    <Nav />

    <main className="mt-13 h-full">
      <div className="flex flex-row h-full">
        <div className="flex flex-3 h-full">
          <div className="flex flex-col h-full w-full">
            <div className="h-10"> </div>
            <div className="h-full">
              <Editor />
            </div>
          </div>
        </div>
        <div className="flex flex-7 h-full">
          <XYFlowRenderer />
          {/* <ObjectNode
            node={{
              id: '$.phoneNumbers[0]',
              type: 'object',
              draggable: false,
              position: { x: 0, y: 0 },
              data: {
                label: 'phoneNumbers[0]',
                nodeType: 'object',
                origin: {},
                primitiveFields: [
                  { key: 'name', value: 'ironman', type: 'string' },
                  { key: 'age', value: 36, type: 'number' },
                  { key: 'ability', value: 'beam', type: 'string' },
                  { key: 'team', value: 'advengers', type: 'string' },
                  { key: 'die', value: false, type: 'boolean' },
                ],
                complexFields: [],
                _children: [],
                _parent: undefined,
              },
            }}
          /> */}
        </div>
      </div>
    </main>
  </div>
);
