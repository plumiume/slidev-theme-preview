<script setup lang="ts">
import { computed } from 'vue'
import { NGrid, NGi, NSpin, NEmpty, NResult } from 'naive-ui'
import ThemeCard from './ThemeCard.vue'
import type { SlidevTheme } from '@/types/theme'

const props = defineProps<{
  themes: SlidevTheme[]
  loading?: boolean
  error?: string | null
  focusedThemeId?: string | null
}>()

const emit = defineEmits<{
  themeClick: [theme: SlidevTheme]
  themeFocus: [theme: SlidevTheme]
  themeUnfocus: []
  navigate: [route: 'preview' | 'detail', theme: SlidevTheme]
}>()

const gridCols = computed(() => {
  return '1 s:2 m:3 l:4 xl:5'
})
</script>

<template>
  <div class="theme-grid">
    <!-- Loading state -->
    <div v-if="loading" class="theme-grid__loading">
      <NSpin size="large" />
      <p>Loading themes from npm...</p>
    </div>

    <!-- Error state -->
    <NResult
      v-else-if="error"
      status="error"
      title="Failed to load themes"
      :description="error"
    />

    <!-- Empty state -->
    <NEmpty
      v-else-if="themes.length === 0"
      description="No themes found"
      size="large"
    />

    <!-- Grid -->
    <NGrid
      v-else
      :cols="gridCols"
      :x-gap="20"
      :y-gap="20"
      responsive="screen"
    >
      <NGi v-for="theme in themes" :key="theme.packageName">
        <ThemeCard
          :theme="theme"
          :focused="focusedThemeId === theme.id"
          @click="emit('themeClick', theme)"
          @focus="emit('themeFocus', theme)"
          @unfocus="emit('themeUnfocus')"
          @navigate="(route, t) => emit('navigate', route, t)"
        />
      </NGi>
    </NGrid>
  </div>
</template>

<style scoped>
.theme-grid {
  width: 100%;
}

.theme-grid__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: var(--n-text-color-3);
}
</style>
