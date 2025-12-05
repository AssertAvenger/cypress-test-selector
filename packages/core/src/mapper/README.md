# Mapping Heuristics Module

## Overview

The mapping heuristics module provides intelligent matching between changed source files and Cypress test files using multiple scoring strategies.

## Features

- ✅ **Directory Mapping**: Path segment matching
- ✅ **Filename Similarity**: Token-based similarity (Dice coefficient + LCS)
- ✅ **Import Graph Mapping**: Regex-based import analysis
- ✅ **Tag Heuristic**: Test tag matching (comment tags, inline tags, Cypress metadata)
- ✅ **Title Heuristic**: Semantic matching of describe/it titles
- ✅ **Safety Levels**: Configurable thresholds (high/medium/low)
- ✅ **Multiplicative Scoring**: Combines all 5 heuristics for accurate matching

## API

### `mapDiffToTests(diff: ChangedFile[], tests: string[], options?: MappingOptions): Promise<MappingResult>`

Main public API for mapping changed files to test files.

```typescript
import { mapDiffToTests } from '@cypress-test-selector/core/mapper';
import { parseDiff } from '@cypress-test-selector/core/diff';
import { discoverTests } from '@cypress-test-selector/core/discovery';

const diffResult = parseDiff(gitDiffOutput);
const tests = await discoverTests({ projectRoot: process.cwd() });
const mapping = await mapDiffToTests(diffResult.files, tests, {
  safetyLevel: 'medium',
});

// mapping.selected contains array of test file paths
```

## Heuristics

### 1. Directory Mapping

Compares path segments between changed files and test files.

- **Score Formula**: `matching_segments / total_segments`
- **Bonus**: Exact directory match gets +0.2
- **Normalization**: Filters common prefixes (src, cypress, e2e)

**Example**:
- Changed: `src/components/Button.tsx`
- Test: `cypress/e2e/components/button.spec.ts`
- Score: High (components directory matches)

### 2. Filename Similarity

Token-based similarity using Dice coefficient and LCS.

- **Tokenization**: Splits on camelCase, underscores, hyphens
- **Scoring**: `Dice * 0.7 + LCS * 0.3`
- **Bonus**: Exact match = 1.0, high overlap (>0.8) gets +0.1

**Example**:
- Changed: `LoginForm.tsx`
- Test: `login-form.spec.ts`
- Score: High (tokens: ["login", "form"] match)

### 3. Import Graph Mapping

Regex-based scanning of imports in test files.

- **Detection**: ES6 imports and require() statements
- **Score**: 1.0 for direct import, 0.0 otherwise
- **Normalization**: Handles relative paths, index files, extensions

**Example**:
- Changed: `src/components/Button.tsx`
- Test imports: `import { Button } from '../../../src/components/Button'`
- Score: 1.0 (direct import)

### 4. Tag Heuristic

Matches test file tags against changed file tokens.

- **Tag Sources**: Comment tags (`// @tag: login`), inline tags (`describe("[auth] ...")`), Cypress metadata (`{ tags: ["login"] }`)
- **Scoring**:
  - Exact tag match → 1.0
  - Partial overlap → 0.4-0.7
  - No match → 0.0
- **Normalization**: Lowercase, trim, alphanumeric + hyphens/underscores only
- **Weight**: Default 0.5

**Example**:
- Changed: `src/components/LoginButton.tsx`
- Test tags: `["login", "auth"]`
- Score: 1.0 (exact "login" tag match)

### 5. Title Semantic Heuristic

Matches test titles (describe/it blocks) against changed file tokens.

- **Title Extraction**: All describe/it/context/specify blocks, nested suites
- **Tokenization**: Same logic as filename similarity (camelCase, hyphens, spaces)
- **Scoring**:
  - Exact phrase match → 1.0
  - Overlap ratio > 0.6 → 0.8
  - Overlap ratio > 0.3 → 0.4-0.6
  - Otherwise → 0.0
- **Weight**: Default 0.4

**Example**:
- Changed: `src/components/LoginForm.tsx`
- Test titles: `["LoginForm component tests", "should render login form"]`
- Score: 1.0 (exact "LoginForm" match in title)

## Safety Levels

