import { bytesToHex } from '@/btclib/util/helper';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { useExecutionStore } from '@/state/executionStore';

interface StackProps {}
export function StackView({}: StackProps) {
  const { stack, altStack, programCounter } = useExecutionStore().executionContext;
  const { getNextArgument } = useScriptDebugger();
  const { executionStatus } = useExecutionStore();

  const detailClass = 'flex flex-row justify-center items-center bg-(--input-gray) p-2 rounded-md text-white ';

  return (
    <div className="flex flex-1 flex-col items-center gap-5 bg-(--background-slate) h-90vh">
      <div className="flex flex-row items-center justify-center text-white text-lg font-bold bg-(--header-gray) p-2 w-full">
        Stack
      </div>

      <div className="flex flex-col justify-center items-center p-2 gap-5 md:flex-row md:flex-wrap">
        <span className={`${detailClass} border-1 border-(--sky-blue) gap-1`}>
          Program Counter: &nbsp;
          <span className="text-(--sky-blue)">{programCounter}</span>
        </span>

        <span className={`${detailClass}`}>
          <span>Current Arg: &nbsp;</span>
          <NextArg nextArg={getNextArgument()} />
        </span>

        <span className={`${detailClass} border-1 border-${getStatusColor(executionStatus)}`}>
          Script Status: &nbsp;
          <span className={`text-${getStatusColor(executionStatus)}`}>{executionStatus}</span>
        </span>
      </div>

      <div className="flex flex-row gap-5">
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
    <div className="flex flex-col items-center align-center">
      <div className="flex flex-col-reverse items-center min-h-[150px] min-w-[120px] gap-4 bg-(--input-gray) p-2 rounded-md">
        {stack.map((item) => (
          <span key={crypto.randomUUID()} className="max-w-[120px] truncate text-(--sky-blue)">
            0x{item.length === 0 ? '00' : bytesToHex(item)}
          </span>
        ))}
      </div>
      <span className="text-white text-lg font-bold">{title}</span>
    </div>
  );
}

function NextArg({ nextArg }: { nextArg: string }) {
  if (nextArg === undefined || nextArg === '') {
    return <span className="text-white">None</span>;
  }

  const nextArgColor = nextArg.startsWith('0x') ? 'text-(--sky-blue)' : 'text-(--soft-orange)';

  return <span className={`${nextArgColor} truncate max-w-[200px]`}>{nextArg}</span>;
}
function getStatusColor(status: string) {
  if (status === 'Success') return '(--soft-green)';
  if (status === 'Failure') return '(--soft-red)';
  if (status === 'Running') return '(--sky-blue)';
  return '(--soft-purple)';
}
