import type { SlidevTheme } from '@/types/theme'

/**
 * Load themes from pre-fetched static data
 * Falls back to live npm API if static data is not available
 */
export async function loadThemesData(): Promise<SlidevTheme[]> {
  try {
    // Try to load from static data first
    const response = await fetch('/data/themes.json')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✓ Loaded themes from static data')
      
      // Transform to match SlidevTheme interface
      return data.map((theme: any) => ({
        ...theme,
        thumbnailUrl: theme.screenshots?.[0] || generateFallbackThumbnail(theme.repositoryUrl),
        screenshotsLoading: false
      }))
    }
  } catch (error) {
    console.warn('Failed to load static data, falling back to live API:', error)
  }

  // Fallback to live API
  return null as any // Will be handled by fetchThemesFromNpm
}

function generateFallbackThumbnail(repositoryUrl?: string): string | undefined {
  if (!repositoryUrl) return undefined
  const match = repositoryUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (match) {
    return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`
  }
  return undefined
}
