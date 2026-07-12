import { Button, Card, Disclaimer } from '@excellent-wealth/ui';

const FEATURES = [
  {
    title: 'Explainable financial health score',
    description:
      'Every score component shows its observed data, its calculation, and a plain-language explanation — never a black box.',
  },
  {
    title: 'What-if simulator',
    description:
      'Model compound growth, debt payoff, and life events before you commit to a plan, using decimal-safe calculations.',
  },
  {
    title: 'Privacy-first local demo mode',
    description:
      'Try the full experience with local, sample data before any account or server storage is involved.',
  },
  {
    title: 'Debt payoff planning',
    description:
      'Compare snowball and avalanche strategies side by side, with full amortisation detail.',
  },
  {
    title: 'Net worth & goal tracking',
    description:
      'Track assets, liabilities, and savings goals over time with transparent, auditable formulas.',
  },
  {
    title: 'Business finance tools',
    description:
      'Revenue, expenses, and cash-flow dashboards for owner-operators running a small business alongside personal finances.',
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight text-brand-ink">
            Excellent Wealth
          </span>
          <nav aria-label="Primary">
            <a
              href="#features"
              className="rounded-md px-3 py-2 text-sm text-brand-ink/80 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Features
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl">
            Understand your money, one explained calculation at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-ink/70">
            Excellent Wealth helps you track income and expenses, build budgets, plan debt payoff,
            and model your financial future — with transparent formulas behind every number, not a
            black-box algorithm.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary">Try the local demo</Button>
            <Button variant="secondary">Read the architecture</Button>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-brand-ink">What you get</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <h3 className="text-base font-semibold text-brand-ink">{feature.title}</h3>
                <p className="mt-2 text-sm text-brand-ink/70">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <Disclaimer className="max-w-3xl" />
          <p className="mt-4 text-xs text-brand-ink/50">
            Excellent Wealth by AXSONprime — created by Kapilash, Founder and CEO, AXSONprime.
          </p>
        </div>
      </footer>
    </>
  );
}
