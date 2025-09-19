import React from 'react';

/**
 * Bot360Logo Component
 * 
 * A reusable component for the Bot360AI logo
 * 
 * @param {Object} props
 * @param {('light'|'dark')} [props.variant='dark'] - Color variant (light for white text, dark for indigo text)
 * @param {('sm'|'md'|'lg'|'xl'|number)} [props.size='md'] - Size of the logo
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The Bot360AI logo
 */
const Bot360Logo = ({ 
  variant = 'dark', 
  size = 'md', 
  className = '',
  ...props
}) => {
  // Define color scheme based on variant
  const colors = {
    dark: {
      text: '#1e40af',        // Indigo-700
      orbital: '#1e40af',     // Indigo-700
      ai: '#ef4444',          // Red-500 (patriotic accent)
    },
    light: {
      text: '#FFFFFF',        // White
      orbital: '#FFFFFF',     // White
      ai: '#f87171',          // Red-400 (brighter for light mode)
    },
  };

  // Define sizes (in pixels)
  const sizes = {
    sm: { height: 24, fontSize: 16, iconSize: 20 },
    md: { height: 32, fontSize: 20, iconSize: 24 },
    lg: { height: 48, fontSize: 28, iconSize: 36 },
    xl: { height: 64, fontSize: 36, iconSize: 48 }
  };

  // Determine actual size values
  const sizeValues = typeof size === 'number' 
    ? { height: size, fontSize: size * 0.6, iconSize: size * 0.75 } 
    : sizes[size] || sizes.md;

  return (
    <div 
      className={`flex items-center ${className}`}
      style={{ height: sizeValues.height }}
      {...props}
    >
      {/* Orbital Logo Icon */}
      <div
        className="relative mr-2 flex-shrink-0"
        style={{ height: sizeValues.iconSize, width: sizeValues.iconSize }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 100 100"
          height={sizeValues.iconSize} 
          width={sizeValues.iconSize}
          fill="none"
          stroke={colors[variant].orbital}
          strokeWidth="4"
          className="transition-colors duration-300"
        >
          {/* Outer Circle */}
          <circle cx="50" cy="50" r="45" />
          
          {/* Orbital Rings */}
          <ellipse 
            cx="50" 
            cy="50" 
            rx="35" 
            ry="20" 
            transform="rotate(30 50 50)" 
            strokeDasharray="4 2"
          />
          <ellipse 
            cx="50" 
            cy="50" 
            rx="30" 
            ry="40" 
            transform="rotate(-20 50 50)" 
            strokeDasharray="4 2"
          />
          
          {/* Center Dot */}
          <circle 
            cx="50" 
            cy="50" 
            r="6" 
            fill={colors[variant].ai} 
            stroke="none"
          />
        </svg>
      </div>

      {/* Text: BOT360 */}
      <div className="flex items-center font-bold tracking-tight transition-colors duration-300">
        {/* Ask (normal colour) */}
        <span
          className="transition-colors duration-300 font-medium"
          style={{
            color: colors[variant].text,
            fontSize: sizeValues.fontSize,
          }}
        >
          Ask
        </span>

        {/* Charlie (highlighted) */}
        <span
          className="font-extrabold ml-1 transition-colors duration-300"
          style={{
            color: colors[variant].ai,
            fontSize: sizeValues.fontSize,
          }}
        >
          Charlie
        </span>
      </div>
    </div>
  );
};

export default Bot360Logo;
