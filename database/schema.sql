-- Slidev Themes Database Schema
-- PostgreSQL 14+

CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  
  -- Basic Info
  package_name VARCHAR(255) UNIQUE NOT NULL,
  theme_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Author
  author VARCHAR(255),
  author_url VARCHAR(512),
  
  -- Links
  repository_url VARCHAR(512),
  npm_url VARCHAR(512),
  demo_url VARCHAR(512),
  
  -- Metadata
  version VARCHAR(50),
  license VARCHAR(100),
  keywords TEXT[],
  is_official BOOLEAN DEFAULT false,
  
  -- Stats
  downloads INTEGER DEFAULT 0,
  
  -- Dates
  published_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS theme_screenshots (
  id SERIAL PRIMARY KEY,
  theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
  url VARCHAR(1024) NOT NULL,
  path VARCHAR(512),
  display_order INTEGER DEFAULT 0,
  source VARCHAR(50), -- 'github', 'manual', 'readme', 'og'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_themes_package_name ON themes(package_name);
CREATE INDEX IF NOT EXISTS idx_themes_theme_id ON themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_is_official ON themes(is_official);
CREATE INDEX IF NOT EXISTS idx_themes_downloads ON themes(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_themes_updated_at ON themes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_theme_id ON theme_screenshots(theme_id);

-- View for easy querying
CREATE OR REPLACE VIEW themes_with_screenshots AS
SELECT 
  t.*,
  COALESCE(
    json_agg(
      json_build_object(
        'url', s.url,
        'path', s.path,
        'source', s.source
      ) ORDER BY s.display_order
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) as screenshots
FROM themes t
LEFT JOIN theme_screenshots s ON t.id = s.theme_id
GROUP BY t.id;

-- Function to update last_fetched_at
CREATE OR REPLACE FUNCTION update_last_fetched_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_fetched_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_fetched_at
BEFORE UPDATE ON themes
FOR EACH ROW
EXECUTE FUNCTION update_last_fetched_at();

COMMENT ON TABLE themes IS 'Slidev theme metadata from npm and GitHub';
COMMENT ON TABLE theme_screenshots IS 'Screenshots for each theme';
COMMENT ON COLUMN theme_screenshots.source IS 'Source of screenshot: github, manual, readme, og';
