<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  NConfigProvider, 
  NLayout, 
  NLayoutContent,
  darkTheme, 
  type GlobalThemeOverrides 
} from 'naive-ui'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const darkMode = ref(true)

const theme = computed(() => darkMode.value ? darkTheme : null)

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#10b981',
    primaryColorHover: '#059669',
    primaryColorPressed: '#047857',
    primaryColorSuppl: '#34d399',
    borderRadius: '8px'
  }
}

// Persist dark mode preference
onMounted(() => {
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) {
    darkMode.value = saved === 'true'
  } else {
    // Default to system preference
    darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

function handleDarkModeChange(value: boolean) {
  darkMode.value = value
  localStorage.setItem('darkMode', String(value))
}
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NLayout class="app-layout" :class="{ 'dark-mode': darkMode }">
      <AppHeader 
        :dark-mode="darkMode" 
        @update:dark-mode="handleDarkModeChange" 
      />
      <NLayoutContent class="app-content">
        <RouterView />
      </NLayoutContent>
      <AppFooter />
    </NLayout>
  </NConfigProvider>
</template>

<style>
:root {
  --app-bg-light: #ffffff;
  --app-bg-dark: #18181c;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-bg-light);
  transition: background 0.3s ease;
}

.app-layout.dark-mode {
  background: var(--app-bg-dark);
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Smooth page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}
</style>
