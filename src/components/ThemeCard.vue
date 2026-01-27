<script setup lang="ts">
import { computed, ref } from 'vue'
import { NCard, NText, NTag, NIcon, NSkeleton, NSpace } from 'naive-ui'
import { 
  DownloadOutline, 
  LogoGithub, 
  LogoNpm, 
  OpenOutline,
  HeartOutline
} from '@vicons/ionicons5'
import type { SlidevTheme } from '@/types/theme'

const props = defineProps<{
  theme: SlidevTheme
  focused?: boolean
}>()

const emit = defineEmits<{
  focus: [theme: SlidevTheme]
  unfocus: []
  navigate: [route: 'preview' | 'detail', theme: SlidevTheme]
}>()

const isHovered = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

const formattedDownloads = computed(() => {
  const downloads = props.theme.downloads ?? 0
  if (downloads >= 1000000) return `${(downloads / 1000000).toFixed(1)}M`
  if (downloads >= 1000) return `${(downloads / 1000).toFixed(1)}K`
  return downloads.toString()
})

const cardStyle = computed(() => ({
  '--hover-scale': props.focused ? '1.02' : '1',
  '--shadow-intensity': props.focused ? '0 8px 32px rgba(0, 128, 128, 0.2)' : 'none'
}))

function handleMouseEnter() {
  isHovered.value = true
  emit('focus', props.theme)
}

function handleMouseLeave() {
  isHovered.value = false
  emit('unfocus')
}

function handleImageLoad() {
  imageLoaded.value = true
}

function handleImageError() {
  imageError.value = true
  imageLoaded.value = true
}
</script>

<template>
  <NCard
    class="theme-card"
    :class="{ 'theme-card--focused': focused, 'theme-card--hovered': isHovered }"
    :style="cardStyle"
    hoverable
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Thumbnail -->
    <div class="theme-card__thumbnail">
      <NSkeleton v-if="!imageLoaded && !imageError" height="160px" />
      <img 
        v-if="theme.thumbnailUrl && !imageError"
        v-show="imageLoaded"
        :src="theme.thumbnailUrl" 
        :alt="theme.name"
        class="theme-card__image"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      <div v-if="imageError || !theme.thumbnailUrl" class="theme-card__placeholder">
        <NText depth="3">{{ theme.name.charAt(0).toUpperCase() }}</NText>
      </div>
      
      <!-- Official badge -->
      <NTag 
        v-if="theme.isOfficial" 
        type="success" 
        size="small" 
        class="theme-card__badge"
      >
        Official
      </NTag>
    </div>

    <!-- Content -->
    <div class="theme-card__content">
      <div class="theme-card__header">
        <NText tag="h3" class="theme-card__title">
          {{ theme.name }}
        </NText>
        <NSpace size="small" align="center">
          <NIcon :component="DownloadOutline" size="14" />
          <NText depth="3" style="font-size: 12px;">{{ formattedDownloads }}</NText>
        </NSpace>
      </div>

      <NText 
        v-if="theme.description" 
        depth="3" 
        class="theme-card__description"
      >
        {{ theme.description }}
      </NText>

      <div class="theme-card__meta">
        <NText depth="3" style="font-size: 12px;">
          by {{ theme.author || 'Unknown' }}
        </NText>
        <NText v-if="theme.version" depth="3" style="font-size: 12px;">
          v{{ theme.version }}
        </NText>
      </div>
    </div>

    <!-- Actions (visible on hover) -->
    <div class="theme-card__actions" :class="{ 'theme-card__actions--visible': isHovered }">
      <button 
        class="theme-card__action-btn theme-card__action-btn--primary"
        @click.stop="emit('navigate', 'preview', theme)"
        title="Preview"
      >
        <NIcon :component="OpenOutline" size="18" />
      </button>
      <a 
        v-if="theme.repositoryUrl"
        :href="theme.repositoryUrl" 
        target="_blank"
        rel="noopener"
        class="theme-card__action-btn"
        @click.stop
        title="GitHub"
      >
        <NIcon :component="LogoGithub" size="18" />
      </a>
      <a 
        v-if="theme.npmUrl"
        :href="theme.npmUrl" 
        target="_blank"
        rel="noopener"
        class="theme-card__action-btn"
        @click.stop
        title="npm"
      >
        <NIcon :component="LogoNpm" size="18" />
      </a>
      <button 
        class="theme-card__action-btn"
        @click.stop
        title="Add to favorites"
      >
        <NIcon :component="HeartOutline" size="18" />
      </button>
    </div>
  </NCard>
</template>

<style scoped>
.theme-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 12px;
}

.theme-card--focused,
.theme-card--hovered {
  transform: translateY(-4px) scale(var(--hover-scale));
  box-shadow: var(--shadow-intensity);
}

.theme-card__thumbnail {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}

.theme-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.theme-card--hovered .theme-card__image {
  transform: scale(1.05);
}

.theme-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  opacity: 0.8;
}

.theme-card__badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.theme-card__content {
  padding: 16px;
}

.theme-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.theme-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.theme-card__description {
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.theme-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-card__actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-card__actions--visible {
  transform: translateY(0);
}

.theme-card__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.theme-card__action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1);
}

.theme-card__action-btn--primary {
  background: #10b981;
}

.theme-card__action-btn--primary:hover {
  background: #059669;
}
</style>
