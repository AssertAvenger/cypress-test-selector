# Quick Start Guide

## Real-World Usage (It's Simple!)

### Step 1: Install (One Command)

```bash
npm install cypress-test-selector
```

### Step 2: Configure (One-Time, Optional)

Create `cypress-test-selector.config.js` in your project root:

```javascript
export default {
  testPatterns: ["cypress/**/*.spec.ts"],
  safetyLevel: "medium", // or "high", "moderate", "low"
  defaultBase: "origin/main",
};
```

**That's it!** You can skip this step and use defaults.

### Step 3: Use It (One Command)

```bash
# Basic usage - compares against default branch
cy-select diff

# Compare against specific commit/branch
cy-select diff --base origin/develop

# Get JSON output (for CI/CD)
cy-select diff --json

# See detailed scoring (for debugging)
cy-select diff --verbose
```

## Typical Workflows

### Local Development

```bash
# Before committing, see which tests would run
cy-select diff

# Compare against main branch
cy-select diff --base origin/main
```

### CI/CD Pipeline

```bash
# In your CI script
cy-select diff --base origin/main --json > selected-tests.json

# Then run Cypress with selected tests
npx cypress run --spec "$(cat selected-tests.json | jq -r '.selected[]' | tr '\n' ',')"
```

### Debugging

```bash
# See why tests were selected
cy-select diff --verbose
```

Output:
```
Selected 12 tests:
  multi-cart-delete.spec.ts
  multi-cart-purchase-partial.spec.ts
  search-and-checkout-shop.spec.ts
  ...

Safety level: moderate (threshold: 0.2)
```

## Common Use Cases

### 1. Pre-commit Check
```bash
cy-select diff
```

### 2. PR Validation (CI)
```bash
cy-select diff --base origin/main --json
```

### 3. Debug Test Selection
```bash
cy-select diff --verbose
```

### 4. Custom Test Patterns
```bash
cy-select diff --pattern "**/*.spec.ts" --pattern "**/*.test.ts"
```
