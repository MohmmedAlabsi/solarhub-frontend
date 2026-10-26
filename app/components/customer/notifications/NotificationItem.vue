<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock,
  Send,
} from 'lucide-vue-next'
import type { CustomerApiNotification } from '../../../composables/useCustomerNotifications'

const props = withDefaults(
  defineProps<{
    notification: CustomerApiNotification
    direction: 'inbox' | 'sent'
    actionAvailable?: boolean
    busy?: boolean
    reading?: boolean
  }>(),
  {
    actionAvailable: false,
    busy: false,
    reading: false,
  },
)

const emit = defineEmits<{
  activate: [notification: CustomerApiNotification]
  read: [notification: CustomerApiNotification]
}>()

const headingId = computed(() =>
  `notification-${props.direction}-${props.notification.id}`,
)

const isInbox = computed(() =>
  props.direction === 'inbox',
)

const isUnread = computed(() =>
  isInbox.value && !props.notification.is_read,
)

const title = computed(() =>
  props.notification.title?.trim() || 'إشعار',
)

const body = computed(() =>
  props.notification.body?.trim() || '',
)

const senderName = computed(() => {
  const sender = props.notification.sender

  if (sender?.name?.trim()) {
    return sender.name.trim()
  }

  if (sender?.type === 'system') {
    return 'النظام'
  }

  return 'غير متاح'
})

const recipientCount = computed<number | null>(() => {
  const value = Number(props.notification.recipient_count)

  return Number.isSafeInteger(value) && value > 0
    ? value
    : null
})

const createdDate = computed<Date | null>(() => {
  const value = props.notification.created_at

  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
})

const dateTime = computed(() =>
  createdDate.value?.toISOString(),
)

const timeLabel = computed(() => {
  if (!createdDate.value) {
    return 'التاريخ غير متاح'
  }

  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(createdDate.value)
})

function activateNotification() {
  if (
    !props.actionAvailable
    || props.busy
    || props.reading
  ) {
    return
  }

  emit('activate', props.notification)
}

function markNotificationRead() {
  if (
    !isUnread.value
    || props.busy
    || props.reading
  ) {
    return
  }

  emit('read', props.notification)
}
</script>

<template>
  <li
    class="solar-card flex min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6"
    :class="isUnread ? 'border-amber-300' : ''"
    :aria-labelledby="headingId"
    :aria-busy="reading"
  >
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-xl"
      :class="
        isInbox
          ? 'bg-amber-50 text-amber-800'
          : 'bg-solar-status-info-bg text-solar-navy'
      "
    >
      <Bell
        v-if="isInbox"
        class="size-6"
        aria-hidden="true"
      />

      <Send
        v-else
        class="size-6"
        aria-hidden="true"
      />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700"
        >
          {{ isInbox ? 'إشعار وارد' : 'سجل صادر' }}
        </span>

        <span
          v-if="isUnread"
          class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800"
        >
          <span
            class="size-1.5 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          غير مقروء
        </span>

        <span
          v-else-if="isInbox"
          class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-800"
        >
          <CheckCheck class="size-3" aria-hidden="true" />
          مقروء
        </span>
      </div>

      <h2
        :id="headingId"
        class="mt-3 break-words text-base font-bold leading-7 text-solar-text-heading"
      >
        {{ title }}
      </h2>

      <p
        v-if="body"
        class="mt-2 whitespace-pre-line break-words text-sm leading-7 text-solar-text-body"
      >
        {{ body }}
      </p>

      <div
        class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-solar-text-muted"
      >
        <p v-if="isInbox">
          المرسل: {{ senderName }}
        </p>

        <p v-else-if="recipientCount !== null">
          عدد المستلمين: {{ recipientCount }}
        </p>

        <p class="inline-flex items-center gap-1.5">
          <Clock class="size-3.5 shrink-0" aria-hidden="true" />

          <time v-if="dateTime" :datetime="dateTime">
            {{ timeLabel }}
          </time>

          <span v-else>{{ timeLabel }}</span>
        </p>
      </div>

      <div
        v-if="actionAvailable || isUnread"
        class="mt-4 flex flex-wrap items-center gap-3"
      >
        <button
          v-if="actionAvailable"
          type="button"
          :disabled="busy || reading"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-solar-status-info-bg px-4 py-2 text-xs font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-not-allowed disabled:opacity-50"
          @click="activateNotification"
        >
          عرض التفاصيل
          <ArrowLeft class="size-3.5" aria-hidden="true" />
        </button>

        <button
          v-if="isUnread"
          type="button"
          :disabled="busy || reading"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-solar-border-card bg-white px-4 py-2 text-xs font-bold text-solar-text-heading focus-visible:ring-2 focus-visible:ring-solar-yellow disabled:cursor-not-allowed disabled:opacity-50"
          @click="markNotificationRead"
        >
          <CheckCheck class="size-3.5" aria-hidden="true" />

          {{ reading ? 'جارٍ الحفظ…' : 'تحديد كمقروء' }}
        </button>
      </div>
    </div>
  </li>
</template>