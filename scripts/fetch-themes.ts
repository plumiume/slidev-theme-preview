#!/usr/bin/env node
/**
 * Fetch all Slidev themes from npm and save to JSON
 * This script can be run locally or in GitHub Actions
 * 
 * Usage:
 *   pnpm run fetch-themes
 *   node --loader tsx scripts/fetch-themes.ts
 */

import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const NPM_SEARCH_API = 'https://registry.npmjs.org/-/v1/search'
const NPM_DOWNLOADS_API = 'https://api.npmjs.org/downloads/point/last-week'
const GITHUB_API = 'https://api.github.com'
const OUTPUT_DIR = join(__dirname, '../public/data')
const OUTPUT_FILE = join(OUTPUT_DIR, 'themes.json')

interface ThemeData {
  id: string
  packageName: string
  name: string
  description?: string
  author?: string
  authorUrl?: string
  version?: string
  repositoryUrl?: string
  npmUrl?: string
  demoUrl?: string
  screenshots: string[]
  downloads?: number
  license?: string
  updatedAt?: string
  publishedAt?: string
  keywords?: string[]
  isOfficial: boolean
  fetchedAt: string
}

interface NpmPackage {
  name: string
  version: string
  description?: string
  keywords?: string[]
  date: string
  links: {
    npm?: string
    homepage?: string
    repository?: string
  }
  author?: {
    name?: string
    username?: string
    url?: string
  }
  publisher: {
    username: string
  }
}

function extractThemeId(packageName: string): string {
  if (packageName.startsWith('@slidev/theme-')) {
    return packageName.replace('@slidev/theme-', '')
  }
  if (packageName.startsWith('slidev-theme-')) {
    return packageName.replace('slidev-theme-', '')
  }
  const scopedMatch = packageName.match(/^@([^/]+)\/slidev-theme-(.+)$/)
  if (scopedMatch) {
    return `${scopedMatch[1]}/${scopedMatch[2]}`
  }
  return packageName
}

function isOfficialTheme(packageName: string): boolean {
  return packageName.startsWith('@slidev/theme-')
}

