import { ref, computed, onMounted } from 'vue'
import type {
  SupplierSettlementItem,
  SupplierPayoutStatus,
  SupplierFinanceSummary,
  WithdrawRequestInput,
} from '~/types/supplier-finance'

export function useSupplierFinance() {
  const { $api } = useNuxtApp()

  const settlements = ref<SupplierSettlementItem[]>([])
  const loading = ref(false)
  const isWithdrawing = ref(false)
  const errorMessage = ref('')
  const noticeMessage = ref('')
  const searchQuery = ref('')
  const statusFilter = ref<string>('all')
  const periodFilter = ref<string>('all')
  const currentPage = ref(1)
  const perPage = ref(6)

  let noticeTimer: ReturnType<typeof setTimeout> | undefined
  const showNotice = (msg: string) => {
    noticeMessage.value = msg
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      noticeMessage.value = ''
    }, 4000)
  }

  function formatArabicDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '–'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('ar-YE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const fetchSettlements = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      let res: any
      try {
        res = await $api<any>('/my/store-payouts')
      } catch (err: any) {
        // Fallback to /store_payouts if /my/store-payouts route cache hasn't refreshed
        res = await $api<any>('/store_payouts')
      }

      const apiData = Array.isArray(res) ? res : res?.data || []
      if (Array.isArray(apiData)) {
        settlements.value = apiData.map((item: any, index: number) => {
          const rawGross = Number(item.total_amount ?? item.amount ?? 0)
          const rate = Number(item.commission_rate ?? 5)
          const rawComm = Number(item.commission_amount ?? (rawGross * rate) / 100)
          const rawNet = Number(item.net_amount ?? rawGross - rawComm)

          let displayStatus: SupplierPayoutStatus = 'completed'
          if (item.status === 'pending') displayStatus = 'pending'
          else if (item.status === 'failed') displayStatus = 'failed'

          let note = ''
          let dateLabel = item.paid_at ? formatArabicDate(item.paid_at) : '–'
          if (displayStatus === 'pending') {
            note = 'مجدول في دورة التحويل القادمة'
            dateLabel = '– (قيد المعالجة)'
          } else if (displayStatus === 'failed') {
            note = 'خطأ في معالجة التحويل'
            dateLabel = '– (فشل التحويل)'
          }

          const order = item.order_store?.order || item.orderStore?.order || {}
          const userWallet = item.user_wallet || item.userWallet || {}
          const walletProvider = userWallet.wallet_provider || userWallet.walletProvider || {}

          return {
            id: item.id || index + 1,
            orderStoreId: item.order_store_id,
            orderNumber: item.order_number || order.order_number || `#ORD-${item.order_store_id || index + 1}`,
            orderDate: item.order_date
              ? new Date(item.order_date).toISOString().split('T')[0]
              : item.created_at
                ? new Date(item.created_at).toISOString().split('T')[0]
                : '–',
            grossAmount: rawGross,
            commissionRate: rate,
            commissionAmount: -Math.abs(rawComm),
            netPayout: rawNet,
            status: displayStatus,
            payoutDate: dateLabel,
            payoutNote: note,
            transferReference: item.transfer_reference || '–',
            bankOrWalletName:
              item.bank_or_wallet ||
              walletProvider.name_ar ||
              walletProvider.name ||
              'محفظة إلكترونية معتمدة',
          }
        })
      } else {
        settlements.value = []
      }
    } catch (err: any) {
      console.error('Failed to load store payouts/settlements:', err)
      settlements.value = []
      errorMessage.value = err?.data?.message || 'تعذر الاتصال بالخادم لجلب المستحقات المالية.'
    } finally {
      loading.value = false
    }
  }

  const filteredSettlements = computed(() => {
    return settlements.value.filter((item) => {
      const query = searchQuery.value.trim().toLowerCase()
      const matchesSearch =
        !query ||
        item.orderNumber.toLowerCase().includes(query) ||
        item.payoutDate.toLowerCase().includes(query) ||
        (item.transferReference && item.transferReference.toLowerCase().includes(query)) ||
        item.bankOrWalletName.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter.value === 'all' || item.status === statusFilter.value

      const matchesPeriod =
        periodFilter.value === 'all' ||
        (item.orderDate && item.orderDate.startsWith(periodFilter.value))

      return matchesSearch && matchesStatus && matchesPeriod
    })
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredSettlements.value.length / perPage.value) || 1
  })

  const paginatedSettlements = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredSettlements.value.slice(start, start + perPage.value)
  })

  const financialSummary = computed<SupplierFinanceSummary>(() => {
    const list = settlements.value
    const totalSettled = list
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.netPayout, 0)
    const totalPending = list
      .filter((s) => s.status === 'pending')
      .reduce((sum, s) => sum + s.netPayout, 0)
    const totalCommissions = list.reduce((sum, s) => sum + Math.abs(s.commissionAmount), 0)
    const netAvailable = totalSettled

    return {
      totalSettled: Math.round(totalSettled * 100) / 100,
      totalPending: Math.round(totalPending * 100) / 100,
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      netAvailable: Math.round(netAvailable * 100) / 100,
      settlementsCount: list.length,
    }
  })

  const formatCurrency = (val: number, includeCurrency = false): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0)
    return includeCurrency ? `${formatted} ر.س` : formatted
  }

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const requestWithdraw = async (input: WithdrawRequestInput): Promise<boolean> => {
    isWithdrawing.value = true
    try {
      try {
        await $api<any>('/my/store-payouts/request', {
          method: 'POST',
          body: {
            amount: input.amount,
            notes: input.notes || undefined,
          },
        })
      } catch (e: any) {
        await $api<any>('/store_payouts', {
          method: 'POST',
          body: {
            amount: input.amount,
            notes: input.notes || undefined,
          },
        })
      }
      showNotice('تم إرسال طلب سحب المستحقات بنجاح، جاري مراجعة الطلب وتحويل المبلغ.')
      await fetchSettlements()
      return true
    } catch (err: any) {
      console.error('Failed to submit withdraw request:', err)
      const msg = err?.data?.message || 'حدث خطأ أثناء رفع طلب السحب. يرجى المحاولة لاحقاً.'
      showNotice(msg)
      return false
    } finally {
      isWithdrawing.value = false
    }
  }

  const exportSettlements = () => {
    if (settlements.value.length === 0) {
      showNotice('لا توجد بيانات متاحة للتصدير.')
      return
    }

    const headers = [
      'رقم الطلب',
      'تاريخ الطلب',
      'إجمالي المبيعات',
      'عمولة المنصة',
      'صافي المستحق',
      'الحالة',
      'تاريخ التحويل',
      'رقم الحوالة',
      'الحساب البنكي / المحفظة',
    ]

    const rows = settlements.value.map((item) => [
      `"${item.orderNumber}"`,
      `"${item.orderDate}"`,
      item.grossAmount,
      item.commissionAmount,
      item.netPayout,
      `"${item.status}"`,
      `"${item.payoutDate}"`,
      `"${item.transferReference || '–'}"`,
      `"${item.bankOrWalletName}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `كشف_مستحقات_المتجر_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showNotice('تم تصدير كشف الحساب بنجاح.')
  }

  onMounted(() => {
    fetchSettlements()
  })

  return {
    settlements,
    financialSummary,
    loading,
    isWithdrawing,
    errorMessage,
    noticeMessage,
    searchQuery,
    statusFilter,
    periodFilter,
    currentPage,
    totalPages,
    perPage,
    filteredSettlements,
    paginatedSettlements,
    fetchSettlements,
    formatCurrency,
    changePage,
    requestWithdraw,
    exportSettlements,
    exportStatement: exportSettlements,
  }
}
