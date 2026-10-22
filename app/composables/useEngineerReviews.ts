/**
 * Engineer Reviews Composable
 *
 * BACKEND BLOCKER / NOTE:
 * The Laravel API (`solarhub-api`) currently has `EngineerRatingController` and `engineer_ratings` table,
 * but:
 * 1. The controller is NOT registered in `routes/api/*.php`.
 * 2. The controller does not have an `index` or `myRatings` action to list reviews for an engineer.
 * 
 * When the backend team exposes `GET /api/engineer/reviews` or `GET /api/engineers/{id}/ratings`,
 * this composable can directly plug into that endpoint.
 * In the meantime, safe fallback data is provided to preserve the UI without crashing.
 */

export interface ReviewItem {
  id: number
  client_name: string
  client_initials: string
  date: string
  rating: number // من 1 إلى 5
  comment: string
}

const mockReviews: ReviewItem[] = [
  {
    id: 1,
    client_name: 'سعود بن حمد الشمري',
    client_initials: 'س.ح',
    date: '02 يونيو 2024',
    rating: 5,
    comment: 'قام المهندس أحمد بإعداد دراسة الجدوى وتصميم المخططات الهندسية لمنظومة الطاقة الكهروضوئية لمشروع مزرعة القصيم 150kWp باحترافية عالية ودقة متناهية. تم اعتماد المخططات لدى شركة الكهرباء خلال 48 ساعة فقط. مهندس متمكن ومتعاون جداً.',
  },
  {
    id: 2,
    client_name: 'م. عبدالمجيد السالم',
    client_initials: 'م.ع',
    date: '28 مايو 2024',
    rating: 5,
    comment: 'استشارة هندسية ممتازة لحساب الأحمال واختيار السعات المناسبة للإنفرترات الهجينة والبطاريات. فحص دقيق للموقع وتوافق كامل مع كود البناء السعودي SBC. نوصي بالتعامل معه لكافة المشاريع الكهروضوئية.',
  },
  {
    id: 3,
    client_name: 'فيصل القحطاني',
    client_initials: 'ف.ق',
    date: '19 مايو 2024',
    rating: 5,
    comment: 'إشراف هندسي ميداني متميز على تركيب محطة الطاقة السكنية واختبار العزل الحراري والربط. تقارير فنية أسبوعية مفصلة وواضحة ساعدتنا على استلام المشروع بجودة استثنائية وبدون أي ملاحظات.',
  },
  {
    id: 4,
    client_name: 'طارق منصور العمري',
    client_initials: 'ط.م',
    date: '14 مايو 2024',
    rating: 5,
    comment: 'دقة واحترافية في إجراء المحاكاة عبر PVsyst وتقديم حسابات العائد على الاستثمار للمصنع بدقة متناهية. ساعدنا في توفير تكاليف المنظومة واختيار مكونات Tier-1 بأفضل كفاءة.',
  },
  {
    id: 5,
    client_name: 'نواف الدوسري',
    client_initials: 'ن.د',
    date: '06 مايو 2024',
    rating: 5,
    comment: 'مهندس خبير ومتمكن جداً في أنظمة الضخ الشمسي الزراعي. قام ببرمجة مضخات Grundfos وربطها بالألواح الكهروضوئية وتأكد من عمل المنظومة بأعلى تدفق مائي في أوقات الذروة.',
  },
]

export function useEngineerReviews() {
  const reviews = ref<ReviewItem[]>([...mockReviews])
  const currentPage = ref(1)
  const totalReviews = ref(145) // كما يظهر في التصميم
  const pageSize = 5

  const totalPages = computed(() => Math.ceil(totalReviews.value / pageSize))

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    reviews,
    currentPage,
    totalReviews,
    totalPages,
    pageSize,
    setPage,
  }
}
