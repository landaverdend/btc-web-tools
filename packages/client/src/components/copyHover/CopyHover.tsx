import { useState } from 'react';
import './copy-hover.css';
import React from 'react';

type CopyHoverProps = {
  children: React.ReactNode;
};

const getTextContent = (children: React.ReactNode): string => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'number') return String(child);
      if (React.isValidElement(child)) return getTextContent(child.props.children);
      return '';
    })
    .join('');
};

function CopyIcon({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg
      className={className}
      onClick={onClick}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CopyHover({ children }: CopyHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = getTextContent(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <span
      className="copy-hover-container flex flex-row items-center justify-center"
      onMouseOver={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCopied(false);
      }}>
      {isHovered && !copied && (
        <CopyIcon
          className="copy-icon"
          onClick={() => {
            handleCopy();
          }}
        />
      )}
      {copied && <CheckIcon className="copy-icon copied" />}
      {children}
    </span>
  );
}
