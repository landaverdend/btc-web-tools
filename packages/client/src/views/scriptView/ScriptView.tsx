import { ScriptEditor } from './scriptEditor/ScriptEditor';
import './script-view.css';
import { StackView } from './stack/StackView';
import { DebugControls } from './debugControls/DebugControls';
import { Tooltip } from 'react-tooltip';
import { createPortal } from 'react-dom';

export default function ScriptView() {
  return (
    <div>
      <div className="flex flex-col gap-10 md:flex-row bg-(--input-gray)">
        <ScriptEditor />
        <DebugControls />
        <StackView />
      </div>
      {createPortal(<Tooltip id="debug" />, document.body)}
    </div>
  );
}
