import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SlidevTheme, ThemeFilter, ThemeSortOption } from '@/types/theme'
import { fetchThemesFromNpm } from '@/api/npm'

export const useThemesStore = defineStore('themes', () => {
  // State
  const themes = ref<SlidevTheme[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const filter = ref<ThemeFilter>({
    official: true,
    community: true
  })
  const sortOption = ref<ThemeSortOption>('downloads')
  const focusedThemeId = ref<string | null>(null)

  // Getters
  const filteredThemes = computed(() => {
    let result = [...themes.value]

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(theme =>
        theme.name.toLowerCase().includes(query) ||
        theme.description?.toLowerCase().includes(query) ||
        theme.author?.toLowerCase().includes(query)
      )
    }

    // Category filter
    result = result.filter(theme => {
      if (theme.isOfficial && !filter.value.official) return false
      if (!theme.isOfficial && !filter.value.community) return false
      return true
    })

    // Sort
    switch (sortOption.value) {
      case 'downloads':
        result.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'updated':
        result.sort((a, b) => 
          new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
        )
        break
    }

    return result
  })

  const officialThemes = computed(() => 
    filteredThemes.value.filter(t => t.isOfficial)
  )

  const communityThemes = computed(() => 
    filteredThemes.value.filter(t => !t.isOfficial)
  )

  const totalCount = computed(() => themes.value.length)

  // Actions
  async function fetchThemes() {
    if (themes.value.length > 0) return // Already fetched

    loading.value = true
    error.value = null

    try {
      themes.value = await fetchThemesFromNpm()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch themes'
      console.error('Failed to fetch themes:', e)
    } finally {
      loading.value = false
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setFilter(newFilter: Partial<ThemeFilter>) {
    filter.value = { ...filter.value, ...newFilter }
  }

  function setSortOption(option: ThemeSortOption) {
    sortOption.value = option
  }

  function setFocusedTheme(themeId: string | null) {
    focusedThemeId.value = themeId
  }

  function getThemeByName(name: string): SlidevTheme | undefined {
    return themes.value.find(t => 
      t.name === name || 
      t.packageName === name ||
      t.packageName === `slidev-theme-${name}` ||
      t.packageName === `@slidev/theme-${name}`
    )
  }

  return {
    // State
    themes,
    loading,
    error,
    searchQuery,
    filter,
    sortOption,
    focusedThemeId,
    // Getters
    filteredThemes,
    officialThemes,
    communityThemes,
    totalCount,
    // Actions
    fetchThemes,
    setSearchQuery,
    setFilter,
    setSortOption,
    setFocusedTheme,
    getThemeByName
  }
})
