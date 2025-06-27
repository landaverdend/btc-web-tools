import { TxFetcher } from '@/components/txFetcher/TxFetcher';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { useDebugStore } from '@/state/debugStore';
import Stepover from '@assets/icons/stepover.svg?react';
import Play from '@assets/icons/play.svg?react';
import Reset from '@assets/icons/reset.svg?react';
import './debug-controls.css';

export function DebugControls() {
  const { reset } = useDebugStore();
  const { step } = useScriptDebugger();

  return (
    <div className="flex-column debug-controls-container">
      <h3>Controls</h3>
      <div className="flex-row control-dock">
        <DebugTooltip tooltipContent="Run">
          <Play onClick={() => {}} height={24} width={24} style={{ fill: 'var(--soft-green)' }} />
        </DebugTooltip>

        <DebugTooltip tooltipContent="Step">
          <Stepover
            onClick={() => {
              // const status = step();
              // setStatus(status);
              step();
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
      <TxFetcher />
    </div>
  );
}

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
