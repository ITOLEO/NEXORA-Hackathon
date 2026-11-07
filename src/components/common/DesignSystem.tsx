import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * PRD 08 Section 7 — Standardized NEXORA Design System Component Library
 * Provides unified Buttons, Cards, Badges, Modals, and Empty States across Student, Lecturer, Industry, and Auth portals.
 */

export type NexoraButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'text'
  | 'icon';

export interface NexoraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NexoraButtonVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const NexoraButton: React.FC<NexoraButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-[10px] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#25866A] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0';

  const variantStyles: Record<NexoraButtonVariant, string> = {
    primary: 'px-4 py-2.5 bg-[#173A32] hover:bg-[#25866A] active:bg-[#173A32] text-white shadow-xs',
    secondary:
      'px-4 py-2.5 bg-[#25866A] hover:bg-[#173A32] active:bg-[#237A55] text-white shadow-xs',
    tertiary:
      'px-3.5 py-2 bg-[#F4F2EA] hover:bg-[#E9E5DA] active:bg-[#DCE4DD] text-[#173A32] border border-[#DCE4DD]',
    destructive:
      'px-3.5 py-2 bg-[#B54747]/10 hover:bg-[#B54747] text-[#B54747] hover:text-white border border-[#B54747]/30',
    text: 'px-2 py-1 text-[#25866A] hover:text-[#173A32] hover:underline bg-transparent',
    icon: 'p-2 bg-white hover:bg-[#F4F2EA] text-[#173A32] border border-[#DCE4DD]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export type NexoraBadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'evergreen' | 'amber';

export interface NexoraBadgeProps {
  tone?: NexoraBadgeTone;
  children: React.ReactNode;
  className?: string;
}

export const NexoraBadge: React.FC<NexoraBadgeProps> = ({
  tone = 'neutral',
  children,
  className = '',
}) => {
  const toneStyles: Record<NexoraBadgeTone, string> = {
    success: 'bg-[#237A55]/10 text-[#237A55] border-[#237A55]/30',
    warning: 'bg-[#A76716]/10 text-[#A76716] border-[#A76716]/30',
    error: 'bg-[#B54747]/10 text-[#B54747] border-[#B54747]/30',
    info: 'bg-[#416B8B]/15 text-[#416B8B] border-[#416B8B]/30',
    neutral: 'bg-[#F4F2EA] text-[#173A32] border-[#DCE4DD]',
    evergreen: 'bg-[#173A32] text-white border-[#173A32]',
    amber: 'bg-[#D7A85B]/20 text-[#173A32] border-[#D7A85B]/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-[6px] border ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

export interface NexoraCardProps {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NexoraCard: React.FC<NexoraCardProps> = ({
  children,
  interactive = false,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[12px] border border-[#DCE4DD] shadow-xs p-5 md:p-6 ${
        interactive
          ? 'hover:border-[#25866A]/50 hover:shadow-sm transition-all duration-150 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export interface NexoraEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const NexoraEmptyState: React.FC<NexoraEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-[#F4F2EA]/70 border border-[#DCE4DD] rounded-[12px] p-8 text-center space-y-3 max-w-xl mx-auto">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-white border border-[#DCE4DD] text-[#25866A] flex items-center justify-center mx-auto shadow-2xs">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h4 className="font-heading font-bold text-sm text-[#173A32]">{title}</h4>
        <p className="text-xs text-[#66736C] leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-1">
          <NexoraButton variant="primary" onClick={onAction}>
            {actionLabel}
          </NexoraButton>
        </div>
      )}
    </div>
  );
};

export interface NexoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const NexoraModal: React.FC<NexoraModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-lg',
  children,
  footer,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#173A32]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexora-modal-title"
    >
      <div
        className={`bg-white rounded-[16px] border border-[#DCE4DD] shadow-2xl w-full ${maxWidthClass} p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#DCE4DD]">
          <div>
            {subtitle && (
              <span className="text-[10px] font-bold text-[#25866A] uppercase tracking-wider block">
                {subtitle}
              </span>
            )}
            <h3 id="nexora-modal-title" className="font-heading font-bold text-lg text-[#173A32]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#66736C] hover:text-[#173A32] hover:bg-[#F4F2EA] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#173A32] space-y-4">{children}</div>

        {footer && <div className="pt-3 border-t border-[#DCE4DD] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};
