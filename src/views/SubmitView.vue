<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NSpace, NButton, NIcon, NText, NCard, NInput, 
  NForm, NFormItem, NAlert, NDivider, NSteps, NStep
} from 'naive-ui'
import { 
  ArrowBackOutline, 
  LogoGithub, 
  RocketOutline
} from '@vicons/ionicons5'

const router = useRouter()

const formValue = ref({
  npmPackage: '',
  githubRepo: '',
  email: ''
})

const submitted = ref(false)

function goBack() {
  router.back()
}

function handleSubmit() {
  // In a real app, this would send to a backend or create a GitHub issue
  console.log('Submitting theme:', formValue.value)
  submitted.value = true
}
</script>

<template>
  <div class="submit-view">
    <NButton quaternary @click="goBack" style="margin-bottom: 24px;">
      <template #icon>
        <NIcon :component="ArrowBackOutline" />
      </template>
      Back to Gallery
    </NButton>

    <!-- Hero -->
    <div class="submit-view__hero">
      <NSpace vertical align="center" :size="16">
        <NText style="font-size: 48px;">🎨</NText>
        <h1 class="submit-view__title">Share Your Theme</h1>
        <NText depth="3" style="font-size: 16px; text-align: center; max-width: 600px;">
          Created an awesome Slidev theme? Submit it here to share with the community!
          We welcome all contributions.
        </NText>
      </NSpace>
    </div>

    <!-- Steps guide -->
    <NCard class="submit-view__guide" title="How to Submit Your Theme">
      <NSteps :current="1" vertical>
        <NStep title="Create Your Theme" description="Follow the official Slidev theme development guide to create your theme.">
          <NButton 
            text 
            type="primary"
            tag="a"
            href="https://sli.dev/guide/theme-addon"
            target="_blank"
          >
            Read the Theme Guide →
          </NButton>
        </NStep>
        <NStep title="Publish to npm" description="Publish your theme to npm with the keyword 'slidev-theme'.">
          <NCard size="small" style="font-family: monospace; background: var(--n-color-modal);">
            "keywords": ["slidev-theme", "slidev"]
          </NCard>
        </NStep>
        <NStep title="Add Screenshots" description="Place screenshots in /screenshots/ folder or configure in package.json (slidev.screenshots).">
          <NCard size="small" style="font-family: monospace; background: var(--n-color-modal);">
            screenshots/01.png, 02.png, ...
          </NCard>
        </NStep>
        <NStep title="Auto-Discovery" description="Your theme will be automatically discovered! This gallery fetches themes from npm in real-time." />
      </NSteps>
    </NCard>

    <NDivider>Or submit directly</NDivider>

    <!-- Submit form -->
    <NCard v-if="!submitted" class="submit-view__form">
      <NForm :model="formValue" label-placement="top">
        <NFormItem label="npm Package Name" path="npmPackage">
          <NInput 
            v-model:value="formValue.npmPackage"
            placeholder="e.g., slidev-theme-awesome"
          />
        </NFormItem>
        <NFormItem label="GitHub Repository (optional)" path="githubRepo">
          <NInput 
            v-model:value="formValue.githubRepo"
            placeholder="e.g., https://github.com/user/slidev-theme-awesome"
          />
        </NFormItem>
        <NFormItem label="Contact Email (optional)" path="email">
          <NInput 
            v-model:value="formValue.email"
            placeholder="your@email.com"
          />
        </NFormItem>
        <NFormItem>
          <NButton type="primary" @click="handleSubmit" :disabled="!formValue.npmPackage">
            <template #icon>
              <NIcon :component="RocketOutline" />
            </template>
            Submit Theme
          </NButton>
        </NFormItem>
      </NForm>
    </NCard>

    <!-- Success message -->
    <NAlert v-else type="success" title="Thank you for your submission!">
      <NSpace vertical :size="8">
        <NText>
          Your theme has been submitted for review. If it's already on npm with the 
          correct keywords, it should appear in the gallery automatically.
        </NText>
        <NButton type="primary" @click="router.push('/')">
          Back to Gallery
        </NButton>
      </NSpace>
    </NAlert>

    <!-- Alternative: GitHub Issue -->
    <NCard class="submit-view__github" style="margin-top: 24px;">
      <NSpace align="center" :size="16">
        <NIcon :component="LogoGithub" size="32" />
        <NSpace vertical :size="4">
          <NText strong>Prefer GitHub?</NText>
          <NText depth="3">
            You can also open an issue on our repository to submit your theme.
          </NText>
        </NSpace>
        <NButton 
          tag="a"
          href="https://github.com/plumiume/slidev-theme-preview/issues/new?template=theme-submission.md"
          target="_blank"
        >
          Open Issue
        </NButton>
      </NSpace>
    </NCard>
  </div>
</template>

<style scoped>
.submit-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.submit-view__hero {
  text-align: center;
  margin-bottom: 48px;
}

.submit-view__title {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.submit-view__guide {
  margin-bottom: 32px;
}

.submit-view__form {
  max-width: 500px;
  margin: 0 auto;
}

.submit-view__github {
  background: var(--n-color-modal);
}
</style>
