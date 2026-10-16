<script setup lang="ts">
// Service requests in the customer menu are engineering service requests.
// Keep the existing entry URL compatible with bookmarks and project links.
definePageMeta({
  layout: 'customer',
  redirect: to => ({ path: '/customer/services/new', query: to.query, hash: to.hash }),
})
</script>

<template>
  <div />
</template>
