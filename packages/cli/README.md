# cypress-test-selector CLI

Command-line interface for intelligent Cypress test selection based on git diffs.

## Installation

```bash
npm install cypress-test-selector
```

## Usage

### Basic Usage

```bash
# Map git diff to Cypress tests
cy-select diff

# Output in JSON format
cy-select diff --json

# Verbose output with scoring breakdown
cy-select diff --verbose

# Specify git base branch
cy-select diff --base origin/main

# Custom test patterns
cy-select diff --pattern "**/*.spec.ts" --pattern "**/*.test.ts"
```

### Command Options

- `-b, --base <ref>` - Git base reference (default: auto-detect)
- `-j, --json` - Output in JSON format
- `-v, --verbose` - Verbose output with scoring breakdown
- `-p, --pattern <pattern>` - Custom test file patterns (can be used multiple times)
- `--log-level <level>` - Logging level: silent, normal, verbose, debug
- `-h, --help` - Show help message

## Configuration

The CLI reads configuration from multiple sources (in order of priority):

1. **CLI arguments** (highest priority)
2. **cypress-test-selector.config.ts** (or `.js`)
3. **package.json** `"cypress-test-selector"` key
4. **Defaults** (lowest priority)

### Config File Example

`cypress-test-selector.config.ts`:

```typescript
export default {
  projectRoot: process.cwd(),
  testPatterns: [
    "cypress/e2e/**/*.spec.ts",
    "cypress/e2e/**/*.cy.ts",
  ],
  exclude: ["**/node_modules/**"],
  safetyLevel: "medium",
  defaultBase: "origin/main",
};
```

### Package.json Example

```json
{
  "cypress-test-selector": {
    "testPatterns": ["cypress/e2e/**/*.spec.ts"],
    "safetyLevel": "high",
    "defaultBase": "origin/develop"
  }
}
```

## Output Formats

### Human-Readable (Default)

```
Selected 3 tests:

  cypress/e2e/components/button.spec.ts
  cypress/e2e/components/input.cy.ts
  cypress/e2e/features/auth/login.spec.ts

Safety level: medium (threshold: 0.4)
Total mappings evaluated: 15
```

### JSON Format (`--json`)

```json
{
  "selected": [
    "/path/to/cypress/e2e/components/button.spec.ts",
    "/path/to/cypress/e2e/components/input.cy.ts"
  ],
  "count": 2,
  "safetyLevel": "medium",
  "threshold": 0.4,
  "mappings": [
    {
      "testPath": "/path/to/cypress/e2e/components/button.spec.ts",
      "score": 0.85,
      "heuristics": {
        "directory": 0.8,
        "similarity": 0.9,
        "importGraph": 1.0
      },
      "reason": "directory match, filename similarity, import dependency"
    }
  ]
}
```

### Verbose Format (`--verbose`)

```
Selected 3 tests:

  button.spec.ts
    Path: /path/to/cypress/e2e/components/button.spec.ts
    Combined Score: 85.0%
    - Directory: 80.0%
    - Similarity: 90.0%
    - Import Graph: 100.0%
    Reason: directory match, filename similarity, import dependency

Safety level: medium (threshold: 0.4)
Total mappings evaluated: 15
```

## Exit Codes

- `0` - Success (tests selected)
- `1` - Error or no tests selected

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Test
npm test
```

## Architecture

The CLI is structured as follows:

- `bin/cy-select.ts` - Binary entry point
- `src/index.ts` - CLI bootstrap and command routing
- `src/commands/diff.ts` - Diff command implementation
- `src/config/loadConfig.ts` - Configuration loading
- `src/git/getDiff.ts` - Git diff resolution
- `src/output/logger.ts` - Logging system
- `src/output/formatters.ts` - Output formatting

## Future Commands

- `cy-select run` - Run Cypress with filtered tests
- `cy-select debug` - Show detailed scoring breakdown

