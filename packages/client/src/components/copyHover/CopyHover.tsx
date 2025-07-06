import { useState } from 'react';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
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
      className="copy-hover-container"
      onMouseOver={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCopied(false);
      }}>
      {isHovered && !copied && (
        <CopyOutlined
          className="copy-icon"
          onClick={() => {
            handleCopy();
          }}
        />
      )}
      {copied && <CheckOutlined className="copy-icon copied" />}
      {children}
    </span>
  );
}
