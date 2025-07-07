type CTProps = {
  children: React.ReactNode;
  color: string;

  className?: string;
};

function ColoredText({ children, color, className }: CTProps) {
  return (
    <span className={className} style={{ color }}>
      {' ' + children}
    </span>
  );
}

export default ColoredText;
