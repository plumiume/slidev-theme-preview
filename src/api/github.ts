const GITHUB_API = 'https://api.github.com'

export interface GitHubScreenshot {
  url: string
  path: string
}

/**
 * Extract GitHub repo info from URL
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match || !match[1] || !match[2]) return null
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  }
}

/**
 * Fetch screenshots from GitHub repository
 */
export async function fetchGitHubScreenshots(
  repositoryUrl: string
): Promise<GitHubScreenshot[]> {
  const repoInfo = parseGitHubUrl(repositoryUrl)
  if (!repoInfo) return []

  const { owner, repo } = repoInfo

  try {
    // Try to get contents of screenshots folder
    const foldersToCheck = ['screenshots', 'assets/screenshots', 'docs/screenshots', '.github/screenshots']
    
    for (const folder of foldersToCheck) {
      try {
        const response = await fetch(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${folder}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )

        if (!response.ok) continue

        const contents = await response.json()
        if (!Array.isArray(contents)) continue

        // Filter image files
        const screenshots = contents
          .filter((file: any) => 
            file.type === 'file' && 
            /\.(png|jpe?g|gif|webp)$/i.test(file.name)
          )
          .map((file: any) => ({
            url: file.download_url,
            path: file.path
          }))
          .sort((a, b) => a.path.localeCompare(b.path))

        if (screenshots.length > 0) {
          return screenshots
        }
      } catch (e) {
        // Continue to next folder
        continue
      }
    }

    // Fallback: try to extract images from README
    return await extractImagesFromReadme(owner, repo)
  } catch (error) {
    console.warn(`Failed to fetch screenshots for ${owner}/${repo}:`, error)
    return []
  }
}

/**
 * Extract screenshot URLs from README
 */
async function extractImagesFromReadme(
  owner: string,
  repo: string
): Promise<GitHubScreenshot[]> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        }
      }
    )

    if (!response.ok) return []

    const readme = await response.text()
    
    // Extract markdown image URLs
    const markdownImages = Array.from(
      readme.matchAll(/!\[.*?\]\((.*?\.(?:png|jpe?g|gif|webp))\)/gi)
    ).map(match => match[1])

    // Extract HTML img tags
    const htmlImages = Array.from(
      readme.matchAll(/<img[^>]+src=["']([^"']+\.(?:png|jpe?g|gif|webp))["']/gi)
    ).map(match => match[1])

    const allImages = [...markdownImages, ...htmlImages]
      .filter((url): url is string => {
        // Filter out undefined and badges/small icons
        if (!url) return false
        return !url.includes('shields.io') && 
               !url.includes('badge') &&
               !url.includes('icon')
      })
      .map(url => {
        // Convert relative URLs to absolute
        if (url.startsWith('http')) {
          return url
        } else if (url.startsWith('/')) {
          return `https://raw.githubusercontent.com/${owner}/${repo}/main${url}`
        } else {
          return `https://raw.githubusercontent.com/${owner}/${repo}/main/${url}`
        }
      })
      .slice(0, 5) // Max 5 screenshots from README

    return allImages.map(url => ({
      url,
      path: url.split('/').pop() || 'screenshot.png'
    }))
  } catch (error) {
    console.warn('Failed to extract images from README:', error)
    return []
  }
}

/**
 * Fetch package.json to check for custom screenshot config
 */
export async function fetchPackageScreenshots(
  repositoryUrl: string,
  _packageName: string
): Promise<string[] | null> {
  const repoInfo = parseGitHubUrl(repositoryUrl)
  if (!repoInfo) return null

  const { owner, repo } = repoInfo

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        }
      }
    )

    if (!response.ok) return null

    const packageJson = await response.json()
    
    // Check for custom slidev.screenshots field
    if (packageJson.slidev?.screenshots) {
      return Array.isArray(packageJson.slidev.screenshots)
        ? packageJson.slidev.screenshots
        : [packageJson.slidev.screenshots]
    }

    // Check for screenshots field at root
    if (packageJson.screenshots) {
      return Array.isArray(packageJson.screenshots)
        ? packageJson.screenshots
        : [packageJson.screenshots]
    }

    return null
  } catch (error) {
    console.warn('Failed to fetch package.json:', error)
    return null
  }
}
