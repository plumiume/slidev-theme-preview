# Database Setup (Future)

This document describes the PostgreSQL database setup for production deployment.

## Schema

See `database/schema.sql` for the complete database schema.

## Tables

### `themes`
Main table storing theme metadata:
- Package info (name, version, description)
- Author information
- Links (repository, npm, demo)
- Statistics (downloads, dates)
- Official flag

### `theme_screenshots`
Screenshots for each theme:
- Multiple screenshots per theme
- Source tracking (github, manual, readme, og)
- Display order

## Migration from Static JSON

When ready to switch from static JSON to PostgreSQL:

1. **Install PostgreSQL client**
   ```bash
   pnpm add pg
   pnpm add -D @types/pg
   ```

2. **Set environment variables**
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/slidev_themes
   ```

3. **Run schema**
   ```bash
   psql $DATABASE_URL < database/schema.sql
   ```

4. **Update fetch script**
   - Modify `scripts/fetch-themes.ts`
   - Add PostgreSQL insert/update logic
   - Keep JSON export for static builds

5. **Update API**
   - Add database queries to `src/api/`
   - Implement caching layer
   - Keep static fallback

## Benefits of PostgreSQL

- ✅ Real-time updates
- ✅ Advanced filtering/search
- ✅ Analytics and reporting
- ✅ User features (favorites, ratings)
- ✅ API rate limit management

## Current Architecture (Static JSON)

```
GitHub Actions (6h)
  └─> Fetch from npm + GitHub
      └─> Save to public/data/themes.json
          └─> Commit to repo
              └─> Deploy to Azure SWA
                  └─> Serve static JSON

Frontend
  └─> Load static JSON
      └─> Fallback to live npm API
```

## Future Architecture (PostgreSQL)

```
GitHub Actions (6h)
  └─> Fetch from npm + GitHub
      └─> Update PostgreSQL
      └─> Export static JSON (for CDN)

API Server
  └─> Query PostgreSQL
      └─> Cache responses
      └─> Serve via REST/GraphQL

Frontend
  └─> Call API
      └─> Fallback to static JSON
      └─> Fallback to live npm API
```

## Query Examples

```sql
-- Get all themes with screenshots
SELECT * FROM themes_with_screenshots 
ORDER BY downloads DESC;

-- Official themes only
SELECT * FROM themes 
WHERE is_official = true 
ORDER BY name;

-- Recently updated
SELECT * FROM themes 
WHERE updated_at > NOW() - INTERVAL '30 days'
ORDER BY updated_at DESC;

-- Search by keyword
SELECT * FROM themes 
WHERE 'slidev' = ANY(keywords)
AND description ILIKE '%presentation%';

-- Themes with multiple screenshots
SELECT t.*, COUNT(s.id) as screenshot_count
FROM themes t
LEFT JOIN theme_screenshots s ON t.id = s.theme_id
GROUP BY t.id
HAVING COUNT(s.id) > 1;
```

## Performance Considerations

- **Indexes**: Already defined in schema
- **Caching**: Implement Redis for frequent queries
- **CDN**: Static JSON for fast global access
- **Rate Limiting**: Track API usage per theme
- **Monitoring**: Log fetch failures and retry
