import { TxFetcher } from '@/components/txFetcher/TxFetcher';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import Stepover from '@assets/icons/stepover.svg?react';
import Play from '@assets/icons/play.svg?react';
import Reset from '@assets/icons/reset.svg?react';
import './debug-controls.css';

export function DebugControls() {
  const { step, reset, run } = useScriptDebugger();

  return (
    <div className="flex-column debug-controls-container">
      <h3>Controls</h3>
      <div className="flex-row control-dock">
        <SvgTooltip tooltipContent="Run">
          <Play
            onClick={() => {
              run();
            }}
            height={24}
            width={24}
            style={{ fill: 'var(--soft-green)' }}
          />
        </SvgTooltip>

        <SvgTooltip tooltipContent="Step">
          <Stepover
            onClick={() => {
              step();
            }}
            height={20}
            width={20}
            style={{ fill: 'var(--sky-blue)' }}
          />
        </SvgTooltip>

        <SvgTooltip tooltipContent="Reset">
          <Reset
            onClick={() => {
              reset();
            }}
            height={22}
            width={22}
          />
        </SvgTooltip>
      </div>
      <TxFetcher includeDemoTxs includeTaprootWarning includeInputSelector/>
    </div>
  );
}

type DTProps = {
  children: React.ReactNode;
  tooltipContent: string;
};
export const SvgTooltip = ({ children, tooltipContent }: DTProps) => {
  return (
    <a data-tooltip-id="debug" data-tooltip-place="bottom" data-tooltip-content={tooltipContent} data-tooltip-delay-show={100}>
      {children}
    </a>
  );
};
