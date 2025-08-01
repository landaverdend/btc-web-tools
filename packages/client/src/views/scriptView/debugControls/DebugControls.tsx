import { TxFetcher } from '@/components/txFetcher/TxFetcher';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import Stepover from '@assets/icons/stepover.svg?react';
import Play from '@assets/icons/play.svg?react';
import Reset from '@assets/icons/reset.svg?react';

export function DebugControls() {
  const { step, reset, run, stopDebugger } = useScriptDebugger();

  return (
    <div className="flex flex-0.25 flex-col items-center gap-10">
      <h3 className="text-white text-lg font-bold mt-5">Controls</h3>
      <div className="flex flex-row items-center justify-center gap-1 p-2 rounded-md bg-(--header-gray)">
        <SvgTooltip tooltipContent="Run">
          <Play
            onClick={() => {
              run();
            }}
            style={{ fill: 'var(--soft-green)' }}
            className="svg-hover"
          />
        </SvgTooltip>

        <SvgTooltip tooltipContent="Step">
          <Stepover
            onClick={() => {
              step();
            }}
            style={{ fill: 'var(--sky-blue)' }}
            className="svg-hover"
          />
        </SvgTooltip>

        <SvgTooltip tooltipContent="Reset">
          <Reset
            onClick={() => {
              reset();
              stopDebugger();
            }}
            className="svg-hover"
          />
        </SvgTooltip>
      </div>
      <TxFetcher includeDemoTxs includeTaprootWarning includeInputSelector />
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
