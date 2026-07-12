import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

describe('LandingPage', () => {
  it('renders the primary heading', () => {
    render(<LandingPage />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /understand your money/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders an educational disclaimer', () => {
    render(<LandingPage />);
    expect(screen.getByRole('note')).toHaveTextContent(/does not provide personalised/i);
  });

  it('includes a skip-to-content link for keyboard users', () => {
    render(
      <>
        <a href="#main-content">Skip to main content</a>
        <LandingPage />
      </>,
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('renders every feature card', () => {
    render(<LandingPage />);
    expect(screen.getByText(/explainable financial health score/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy-first local demo mode/i)).toBeInTheDocument();
  });
});
