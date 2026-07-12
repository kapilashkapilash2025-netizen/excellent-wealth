import type { HTMLAttributes } from 'react';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** A spacious, high-contrast surface used for dashboard metrics and content blocks. */
export function Card({ className = '', children, ...rest }: CardProps) {
  const classes = [
    'rounded-2xl border border-white/10 bg-brand-navy-900/60 p-6 shadow-sm backdrop-blur-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
