<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center text-center mb-6 sm:mb-8">
    <!-- شعار سولار هب المعتمد في أعلى بطاقات المصادقة -->
    <NuxtLink to="/" class="mb-4 inline-block transition-transform hover:scale-105" title="العودة للرئيسية">
      <img
        src="/images/logo-expanded-trimmed.jpg"
        alt="Solar Hub"
        class="h-10 sm:h-12 w-auto object-contain"
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
