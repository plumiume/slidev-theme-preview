<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  NSpace, NButton, NIcon, NText, NSpin, NResult, 
  NCard, NTag, NStatistic, NDivider, NCarousel
} from 'naive-ui'
import { 
  ArrowBackOutline, 
  LogoGithub, 
  LogoNpm,
  OpenOutline,
  CopyOutline,
  CheckmarkOutline
} from '@vicons/ionicons5'
import { useThemesStore } from '@/stores/themes'
import { fetchThemeScreenshots } from '@/api/npm'
import type { SlidevTheme } from '@/types/theme'

const route = useRoute()
const router = useRouter()
const themesStore = useThemesStore()

const theme = ref<SlidevTheme | null>(null)
const loading = ref(true)
const copied = ref(false)
const screenshots = ref<string[]>([])
const screenshotsLoading = ref(false)

const themeName = computed(() => route.params.themeName as string)

const installCommand = computed(() => {
  if (!theme.value) return ''
  return `npm i ${theme.value.packageName}`
})

const usageCode = computed(() => {
  if (!theme.value) return ''
  return `---
theme: ${theme.value.id}
---

# Welcome to Slidev

Presentation slides for developers`
})

onMounted(async () => {
  await themesStore.fetchThemes()
  loadTheme()
})

watch(themeName, loadTheme)

async function loadTheme() {
  loading.value = true
  theme.value = themesStore.getThemeByName(themeName.value) || null
  
  // Fetch screenshots
  if (theme.value && !screenshotsLoading.value) {
    screenshotsLoading.value = true
    try {
      const fetched = await fetchThemeScreenshots(theme.value)
      screenshots.value = fetched
    } catch (e) {
      console.warn('Failed to load screenshots:', e)
    } finally {
      screenshotsLoading.value = false
    }
  }
  
  loading.value = false
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function goBack() {
  router.back()
}

function formatDownloads(count?: number): string {
  if (!count) return '0'
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="detail-view">
    <!-- Back button -->
    <NButton quaternary @click="goBack" style="margin-bottom: 24px;">
      <template #icon>
        <NIcon :component="ArrowBackOutline" />
      </template>
      Back to Gallery
    </NButton>

    <!-- Loading -->
    <div v-if="loading" class="detail-view__loading">
      <NSpin size="large" />
    </div>

    <!-- Not found -->
    <NResult
      v-else-if="!theme"
      status="404"
      title="Theme Not Found"
      description="The theme you're looking for doesn't exist or may have been removed."
    >
      <template #footer>
        <NButton @click="router.push('/')">Go Home</NButton>
      </template>
    </NResult>

    <!-- Theme detail -->
    <template v-else>
      <div class="detail-view__content">
        <!-- Header -->
        <div class="detail-view__header">
          <NSpace vertical :size="16">
            <NSpace align="center" :size="12">
              <h1 class="detail-view__title">{{ theme.name }}</h1>
              <NTag v-if="theme.isOfficial" type="success">Official</NTag>
            </NSpace>
            
            <NText depth="3" style="font-size: 16px;">
              {{ theme.description || 'No description available' }}
            </NText>

            <NSpace :size="16">
              <NButton 
                type="primary"
                @click="router.push({ name: 'preview', params: { themeName: theme.id } })"
              >
                <template #icon>
                  <NIcon :component="OpenOutline" />
                </template>
                Live Preview
              </NButton>
              <NButton 
                v-if="theme.repositoryUrl"
                secondary
                tag="a"
                :href="theme.repositoryUrl"
                target="_blank"
              >
                <template #icon>
                  <NIcon :component="LogoGithub" />
                </template>
                GitHub
              </NButton>
              <NButton 
                v-if="theme.npmUrl"
                secondary
                tag="a"
                :href="theme.npmUrl"
                target="_blank"
              >
                <template #icon>
                  <NIcon :component="LogoNpm" />
                </template>
                npm
              </NButton>
            </NSpace>
          </NSpace>
        </div>

        <!-- Stats -->
        <NSpace :size="48" style="margin: 32px 0;">
          <NStatistic label="Weekly Downloads" :value="formatDownloads(theme.downloads)" />
          <NStatistic label="Version" :value="theme.version || '-'" />
          <NStatistic label="Author" :value="theme.author || 'Unknown'" />
          <NStatistic label="Updated" :value="formatDate(theme.updatedAt)" />
        </NSpace>

        <NDivider />

        <!-- Installation -->
        <section class="detail-view__section">
          <h2>Installation</h2>
          <NCard class="detail-view__code-card">
            <NSpace justify="space-between" align="center">
              <code>{{ installCommand }}</code>
              <NButton 
                quaternary 
                circle
                @click="copyToClipboard(installCommand)"
              >
                <template #icon>
                  <NIcon :component="copied ? CheckmarkOutline : CopyOutline" />
                </template>
              </NButton>
            </NSpace>
          </NCard>
        </section>

        <!-- Usage -->
        <section class="detail-view__section">
          <h2>Usage</h2>
          <NText depth="3" style="margin-bottom: 12px; display: block;">
            Add the following to your slides.md frontmatter:
          </NText>
          <NCard class="detail-view__code-card">
            <pre><code>{{ usageCode }}</code></pre>
          </NCard>
        </section>

        <!-- Preview image -->
        <section v-if="screenshots.length > 0" class="detail-view__section">
          <h2>Preview</h2>
          <NSpin v-if="screenshotsLoading" />
          <NCarousel 
            v-else-if="screenshots.length > 1"
            :autoplay="true"
            :interval="4000"
            show-arrow
            class="detail-view__carousel"
          >
            <img 
              v-for="(screenshot, index) in screenshots"
              :key="index"
              :src="screenshot" 
              :alt="`${theme.name} screenshot ${index + 1}`"
              class="detail-view__preview-image"
            />
          </NCarousel>
          <img 
            v-else
            :src="screenshots[0]" 
            :alt="theme.name"
            class="detail-view__preview-image"
          />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.detail-view__loading {
  display: flex;
  justify-content: center;
  padding: 80px;
}

.detail-view__header {
  margin-bottom: 24px;
}

.detail-view__title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
}

.detail-view__section {
  margin: 32px 0;
}

.detail-view__section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.detail-view__code-card {
  background: var(--n-color-modal);
  font-family: 'Fira Code', monospace;
}

.detail-view__code-card pre {
  margin: 0;
  white-space: pre-wrap;
}

.detail-view__carousel {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.detail-view__preview-image {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}
</style>
