# SQL and Scripts Cleanup Log

## Files Removed

### Root SQL Files:
- `create-profiles-table.sql` - Old profiles table creation
- `setup-notes-table.sql` - Notes table creation

### Database Folder (All Files Removed):
- `add-missing-profile-columns.sql`
- `create-avatars-bucket.sql`
- `create-profile-trigger.sql`
- `create-profiles-for-existing-users.sql`
- `fix-rls-policies-complete.sql`
- `insert-profile-function.sql`
- `profiles-rls-policies.sql`
- `profiles-schema.sql`
- `upsert-profile-function.sql`

### Scripts Folder (Database Scripts Removed):
- `create-profiles-table.ts` - Create profiles table script
- `setup-profile-db.ts` - Setup database script
- `setup-rls-policies.ts` - Setup RLS policies script
- `create-profile-trigger.ts` - Create profile trigger script
- `create-auto-profile-trigger.ts` - Auto profile trigger script
- `check-profiles-structure.ts` - Check profiles structure
- `check-rls-policies.ts` - Check RLS policies
- `check-specific-user.ts` - Check specific user
- `check-trigger-exists.ts` - Check trigger exists
- `fix-rls-policies.ts` - Fix RLS policies
- `grant-admin-access.ts` - Grant admin access
- `sync-and-create-user.ts` - Sync and create user
- `add-missing-columns.ts` - Add missing columns
- `bypass-hooks.ts` - Bypass hooks
- `get-users.ts` - Get users script

### Backup Files Removed:
- `MIDDLEWARE_FIX_DOCUMENTATION.md` - Middleware fix documentation
- `SUPABASE_FIX_GUIDE.md` - Supabase fix guide
- `DEBUG_CLEANUP_LOG.md` - Debug cleanup log
- `.eslintrc.json.bak` - ESLint backup
- `eslint.config.js.bak` - ESLint backup

## Remaining Scripts (Useful):
- `create-avatars-bucket.ts` - Create avatars bucket
- `create-logo-variants.mjs` - Generate logo variants
- `generate-app-icons.mjs` - Generate app icons
- `optimize-all-assets.mjs` - Optimize all assets
- `optimize-logo-*.mjs` - Optimize logos
- `update-manifest-version.mjs` - Update manifest version
- `vidsrc-caption-fix.js` - Caption fix
- `test-subtitle*.vtt` - Subtitle test files
- `fix-subtitle-delay.py` - Subtitle delay fix
- `README-caption-fix.md` - Caption fix documentation

## Current Structure:
```
CineVerse/
├── src/ (247 items) - Core application code
├── supabase/ (17 items) - Supabase migrations
├── scripts/ (14 items) - Utility scripts
├── public/ (61 items) - Static assets
└── docs/ (5 items) - Documentation
```

## Notes:
- All database operations now use Supabase migrations
- Old SQL scripts replaced by proper migration files
- Database setup now handled by Supabase CLI
- Only utility scripts remain for asset optimization and testing
