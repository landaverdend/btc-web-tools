import { ScriptEditor } from './scriptEditor/ScriptEditor';

import './script-view.css';
import { Stack } from './stack/Stack';

import Stepover from '@assets/icons/stepover.svg?react';
import Play from '@assets/icons/play.svg?react';
import Reset from '@assets/icons/reset.svg?react';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { useDebugStore } from '@/state/debugStore';
import { Tooltip } from 'react-tooltip';

type DTProps = {
  children: React.ReactNode;
  tooltipContent: string;
};
const DebugTooltip = ({ children, tooltipContent }: DTProps) => {
  return (
    <a data-tooltip-id="debug" data-tooltip-place="bottom" data-tooltip-content={tooltipContent} data-tooltip-delay-show={100}>
      {children}
    </a>
  );
};

export default function ScriptView() {
  const { reset, setStatus } = useDebugStore();
  const { step } = useScriptDebugger();

  return (
    <div>
      <div className="flex-row script-view-container">
        <ScriptEditor />
        <div className="flex-column debug-controls-container">
          <h3>Controls</h3>
          <div className="flex-row control-dock">
            <DebugTooltip tooltipContent="Run">
              <Play onClick={() => {}} height={24} width={24} style={{ fill: 'var(--soft-green)' }} />
            </DebugTooltip>

            <DebugTooltip tooltipContent="Step">
              <Stepover
                onClick={() => {
                  const status = step();
                  setStatus(status);
                }}
                height={20}
                width={20}
                style={{ fill: 'var(--sky-blue)' }}
              />
            </DebugTooltip>

            <DebugTooltip tooltipContent="Reset">
              <Reset
                onClick={() => {
                  reset();
                }}
                height={22}
                width={22}
              />
            </DebugTooltip>
          </div>
        </div>
        <Stack />
      </div>
      <Tooltip id="debug" />
    </div>
  );
}
