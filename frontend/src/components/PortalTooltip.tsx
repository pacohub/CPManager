import React from 'react';
import ReactDOM from 'react-dom';

interface Props {
  visible: boolean;
  x: number;
  y: number;
  children: React.ReactNode;
}

const PortalTooltip: React.FC<Props> = ({ visible, x, y, children }) => {
  if (!visible) return null;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    pointerEvents: 'none',
  };
  return ReactDOM.createPortal(
    <div className="portal-tooltip" style={style}>
      {children}
    </div>,
    document.body,
  );
};

export default PortalTooltip;
