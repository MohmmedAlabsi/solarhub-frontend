import type { NuxtApp } from '#app'

/**
 * يدمج الطلبات المتزامنة لنفس المفتاح في طلب واحد: من يطلب أثناء وجود طلب جارٍ ينتظر نفس الوعد.
 * النطاق هو تطبيق Nuxt الحالي (طلب واحد على الخادم، وتبويب واحد في المتصفح)، فلا تُشارَك حالة
 * بين مستخدمين مختلفين أثناء SSR كما يحدث مع متغير على مستوى الوحدة.
 */
export function shareInflight<T>(nuxtApp: NuxtApp, key: string, run: () => Promise<T>): Promise<T> {
  const app = nuxtApp as NuxtApp & { __inflight?: Map<string, Promise<unknown>> }
  const pending = (app.__inflight ??= new Map())
  const existing = pending.get(key) as Promise<T> | undefined
  if (existing) return existing

  const promise = run().finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}
