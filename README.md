# Nuxt Minimal Starter

تقرير توحيد واجهات العميل مع مرجع main وقائمة الملفات والفحوصات: [مراجعة واجهات العميل](docs/client-interface-review.md).

## معاينة حالات الإشعارات للمطور

بعد تشغيل `npm run dev`، أضف `notificationPreview` إلى `/customer/notifications`:

- `?notificationPreview=empty`: مركز فارغ بالكامل، مع عدادات صفرية في المركز والهيدر.
- `?notificationPreview=empty-inbox`: واردة فارغة دون تغيير الصادرة.
- `?tab=sent&notificationPreview=empty-sent`: صادرة فارغة مع بقاء غير المقروء في الواردة والهيدر.
- `?notificationPreview=loading`: عرض التحميل فقط، دون رسالة فراغ.
- `?notificationPreview=error`: عرض فشل الجلب وإعادة المحاولة محليًا على البيانات التجريبية.

هذه معاينات عرض في بيئة التطوير فقط (`import.meta.dev`)، ولا تمسح السجلات أو حالة القراءة. أزل المعامل لاستعادة العرض المعتاد. نسخة الإنتاج تتجاهل المعامل. لاختبار فراغ الفلتر، حدد كل الواردة كمقروءة ثم افتح «غير المقروءة» وجرب «إعادة ضبط الفلتر».

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
