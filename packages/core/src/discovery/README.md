# Test Discovery Module

## Overview

The test discovery module provides fast, reliable discovery of Cypress test files in a project using pattern matching and globbing.

## Features

- ✅ Fast glob-based discovery using `fast-glob`
- ✅ Default patterns for common Cypress test file naming conventions
- ✅ Custom pattern support
- ✅ Automatic exclusion of build artifacts and dependencies
- ✅ POSIX path normalization
- ✅ Deduplication and sorting
- ✅ Monorepo support
- ✅ Deeply nested directory support

## API

### `discoverTests(options: DiscoverOptions): Promise<string[]>`

Main public API for discovering test files.

```typescript
import { discoverTests } from '@cypress-test-selector/core/discovery';

const files = await discoverTests({
  projectRoot: '/path/to/project',
  testPatterns: ['cypress/e2e/**/*.spec.ts'], // optional
  exclude: ['**/node_modules/**'], // optional
});

// Returns: ['/path/to/project/cypress/e2e/test1.spec.ts', ...]
```

### Options

```typescript
interface DiscoverOptions {
  /** Root directory of the project (required) */
  projectRoot: string;
  /** Custom test file patterns (defaults to standard Cypress patterns) */
  testPatterns?: string[];
  /** Additional exclusion patterns */
  exclude?: string[];
}
```

## Default Patterns

The module uses these default patterns if `testPatterns` is not provided:

- `cypress/e2e/**/*.cy.{ts,tsx,js,jsx}`
- `cypress/e2e/**/*.spec.{ts,tsx,js,jsx}`
- `cypress/e2e/**/*.test.{ts,tsx,js,jsx}`

## Default Exclusions

These directories are automatically excluded:

- `**/node_modules/**`
- `**/dist/**`
- `**/build/**`
- `**/.cache/**`
- `**/.cycache/**`
- `**/.git/**`
- `**/coverage/**`

## Output

- **Absolute paths**: All returned paths are absolute
- **POSIX style**: All paths use forward slashes (`/`) regardless of platform
- **Deduplicated**: No duplicate paths in the result
- **Sorted**: Paths are sorted alphabetically for consistent output

## Examples

### Basic Usage

```typescript
const files = await discoverTests({
  projectRoot: process.cwd(),
});
```

### Custom Patterns

```typescript
const files = await discoverTests({
  projectRoot: process.cwd(),
  testPatterns: [
    'cypress/e2e/**/*.spec.ts',
    'tests/**/*.test.ts',
  ],
});
```

### With Custom Exclusions

```typescript
const files = await discoverTests({
  projectRoot: process.cwd(),
  exclude: [
    '**/legacy/**',
    '**/*.skip.spec.ts',
  ],
});
```

### Monorepo Support

The module automatically handles monorepo structures:

```typescript
// Discovers tests in all packages/apps
const files = await discoverTests({
  projectRoot: '/path/to/monorepo',
});
```

## Performance

- Uses `fast-glob` for high-performance file system traversal
- Follows symlinks (useful in monorepos)
- Case-insensitive matching
- Efficient pattern normalization

## Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- Default patterns
- Custom patterns
- Monorepo layouts
- Nested directories
- Exclusion patterns
- Edge cases (empty projects, relative/absolute paths)

