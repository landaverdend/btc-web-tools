import { useDebugStore } from '@/state/debugStore';
import './stack.css';
import { bytesToHex } from '@/crypto/util/helper';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';

function NextArg({ nextArg }: { nextArg: string }) {
  if (nextArg === undefined || nextArg === '') {
    return <span style={{ color: 'black' }}>None</span>;
  }

  const nextArgColor = nextArg.startsWith('0x') ? 'var(--sky-blue)' : 'var(--soft-orange)';

  return <span style={{ color: nextArgColor }}>{nextArg} </span>;
}

interface StackProps {}
export function Stack({}: StackProps) {
  const { stack, altStack, status } = useDebugStore();
  const { getNextArgument } = useScriptDebugger();

  return (
    <div className="flex-column stack-container">
      <div className="flex-row header-panel">Stack</div>

      <div className="flex-row stack-details-container">
        <span className="details-item">
          <span>Next Argument: </span>
          <NextArg nextArg={getNextArgument()} />
        </span>

        <span className="details-item" style={{}}>
          Script Status: {status}
        </span>
      </div>

      <div className="flex-column stack-items">
        {stack.map((item) => (
          <span key={crypto.randomUUID()}>0x{item.length === 0 ? '00' : bytesToHex(item)}</span>
        ))}
      </div>
    </div>
  );
}
