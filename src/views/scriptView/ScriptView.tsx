import { ScriptEditor } from './scriptEditor/ScriptEditor';

import './script-view.css';

export default function ScriptView() {
  return (
    <div className="flex-row script-view-container">
      <ScriptEditor />

      <div className="flex-column" style={{ flex: 1 }}>
        Stack Placeholder
      </div>
    </div>
  );
}
