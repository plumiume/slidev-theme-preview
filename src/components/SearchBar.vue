<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { useDebounceFn } from '@/composables/useDebounce'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

const debouncedEmit = useDebounceFn((value: string) => {
  emit('update:modelValue', value)
}, 300)

function handleInput(value: string) {
  localValue.value = value
  debouncedEmit(value)
}

function handleClear() {
  localValue.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search-bar">
    <NInput
      :value="localValue"
      :placeholder="placeholder || 'Search themes...'"
      size="large"
      round
      clearable
      @update:value="handleInput"
      @clear="handleClear"
    >
      <template #prefix>
        <NIcon :component="SearchOutline" />
      </template>
    </NInput>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 500px;
}

.search-bar :deep(.n-input) {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.search-bar :deep(.n-input:focus-within) {
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
  transform: scale(1.02);
}
</style>
