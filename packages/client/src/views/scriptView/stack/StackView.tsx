import { type ReactNode, useRef, useEffect, useState } from 'react';
import { bytesToHex } from '@/btclib/util/helper';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { useExecutionStore } from '@/state/executionStore';

interface StackProps {}
export function StackView({}: StackProps) {
  const { stack, altStack, programCounter } = useExecutionStore().executionContext;
  const { getNextArgument } = useScriptDebugger();
  const { executionStatus } = useExecutionStore();

  return (
    <div className="flex flex-1 flex-col items-center gap-5 bg-(--background-slate) h-90vh p-5">
      {/* Header */}
      <div className="flex flex-row items-center justify-center gap-3 text-white text-lg font-semibold tracking-wide bg-gradient-to-r from-[#1e1e1e] via-[#252525] to-[#1e1e1e] py-3 px-8 rounded-xl border border-[#333] shadow-xl">
        <div className="w-2 h-2 rounded-full bg-(--sky-blue) animate-pulse" />
        Stack Inspector
      </div>

      {/* Status Cards */}
      <div className="flex flex-col justify-center items-center gap-3 md:flex-row md:gap-3 w-full max-w-2xl">
        <StatusCard
          label="PC"
          value={String(programCounter)}
          accentColor="sky-blue"
          icon="→"
        />
        <StatusCard
          label="Next Op"
          value={<NextArg nextArg={getNextArgument()} />}
          accentColor="soft-orange"
          icon="◆"
        />
        <StatusCard
          label="Status"
          value={executionStatus}
          accentColor={getStatusColorName(executionStatus)}
          icon={getStatusIcon(executionStatus)}
          highlighted
        />
      </div>

      {/* Stacks */}
      <div className="flex flex-row gap-4 w-full max-w-2xl justify-center">
        <Stack stack={stack} title="Main Stack" isPrimary />
        <Stack stack={altStack} title="Alt Stack" />
      </div>
    </div>
  );
}

type StatusCardProps = {
  label: string;
  value: ReactNode;
  accentColor: string;
  icon: string;
  highlighted?: boolean;
};
function StatusCard({ label, value, accentColor, icon, highlighted }: StatusCardProps) {
  const colorVar = `var(--${accentColor})`;
  return (
    <div
      className={`flex flex-col flex-1 min-w-[120px] bg-gradient-to-b from-[#252525] to-[#1f1f1f] rounded-lg p-3 border border-[#333] transition-all duration-200 hover:border-[#444] ${
        highlighted ? 'ring-1 ring-opacity-50' : ''
      }`}
      style={highlighted ? { boxShadow: `0 0 20px ${colorVar}20` } : {}}
    >
      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-widest mb-1.5 font-medium">
        <span style={{ color: colorVar }} className="text-xs">{icon}</span>
        {label}
      </div>
      <div className="text-white font-semibold text-sm font-mono overflow-hidden" style={{ color: typeof value === 'string' ? colorVar : undefined }}>
        {value}
      </div>
    </div>
  );
}

