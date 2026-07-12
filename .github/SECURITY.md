# Security Policy

Excellent Wealth handles sensitive personal and business financial data.
Security reports are taken seriously and triaged promptly.

## Reporting a Vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Instead, please report it privately:

- Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
  feature on this repository ("Security" tab → "Report a vulnerability"), or
- Email the maintainer directly (see the repository's contact details on
  GitHub) with a description of the issue, steps to reproduce, and its
  potential impact.

Please include:

- A clear description of the vulnerability and its impact
- Steps to reproduce, or a proof of concept
- The affected version/commit
- Whether the issue has been publicly disclosed elsewhere

We aim to acknowledge reports within 5 business days.

## Supported Versions

This project is pre-1.0 and evolving rapidly. Security fixes are applied to
the `main` branch only until a stable 1.0 release is tagged, at which point a
supported-versions table will be published here.

## Scope

In scope:

- Authentication, session, and authorization logic
- Input validation and data-sanitisation boundaries
- Dependency vulnerabilities with a demonstrable exploit path
- Data-export and data-deletion flows

Out of scope:

- Findings that require physical access to a user's unlocked device
- Denial-of-service reports that require unrealistic traffic volumes
- Issues in third-party services this project does not control

## Our Commitments

- We will not take legal action against good-faith security research
  conducted under this policy.
- We will credit reporters (with permission) in release notes once a fix
  ships.

## Project Security Practices

See [docs/security](../docs/security) for the current threat model,
data-flow overview, and security checklist.
