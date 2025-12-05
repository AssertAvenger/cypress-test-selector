# cypress-test-selector

Intelligent Cypress test selection based on git diffs. Mimics enterprise-grade Test Impact Analysis for Cypress frameworks.

## 🚀 Quick Start

### Install
```bash
npm install cypress-test-selector
```

### Use
```bash
# See which tests are selected based on your changes
cy-select diff

# Compare against a specific branch
cy-select diff --base origin/main

# Get JSON output for CI/CD
cy-select diff --json
```

**That's it!** One command. No complex setup needed.

See [QUICK_START.md](./QUICK_START.md) for detailed usage examples.

## ✨ Features

- **Intelligent Test Selection** - Uses 5 heuristics (directory, filename, imports, tags, titles)
- **Git Diff Analysis** - Automatically detects changed files
- **Configurable Safety Levels** - `high`, `moderate`, `medium`, `low` thresholds
- **Zero Configuration** - Works out of the box with sensible defaults
- **CI/CD Ready** - JSON output for automation
- **TypeScript** - Fully typed, strict mode

## 📦 Project Structure

This is a monorepo containing:

- **packages/core** - Core diff parsing and intelligent mapping logic
- **packages/cli** - Command-line interface for the tool
- **examples/demo-app** - Simple demo React + Cypress setup

## 📖 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started in 2 minutes
- [CLI Documentation](./packages/cli/README.md) - Complete CLI reference
- [Architecture](./ARCHITECTURE.md) - Technical design details

## 🎯 Real-World Usage

### Local Development
```bash
cy-select diff  # See which tests would run
```

### CI/CD Pipeline
```bash
cy-select diff --base origin/main --json > selected-tests.json
```

### Debugging
```bash
cy-select diff --verbose  # See detailed scoring
```

## License

MIT

