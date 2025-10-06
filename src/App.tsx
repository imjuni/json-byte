import Editor from '@monaco-editor/react';

import './App.css';
import { Nav } from './components/nav/Nav';

export const App = () => (
  <div className="w-full h-full">
    <Nav />

    <main className="mt-13 h-full">
      <div className="flex flex-row h-full">
        <div className="flex flex-3 h-full">
          <div className="flex flex-col h-full w-full">
            <div className="h-10"> </div>
            <div className="h-full">
              <Editor defaultLanguage="json" defaultValue="{}" height="100%" width="100%" />
            </div>
          </div>
        </div>
        <div className="flex flex-7 h-full">renderer</div>
      </div>
    </main>
  </div>
);
