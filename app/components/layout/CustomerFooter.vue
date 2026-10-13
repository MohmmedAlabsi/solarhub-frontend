<script setup lang="ts">
const emit = defineEmits<{ unavailable: [label: string] }>()
</script>
<template>
  <footer class="flex flex-col-reverse gap-4 bg-[#24445f] px-5 py-5 text-xs text-[#d4dde5] sm:flex-row sm:items-center sm:justify-between">
    <nav class="flex flex-wrap gap-5" aria-label="روابط التذييل"><button type="button" @click="emit('unavailable', 'شروط الخدمة')">شروط الخدمة</button><button type="button" @click="emit('unavailable', 'سياسة الخصوصية')">سياسة الخصوصية</button><button type="button" @click="emit('unavailable', 'الدعم الفني')">الدعم الفني</button></nav>
    <p>© 2025 سولار هب (Solar Hub). جميع الحقوق محفوظة.</p>
  </footer>
</template>