function formatThemeName(id: string): string {
  return id
    .split(/[-_/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function extractGitHubUser(repositoryUrl?: string): string | undefined {
  if (!repositoryUrl) return undefined
  const match = repositoryUrl.match(/github\.com\/([^/]+)/)
  return match?.[1]
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match || !match[1] || !match[2]) return null
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      if (response.status === 404) throw new Error('Not found')
      if (i === retries - 1) throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

async function fetchGitHubScreenshots(repositoryUrl: string): Promise<string[]> {
  const repoInfo = parseGitHubUrl(repositoryUrl)
  if (!repoInfo) return []

  const { owner, repo } = repoInfo
  const foldersToCheck = ['screenshots', 'assets/screenshots', 'docs/screenshots', '.github/screenshots']
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  }

  // Use GitHub token if available
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  for (const folder of foldersToCheck) {
    try {
      const response = await fetchWithRetry(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${folder}`,
        { headers }
      )

      const contents = await response.json()
      if (!Array.isArray(contents)) continue

      const screenshots = contents
        .filter((file: any) => 
          file.type === 'file' && 
          /\.(png|jpe?g|gif|webp)$/i.test(file.name)
        )
        .map((file: any) => file.download_url)
        .sort()

      if (screenshots.length > 0) {
        console.log(`  ✓ Found ${screenshots.length} screenshots in ${folder}`)
        return screenshots
      }
    } catch (e) {
      continue
    }
  }

  // Fallback to README extraction
  try {
    const response = await fetchWithRetry(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      { headers: { ...headers, 'Accept': 'application/vnd.github.v3.raw' } }
    )

    const readme = await response.text()
    const markdownImages = Array.from(
      readme.matchAll(/!\[.*?\]\((.*?\.(?:png|jpe?g|gif|webp))\)/gi)
    ).map(match => match[1])

    const screenshots = markdownImages
      .filter((url): url is string => {
        if (!url) return false
        return !url.includes('shields.io') && 
               !url.includes('badge') &&
               !url.includes('icon')
      })
      .map(url => {
        if (url.startsWith('http')) return url
        if (url.startsWith('/')) {
          return `https://raw.githubusercontent.com/${owner}/${repo}/main${url}`
        }
        return `https://raw.githubusercontent.com/${owner}/${repo}/main/${url}`
      })
      .slice(0, 3)

    if (screenshots.length > 0) {
      console.log(`  ✓ Extracted ${screenshots.length} screenshots from README`)
      return screenshots
    }
  } catch (e) {
    // Ignore
  }

  // Fallback to OG image
  return [`https://opengraph.githubassets.com/1/${owner}/${repo}`]
}

async function fetchAllThemes(): Promise<ThemeData[]> {
  console.log('🔍 Fetching themes from npm...')
  const themes: ThemeData[] = []
  let from = 0
  const size = 250

  while (true) {
    const url = `${NPM_SEARCH_API}?text=keywords:slidev-theme&size=${size}&from=${from}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (data.objects.length === 0) break

    for (const obj of data.objects) {
      const pkg: NpmPackage = obj.package

      if (!pkg.name.includes('slidev-theme') && !pkg.name.includes('theme-')) {
        continue
      }

      const repositoryUrl = pkg.links.repository?.replace(/\.git$/, '')
      
      console.log(`\n📦 Processing: ${pkg.name}`)

      const theme: ThemeData = {
        id: extractThemeId(pkg.name),
        packageName: pkg.name,
        name: formatThemeName(extractThemeId(pkg.name)),
        description: pkg.description,
        author: pkg.author?.name || pkg.author?.username || pkg.publisher.username,
        authorUrl: pkg.author?.url || (extractGitHubUser(repositoryUrl) 
          ? `https://github.com/${extractGitHubUser(repositoryUrl)}` 
          : undefined),
        version: pkg.version,
        repositoryUrl,
        npmUrl: pkg.links.npm || `https://www.npmjs.com/package/${pkg.name}`,
        demoUrl: pkg.links.homepage,
        screenshots: [],
        updatedAt: pkg.date,
        keywords: pkg.keywords,
        isOfficial: isOfficialTheme(pkg.name),
        fetchedAt: new Date().toISOString()
      }

      // Fetch screenshots
      if (repositoryUrl) {
        try {
          theme.screenshots = await fetchGitHubScreenshots(repositoryUrl)
          await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit
        } catch (e) {
          console.log(`  ⚠ Failed to fetch screenshots: ${e}`)
        }
      }

      themes.push(theme)
    }

    from += data.objects.length
    if (from >= data.total) break

    console.log(`\n📊 Progress: ${from}/${data.total}`)
  }

  console.log(`\n✅ Fetched ${themes.length} themes`)
  return themes
}

async function fetchDownloads(themes: ThemeData[]): Promise<void> {
  console.log('\n📊 Fetching download counts...')
  const batchSize = 128

  for (let i = 0; i < themes.length; i += batchSize) {
    const batch = themes.slice(i, i + batchSize)
    const packageNames = batch.map(t => t.packageName).join(',')

    try {
      const response = await fetchWithRetry(`${NPM_DOWNLOADS_API}/${packageNames}`)
      const data = await response.json()

      if (data.downloads !== undefined) {
        if (batch[0]) batch[0].downloads = data.downloads
      } else {
        for (const theme of batch) {
          const pkgData = data[theme.packageName]
          if (pkgData?.downloads) {
            theme.downloads = pkgData.downloads
          }
        }
      }

      console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(themes.length / batchSize)}`)
    } catch (e) {
      console.warn(`  ⚠ Failed to fetch downloads for batch: ${e}`)
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting theme collection...\n')

    // Fetch all themes
    const themes = await fetchAllThemes()

    // Fetch download counts
    await fetchDownloads(themes)

    // Sort by downloads
    themes.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))

    // Save to JSON
    console.log('\n💾 Saving to JSON...')
    await mkdir(OUTPUT_DIR, { recursive: true })
    await writeFile(OUTPUT_FILE, JSON.stringify(themes, null, 2), 'utf-8')

    console.log(`\n✅ Successfully saved ${themes.length} themes to ${OUTPUT_FILE}`)
    
    // Print summary
    const official = themes.filter(t => t.isOfficial).length
    const community = themes.length - official
    const withScreenshots = themes.filter(t => t.screenshots.length > 0).length
    
    console.log('\n📈 Summary:')
    console.log(`  Total themes: ${themes.length}`)
    console.log(`  Official: ${official}`)
    console.log(`  Community: ${community}`)
    console.log(`  With screenshots: ${withScreenshots}`)
    console.log(`  File size: ${(JSON.stringify(themes).length / 1024).toFixed(2)} KB`)

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
