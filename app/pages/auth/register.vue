<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'إنشاء حساب جديد | سولار هب',
  meta: [
    { name: 'description', content: 'إنشاء حساب جديد كعميل أو مورد أو مهندس في منصة سولار هب.' },
  ],
})
</script>

<template>
  <div>
    <AuthRegisterForm />
  </div>
</template>
