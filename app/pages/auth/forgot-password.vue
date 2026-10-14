<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'استعادة كلمة المرور | سولار هب',
  meta: [
    { name: 'description', content: 'استعادة كلمة المرور لحسابك في منصة سولار هب بسهولة وأمان.' },
  ],
})
</script>

<template>
  <div>
    <AuthForgotPasswordForm />
  </div>
</template>
