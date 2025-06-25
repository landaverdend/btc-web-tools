function ColoredText({ children, color }: { children: React.ReactNode; color: string }) {
  return <span style={{ color }}>{' ' + children}</span>;
}

export default ColoredText;
