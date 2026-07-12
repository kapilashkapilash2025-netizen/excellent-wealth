import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-accent text-brand-navy-950 hover:bg-brand-accent/90 focus-visible:ring-brand-accent',
  secondary:
    'bg-transparent text-brand-ink border border-brand-ink/30 hover:bg-brand-ink/10 focus-visible:ring-brand-ink',
  ghost:
    'bg-transparent text-brand-accent hover:bg-brand-accent/10 focus-visible:ring-brand-accent',
};

/**
 * Accessible base button: visible focus ring, disabled state, and a
 * type="button" default so it never accidentally submits a form.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', type = 'button', ...rest },
  ref,
) {
  const classes = [
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium',
    'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button ref={ref} type={type} className={classes} {...rest} />;
});
