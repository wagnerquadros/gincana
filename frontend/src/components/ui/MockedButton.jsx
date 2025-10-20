import React, { useState } from 'react';

const MockedButton = ({ children, onClick, variant = 'primary', icon: Icon, style, ...props }) => {
  const [hover, setHover] = useState(false);

  const baseStyle = {
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    border: 'none',
    transition: 'background-color 0.3s',
  };

  const variantColors = {
    primary: { default: '#101010', hover: '#5e5e5eff', color: 'white' },
    secondary: { default: '#ffffff', hover: '#d9d9d9ff', color: 'black', border: '1px solid #a3a3a3ff' },
    danger: { default: '#ef4444', hover: '#e07e7eff', color: 'white' },
  }[variant];

  const combinedStyle = {
    ...baseStyle,
    backgroundColor: hover ? variantColors.hover : variantColors.default,
    color: variantColors.color,
    border: variantColors.border,
    ...style, // permite sobrescrever se passar props style
  };

  return (
    <button
      onClick={onClick}
      style={combinedStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default MockedButton;
