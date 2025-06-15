import './stack.css';

interface StackProps {
  stack: string[];
  altStack: string[];
}

export function Stack({ stack }: StackProps) {
  return (
    <div className="flex-row stack-container">
      <div className="flex-column">
        {stack.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
