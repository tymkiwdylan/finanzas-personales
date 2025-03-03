# Package Manager Documentation

## Migration to pnpm

### Why pnpm?
1. **Disk Space Efficiency**: pnpm uses a content-addressable store for all packages, sharing them between projects
2. **Strict Dependencies**: Prevents phantom dependencies by using strict symlinks
3. **Better Performance**: Faster than npm and yarn due to its efficient storage and linking strategy
4. **Built-in Monorepo Support**: Better support for monorepo setups if needed in the future

### Migration Steps
1. Install pnpm globally
2. Remove existing node_modules and package-lock.json
3. Convert to pnpm by running pnpm import
4. Update scripts to use pnpm
5. Add pnpm-specific files to .gitignore

### Post-Migration
- Use `pnpm install` instead of `npm install`
- Use `pnpm add` instead of `npm install [package]`
- Use `pnpm remove` instead of `npm uninstall [package]`
- Use `pnpm run [script]` or `pnpm [script]` for scripts

### Configuration
The project will use:
- `pnpm-lock.yaml` for lock file
- `.npmrc` for pnpm configuration
- `node_modules` managed by pnpm's symlink structure
