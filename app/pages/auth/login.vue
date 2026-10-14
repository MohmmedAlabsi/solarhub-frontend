<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'تسجيل الدخول | سولار هب',
  meta: [
    { name: 'description', content: 'تسجيل الدخول إلى حسابك في منصة سولار هب لحلول ومنظومات الطاقة الشمسية.' },
  ],
})
</script>

<template>
  <div>
    <AuthLoginForm />
  </div>
</template>
