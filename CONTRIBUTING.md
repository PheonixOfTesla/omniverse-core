# Contributing to Omniverse

Thank you for your interest in contributing to Omniverse. This document outlines
the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by the TABLE_OF_LAW.md
social contract and treat all contributors with respect.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include reproduction steps
4. Include your environment details

### Suggesting Features

1. Open a discussion first
2. Explain the use case
3. Consider sovereignty implications
4. Propose implementation approach

### Code Contributions

#### Setup

```bash
# Clone the repository
git clone https://github.com/omniverse-ai/omniverse-core
cd omniverse-core

# Install Rust (if needed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build
cargo build

# Test
cargo test
```

#### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

#### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Example:
```
feat(conscience): add impact measurement for health domain

Implements Article III compliance for Mercury domain actions.
Includes unit tests for positive/negative outcome tracking.

Closes #123
```

### Code Style

#### Rust

- Run `cargo fmt` before committing
- Run `cargo clippy` and address warnings
- Write doc comments for public APIs
- Include unit tests for new functionality

#### JavaScript

- Use ESLint configuration
- Prefer `const` over `let`
- Use async/await over callbacks

#### Solidity

- Follow Solidity style guide
- Include NatSpec comments
- Write comprehensive tests

### Testing

```bash
# Rust tests
cargo test

# JavaScript tests
cd router && npm test

# Solidity tests
cd ledger && npx hardhat test
```

### Documentation

- Update README.md if adding features
- Add doc comments to new code
- Update ARCHITECTURE.md for structural changes

## Review Process

1. All PRs require at least one maintainer approval
2. CI must pass (build, test, lint)
3. Breaking changes require RFC process
4. Security-sensitive changes require security review

## Security Vulnerabilities

**Do NOT open public issues for security vulnerabilities.**

Email: security@omniverse.ai (PGP key in SECURITY.md)

## Governance

Changes to TABLE_OF_LAW.md require the full governance process
outlined in gov/GOVERNANCE.md. This includes:

- 30-day public comment period
- Genesis Council review
- Supermajority vote

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- Annual transparency report

## Questions?

- Open a GitHub Discussion
- Email: contributors@omniverse.ai

---

Thank you for helping build sovereign AI.
