import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(false);
  };
  
  // Determine tooltip position
  useEffect(() => {
    if (showTooltip && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Reset position to avoid overlapping with edges
      tooltip.style.top = '';
      tooltip.style.left = '';
      tooltip.style.right = '';
      tooltip.style.bottom = '';
      
      const tooltipRect = tooltip.getBoundingClientRect();
      
      switch (position) {
        case 'top':
          tooltip.style.bottom = `${container.clientHeight + 8}px`;
          tooltip.style.left = `${container.clientWidth / 2 - tooltipRect.width / 2}px`;
          break;
        case 'bottom':
          tooltip.style.top = `${container.clientHeight + 8}px`;
          tooltip.style.left = `${container.clientWidth / 2 - tooltipRect.width / 2}px`;
          break;
        case 'left':
          tooltip.style.right = `${container.clientWidth + 8}px`;
          tooltip.style.top = `${container.clientHeight / 2 - tooltipRect.height / 2}px`;
          break;
        case 'right':
          tooltip.style.left = `${container.clientWidth + 8}px`;
          tooltip.style.top = `${container.clientHeight / 2 - tooltipRect.height / 2}px`;
          break;
      }
      
      // Check if tooltip is outside viewport and adjust if needed
      const updatedTooltipRect = tooltip.getBoundingClientRect();
      
      if (updatedTooltipRect.left < 0) {
        tooltip.style.left = '0px';
      }
      
      if (updatedTooltipRect.right > window.innerWidth) {
        tooltip.style.left = '';
        tooltip.style.right = '0px';
      }
    }
  }, [showTooltip, position]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-black rounded shadow max-w-xs pointer-events-none whitespace-normal ${
            position === 'top' && 'mb-2 transform -translate-x-1/2'
          } ${
            position === 'bottom' && 'mt-2 transform -translate-x-1/2'
          } ${
            position === 'left' && 'mr-2 transform -translate-y-1/2'
          } ${
            position === 'right' && 'ml-2 transform -translate-y-1/2'
          }`}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-black transform rotate-45 ${
              position === 'top' && 'bottom-0 left-1/2 -mb-1 -ml-1'
            } ${
              position === 'bottom' && 'top-0 left-1/2 -mt-1 -ml-1'
            } ${
              position === 'left' && 'right-0 top-1/2 -mr-1 -mt-1'
            } ${
              position === 'right' && 'left-0 top-1/2 -ml-1 -mt-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;