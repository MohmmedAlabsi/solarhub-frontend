<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'التحقق من البريد الإلكتروني | سولار هب',
  meta: [
    { name: 'description', content: 'أدخل رمز التحقق لتأكيد بريدك الإلكتروني والدخول إلى منصة سولار هب.' },
  ],
})
</script>

<template>
  <div>
    <AuthVerifyEmailForm />
  </div>
</template>
