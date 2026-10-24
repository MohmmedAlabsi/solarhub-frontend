<script setup lang="ts">
import { Send, User as UserIcon } from 'lucide-vue-next'
import AdminModal from '../common/AdminModal.vue'
import FormField from '../../common/FormField.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { draft, errors, sending, reset, submit } = useAdminBroadcastForm()
const { users, fetchUsers, isLoading: loadingUsers } = useAdminUsers()
const formId = useId()
const userSearch = ref('')

watch(() => props.modelValue, open => {
  if (open) {
    reset()
    userSearch.value = ''
    if (draft.audience === 'specific' && !users.value.length) {
      fetchUsers()
    }
  }
})

watch(() => draft.audience, async (aud) => {
  if (aud === 'specific' && !users.value.length) {
    await fetchUsers()
  }
})

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return users.value
  const q = userSearch.value.trim().toLowerCase()
  return users.value.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.phone?.includes(q),
  )
})

async function save() {
  if (await submit()) {
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <AdminModal
    :model-value="modelValue"
    title="إرسال إشعار جديد"
    :icon="Send"
    max-width="xl"
    tinted
    :busy="sending"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form :id="formId" novalidate :aria-busy="sending" @submit.prevent="save">
      <fieldset :disabled="sending" class="flex min-w-0 flex-col gap-5">
        <FormField label="عنوان الإشعار" required :error="errors.title">
          <input
            v-model="draft.title"
            required
            maxlength="150"
            class="solar-input bg-[#f1f2ff]"
            placeholder="أدخل عنوان الإشعار..."
            :aria-invalid="!!errors.title"
          />
        </FormField>

        <FormField label="نص الإشعار" required :error="errors.content">
          <textarea
            v-model="draft.content"
            required
            maxlength="2000"
            rows="5"
            class="solar-input bg-[#f1f2ff]"
            placeholder="أدخل محتوى ونص الإشعار بالتفصيل..."
            :aria-invalid="!!errors.content"
          />
        </FormField>

        <FormField label="المستلمون المستهدفون" required :error="errors.audience">
          <select v-model="draft.audience" class="solar-input bg-[#f1f2ff]">
            <option v-for="(label, value) in audienceLabels" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </FormField>

        <FormField
          v-if="draft.audience === 'specific'"
          label="تحديد المستخدم المستهدف"
          required
          :error="errors.userId"
        >
          <div class="flex flex-col gap-2">
            <input
              v-model="userSearch"
              type="search"
              placeholder="ابحث باسم المستخدم أو البريد الإلكتروني أو الهاتف..."
              class="solar-input bg-white text-xs"
            />
            <select
              v-model="draft.userId"
              class="solar-input bg-[#f1f2ff]"
              :disabled="loadingUsers"
              :aria-invalid="!!errors.userId"
            >
              <option :value="null">
                {{ loadingUsers ? 'جارٍ تحميل قائمة المستخدمين...' : `-- اختر المستخدم (${filteredUsers.length} متاح) --` }}
              </option>
              <option v-for="u in filteredUsers" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.email || u.phone }})
              </option>
            </select>
          </div>
        </FormField>

        <p class="text-xs leading-6 text-solar-text-muted">
          {{ draft.audience === 'specific' ? 'سيتم إرسال هذا الإشعار مباشرة إلى الحساب المحدد.' : 'سيتم إرسال هذا الإشعار فوريًا إلى حسابات الفئة المستهدفة في المنظومة.' }}
        </p>
      </fieldset>
    </form>

    <template #footer>
      <button
        type="button"
        :disabled="sending"
        class="btn-outline"
        @click="emit('update:modelValue', false)"
      >
        إلغاء
      </button>
      <button
        type="submit"
        :form="formId"
        :disabled="sending"
        class="btn-dark"
      >
        <Send class="size-4 text-solar-yellow" />
        {{ sending ? 'جارٍ إرسال الإشعار...' : 'إرسال الإشعار' }}
      </button>
    </template>
  </AdminModal>
</template>
