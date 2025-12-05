# Publishing Guide: Your First npm Package 🚀

## Understanding npm Publishing (Simple Explanation)

### What is npm?
- **npm** = Node Package Manager
- It's like an app store for JavaScript code
- People can install your package with: `npm install cypress-test-selector`

### What Happens When You Publish?
1. Your code gets uploaded to npm's servers
2. It becomes available to everyone
3. People can install it with `npm install`
4. You can update it with new versions

### Your Package Structure
You have **2 packages** to publish:
1. **`@cypress-test-selector/core`** - The core library (used by CLI)
2. **`cypress-test-selector`** - The CLI tool (what users install)

**Important:** You must publish `core` first, then `cli` (because CLI depends on core).

---

## Step-by-Step Publishing Process

### Prerequisites (One-Time Setup)

#### 1. Create npm Account
- Go to: https://www.npmjs.com/signup
- Create a free account
- Verify your email

#### 2. Login to npm (on your computer)
```bash
npm login
```
- Enter your username, password, and email
- This saves your credentials locally

#### 3. Check You're Logged In
```bash
npm whoami
```
- Should show your username

---

### Step 1: Prepare Your Packages

#### Fix Dependencies
- CLI currently uses `file:../core` (works locally, not when published)
- We need to change it to use the published version

#### Add Missing Metadata
- Add author, repository, homepage
- Add proper version numbers
- Add README files

#### Build Everything
- Make sure all code is compiled
- Run tests to ensure everything works

---

### Step 2: Publish Core Package First

```bash
cd packages/core
npm publish --access public
```

**Why `--access public`?**
- Packages starting with `@` are "scoped packages"
- They're private by default
- `--access public` makes it free for everyone

---

### Step 3: Update CLI to Use Published Core

- Change CLI's dependency from `file:../core` to `@cypress-test-selector/core@^0.1.0`
- Install dependencies
- Test that it works

---

### Step 4: Publish CLI Package

```bash
cd packages/cli
npm publish
```

---

### Step 5: Verify It Works

```bash
# Create a test directory
mkdir /tmp/test-cypress-diff
cd /tmp/test-cypress-diff

# Install your package
npm install cypress-test-selector

# Test it
npx cy-select --help
```

---

## Version Numbers Explained

### Semantic Versioning (semver)
Format: `MAJOR.MINOR.PATCH` (e.g., `0.1.0`)

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.2.0): New features, backward compatible
- **PATCH** (0.1.1): Bug fixes

### Your First Version
- Start with `0.1.0` (initial release)
- After publishing, you can't republish the same version
- To update: change version → publish again

---

## Common Commands

```bash
# Check what will be published
npm pack

# Dry run (see what would happen, don't actually publish)
npm publish --dry-run

# Publish
npm publish

# Publish with public access (for scoped packages)
npm publish --access public
```

---

## What Gets Published?

Only files listed in `package.json` → `"files"` array:
- `dist/` - Compiled code
- `README.md` - Documentation
- `package.json` - Package metadata
- `LICENSE` - License file (if included)

**NOT published:**
- `src/` - Source code (unless you want to)
- `tests/` - Test files
- `node_modules/` - Dependencies
- `.git/` - Git files

---

## After Publishing

### Update Version for Next Release
```bash
# Update version in package.json
npm version patch  # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
```

### Publish Updates
```bash
npm publish
```

---

## Troubleshooting

### "Package name already taken"
- Someone else has that name
- Try a different name or add your username

### "You cannot publish over the previously published version"
- You already published `0.1.0`
- Bump the version number

### "Incorrect password"
- Run `npm login` again
- Check 2FA if enabled

---

## Next Steps After Publishing

1. **Share it!** Tell people about your package
2. **Get feedback** - See what users think
3. **Iterate** - Fix bugs, add features
4. **Version up** - Publish updates

---

## Summary Checklist

Before publishing:
- [ ] npm account created
- [ ] Logged in (`npm login`)
- [ ] Packages prepared (metadata, dependencies)
- [ ] Everything built (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Version numbers set
- [ ] README files complete

Publishing:
- [ ] Publish core package first
- [ ] Update CLI dependency
- [ ] Publish CLI package
- [ ] Test installation works

After publishing:
- [ ] Verify on npmjs.com
- [ ] Test installation in clean directory
- [ ] Share with the world! 🎉

