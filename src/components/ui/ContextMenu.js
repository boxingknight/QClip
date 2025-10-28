// ContextMenu.js - Right-click context menu with keyboard navigation
// V2 Feature: Professional context menus with accessibility
// Status: Implemented for PR #12

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './ContextMenu.css';

const ContextMenu = ({ 
  isOpen, 
  position, 
  items = [], 
  onClose, 
  className = '' 
}) => {
  const menuRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex >= items.length ? 0 : nextIndex;
          });
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex < 0 ? items.length - 1 : prevIndex;
          });
          break;
        
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            const item = items[focusedIndex];
            if (!item.disabled && item.onClick) {
              item.onClick();
              onClose();
            }
          }
          break;
        
        case 'Tab':
          event.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, items, onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  if (!isOpen) {
    return null;
  }

  const menuElement = (
    <div
      ref={menuRef}
      className={`context-menu ${className}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      role="menu"
      aria-label="Context menu"
    >
      {items.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="context-menu-separator" />;
        }

        if (item.type === 'group') {
          return (
            <div key={index} className="context-menu-group">
              <div className="context-menu-group-title">
                {item.title}
              </div>
              {item.items?.map((subItem, subIndex) => (
                <ContextMenuItem
                  key={`${index}-${subIndex}`}
                  item={subItem}
                  isFocused={focusedIndex === index + subIndex + 1}
                  onClick={() => {
                    if (subItem.onClick) {
                      subItem.onClick();
                      onClose();
                    }
                  }}
                />
              ))}
            </div>
          );
        }

        return (
          <ContextMenuItem
            key={index}
            item={item}
            isFocused={focusedIndex === index}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
          />
        );
      })}
    </div>
  );

  return createPortal(menuElement, document.body);
};

const ContextMenuItem = ({ item, isFocused, onClick }) => {
  const { icon, label, shortcut, disabled = false } = item;

  return (
    <button
      className="context-menu-item"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      data-focused={isFocused}
      tabIndex={-1}
    >
      {icon && (
        <div className="context-menu-icon">
          {icon}
        </div>
      )}
      
      <div className="context-menu-label">
        {label}
      </div>
      
      {shortcut && (
        <div className="context-menu-shortcut">
          {shortcut}
        </div>
      )}
    </button>
  );
};

export default ContextMenu;

