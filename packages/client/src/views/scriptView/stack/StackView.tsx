import { ScriptDebuggerResult, useDebugStore } from '@/state/debugStore';
import './stack-view.css';
import { bytesToHex } from '@/crypto/util/helper';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import ColoredText from '@/components/coloredText/ColoredText';

function NextArg({ nextArg }: { nextArg: string }) {
  if (nextArg === undefined || nextArg === '') {
    return <span style={{ color: 'white' }}>None</span>;
  }

  const nextArgColor = nextArg.startsWith('0x') ? 'var(--sky-blue)' : 'var(--soft-orange)';

  return <ColoredText color={nextArgColor}>{nextArg}</ColoredText>;
}
function getStatusColor(status: ScriptDebuggerResult) {
  if (status === 'Success') return 'var(--soft-green)';
  if (status === 'Failure') return 'var(--soft-red)';
  if (status === 'Running') return 'var(--sky-blue)';
  return 'var(--soft-purple)';
}

interface StackProps {}
export function StackView({}: StackProps) {
  const { stack, altStack, status, programCounter } = useDebugStore();
  const { getNextArgument } = useScriptDebugger();

  return (
    <div className="flex-column stack-view-container">
      <div className="flex-row header-panel">Stack</div>

      <div className="flex-row stack-details-container">
        <span className="details-item" style={{ border: `1px solid var(--sky-blue)` }}>
          Program Counter:
          <ColoredText color="var(--sky-blue)">{programCounter}</ColoredText>
        </span>

        <span className="details-item next-arg-container">
          <span>Current Argument: </span>
          <NextArg nextArg={getNextArgument()} />
        </span>

        <span className="details-item" style={{ border: `1px solid ${getStatusColor(status)}` }}>
          Script Status:
          <ColoredText color={getStatusColor(status)}>{status}</ColoredText>
        </span>
      </div>

      <div className="flex-row" style={{ gap: '20px' }}>
        <Stack stack={stack} title="Main Stack" />
        <Stack stack={altStack} title="Alt Stack" />
      </div>
    </div>
  );
}

type SProps = {
  stack: Uint8Array[];
  title: string;
};
function Stack({ stack, title }: SProps) {
  return (
    <div className="flex-column stack-container">
      <div className="flex-column stack-items">
        {stack.map((item) => (
          <span key={crypto.randomUUID()} className="hex-string">
            0x{item.length === 0 ? '00' : bytesToHex(item)}
          </span>
        ))}
      </div>
      <span className="stack-title">{title}</span>
    </div>
  );
}
