export interface SlidevTheme {
  /** Unique identifier (package name without scope/prefix) */
  id: string
  /** Display name */
  name: string
  /** Full npm package name */
  packageName: string
  /** Theme description */
  description?: string
  /** Author name or GitHub username */
  author?: string
  /** Author's GitHub profile URL */
  authorUrl?: string
  /** npm package version */
  version?: string
  /** GitHub repository URL */
  repositoryUrl?: string
  /** npm package URL */
  npmUrl?: string
  /** Demo/preview URL */
  demoUrl?: string
  /** Screenshot/thumbnail URL (deprecated, use screenshots) */
  thumbnailUrl?: string
  /** Multiple screenshots for animation */
  screenshots?: string[]
  /** Screenshots loading state */
  screenshotsLoading?: boolean
  /** Weekly download count from npm */
  downloads?: number
  /** License type */
  license?: string
  /** Last updated date */
  updatedAt?: string
  /** Published date */
  publishedAt?: string
  /** Keywords/tags */
  keywords?: string[]
  /** Is this an official Slidev theme? */
  isOfficial: boolean
}

export interface ThemeFilter {
  official: boolean
  community: boolean
}

export type ThemeSortOption = 'downloads' | 'name' | 'updated'

export interface NpmSearchResult {
  objects: NpmPackageObject[]
  total: number
  time: string
}

export interface NpmPackageObject {
  package: NpmPackage
  score: NpmScore
  searchScore: number
}

export interface NpmPackage {
  name: string
  scope?: string
  version: string
  description?: string
  keywords?: string[]
  date: string
  links: {
    npm?: string
    homepage?: string
    repository?: string
    bugs?: string
  }
  author?: {
    name?: string
    email?: string
    url?: string
    username?: string
  }
  publisher: {
    username: string
    email: string
  }
  maintainers: Array<{
    username: string
    email: string
  }>
}

export interface NpmScore {
  final: number
  detail: {
    quality: number
    popularity: number
    maintenance: number
  }
}

export interface NpmDownloadsResponse {
  downloads: number
  start: string
  end: string
  package: string
}