### High Safety (`threshold: 0.0`)
- Selects all tests with any score > 0
- Most comprehensive, may include false positives
- Use when you want to ensure no tests are missed

### Moderate Safety (`threshold: 0.2`)
- Selects tests with score >= 0.2
- More inclusive than medium, less than high
- Good balance between coverage and precision
- Use when you want broader coverage without running everything

### Medium Safety (`threshold: 0.4`)
- Selects tests with score >= 0.4
- Balanced approach
- Default recommendation

### Low Safety (`threshold: 0.7`)
- Selects only tests with score >= 0.7
- Most precise, may miss some relevant tests
- Use when you want high confidence matches only

## Scoring Engine

Heuristics are combined using multiplicative scoring:

```
combined = 1 - (1 - h1) * (1 - h2) * (1 - h3) * (1 - hTags) * (1 - hTitles)
```

**Properties**:
- If any heuristic = 1.0, combined = 1.0
- If all heuristics are low, combined is low
- Supports weighted heuristics
- All 5 heuristics contribute to final score

## Options

```typescript
interface MappingOptions {
  safetyLevel?: "high" | "moderate" | "medium" | "low";  // Default: "medium"
  threshold?: number;                        // Override safety level
  includeScores?: boolean;                    // Include heuristic scores
  directoryWeight?: number;                   // Default: DEFAULT_WEIGHTS.directoryWeight (1.0)
  similarityWeight?: number;                  // Default: DEFAULT_WEIGHTS.similarityWeight (1.0)
  importGraphWeight?: number;                 // Default: DEFAULT_WEIGHTS.importGraphWeight (1.0)
  tagWeight?: number;                        // Default: DEFAULT_WEIGHTS.tagWeight (0.5)
  titleWeight?: number;                      // Default: DEFAULT_WEIGHTS.titleWeight (0.4)
}
```

### Default Weights

Default weights are exported as `DEFAULT_WEIGHTS` from `@cypress-test-selector/core/mapper`:

```typescript
import { DEFAULT_WEIGHTS } from '@cypress-test-selector/core/mapper';

// DEFAULT_WEIGHTS:
// {
//   directoryWeight: 1.0,
//   similarityWeight: 1.0,
//   importGraphWeight: 1.0,
//   tagWeight: 0.5,
//   titleWeight: 0.4,
// }
```

## Result Format

```typescript
interface MappingResult {
  mappings: TestMapping[];      // All mappings with scores
  selected: string[];            // Selected test paths
  safetyLevel: SafetyLevel;     // Safety level used
  threshold: number;            // Threshold applied
}

interface TestMapping {
  testPath: string;             // Absolute test file path
  score: number;                // Combined score (0.0-1.0)
  heuristics: {
    directory: number;          // Directory score
    similarity: number;         // Similarity score
    importGraph: number;        // Import graph score
    tags: number;              // Tag heuristic score
    titles: number;           // Title heuristic score
  };
  reason?: string;              // Human-readable reason
}
```

## Examples

### Basic Usage

```typescript
const result = await mapDiffToTests(changedFiles, testFiles);
console.log(result.selected); // Array of selected test paths
```

### Custom Safety Level

```typescript
const result = await mapDiffToTests(changedFiles, testFiles, {
  safetyLevel: 'high', // Select all with any score > 0
});
```

### Custom Threshold

```typescript
const result = await mapDiffToTests(changedFiles, testFiles, {
  threshold: 0.6, // Custom threshold
});
```

### Weighted Heuristics

```typescript
const result = await mapDiffToTests(changedFiles, testFiles, {
  directoryWeight: 2.0,    // Emphasize directory matching
  similarityWeight: 1.0,
  importGraphWeight: 0.5,  // De-emphasize import graph
  tagWeight: 1.0,          // Emphasize tag matching
  titleWeight: 0.8,        // Emphasize title matching
});
```

## Performance

- **Directory & Similarity**: Synchronous, fast
- **Import Graph**: Async (file I/O), cached per test file
- **Tag & Title**: Async (file I/O during discovery), cached in metadata
- **Scoring**: O(n*m) where n=changed files, m=test files

## Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- Individual heuristics
- Combined scoring
- Safety levels
- Edge cases (empty inputs, missing files, etc.)

