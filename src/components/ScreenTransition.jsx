import React from 'react';

/**
 * Simple screen transition wrapper using CSS transitions.
 * The key prop forces re-render with transition effect.
 */
const ScreenTransition = ({ children, screenKey, type = 'fade' }) => {
  const getTransitionStyles = () => {
    const baseStyles = {
      position: 'relative',
      width: '100%',
      height: '100%',
      animation: 'fadeIn 200ms ease-in-out',
    };

    switch (type) {
      case 'slide':
        return { ...baseStyles, animation: 'slideIn 200ms ease-in-out' };
      case 'scale':
        return { ...baseStyles, animation: 'scaleIn 200ms ease-in-out' };
      default:
        return baseStyles;
    }
  };

  return (
    <div key={screenKey} style={getTransitionStyles()}>
      {children}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ScreenTransition;
