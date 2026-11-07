import React from 'react';

interface NexoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only';
  lightText?: boolean;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  size = 'md',
  variant = 'full',
  lightText = false,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', svg: 'w-4 h-4', text: 'text-base' },
    md: { box: 'w-9 h-9', svg: 'w-5 h-5', text: 'text-xl' },
    lg: { box: 'w-11 h-11', svg: 'w-6 h-6', text: 'text-2xl' },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Original N-inspired Logo Mark: Connected Nodes + Growth Path */}
      <div
        className={`${current.box} rounded-lg bg-[#173A32] flex items-center justify-center shadow-xs border border-[#25866A]/30 shrink-0 transition-transform duration-200 hover:scale-105`}
        aria-label="NEXORA Logo Mark"
      >
        <svg
          className={`${current.svg} text-white`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* N-stem left */}
          <path d="M6 19V5" stroke="#F4F2EA" />
          {/* Diagonal upward path with growth node */}
          <path d="M6 19L16 6" stroke="#25866A" strokeWidth="2.5" />
          {/* Stem right */}
          <path d="M18 19V9" stroke="#F4F2EA" />
          {/* Connected nodes */}
          <circle cx="6" cy="19" r="1.5" fill="#D7A85B" stroke="none" />
          <circle cx="6" cy="5" r="1.5" fill="#F4F2EA" stroke="none" />
          <circle cx="16" cy="6" r="2" fill="#25866A" stroke="#F4F2EA" strokeWidth="1" />
          <circle cx="18" cy="19" r="1.5" fill="#F4F2EA" stroke="none" />
        </svg>
      </div>

      {variant === 'full' && (
        <span
          className={`font-heading font-extrabold tracking-tight ${current.text} ${
            lightText ? 'text-white' : 'text-[#173A32]'
          }`}
        >
          NEXORA
        </span>
      )}
    </div>
  );
};
