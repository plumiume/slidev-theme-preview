<script setup lang="ts">
import { NLayoutHeader, NIcon, NButton, NSpace } from 'naive-ui'
import { LogoGithub, AddCircleOutline, MoonOutline, SunnyOutline } from '@vicons/ionicons5'
import { RouterLink } from 'vue-router'

defineProps<{
  darkMode: boolean
}>()

const emit = defineEmits<{
  'update:darkMode': [value: boolean]
}>()
</script>

<template>
  <NLayoutHeader bordered class="app-header">
    <div class="app-header__inner">
      <!-- Logo -->
      <RouterLink to="/" class="app-header__logo">
        <span class="app-header__logo-icon">🎨</span>
        <span class="app-header__logo-text">Slidev Themes</span>
      </RouterLink>

      <!-- Actions -->
      <NSpace align="center" :size="12">
        <!-- Submit theme button -->
        <RouterLink to="/submit">
          <NButton type="primary" secondary>
            <template #icon>
              <NIcon :component="AddCircleOutline" />
            </template>
            Submit Theme
          </NButton>
        </RouterLink>

        <!-- GitHub link -->
        <NButton 
          quaternary
          circle
          tag="a"
          href="https://github.com/plumiume/slidev-theme-preview"
          target="_blank"
          rel="noopener"
        >
          <template #icon>
            <NIcon :component="LogoGithub" size="20" />
          </template>
        </NButton>

        <!-- Dark mode toggle -->
        <NButton 
          quaternary 
          circle
          @click="emit('update:darkMode', !darkMode)"
        >
          <template #icon>
            <NIcon :component="darkMode ? SunnyOutline : MoonOutline" size="20" />
          </template>
        </NButton>
      </NSpace>
    </div>
  </NLayoutHeader>
</template>

<style scoped>
.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.app-header__inner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
}

.app-header__logo:hover {
  opacity: 0.8;
}

.app-header__logo-icon {
  font-size: 28px;
}

.app-header__logo-text {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
