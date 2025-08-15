import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: 'dark', name: 'Dark', icon: '🌑' },
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'blue', name: 'Blue', icon: '🔵' },
  { id: 'green', name: 'Green', icon: '🟢' },
  { id: 'purple', name: 'Purple', icon: '🟣' },
  { id: 'amber', name: 'Amber', icon: '🟠' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={menuRef}
      className="absolute right-full top-0 mr-2 bg-surface border border-border rounded-lg shadow-lg p-2 w-36"
      style={{ zIndex: 100 }}
    >
      <div className="py-1 text-sm font-medium text-text">Theme</div>
      <div className="space-y-1 mt-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTheme(t.id);
              onClose();
            }}
            className={`w-full text-left px-2 py-1.5 rounded flex items-center ${
              theme === t.id ? 'bg-accent text-primary' : 'hover:bg-button-hover'
            }`}
          >
            <span className="mr-2">{t.icon}</span>
            <span>{t.name}</span>
            {theme === t.id && (
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;