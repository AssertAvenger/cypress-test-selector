# Diff Parser Module

## Overview

The diff parser module provides robust parsing of git diff output in multiple formats and normalizes them into a consistent structure.

## Features

- ✅ Supports `--name-only` format
- ✅ Supports `--name-status` format  
- ✅ Supports full unified diff format
- ✅ Handles all git status codes: A, M, D, R, C, T
- ✅ Extracts similarity scores for renames/copies
- ✅ Handles renamed files with old/new paths
- ✅ Normalizes output to consistent `ChangedFile` format
- ✅ Comprehensive error handling and edge case coverage

## API

### `parseDiff(diffOutput: string, options?: ParseOptions): ParseResult`

Main public API for parsing git diff output.

```typescript
import { parseDiff } from '@cypress-test-selector/core/diff';

const result = parseDiff('M\tsrc/file.ts');
// result.files = [{ newPath: 'src/file.ts', status: 'modified' }]
```

### Types

```typescript
interface ChangedFile {
  oldPath?: string;
  newPath: string;
  status: "added" | "modified" | "deleted" | "renamed";
}
```

## Supported Formats

### --name-only
```
src/components/Button.tsx
src/utils/helpers.ts
```

### --name-status
```
A\tsrc/new.ts
M\tsrc/modified.ts
D\tsrc/deleted.ts
R100\told/path.ts\tnew/path.ts
```

### Unified Diff
```
diff --git a/src/Button.tsx b/src/Button.tsx
index 123..456
--- a/src/Button.tsx
+++ b/src/Button.tsx
@@ -1 +1 @@
-changed
+changed
```

## Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- All three diff formats
- All status codes
- Renamed files with similarity scores
- Multiple files in one diff
- Edge cases (empty input, malformed lines, etc.)
- Files with spaces, long paths, various extensions

