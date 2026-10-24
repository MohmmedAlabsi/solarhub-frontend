<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { isDark, initTheme } = useTheme()

useHead({
  htmlAttrs: {
    class: computed(() => (isDark.value ? 'dark' : '')),
    lang: 'ar',
    dir: 'rtl',
  },
})

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>