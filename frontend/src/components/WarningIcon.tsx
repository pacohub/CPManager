import React from 'react';
import ReactDOM from 'react-dom';
import { FaExclamation } from 'react-icons/fa';

interface WarningIconProps {
  tooltip: string;
  size?: number;
  style?: React.CSSProperties;
}


const WarningIcon: React.FC<WarningIconProps> = ({ tooltip, size = 15, style }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState<{x: number, y: number} | null>(null);
  const iconRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (showTooltip && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({
        x: rect.right + 8,
        y: rect.top + rect.height / 2,
      });
    }
    if (!showTooltip) setTooltipPos(null);
  }, [showTooltip]);

  React.useEffect(() => {
    if (!showTooltip) return;
    const handle = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [showTooltip]);

  return (
    <>
      <span
        ref={iconRef}
        style={{
          display: 'inline-block',
          marginRight: 6,
          color: '#e24444',
          verticalAlign: 'middle',
          position: 'relative',
          cursor: 'pointer',
          ...style,
        }}
        aria-label={tooltip}
        tabIndex={0}
        onClick={e => {
          e.stopPropagation();
          setShowTooltip(v => !v);
        }}
        onBlur={() => setShowTooltip(false)}
      >
        <FaExclamation size={size} />
      </span>
      {showTooltip && tooltipPos && ReactDOM.createPortal(
        <div
          className="cp-tooltip cp-tooltip--visible"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            position: 'fixed',
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
            zIndex: 10010,
          }}
          role="tooltip"
        >
          {tooltip}
        </div>,
        document.body
      )}
    </>
  );
};

export default WarningIcon;
