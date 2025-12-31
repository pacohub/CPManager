import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ClearableSearchInput: React.FC<Props> = ({ value, onChange, placeholder, className, style }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        transition: 'box-shadow 160ms ease',
        boxShadow: focused ? '0 0 8px rgba(255,213,79,0.25)' : 'none',
        borderRadius: 6,
        ...style,
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ paddingRight: 32, outline: 'none', boxShadow: 'none' }}
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          title="Limpiar"
          onClick={() => onChange('')}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: '#bdbdbd',
            outline: 'none',
            boxShadow: 'none',
          }}
        >
          <FaTimes />
        </button>
      ) : null}
    </div>
  );
};

export default ClearableSearchInput;
