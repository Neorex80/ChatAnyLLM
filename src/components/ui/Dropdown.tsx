import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  label: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
  buttonClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  children,
  position = 'left',
  width = 'w-48',
  buttonClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const positionClass = position === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`inline-flex items-center justify-center text-sm ${buttonClassName}`}
        aria-expanded="true"
        aria-haspopup="true"
      >
        {label}
      </button>

      {isOpen && (
        <div 
          className={`origin-top-right absolute ${positionClass} mt-2 ${width} rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<{
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, className = '', children, disabled = false }) => {
  const baseClasses = 'block px-4 py-2 text-sm';
  const activeClasses = disabled 
    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer';

  return (
    <div
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
    >
      {children}
    </div>
  );
};

export default Dropdown;