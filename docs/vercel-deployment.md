# Vercel Deployment Configuration

## pnpm Setup

### Required Changes
1. Add a `vercel.json` configuration file to specify pnpm as the package manager
2. Configure the project settings in Vercel dashboard
3. Update build settings to use pnpm commands

### Configuration Steps

#### 1. Project Configuration
In Vercel dashboard:
- Go to Project Settings
- Under "Build & Development Settings":
  - Framework Preset: Next.js
  - Build Command: `pnpm build`
  - Install Command: `pnpm install`
  - Development Command: `pnpm dev`

#### 2. Environment Setup
Vercel needs to be configured to use the correct pnpm version:
- Add `packageManager` field in package.json
- Use `vercel.json` for additional configuration

### Troubleshooting
Common issues:
- Build failures due to pnpm not being recognized
- Peer dependency warnings
- Module resolution errors

Solution: Ensure the build environment is properly configured with pnpm
