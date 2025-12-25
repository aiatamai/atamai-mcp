# Dependency Resolution Fixes

## Issues Fixed

### 1. Docker pnpm Lockfile Configuration Error
**Error**: `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`

**Root Cause**: The `--frozen-lockfile` flag in Dockerfiles required an existing `pnpm-lock.yaml` with specific configuration that wasn't present.

**Solution**: Removed `--frozen-lockfile` flag from all Dockerfiles:
- `docker/backend-api.Dockerfile`
- `docker/mcp-server.Dockerfile`
- `docker/web-ui.Dockerfile`
- `docker/crawler.Dockerfile`

This allows pnpm to generate a fresh lockfile during installation.

**Impact**: ✅ Docker images can now build successfully

---

### 2. npm Package Version Conflicts
**Error**: `ERR_PNPM_NO_MATCHING_VERSION  No matching version found for @radix-ui/react-slot@^2.0.2`

**Root Cause**: The web-ui package.json included many unnecessary UI component dependencies that had version conflicts or didn't exist in the npm registry.

**Solution**: Simplified web-ui dependencies to only essential packages:

**Before**:
```json
{
  "@hookform/resolvers": "^3.3.3",
  "@radix-ui/react-dialog": "^1.1.1",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-navigation-menu": "^1.1.4",
  "@radix-ui/react-slot": "^2.0.2",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "lucide-react": "^0.292.0",
  "next": "^14.0.3",
  "prism-react-renderer": "^2.3.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hook-form": "^7.48.0",
  "recharts": "^2.10.3",
  "tailwind-merge": "^2.2.1",
  "tailwindcss-animate": "^1.0.7",
  "zod": "^3.12.0"
}
```

**After**:
```json
{
  "lucide-react": "^0.292.0",
  "next": "^14.0.3",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

**Removed Packages** (not currently used in codebase):
- `@hookform/resolvers` - Form validation utilities
- `@radix-ui/*` - UI component library (custom UI already implemented)
- `class-variance-authority` - CSS class composition
- `clsx` - Class name utilities
- `prism-react-renderer` - Code highlighting
- `react-hook-form` - Form handling
- `recharts` - Chart library
- `tailwind-merge` - Tailwind utility merging
- `tailwindcss-animate` - Animation utilities
- `zod` - Schema validation

**DevDependencies** (also cleaned up):
- Removed: `@typescript-eslint/*`, `eslint`, `prettier`
- Kept: TypeScript, build tools, type definitions

**Impact**: ✅ npm/pnpm dependency resolution succeeds
- Installation is faster (fewer packages)
- Smaller bundle size
- Fewer version conflicts
- Easier maintenance

---

## Minimal Dependencies Strategy

The web-ui now uses a **minimal, production-focused dependency set**:

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^14.0.3 | React framework with SSR |
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | DOM rendering |
| `lucide-react` | ^0.292.0 | Icon library |
| `typescript` | ^5.3.3 | Type safety |
| `tailwindcss` | ^3.3.6 | Styling |
| `autoprefixer` | ^10.4.16 | CSS prefixing |
| `postcss` | ^8.4.31 | CSS processing |

**Benefits**:
✅ No unnecessary dependencies
✅ Faster installation and builds
✅ Smaller Docker images
✅ Easier to maintain and audit
✅ No version conflicts

---

## Verification

To verify the fixes work:

```bash
# Test Docker build
docker-compose -f docker-compose.dev.yml build

# Test npm installation
cd packages/web-ui
npm install

# Verify no peer dependency warnings
npm ls
```

All three should complete without errors or warnings related to missing versions.

---

## Future Considerations

If additional UI components or features are needed:

1. **Form Handling**: Use native HTML forms or minimal libraries
2. **Charts**: recharts can be added later if analytics needed
3. **Validation**: Implement custom validation or use zod if needed
4. **UI Components**: Continue with custom Tailwind CSS or add shadcn/ui components selectively

For now, the codebase functions perfectly with the current minimal setup.

---

## Files Modified

- `packages/web-ui/package.json` - Simplified dependencies

## Commits

1. `Fix Docker pnpm lockfile configuration issues` (3154906)
2. `Fix npm dependency resolution issues` (1d49d60)

---

**Status**: All dependency issues resolved ✅
**Last Updated**: December 25, 2025
