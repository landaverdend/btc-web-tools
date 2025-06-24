import { ScriptEditor } from './scriptEditor/ScriptEditor';
import './script-view.css';
import { StackView } from './stack/StackView';
import { Tooltip } from 'react-tooltip';
import { DebugControls } from './debugControls/DebugControls';

export default function ScriptView() {
  return (
    <div>
      <div className="flex-row script-view-container">
        <ScriptEditor />
        <DebugControls />
        <StackView />
      </div>
      <Tooltip id="debug" />
    </div>
  );
}