type SProps = {
  stack: Uint8Array[];
  title: string;
  isPrimary?: boolean;
};
function Stack({ stack, title, isPrimary }: SProps) {
  const accentColor = isPrimary ? 'var(--sky-blue)' : 'var(--soft-purple)';
  const prevLengthRef = useRef(stack.length);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  useEffect(() => {
    const prevLength = prevLengthRef.current;
    const currentLength = stack.length;

    // Detect push (stack grew)
    if (currentLength > prevLength) {
      const newItemIndex = currentLength - 1;
      setAnimatingIndex(newItemIndex);

      // Clear animation after it completes
      const timer = setTimeout(() => {
        setAnimatingIndex(null);
      }, 300);

      prevLengthRef.current = currentLength;
      return () => clearTimeout(timer);
    }

    prevLengthRef.current = currentLength;
  }, [stack.length]);

  return (
    <div className="flex flex-col items-stretch max-w-[300px] w-full">
      {/* Stack Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <span className={`text-xs font-semibold uppercase tracking-widest ${isPrimary ? 'text-(--sky-blue)' : 'text-gray-400'}`}>
            {title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full">
          {stack.length} items
        </span>
      </div>

      {/* Stack Container */}
      <div className="relative flex flex-col w-full bg-gradient-to-b from-[#1a1a1a] to-[#151515] rounded-xl border border-[#2a2a2a] overflow-hidden">
        {/* Top of Stack indicator */}
        <div
          className="flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase tracking-widest font-medium border-b border-[#2a2a2a]"
          style={{ color: accentColor }}
        >
          <span className="opacity-50">▲</span>
          <span>top</span>
          <span className="opacity-50">▲</span>
        </div>

        {/* Stack Items */}
        <div className="flex flex-col-reverse items-stretch p-2 gap-1.5 max-h-[400px] overflow-y-auto">
          {stack.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-600 gap-2">
              <div className="text-2xl opacity-30">[ ]</div>
              <span className="text-xs">Empty stack</span>
            </div>
          ) : (
            stack.map((item, index) => {
              const isTop = index === stack.length - 1;
              const isAnimating = index === animatingIndex;
              const hexValue = item.length === 0 ? '00' : bytesToHex(item);
              return (
                <div
                  key={`${index}-${hexValue}`}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150 border ${
                    isTop
                      ? 'bg-[#1f2937] border-[#374151]'
                      : 'bg-[#1c1c1c] border-transparent hover:bg-[#222] hover:border-[#333]'
                  }`}
                  style={{
                    ...(isTop ? { borderColor: `${accentColor}40` } : {}),
                    ...(isAnimating ? {
                      animation: 'stackPush 0.3s ease-out',
                    } : {}),
                  }}
                >
                  {/* Stack Index */}
                  <span className={`text-[10px] font-mono w-5 text-center rounded px-1 ${
                    isTop ? 'bg-[#374151] text-gray-300' : 'text-gray-600'
                  }`}>
                    {index}
                  </span>

                  {/* Value */}
                  <span
                    className="font-mono text-sm truncate flex-1"
                    style={{ color: isTop ? accentColor : '#9ca3af' }}
                  >
                    0x{hexValue}
                  </span>

                  {/* Byte length badge */}
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-opacity ${
                    isTop
                      ? 'bg-[#374151] text-gray-400'
                      : 'bg-[#252525] text-gray-500 opacity-0 group-hover:opacity-100'
                  }`}>
                    {item.length}B
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Stack Bottom */}
        <div className="flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase tracking-widest text-gray-600 border-t border-[#2a2a2a] bg-[#111]">
          <span className="opacity-50">▼</span>
          <span>base</span>
          <span className="opacity-50">▼</span>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes stackPush {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          50% {
            transform: translateY(2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function NextArg({ nextArg }: { nextArg: string }) {
  if (nextArg === undefined || nextArg === '') {
    return <span className="text-gray-500 text-sm">—</span>;
  }

  const isHex = nextArg.startsWith('0x');
  const colorClass = isHex ? 'text-(--sky-blue)' : 'text-(--soft-orange)';

  // Truncate long hex strings
  const displayValue = isHex && nextArg.length > 12
    ? `${nextArg.slice(0, 10)}…`
    : nextArg;

  return (
    <span className={`${colorClass} font-mono text-sm`} title={nextArg}>
      {displayValue}
    </span>
  );
}

function getStatusColorName(status: string): string {
  if (status === 'Success') return 'soft-green';
  if (status === 'Failure') return 'soft-red';
  if (status === 'Running') return 'sky-blue';
  return 'soft-purple';
}

function getStatusIcon(status: string): string {
  if (status === 'Success') return '✓';
  if (status === 'Failure') return '✗';
  if (status === 'Running') return '●';
  return '○';
}
