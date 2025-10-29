# Quick Reference: Deployment Commands

This is a quick reference card for common deployment tasks. For detailed instructions, see [MIGRATION_DEPLOYMENT.md](./MIGRATION_DEPLOYMENT.md).

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Docker Deployment

```bash
# Build Docker image
docker build -t cs-portal:latest .

# Run container
docker run -p 8080:8080 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_PUBLISHABLE_KEY=your_key \
  cs-portal:latest

# Using docker-compose
cp docker-compose.example.yml docker-compose.yml
# Edit docker-compose.yml with your environment variables
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations to database
supabase db push

# Create new migration
supabase migration new migration_description

# Reset local database (development only)
supabase db reset
```

## Creating Admin Users

```bash
# Interactive mode
./scripts/seed-admin.sh

# With arguments
./scripts/seed-admin.sh admin@example.com SecurePassword123

# Using Node.js directly
cd scripts
node create-admin.js --email admin@example.com --password SecurePass123
```

## Creating Demo Students

```bash
cd scripts
node create-demo-students.js
```

## Production Deployment

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Manual Deployment

1. Build the application: `npm run build`
2. Upload `dist/` directory to your web server
3. Configure environment variables on your hosting platform
4. Set up proper redirects for SPA routing

## Health Checks

```bash
# Check if app is running
curl http://localhost:8080/health

# Test admin login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Docker Issues
```bash
# Clear Docker cache
docker system prune -a

# View container logs
docker logs <container-id>

# Rebuild without cache
docker build --no-cache -t cs-portal:latest .
```

### Database Issues
```bash
# Check connection
supabase status

# View migration history
supabase migration list

# Test database queries
supabase db diff
```

## Environment Variables

Required variables for production:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

For admin operations (server-side only):
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Additional Resources

- [Full Migration Guide](./MIGRATION_DEPLOYMENT.md)
- [Admin Setup Guide](./create-admin-account.md)
- [Demo Students Guide](./RUN_DEMO_STUDENTS.md)
- [Project README](./README.md)
- [Supabase Documentation](https://supabase.com/docs)

---

**Remember:** Always test in staging before deploying to production!
