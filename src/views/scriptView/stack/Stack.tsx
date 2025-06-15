import { useDebugStore } from '@/state/debugStore';
import './stack.css';

interface StackProps {}
export function Stack({}: StackProps) {
  const { stack, altStack } = useDebugStore();

  return (
    <div className="flex-column stack-container">
      <div className="flex-row header-panel">Stack</div>
      <div className="flex-column stack-items">
        {stack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
