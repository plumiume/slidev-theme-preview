<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NSpace, NButton, NIcon, NText, NSpin, NResult, NCard } from 'naive-ui'
import { ArrowBackOutline, OpenOutline, RefreshOutline } from '@vicons/ionicons5'
import { useThemesStore } from '@/stores/themes'
import type { SlidevTheme } from '@/types/theme'

const route = useRoute()
const router = useRouter()
const themesStore = useThemesStore()

const theme = ref<SlidevTheme | null>(null)
const loading = ref(true)
const iframeLoading = ref(true)

const themeName = computed(() => route.params.themeName as string)

// StackBlitz embed URL for live Slidev preview
const previewUrl = computed(() => {
  if (!theme.value) return ''
  // Use sli.dev's built-in demo or StackBlitz
  const themeId = theme.value.id
  return `https://stackblitz.com/edit/slidev-theme-${themeId}?embed=1&file=slides.md&view=preview`
})

// Fallback: use theme's demo URL if available
const fallbackUrl = computed(() => theme.value?.demoUrl)

onMounted(async () => {
  await themesStore.fetchThemes()
  loadTheme()
})

watch(themeName, loadTheme)

function loadTheme() {
  loading.value = true
  iframeLoading.value = true
  theme.value = themesStore.getThemeByName(themeName.value) || null
  loading.value = false
}

function handleIframeLoad() {
  iframeLoading.value = false
}

function goBack() {
  router.back()
}

function refreshPreview() {
  iframeLoading.value = true
  const iframe = document.querySelector('.preview-view__iframe') as HTMLIFrameElement
  if (iframe) {
    iframe.src = iframe.src
  }
}
</script>

<template>
  <div class="preview-view">
    <!-- Header -->
    <div class="preview-view__header">
      <NSpace align="center" justify="space-between" style="width: 100%;">
        <NSpace align="center" :size="16">
          <NButton quaternary @click="goBack">
            <template #icon>
              <NIcon :component="ArrowBackOutline" />
            </template>
            Back
          </NButton>
          <NText v-if="theme" strong style="font-size: 18px;">
            {{ theme.name }} Preview
          </NText>
        </NSpace>
        
        <NSpace :size="12">
          <NButton quaternary @click="refreshPreview">
            <template #icon>
              <NIcon :component="RefreshOutline" />
            </template>
            Refresh
          </NButton>
          <NButton 
            v-if="theme"
            type="primary"
            @click="router.push({ name: 'detail', params: { themeName: theme.id } })"
          >
            View Details
          </NButton>
          <NButton 
            v-if="fallbackUrl"
            secondary
            tag="a"
            :href="fallbackUrl"
            target="_blank"
          >
            <template #icon>
              <NIcon :component="OpenOutline" />
            </template>
            Open Demo
          </NButton>
        </NSpace>
      </NSpace>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="preview-view__loading">
      <NSpin size="large" />
    </div>

    <!-- Not found -->
    <NResult
      v-else-if="!theme"
      status="404"
      title="Theme Not Found"
      description="The theme you're looking for doesn't exist."
    >
      <template #footer>
        <NButton @click="router.push('/')">Go Home</NButton>
      </template>
    </NResult>

    <!-- Preview content -->
    <template v-else>
      <div class="preview-view__content">
        <!-- iframe loading indicator -->
        <div v-if="iframeLoading" class="preview-view__iframe-loading">
          <NSpin size="large" />
          <NText depth="3">Loading preview...</NText>
        </div>

        <!-- Preview iframe -->
        <iframe
          v-if="fallbackUrl || previewUrl"
          :src="fallbackUrl || previewUrl"
          class="preview-view__iframe"
          :class="{ 'preview-view__iframe--loading': iframeLoading }"
          @load="handleIframeLoad"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />

        <!-- No preview available -->
        <NCard v-else class="preview-view__no-preview">
          <NSpace vertical align="center" :size="16">
            <NText depth="2" style="font-size: 48px;">🎨</NText>
            <NText strong style="font-size: 18px;">No Live Preview Available</NText>
            <NText depth="3" style="text-align: center;">
              This theme doesn't have a live demo yet.<br/>
              You can still install it and try it locally!
            </NText>
            <NButton 
              type="primary"
              @click="router.push({ name: 'detail', params: { themeName: theme.id } })"
            >
              View Installation Instructions
            </NButton>
          </NSpace>
        </NCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.preview-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 120px); /* Header + Footer */
  min-height: 500px;
}

.preview-view__header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--n-border-color);
  flex-shrink: 0;
}

.preview-view__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-view__content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.preview-view__iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--n-color-modal);
  z-index: 1;
}

.preview-view__iframe {
  width: 100%;
  height: 100%;
  border: none;
  transition: opacity 0.3s ease;
}

.preview-view__iframe--loading {
  opacity: 0;
}

.preview-view__no-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 400px;
}
</style>
