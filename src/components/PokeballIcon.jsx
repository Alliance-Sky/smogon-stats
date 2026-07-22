import React from 'react';

export default function PokeballIcon({ variant = 'scarlet', size = 24, className = '' }) {

  const src = variant === 'scarlet' ? '/favicon-scarlet.svg' : '/favicon-violet.svg';

  return (
    <img 
      src={src} 
      alt={`${variant} pokeball icon`} 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
