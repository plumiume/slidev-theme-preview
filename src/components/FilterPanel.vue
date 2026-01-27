<script setup lang="ts">
import { NSpace, NCheckbox, NSelect, NButton, NIcon, NPopover } from 'naive-ui'
import { FunnelOutline, SwapVerticalOutline } from '@vicons/ionicons5'
import type { ThemeFilter, ThemeSortOption } from '@/types/theme'

const props = defineProps<{
  filter: ThemeFilter
  sortOption: ThemeSortOption
  totalCount: number
  filteredCount: number
}>()

const emit = defineEmits<{
  'update:filter': [filter: Partial<ThemeFilter>]
  'update:sortOption': [option: ThemeSortOption]
}>()

const sortOptions = [
  { label: 'Downloads', value: 'downloads' as const },
  { label: 'Name', value: 'name' as const },
  { label: 'Recently Updated', value: 'updated' as const }
]
</script>

<template>
  <div class="filter-panel">
    <NSpace align="center" justify="space-between" style="width: 100%;">
      <NSpace align="center" :size="16">
        <!-- Filter popover -->
        <NPopover trigger="click" placement="bottom-start">
          <template #trigger>
            <NButton quaternary>
              <template #icon>
                <NIcon :component="FunnelOutline" />
              </template>
              Filter
            </NButton>
          </template>
          <div class="filter-panel__popover">
            <NSpace vertical :size="12">
              <NCheckbox 
                :checked="filter.official"
                @update:checked="emit('update:filter', { official: $event })"
              >
                Official Themes
              </NCheckbox>
              <NCheckbox 
                :checked="filter.community"
                @update:checked="emit('update:filter', { community: $event })"
              >
                Community Themes
              </NCheckbox>
            </NSpace>
          </div>
        </NPopover>

        <!-- Sort -->
        <NSelect
          :value="sortOption"
          :options="sortOptions"
          style="width: 180px;"
          @update:value="emit('update:sortOption', $event)"
        >
          <template #arrow>
            <NIcon :component="SwapVerticalOutline" />
          </template>
        </NSelect>
      </NSpace>

      <!-- Count -->
      <span class="filter-panel__count">
        {{ filteredCount }} of {{ totalCount }} themes
      </span>
    </NSpace>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 16px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.filter-panel__popover {
  padding: 8px;
  min-width: 180px;
}

.filter-panel__count {
  font-size: 14px;
  color: var(--n-text-color-3);
}
</style>
