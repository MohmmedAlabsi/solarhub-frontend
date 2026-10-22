<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Component } from 'vue'
const props=withDefaults(defineProps<{modelValue:boolean;title:string;subtitle?:string;icon?:Component;maxWidth?:'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl';tinted?:boolean;busy?:boolean}>(),{maxWidth:'2xl',tinted:false,busy:false})
const emit=defineEmits<{(e:'update:modelValue',value:boolean):void;(e:'close'):void}>()
const panel=ref<HTMLElement>(),overlay=ref<HTMLElement>(),titleId=useId()
let returnFocus:HTMLElement|null=null
let savedOverflow=''
const inertBefore=new Map<HTMLElement,boolean>()
const maxWidthClass=computed(()=>({'sm':'max-w-sm','md':'max-w-md','lg':'max-w-lg','xl':'max-w-xl','2xl':'max-w-2xl','3xl':'max-w-3xl','4xl':'max-w-4xl'}[props.maxWidth]))
function close(){if(props.busy)return;emit('update:modelValue',false);emit('close')}
function restore(){for(const [element,value] of inertBefore)element.inert=value;inertBefore.clear();document.body.style.overflow=savedOverflow}
watch(()=>props.modelValue,async open=>{
  if(open){
    returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null
    savedOverflow=document.body.style.overflow
    await nextTick()
    if(!props.modelValue)return
    for(const child of Array.from(document.body.children)){if(child instanceof HTMLElement&&overlay.value&&!child.contains(overlay.value)){inertBefore.set(child,child.inert);child.inert=true}}
    document.body.style.overflow='hidden'
    panel.value?.querySelector<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')?.focus({preventScroll:true})
  }else{restore();await nextTick();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else document.getElementById('admin-main')?.focus({preventScroll:true});returnFocus=null}
},{flush:'post'})
function handleKeydown(event:KeyboardEvent){
  if(!props.modelValue)return
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close()}
  if(event.key==='Tab'){
    const nodes=Array.from(panel.value?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')??[]).filter(e=>e.getClientRects().length>0)
    const first=nodes[0],last=nodes[nodes.length-1]
    if(!first){event.preventDefault();panel.value?.focus()}
    else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
}
onMounted(()=>window.addEventListener('keydown',handleKeydown,true))
onBeforeUnmount(()=>{window.removeEventListener('keydown',handleKeydown,true);if(props.modelValue||inertBefore.size)restore()})
</script>
<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" ref="overlay" class="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden p-3 sm:p-6" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-busy="busy" dir="rtl">
        <div class="fixed inset-0 bg-solar-navy-dark/60 backdrop-blur-sm transition-opacity" aria-hidden="true" @click="close" @wheel.prevent @touchmove.prevent />
        <div ref="panel" tabindex="-1" class="relative z-10 flex max-h-[92dvh] w-full min-w-0 flex-col rounded-2xl border border-solar-border-card bg-white p-5 shadow-2xl outline-none sm:p-7" :class="maxWidthClass">
          <div class="flex shrink-0 items-center justify-between gap-4 border-b border-solar-border-card pb-4" :class="tinted?'rounded-t-2xl bg-solar-bg-page -mx-5 -mt-5 px-5 pt-5 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7':''">
            <div class="flex min-w-0 items-center gap-3"><span v-if="icon" class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-yellow/20 text-solar-navy-dark"><component :is="icon" class="size-5" aria-hidden="true" /></span><div class="min-w-0"><h2 :id="titleId" class="text-base font-bold text-solar-text-heading sm:text-lg">{{ title }}</h2><p v-if="subtitle" class="mt-1 break-words text-xs text-solar-text-muted">{{ subtitle }}</p></div></div>
            <button type="button" :disabled="busy" class="flex size-8 shrink-0 items-center justify-center rounded-lg text-solar-text-muted transition-colors hover:bg-solar-bg-subtle focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:opacity-40" aria-label="إغلاق النافذة" @click="close"><X class="size-5" /></button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-5"><slot /></div>
          <div v-if="$slots.footer" class="mt-2 flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-solar-border-card pt-4"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
