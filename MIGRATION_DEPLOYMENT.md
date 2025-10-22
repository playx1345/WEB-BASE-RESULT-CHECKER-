# Migration & Deployment Checklist

This document describes recommended steps and checklists for preparing and executing database/schema migrations and deploying the application to production.

> Reference: GitHub issue #63 (Migration / Deployment checklist)
> https://github.com/playx1345/WEB-BASE-RESULT-CHECKER-/issues/63

---

## Overview

This guide helps you:
- Prepare and run schema migrations safely.
- Perform backups and restore if needed.
- Rollback in case of failure.
- Deploy using Docker and docker-compose (examples provided).
- Run seed scripts in development.

> WARNING: Do not store secrets or production credentials in the repository. Use environment secrets/secret manager.

---

## Pre-deployment checklist

1. Confirm maintainer contacts and maintenance window.
2. Ensure CI pipeline passes for the branch.
3. Create a backup of production data (see Backup section).
4. Ensure health & monitoring are in place (alerts configured).
5. Confirm migration scripts are versioned and tested on staging.
6. Prepare a rollback plan and test it on staging.
7. Review env variables and secrets required (see Env checklist).
8. Notify stakeholders and queue downtime if necessary.

---

## Environment variable checklist

- NODE_ENV (production|staging|development)
- PORT
- DATABASE_URL (or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- JWT_SECRET (or session secret)
- REDIS_URL (if used for sessions or caching)
- SENTRY_DSN (optional)
- Any cloud provider credentials (stored in secret manager)
- Ensure `.env` files are NOT committed.

For this project specifically:
```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # For admin operations only
```

---

## Database migration steps

### Using Supabase Migrations

This project uses Supabase for database management. Migrations are located in `supabase/migrations/`.

1. Ensure Supabase CLI is installed:
   ```bash
   npm install -g supabase
   ```

2. On staging:
   - Pull latest code and install dependencies:
     ```bash
     git pull origin main
     npm install
     ```
   - Link to your Supabase project:
     ```bash
     supabase link --project-ref your-project-ref
     ```
   - Run database migrations:
     ```bash
     supabase db push
     ```
   - Verify schema and run smoke tests:
     ```bash
     # Check that tables exist
     supabase db diff
     # Run integration tests
     npm run test
     ```

3. On production:
   - Put the app into maintenance mode (if required).
   - Take a full DB backup (see Backup section).
   - Run migrations:
     ```bash
     supabase link --project-ref production-project-ref
     supabase db push
     ```
   - Verify application health:
     - Check logs for errors in Supabase Dashboard
     - Run smoke checks (test login, view results, etc.)
     - Monitor database metrics

4. Rollback (if migration fails):
   - Stop new app instances.
   - Restore DB backup via Supabase Dashboard or CLI.
   - Re-deploy last known-good release.

### Creating New Migrations

To create a new migration:
```bash
supabase migration new migration_description
```

Edit the generated SQL file in `supabase/migrations/`, then test locally:
```bash
supabase db reset  # Resets local DB and applies all migrations
```

---

## Backup & restore

### Supabase Database Backups

Recommended approach:
- Use Supabase's built-in backup feature (Pro plan) or manual exports.
- Store backups off-site and rotate retention policy (e.g., daily backups for 30 days).

### Backup checklist before migration:

1. **Via Supabase Dashboard:**
   - Navigate to Database → Backups
   - Create a manual backup before deploying
   - Verify backup completion

2. **Via SQL Export:**
   ```bash
   # Export using pg_dump (requires connection string)
   pg_dump -d "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
     -f backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Verify backup integrity:**
   - Test restore to a sandbox/development environment
   - Confirm all tables and data are present

### Restore example:

1. **Via Supabase Dashboard:**
   - Database → Backups → Select backup → Restore

2. **Via SQL Import:**
   ```bash
   psql -d "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
     -f backup_20250110_120000.sql
   ```

---

## Rollback strategy

- Preferred: reversible migrations that support down/rollback scripts.
- If irreversible changes were made (e.g., destructive column drop):
  - Restore from backup and re-apply safe changes.
- Document rollback steps per migration.

### Rollback procedure:

1. **Stop traffic to the application:**
   - Enable maintenance mode
   - Stop accepting new requests

2. **Restore database:**
   - Use latest pre-migration backup
   - Verify data integrity

3. **Revert application code:**
   ```bash
   git revert <commit-hash>
   # or
   git reset --hard <previous-good-commit>
   npm run build
   npm run deploy
   ```

4. **Verify system health:**
   - Run smoke tests
   - Check logs for errors
   - Monitor user reports

---

## Deployment checklist

1. **Build artifacts:**
   ```bash
   npm run build
   ```
   This creates optimized production build in `dist/` directory.

2. **Verify environment variables/secrets are set in target environment:**
   - Check Vercel/Netlify environment settings
   - Ensure Supabase keys are correct
   - Verify all required env vars from checklist above

3. **Deploy application:**
   
   **Option A: Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```
   
   **Option B: Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```
   
   **Option C: Deploy via Docker (see Docker section below)**

4. **Run DB migrations** (if not already done):
   ```bash
   supabase link --project-ref production-ref
   supabase db push
   ```

5. **Run smoke tests against new deployment:**
   - Test admin login
   - Test student login
   - Verify result viewing
   - Check announcements display

6. **Gradually shift traffic** (if supported by platform):
   - Use canary deployments or blue/green strategy
   - Monitor error rates and performance metrics

7. **If problems occur, follow rollback strategy.**

---

## Docker & docker-compose notes

This project provides Docker configuration for containerized deployment.

### Using Docker

1. **Build the Docker image:**
   ```bash
   docker build -t cs-portal:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:8080 \
     -e VITE_SUPABASE_URL=your_url \
     -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
     cs-portal:latest
   ```

### Using docker-compose

For local development or staging environments:

1. **Copy the example docker-compose file:**
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   ```

2. **Edit environment variables in docker-compose.yml** (or use .env file)

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

> **IMPORTANT:** Do not commit `docker-compose.yml` with production secrets. Use `docker-compose.example.yml` as a template. Production deployments should use secret managers (AWS Secrets Manager, Azure Key Vault, etc.).

See `Dockerfile` and `docker-compose.example.yml` in project root for reference implementations.

---

## Seed instructions

The project provides seed scripts for creating initial data in development/staging environments.

### Creating Admin Account

**Method 1: Using the seed script wrapper**
```bash
./scripts/seed-admin.sh
```

**Method 2: Using Node.js script directly**
```bash
cd scripts
npm install
node create-admin.js --email admin@example.com --password SecurePass123
```

**Method 3: Using environment variables**
```bash
export ADMIN_EMAIL=admin@plateau.edu.ng
export ADMIN_PASSWORD=Admin123456
cd scripts
node create-admin.js
```

### Creating Demo Students

For development and testing only:
```bash
cd scripts
node create-demo-students.js
```

> **SECURITY NOTE:** 
> - Only run seed scripts in development/staging environments
> - Never use default credentials in production
> - The admin creation endpoint should be secured or disabled in production
> - Seed scripts require SUPABASE_SERVICE_ROLE_KEY which has admin privileges

---

## Post-deployment health checks

After deployment, verify the following:

### Application Health
- [ ] Application loads without errors
- [ ] All static assets load correctly
- [ ] No console errors in browser

### Functionality Tests
- [ ] Admin login works
- [ ] Student login works (matric number + PIN)
- [ ] Results display correctly for students with paid fees
- [ ] Announcements display correctly
- [ ] Admin can create/edit students
- [ ] Admin can upload results

### Database Health
- [ ] Database connections are stable
- [ ] Query performance is acceptable
- [ ] No connection pool exhaustion
- [ ] RLS policies are active and working

### Monitoring
- [ ] Application logs show no new errors
- [ ] Basic endpoints respond within expected latency (<500ms)
- [ ] Database metrics stable: CPU, connections, query latency
- [ ] Error tracking is capturing issues (if Sentry configured)

### Supabase-Specific Checks
- [ ] Auth endpoints responding correctly
- [ ] Database queries executing successfully
- [ ] Edge functions (if used) are deployed
- [ ] RLS policies preventing unauthorized access

---

## Troubleshooting & notes

### Common Issues

**Migration fails with "permission denied"**
- Ensure you're using service role key for migrations
- Check that pgcrypto extension is enabled
- Verify RLS policies allow the migration user

**Students can't see results after deployment**
- Check fee_status is "paid" in students table
- Verify RLS policies on results table
- Confirm student authentication is working

**Environment variables not loading**
- For Vite, env vars must be prefixed with `VITE_`
- Rebuild after changing env vars: `npm run build`
- Check that env vars are set in deployment platform

**Docker build fails**
- Clear Docker cache: `docker system prune -a`
- Check that all dependencies are in package.json
- Verify Dockerfile paths are correct

### Best Practices

- **Tag releases in Git when performing production migrations:**
  ```bash
  git tag -a v1.0.0 -m "Production release with migration XYZ"
  git push origin v1.0.0
  ```

- **Document migration dependencies:**
  If a migration requires specific data or another migration, document it in the migration file comments.

- **Test migrations on realistic data:**
  Copy production data to staging (anonymized if needed) and test migrations there first.

- **Keep migrations atomic:**
  Each migration should do one thing and be reversible when possible.

### Emergency Procedures

If a critical issue occurs in production:

1. **Enable maintenance mode** (if available on your platform)
2. **Notify stakeholders** immediately
3. **Assess the issue** - check logs, database state
4. **Execute rollback** if needed (see Rollback Strategy)
5. **Document the incident** for post-mortem analysis
6. **Fix and test** in staging before re-deploying

---

## Performance Optimization

### Pre-deployment Optimizations

1. **Build optimization:**
   ```bash
   npm run build
   # Check bundle size
   ls -lh dist/assets/
   ```

2. **Code splitting:**
   - Ensure lazy loading for routes
   - Verify dynamic imports are working

3. **Asset optimization:**
   - Images are compressed
   - Fonts are optimized
   - Unused CSS is purged

### Database Optimizations

1. **Indexes:**
   - Verify indexes exist on frequently queried columns
   - Check `supabase/migrations/` for index definitions

2. **Connection pooling:**
   - Supabase handles this automatically
   - Monitor connection count in dashboard

3. **Query optimization:**
   - Use `.select()` to fetch only needed columns
   - Implement pagination for large datasets
   - Use `.single()` when expecting one result

---

## Security Checklist

Before deploying to production:

- [ ] All secrets stored in environment variables, not in code
- [ ] `.env` files are in `.gitignore`
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is only used server-side, never exposed to client
- [ ] CORS settings are properly configured
- [ ] SQL injection prevention verified (using parameterized queries)
- [ ] Authentication flows tested for security
- [ ] Rate limiting configured (via Supabase or Cloudflare)
- [ ] HTTPS enforced on production domain
- [ ] Security headers configured (CSP, HSTS, etc.)

---

## Where to find more info

- **Project Documentation:**
  - [README.md](./README.md) - Project overview and setup
  - [create-admin-account.md](./create-admin-account.md) - Admin setup guide
  - [RUN_DEMO_STUDENTS.md](./RUN_DEMO_STUDENTS.md) - Demo student creation

- **External Resources:**
  - [Supabase Documentation](https://supabase.com/docs)
  - [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
  - [Database Migrations Guide](https://supabase.com/docs/guides/database/migrations)
  - [Docker Documentation](https://docs.docker.com/)

- **Issue Tracking:**
  - Issue: https://github.com/playx1345/WEB-BASE-RESULT-CHECKER-/issues/63
  - Add additional company/project-specific steps here.

---

## Maintenance Schedule Template

Copy this template for planning deployments:

```markdown
# Deployment Plan: [Feature/Version Name]

**Date:** YYYY-MM-DD
**Time:** HH:MM - HH:MM (Timezone)
**Deployment Lead:** [Name]
**Backup Lead:** [Name]

## Pre-deployment
- [ ] Stakeholders notified
- [ ] Backup completed and verified
- [ ] Staging tests passed
- [ ] Rollback plan prepared

## Deployment Steps
1. [ ] Enable maintenance mode (if needed)
2. [ ] Pull latest code
3. [ ] Run migrations
4. [ ] Deploy application
5. [ ] Run health checks
6. [ ] Disable maintenance mode

## Post-deployment
- [ ] Smoke tests passed
- [ ] Monitoring shows no errors
- [ ] Stakeholders notified of completion
- [ ] Documentation updated

## Rollback Trigger
If [specific condition], execute rollback within [time limit].
```

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
