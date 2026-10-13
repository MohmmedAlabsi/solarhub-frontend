<script setup lang="ts">defineProps<{ message: string }>()</script>
<template><Transition name="toast"><div v-if="message" class="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-[#142f49] px-5 py-3 text-sm font-medium text-white shadow-xl" role="status" aria-live="polite">{{ message }}</div></Transition></template>
<style scoped>.toast-enter-active,.toast-leave-active{transition:opacity .2s,transform .2s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translate(-50%,.5rem)}</style>
