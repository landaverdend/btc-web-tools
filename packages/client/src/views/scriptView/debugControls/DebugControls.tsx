import { TxFetcher } from '@/components/txFetcher/TxFetcher';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import Stepover from '@assets/icons/stepover.svg?react';
import Play from '@assets/icons/play.svg?react';
import Reset from '@assets/icons/reset.svg?react';

export function DebugControls() {
  const { step, reset, run, stopDebugger } = useScriptDebugger();

  return (
    <div className="flex flex-col gap-4 p-4 min-w-[280px]">
      {/* Debug Toolbar */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Debugger
        </span>
        <div className="flex flex-row items-center gap-2">
          <ControlButton
            onClick={run}
            icon={<Play style={{ fill: 'var(--soft-green)' }} className="w-5 h-5" />}
            label="Run"
            shortcut="F5"
          />
          <ControlButton
            onClick={step}
            icon={<Stepover style={{ fill: 'var(--sky-blue)' }} className="w-5 h-5" />}
            label="Step"
            shortcut="F10"
          />
          <ControlButton
            onClick={() => {
              reset();
              stopDebugger();
            }}
            icon={<Reset className="w-5 h-5" style={{ fill: '#9ca3af' }} />}
            label="Reset"
          />
        </div>
      </div>

      {/* Tx Fetcher */}
      <TxFetcher includeDemoTxs includeTaprootWarning includeInputSelector />
    </div>
  );
}

type ControlButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
};

function ControlButton({ onClick, icon, label, shortcut }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#222] transition-all duration-150 cursor-pointer"
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
        {label}
      </span>
    </button>
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
