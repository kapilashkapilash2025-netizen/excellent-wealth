export interface DisclaimerProps {
  className?: string;
}

/**
 * Standard educational-use disclaimer. Rendered anywhere Excellent Wealth
 * shows a calculation, projection, or insight, per the project's policy of
 * never presenting simulated figures as guaranteed outcomes or regulated
 * financial advice.
 */
export function Disclaimer({ className = '' }: DisclaimerProps) {
  return (
    <p role="note" className={['text-xs text-brand-ink/60', className].filter(Boolean).join(' ')}>
      Excellent Wealth provides educational and analytical information only. It does not provide
      personalised regulated financial advice, and no figure shown is a guarantee of future
      financial results.
    </p>
  );
}
