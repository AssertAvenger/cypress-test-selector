# Architecture Plan

## Directory Structure

```
cypress-test-selector/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── index.ts                    # Main export
│   │   │   ├── diff/
│   │   │   │   ├── parser.ts               # Git diff parsing
│   │   │   │   └── types.ts                # Diff-related types
│   │   │   ├── mapper/
│   │   │   │   ├── index.ts                # Main mapping orchestrator
│   │   │   │   ├── directory-heuristic.ts  # Directory-based mapping
│   │   │   │   ├── similarity-heuristic.ts # File similarity mapping
│   │   │   │   ├── import-graph.ts         # Import graph analysis
│   │   │   │   └── conservative.ts         # Conservative fallback strategy
│   │   │   ├── safety/
│   │   │   │   ├── levels.ts               # Safety level definitions
│   │   │   │   └── validator.ts            # High-safety mode guarantees
│   │   │   └── utils/
│   │   │       ├── file-utils.ts           # File path utilities
│   │   │       └── test-discovery.ts       # Find Cypress test files
│   │   ├── tests/
│   │   │   ├── diff/
│   │   │   ├── mapper/
│   │   │   └── safety/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli/
│       ├── src/
│       │   ├── cli.ts                      # CLI entry point
│       │   ├── commands/
│       │   │   └── run.ts                  # Main run command
│       │   ├── config/
│       │   │   └── loader.ts               # Config file loading
│       │   └── output/
│       │       └── writer.ts               # JSON output writer
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
│
├── examples/
│   └── demo-app/
│       ├── src/                            # React app source
│       ├── cypress/
│       │   ├── e2e/
│       │   │   └── **/*.spec.ts            # Demo test files
│       │   └── support/
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                            # Root workspace config
├── tsconfig.base.json                      # Shared TS config
└── README.md
```

## Core Package (`packages/core`)

### Responsibilities

1. **Diff Parsing** (`diff/`)
   - Parse git diff output (file-level and granular)
   - Extract changed files, lines, and change types
   - Handle various git diff formats

2. **Mapping Logic** (`mapper/`)
   - **Directory Heuristic**: Map based on directory structure
     - `src/components/Button.tsx` → `cypress/e2e/components/button.spec.ts`
     - `src/features/auth/login.tsx` → `cypress/e2e/features/auth/login.spec.ts`
   - **Similarity Heuristic**: File name similarity matching
     - `Button.tsx` → `button.spec.ts`, `Button.spec.ts`
   - **Import Graph**: Lightweight analysis of imports
     - Track which test files import/use which source files
   - **Conservative Strategy**: When uncertain, include more tests

3. **Safety Levels** (`safety/`)
   - **High**: Guarantee no test silently skipped (may include extra tests)
   - **Medium**: Balanced selection with reasonable confidence
   - **Low**: Aggressive filtering (may miss some tests)

4. **Utilities** (`utils/`)
   - Test file discovery (`cypress/e2e/**/*.spec.ts`)
   - File path normalization and matching
   - Pattern matching utilities

## CLI Package (`packages/cli`)

### Responsibilities

1. **Command Interface** (`cli.ts`)
   - Parse command-line arguments
   - Handle `--diff`, `--safety-level`, `--pattern`, `--json`, `--write-output`
   - Exit codes: 0 (OK), 1 (errors)

2. **Configuration** (`config/`)
   - Load config from file (`.cypress-test-selector.json` or similar)
   - Merge CLI args with config file
   - Default values

3. **Output** (`output/`)
   - Generate `selected-tests.json` with:
     - Array of selected test file paths
     - Metadata (reason for selection, confidence, etc.)
   - Console output for human-readable format

## Example App (`examples/demo-app`)

### Purpose

- Demonstrate tool usage
- Provide integration test environment
- Show realistic directory structure:
  - `src/components/` → `cypress/e2e/components/`
  - `src/features/` → `cypress/e2e/features/`
  - Various naming patterns

## Data Flow

```
1. CLI receives git diff (or runs `git diff` command)
2. Core parses diff → ChangedFile[]
3. Core discovers all Cypress test files
4. Core applies mapping heuristics:
   - Directory heuristic
   - Similarity heuristic
   - Import graph analysis
   - Tag heuristic
   - Title heuristic
5. Core applies safety level filter
6. Core validates (high-safety mode: ensure no silent skips)
7. CLI outputs selected-tests.json
8. CLI exits with appropriate code
```

## Key Design Decisions

1. **Monorepo**: Separate concerns, enable independent versioning
2. **TypeScript Strict**: Type safety and better DX
3. **Vitest**: Fast, modern testing framework
4. **Configurable Safety**: Balance between precision and safety
5. **JSON Output**: CI-friendly, machine-readable
6. **No Silent Skips**: High-safety mode guarantees comprehensive coverage