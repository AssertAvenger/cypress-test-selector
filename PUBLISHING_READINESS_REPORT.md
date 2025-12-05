# Publishing Readiness Report

## ✅ What's Good

1. **CLI Package Structure** - Properly configured with `files` field, only publishing `dist/` and `README.md`
2. **Build Outputs** - Both packages have compiled `dist/` directories
3. **Bin File** - CLI has proper shebang (`#!/usr/bin/env node`)
4. **License** - MIT license file exists
5. **Version Numbers** - Both packages have version `0.1.0` set
6. **TypeScript Types** - Both packages export type definitions
7. **CLI README** - Comprehensive README exists for CLI package

## ❌ Issues Found

### Critical Issues (Must Fix Before Publishing)

1. **Core Package Missing `files` Field**
   - **Problem**: Core package will publish ALL files including `src/`, `tests/`, and test fixtures
   - **Impact**: Package will be bloated and expose source code
   - **Fix**: Add `"files": ["dist", "README.md"]` to core package.json

2. **Core Package Missing README.md**
   - **Problem**: No README.md in core package directory
   - **Impact**: npm page will have no documentation
   - **Fix**: Create README.md for core package

3. **CLI Dependency Uses Local Path**
   - **Problem**: CLI has `"@cypress-test-selector/core": "file:../core"`
   - **Impact**: Won't work when published, users can't install
   - **Fix**: Change to `"@cypress-test-selector/core": "^0.1.0"` after publishing core

4. **Core Package Main Entry Point Issue**
   - **Problem**: `"main": "./dist/index.js"` but file doesn't exist
   - **Impact**: May cause import issues (though exports should handle it)
   - **Fix**: Remove main field or create index.js, or update to point to a valid export

### Important Issues (Should Fix)

5. **Missing Author Information**
   - **Problem**: Both packages have empty `"author": ""` field
   - **Impact**: No attribution on npm
   - **Fix**: Add author name and email

6. **Missing Repository Information**
   - **Problem**: No `repository`, `homepage`, or `bugs` fields
   - **Impact**: Users can't find source code or report issues
   - **Fix**: Add repository URL (need to know GitHub URL)

7. **No Git Remote Configured**
   - **Problem**: `git remote get-url origin` returns nothing
   - **Impact**: Can't auto-detect repository URL
   - **Fix**: Configure git remote or manually add repository field

### Optional Improvements

8. **Core Package Could Include LICENSE**
   - Currently only CLI includes LICENSE in files array
   - Consider adding LICENSE to core package files array

## 📋 Pre-Publishing Checklist

### Before Publishing Core Package:
- [ ] Add `files` field to core/package.json
- [ ] Create core/README.md
- [ ] Fix or remove `main` field in core/package.json
- [ ] Add author information
- [ ] Add repository/homepage URLs (if available)
- [ ] Run `npm pack --dry-run` to verify only dist/ is included
- [ ] Build core package: `cd packages/core && npm run build`
- [ ] Test core package: `cd packages/core && npm test`

### Before Publishing CLI Package:
- [ ] Publish core package first
- [ ] Update CLI dependency from `file:../core` to `@cypress-test-selector/core@^0.1.0`
- [ ] Install dependencies: `cd packages/cli && npm install`
- [ ] Test CLI works with published core
- [ ] Add author information
- [ ] Add repository/homepage URLs
- [ ] Run `npm pack --dry-run` to verify contents
- [ ] Build CLI package: `cd packages/cli && npm run build`
- [ ] Test CLI package: `cd packages/cli && npm test`

## 🔧 Fixes Applied

✅ **Fixed Issues:**

1. ✅ Added `files` field to core package.json - Now only publishes `dist/` and `README.md`
2. ✅ Created core/README.md - Comprehensive documentation for core package
3. ✅ Removed invalid `main` field from core package - Package uses subpath exports only
4. ✅ Removed invalid `"."` export from core package - Not needed for subpath-only design
5. ✅ Added repository/homepage/bugs fields to both packages (with placeholder URLs)
6. ✅ Verified npm pack output - Core now only publishes dist/ and README.md

## ⚠️ Action Required Before Publishing

### 1. Update Repository URLs
Both packages have placeholder repository URLs:
- Replace `YOUR_USERNAME` in both `packages/core/package.json` and `packages/cli/package.json`
- Update with your actual GitHub username/organization

### 2. Add Author Information
Both packages have empty `"author": ""` fields. Add your information:
```json
"author": "Your Name <your.email@example.com>"
```

### 3. CLI Dependency Update (After Publishing Core)
After publishing the core package, update `packages/cli/package.json`:
```json
"@cypress-test-selector/core": "^0.1.0"
```
Change from: `"file:../core"`

## 📝 Final Pre-Publishing Steps

1. **Update repository URLs** in both package.json files
2. **Add author information** to both package.json files
3. **Build both packages**: `npm run build` (from root)
4. **Test both packages**: `npm test` (from root)
5. **Publish core first**: `cd packages/core && npm publish --access public`
6. **Update CLI dependency** to use published version
7. **Publish CLI**: `cd packages/cli && npm publish`

