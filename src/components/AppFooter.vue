<script setup lang="ts">
import { NText, NSpace, NIcon, NButton } from 'naive-ui'
import { HeartOutline } from '@vicons/ionicons5'
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <NSpace vertical align="center" :size="8">
        <NText depth="3" style="font-size: 14px;">
          Discover and explore Slidev presentation themes
        </NText>
        <NSpace align="center" :size="4">
          <NText depth="3" style="font-size: 12px;">
            Made with
          </NText>
          <NIcon :component="HeartOutline" color="#f43f5e" size="14" />
          <NText depth="3" style="font-size: 12px;">
            for the Slidev community
          </NText>
        </NSpace>
        <NSpace :size="16" style="margin-top: 8px;">
          <NButton 
            text 
            tag="a" 
            href="https://sli.dev" 
            target="_blank"
            style="font-size: 12px;"
          >
            Slidev Docs
          </NButton>
          <NButton 
            text 
            tag="a" 
            href="https://github.com/slidevjs/slidev" 
            target="_blank"
            style="font-size: 12px;"
          >
            Slidev GitHub
          </NButton>
          <NButton 
            text 
            tag="a" 
            href="https://github.com/plumiume/slidev-theme-preview" 
            target="_blank"
            style="font-size: 12px;"
          >
            This Project
          </NButton>
        </NSpace>
      </NSpace>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 32px 24px;
  border-top: 1px solid var(--n-border-color);
  margin-top: auto;
}

.app-footer__inner {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}
</style>
