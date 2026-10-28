# خطة مهام وتطوير لوحة تحكم المورد (Supplier Dashboard)
## المطور المسؤول: م. محمد العبسي (Mohammed Alabsi)
### النطاق: العمليات التجارية والمالية الأساسية للمتجر (Core Commercial & Financial Operations)

---

## 📌 ملخص المسؤوليات
يتولى المطور محمد العبسي بناء وربط الوحدات الأساسية ذات الثقل التجاري والتشغيلي في لوحة تحكم المورد، وتشمل:
1. **موديول إدارة المنتجات** (عرض القائمة، الفلترة والبحث، إضافة منتج، تعديل منتج).
2. **موديول طلبات الشراء** (قائمة الطلبات، وتفاصيل الطلب ومتابعة الشحن والتوصيل).
3. **موديول طلبات عروض الأسعار RFQs** (قائمة الطلبات، تفاصيل الطلب، واستمارة تقديم عرض السعر).
4. **موديول المستحقات والعمليات المالية** (الأرصدة، سجل العمليات، وطلبات السحب).

---

## 1️⃣ موديول إدارة المنتجات (Products Management)

### 🖼️ ملفات التصميم المرجعية
المسار: `C:\Users\ATC\Downloads\Telegram Desktop\Supplier\Supplier\`
- `المورد - إدارة المنتجات.png`
- `المورد - إدارة المنتجات - إضافة منتج للمتجر.png`
- `المورد - إدارة المنتجات - تعديل المنتج.png`

### 📁 المسارات والصفحات (Pages & Routes)
1. **قائمة المنتجات:** `app/pages/supplier/products/index.vue`
   - جدول المنتجات مع الصور المصغرة، السعر، الكمية في المخزون، وحالة التوفر (متوفر / نفد المخزون / مسودة).
   - شريط بحث وفلاتر بحسب التصنيف (ألواح، بطاريات، محولات، ملحقات)، الماركة، وحالة النشر.
   - أزرار الإجراءات السريعة (تعديل، حذف، تغيير حالة الإتاحة).
2. **إضافة منتج للمتجر:** `app/pages/supplier/products/new.vue`
   - رفع وتنسيق الصور المتعددة للمنتج.
   - البيانات الأساسية (اسم المنتج، الوصف، التصنيف، العلامة التجارية).
   - المواصفات الفنية المعتمدة لمنظومات الطاقة الشمسية (القدرة بالواط/كيلوواط، الجهد، الكفاءة، الضمان).
   - بيانات التسعير والمخزون وسعر الجملة/التجزئة، والحد الأدنى للطلب.
3. **تعديل المنتج:** `app/pages/supplier/products/[id]/edit.vue`
   - استرجاع بيانات المنتج وتحديثها مع حفظ التعديلات وإمكانية أرشفة المنتج.

### 🧩 المكونات والدوال المقترحة (Components & Composables)
- `app/composables/useSupplierProducts.ts` (جلب، إضافة، تعديل، حذف، وفلترة المنتجات).
- `app/components/supplier/products/ProductTable.vue`
- `app/components/supplier/products/ProductCard.vue`
- `app/components/supplier/products/ProductForm.vue`
- `app/components/supplier/products/ProductFilters.vue`

### 🌐 واجهات الـ API المرتبطة
- `GET /api/my/store-products` (قائمة منتجات المتجر المسجل)
- `POST /api/store-products` (إنشاء منتج جديد)
- `GET /api/store-products/{id}` (تفاصيل منتج للمتجر)
- `PUT /api/store-products/{id}` (تحديث المنتج)
- `DELETE /api/store-products/{id}` (حذف منتج)
- `GET /api/categories` و `GET /api/brands` (قوائم التصنيفات والشركات المصنعة)

---

## 2️⃣ موديول طلبات الشراء (Purchase Orders)

### 🖼️ ملفات التصميم المرجعية
- `المورد - طلبات الشراء.png`
- `المورد - طلبات الشراء - تفاصيل طلبات الشراء.png`

### 📁 المسارات والصفحات (Pages & Routes)
1. **جدول طلبات الشراء:** `app/pages/supplier/orders/index.vue`
   - تبويبات وفلاتر حسب الحالة: الكل، بانتظار التجهيز (`pending`/`processing`)، قيد الشحن (`shipped`)، مكتمل ومسلم (`completed`)، ملغي (`cancelled`).
   - بطاقات إحصائية سريعة لأوامر الشراء الحالية.
2. **تفاصيل طلب الشراء:** `app/pages/supplier/orders/[id].vue`
   - بيانات العميل والموقع الجغرافي للتوصيل وعنوان الشحن.
   - جدول المنتجات والكميات المشتراة، السعر الإفرادي والإجمالي.
   - تفاصيل الدفع وطريقة السداد وتأكيد الاستلام.
   - إجراءات تحديث الحالة (تأكيد التجهيز، إرسال الشحنة مع رقم التتبع).

### 🧩 المكونات والدوال المقترحة (Components & Composables)
- `app/composables/useSupplierOrders.ts`
- `app/components/supplier/orders/OrderListTable.vue`
- `app/components/supplier/orders/OrderStatusBadge.vue`
- `app/components/supplier/orders/OrderUpdateStatusModal.vue`

### 🌐 واجهات الـ API المرتبطة
- `GET /api/my/store-orders` (قائمة طلبات الشراء الخاصة بمتجر المورد)
- `GET /api/order-stores/{orderStore}` (تفاصيل طلب محدد لمتجر المورد)
- `PATCH /api/order-stores/{orderStore}/status` (تحديث حالة الشحن والتنفيذ)

---

## 3️⃣ موديول طلبات عروض الأسعار (Quote Requests / RFQs)

### 🖼️ ملفات التصميم المرجعية
- `المورد - طلبات عروض الأسعار.png`
- `المورد - طلبات عروض الأسعار -  تفاصيل طلب عرض سعر.png`
- `المورد - طلبات عروض الأسعار - الرد على طلب السعر.png`

### 📁 المسارات والصفحات (Pages & Routes)
1. **قائمة طلبات الأسعار:** `app/pages/supplier/quotes/index.vue`
   - استعراض طلبات الأسعار الواردة من عملاء المشاريع والمهندسين.
   - فلاتر الحالة: بانتظار التسعير (`pending`)، تم الرد (`responded`)، مقبولة (`accepted`)، ملغاة/منتهية الصلاحية (`expired`/`rejected`).
2. **معاينة طلب التسعير:** `app/pages/supplier/quotes/[id].vue`
   - عرض الكميات والمواصفات المطلوبة، تاريخ تقديم الطلب، والتاريخ الأقصى للتوريد.
3. **نموذج الرد على طلب السعر:** `app/pages/supplier/quotes/[id]/respond.vue` (أو Dialog منبثق)
   - إدخال سعر الوحدة، التكلفة الإجمالية، الخصم، وتكلفة النقل/التوصيل.
   - تحديد تاريخ انتهاء صلاحية العرض والشروط الفنية للتسليم.

### 🧩 المكونات والدوال المقترحة (Components & Composables)
- `app/composables/useSupplierQuotes.ts`
- `app/components/supplier/quotes/QuoteListTable.vue`
- `app/components/supplier/quotes/QuoteStatusBadge.vue`
- `app/components/supplier/quotes/QuoteRespondModal.vue`

### 🌐 واجهات الـ API المرتبطة
- `GET /api/my/store-quote-requests` (طلبات الأسعار الواردة للمتجر)
- `PATCH /api/quote-requests/{quoteRequest}/respond` (تقديم العرض الفني والمالي)

---

## 4️⃣ موديول المستحقات والعمليات المالية (Financial Dues & Wallet)

### 🖼️ ملفات التصميم المرجعية
- `المورد - المستحقات.png`

### 📁 المسارات والصفحات (Pages & Routes)
1. **صفحة المستحقات المالية:** `app/pages/supplier/finance/index.vue`
   - بطاقات الأرصدة: إجمالي المبيعات، الرصيد المتاح للسحب، الأرباح المعلقة بانتظار تأكيد الاستلام.
   - سجل العمليات والتحويلات المالية المرتبطة بأرقام الطلبات.
   - نافذة طلب سحب أو تحويل للأرباح عبر المحافظ الإلكترونية اليمنية المعتمدة (كريمي جوال، كاش، ون كاش، فلوسك) أو الحسابات البنكية.

### 🧩 المكونات والدوال المقترحة (Components & Composables)
- `app/composables/useSupplierFinance.ts`
- `app/components/supplier/finance/BalanceSummaryCard.vue`
- `app/components/supplier/finance/TransactionsTable.vue`
- `app/components/supplier/finance/WithdrawRequestModal.vue`

### 🌐 واجهات الـ API المرتبطة
- `GET /api/my/wallets` (محافظ المورد المسجلة)
- `GET /api/store_payouts` و `POST /api/store_payouts` (سجل وطلبات سحب الأرباح)
- `GET /api/wallet_providers` (قائمة المحافظ والبنوك المعتمدة)

---

## 🎯 معايير الجودة والالتزام
1. **نظام التصميم (Design System):** الالتزام بفئات `solar-card` و `solar-input` و `btn-primary` و `btn-outline` والمتغيرات المتوافقة مع الوضعين الفاتح والداكن.
2. **التحقق من الأنواع (Type Safety):** يجب أن تمر كافة المكونات عبر `vue-tsc --noEmit` بنجاح كامل بدون أي خطأ.
3. **التوطين والسياق اليمني:** العملة بالريال اليمني/الدولار حسب النظام، والمحافظ والمحافظات اليمنية الرسمية.
