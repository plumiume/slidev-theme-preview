<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NSpace, NDivider, NText, NButton, NIcon } from 'naive-ui'
import { RocketOutline } from '@vicons/ionicons5'
import { useThemesStore } from '@/stores/themes'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import ThemeGrid from '@/components/ThemeGrid.vue'
import type { SlidevTheme } from '@/types/theme'

const router = useRouter()
const themesStore = useThemesStore()

onMounted(() => {
  themesStore.fetchThemes()
})

const officialThemes = computed(() => themesStore.officialThemes)
const communityThemes = computed(() => themesStore.communityThemes)

function handleNavigate(route: 'preview' | 'detail', theme: SlidevTheme) {
  router.push({ name: route, params: { themeName: theme.id } })
}

function handleThemeClick(theme: SlidevTheme) {
  router.push({ name: 'detail', params: { themeName: theme.id } })
}
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <NSpace vertical align="center" :size="24">
        <h1 class="hero__title">
          Discover <span class="hero__highlight">Slidev</span> Themes
        </h1>
        <NText class="hero__subtitle" depth="3">
          Browse {{ themesStore.totalCount }}+ beautiful presentation themes for your next talk
        </NText>
        
        <SearchBar 
          :model-value="themesStore.searchQuery"
          placeholder="Search themes by name, author, or description..."
          @update:model-value="themesStore.setSearchQuery"
        />

        <NButton 
          type="primary" 
          size="large"
          tag="a"
          href="https://sli.dev/guide/theme-addon"
          target="_blank"
        >
          <template #icon>
            <NIcon :component="RocketOutline" />
          </template>
          Create Your Own Theme
        </NButton>
      </NSpace>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <FilterPanel
        :filter="themesStore.filter"
        :sort-option="themesStore.sortOption"
        :total-count="themesStore.totalCount"
        :filtered-count="themesStore.filteredThemes.length"
        @update:filter="themesStore.setFilter"
        @update:sort-option="themesStore.setSortOption"
      />

      <!-- Official Themes Section -->
      <section v-if="officialThemes.length > 0" class="theme-section">
        <NDivider title-placement="left">
          <NText strong style="font-size: 18px;">✨ Official Themes</NText>
        </NDivider>
        <ThemeGrid
          :themes="officialThemes"
          :loading="false"
          :focused-theme-id="themesStore.focusedThemeId"
          @theme-click="handleThemeClick"
          @theme-focus="(t) => themesStore.setFocusedTheme(t.id)"
          @theme-unfocus="() => themesStore.setFocusedTheme(null)"
          @navigate="handleNavigate"
        />
      </section>

      <!-- Community Themes Section -->
      <section class="theme-section">
        <NDivider title-placement="left">
          <NText strong style="font-size: 18px;">🌍 Community Themes</NText>
        </NDivider>
        <ThemeGrid
          :themes="communityThemes"
          :loading="themesStore.loading"
          :error="themesStore.error"
          :focused-theme-id="themesStore.focusedThemeId"
          @theme-click="handleThemeClick"
          @theme-focus="(t) => themesStore.setFocusedTheme(t.id)"
          @theme-unfocus="() => themesStore.setFocusedTheme(null)"
          @navigate="handleNavigate"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100%;
}

.hero {
  padding: 80px 24px;
  text-align: center;
  background: linear-gradient(180deg, transparent 0%, var(--n-color-modal) 100%);
}

.hero__title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.hero__highlight {
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__subtitle {
  font-size: clamp(16px, 2vw, 20px);
  max-width: 600px;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.theme-section {
  margin-top: 32px;
}
</style>
