/**
 * إبطال التوكن على الخادم بعد الخروج، في الخلفية (الواجهة تكون قد مسحت الجلسة وانتقلت لصفحة الدخول).
 * إذا فشل الطلب (شبكة أو خطأ خادم) نعيد المحاولة مرة واحدة بعد ثانية، ليُلغى التوكن خلال 5 ثوانٍ حتى مع إعادة المحاولة.
 * 401 يعني أن التوكن غير صالح أصلاً، فلا داعي للإعادة.
 */
export async function revokeTokenInBackground(send: () => Promise<unknown>, retryDelayMs = 1000): Promise<void> {
  try {
    await send()
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode ?? err?.response?.status
    if (status === 401) return
    await new Promise(resolve => setTimeout(resolve, retryDelayMs))
    await send().catch(() => {})
  }
}
