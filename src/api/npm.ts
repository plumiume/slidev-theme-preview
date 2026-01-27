import type { SlidevTheme, NpmSearchResult, NpmDownloadsResponse } from '@/types/theme'

const NPM_REGISTRY_API = 'https://registry.npmjs.org'
const NPM_SEARCH_API = 'https://registry.npmjs.org/-/v1/search'
const NPM_DOWNLOADS_API = 'https://api.npmjs.org/downloads/point/last-week'

/**
 * Extract theme ID from package name
 */
function extractThemeId(packageName: string): string {
  // @slidev/theme-xxx -> xxx
  if (packageName.startsWith('@slidev/theme-')) {
    return packageName.replace('@slidev/theme-', '')
  }
  // slidev-theme-xxx -> xxx
  if (packageName.startsWith('slidev-theme-')) {
    return packageName.replace('slidev-theme-', '')
  }
  // @org/slidev-theme-xxx -> org/xxx
  const scopedMatch = packageName.match(/^@([^/]+)\/slidev-theme-(.+)$/)
  if (scopedMatch) {
    return `${scopedMatch[1]}/${scopedMatch[2]}`
  }
  return packageName
}

/**
 * Check if package is an official Slidev theme
 */
function isOfficialTheme(packageName: string): boolean {
  return packageName.startsWith('@slidev/theme-')
}

/**
 * Extract GitHub username from repository URL
 */
function extractGitHubUser(repositoryUrl?: string): string | undefined {
  if (!repositoryUrl) return undefined
  const match = repositoryUrl.match(/github\.com\/([^/]+)/)
  return match?.[1]
}

/**
 * Generate thumbnail URL (GitHub README screenshot or default)
 */
function generateThumbnailUrl(repositoryUrl?: string, _packageName?: string): string | undefined {
  if (repositoryUrl) {
    const match = repositoryUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      // Use GitHub's OpenGraph image as fallback
      return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`
    }
  }
  // Default placeholder
  return undefined
}

/**
 * Fetch themes from npm registry
 */
export async function fetchThemesFromNpm(): Promise<SlidevTheme[]> {
  const themes: SlidevTheme[] = []
  let from = 0
  const size = 250 // Max allowed by npm

  // Fetch all pages
  while (true) {
    const url = `${NPM_SEARCH_API}?text=keywords:slidev-theme&size=${size}&from=${from}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from npm: ${response.statusText}`)
    }

    const data: NpmSearchResult = await response.json()
    
    if (data.objects.length === 0) break

    for (const obj of data.objects) {
      const pkg = obj.package
      
      // Filter out non-theme packages
      if (!pkg.name.includes('slidev-theme') && !pkg.name.includes('theme-')) {
        continue
      }

      const repositoryUrl = pkg.links.repository?.replace(/\.git$/, '')
      const theme: SlidevTheme = {
        id: extractThemeId(pkg.name),
        name: formatThemeName(extractThemeId(pkg.name)),
        packageName: pkg.name,
        description: pkg.description,
        author: pkg.author?.name || pkg.author?.username || pkg.publisher.username,
        authorUrl: pkg.author?.url || (extractGitHubUser(repositoryUrl) 
          ? `https://github.com/${extractGitHubUser(repositoryUrl)}` 
          : undefined),
        version: pkg.version,
        repositoryUrl,
        npmUrl: pkg.links.npm || `https://www.npmjs.com/package/${pkg.name}`,
        demoUrl: pkg.links.homepage,
        thumbnailUrl: generateThumbnailUrl(repositoryUrl, pkg.name),
        license: undefined, // Would need additional API call
        updatedAt: pkg.date,
        keywords: pkg.keywords,
        isOfficial: isOfficialTheme(pkg.name)
      }

      themes.push(theme)
    }

    from += data.objects.length
    if (from >= data.total) break
  }

  // Fetch download counts in batches
  await fetchDownloadCounts(themes)

  return themes
}

/**
 * Fetch download counts for themes (batch)
 */
async function fetchDownloadCounts(themes: SlidevTheme[]): Promise<void> {
  // Batch fetch in chunks of 128 (npm API limit)
  const batchSize = 128
  
  for (let i = 0; i < themes.length; i += batchSize) {
    const batch = themes.slice(i, i + batchSize)
    const packageNames = batch.map(t => t.packageName).join(',')
    
    try {
      const response = await fetch(`${NPM_DOWNLOADS_API}/${packageNames}`)
      if (response.ok) {
        const data = await response.json()
        
        // Handle both single and bulk response formats
        if (data.downloads !== undefined) {
          // Single package response
          if (batch[0]) batch[0].downloads = data.downloads
        } else {
          // Bulk response
          for (const theme of batch) {
            const pkgData = data[theme.packageName] as NpmDownloadsResponse | undefined
            if (pkgData?.downloads) {
              theme.downloads = pkgData.downloads
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch download counts:', e)
    }
  }
}

/**
 * Format theme name for display
 */
function formatThemeName(id: string): string {
  return id
    .split(/[-_/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Fetch single theme details
 */
export async function fetchThemeDetails(packageName: string): Promise<any> {
  const response = await fetch(`${NPM_REGISTRY_API}/${encodeURIComponent(packageName)}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch theme details: ${response.statusText}`)
  }
  return response.json()
}
