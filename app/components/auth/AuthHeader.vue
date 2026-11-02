<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
const { isDark } = useTheme()
</script>

<template>
  <div class="flex flex-col items-center text-center mb-6 sm:mb-8">
    <!-- شعار سولار هب المعتمد الشفاف المتوافق مع الوضعين الداكن والنهاري -->
    <NuxtLink to="/" class="mb-4 inline-block transition-transform hover:scale-105" title="العودة للرئيسية">
      <img
        v-if="!isDark"
        src="/images/logo-expanded-dark-transparent.png"
        alt="Solar Hub"
        class="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
      />
      <img
        v-else
        src="/images/logo-expanded-transparent.png"
        alt="Solar Hub"
        class="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
      />
    </NuxtLink>

    <h1 class="text-2xl sm:text-3xl font-black text-solar-text-heading tracking-tight mb-2">
      {{ title }}
    </h1>

    <p v-if="subtitle" class="text-xs sm:text-sm text-solar-text-muted max-w-sm leading-relaxed">
      {{ subtitle }}
    </p>
  </div>
</template>
