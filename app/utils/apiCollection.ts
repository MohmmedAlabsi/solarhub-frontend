interface ApiRecord {
  id: number | string
}

interface PaginatedCollection<T> {
  data: T[]
  last_page?: number
  meta?: {
    last_page?: number
  }
}

interface ApiCollectionResponse<T> {
  status: string
  message?: string
  data: T[] | PaginatedCollection<T>
  meta?: {
    last_page?: number
  }
}

interface CollectionQuery {
  page: number
  per_page: number
}

export async function fetchAllApiRows<T extends ApiRecord>(
  fetchPage: (
    query: CollectionQuery,
  ) => Promise<ApiCollectionResponse<T>>,
  perPage = 100,
): Promise<T[]> {
  const rows: T[] = []
  const seenIds = new Set<string>()

  const maximumPages = 1000

  for (let page = 1; page <= maximumPages; page++) {
    const response = await fetchPage({
      page,
      per_page: perPage,
    })

    if (response.status !== 'success') {
      throw new Error(
        response.message || 'تعذر تحميل البيانات.',
      )
    }

    const collection = response.data

    const batch = Array.isArray(collection)
      ? collection
      : collection?.data

    if (!Array.isArray(batch)) {
      throw new Error('صيغة البيانات المستلمة غير متوقعة.')
    }

    for (const row of batch) {
      const id = String(row.id)

      if (seenIds.has(id)) {
        throw new Error(
          'تكررت بعض السجلات أثناء التحميل. أعد المحاولة.',
        )
      }

      seenIds.add(id)
      rows.push(row)
    }

    const lastPage = Array.isArray(collection)
      ? response.meta?.last_page
      : collection.last_page ??
        collection.meta?.last_page ??
        response.meta?.last_page

    if (lastPage !== undefined && page >= lastPage) {
      return rows
    }

    if (batch.length < perPage) {
      return rows
    }
  }

  throw new Error(
    'حجم البيانات يتجاوز حد التحميل المتاح.',
  )
}