
import React from 'react';

const MockedCard = ({ children, style, ...props }) => {
  const cardStyle = {
    backgroundColor: '#1f2937', // Fundo cinza escuro para contraste com o fundo preto
    color: '#f9fafb',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s',
    ...style
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
};

export default MockedCard;