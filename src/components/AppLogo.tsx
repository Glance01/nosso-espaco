import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = "w-9 h-9", size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1E3A8A" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Outer Rounded Container */}
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#logoGrad)" filter="url(#logoShadow)" />

      {/* Document Sheet */}
      <rect x="16" y="14" width="32" height="36" rx="6" fill="url(#docGrad)" />

      {/* Document Header Accent / Avatar Circle */}
      <circle cx="23" cy="22" r="3.5" fill="#2563EB" />
      <rect x="29" y="20" width="14" height="2.5" rx="1.25" fill="#1E293B" opacity="0.85" />
      <rect x="29" y="24" width="10" height="2" rx="1" fill="#64748B" opacity="0.7" />

      {/* Document Lines */}
      <rect x="20" y="31" width="24" height="2" rx="1" fill="#CBD5E1" />
      <rect x="20" y="36" width="20" height="2" rx="1" fill="#CBD5E1" />
      <rect x="20" y="41" width="16" height="2" rx="1" fill="#CBD5E1" />

      {/* Verification Check Badge */}
      <circle cx="43" cy="41" r="5" fill="#10B981" />
      <path d="M41 41l1.5 1.5 3-3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
