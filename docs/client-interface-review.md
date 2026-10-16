# مراجعة توحيد واجهات العميل مع main

## المرجع وحدود العمل

- فرع العمل: `client-interface-design/Ahakimi`، وHEAD هو `f49e4ba`.
- نجح `git fetch origin`. المرجع المفحوص: `origin/main` عند `22529e060e5c5c26c4bb49a28ff597a36965bc37`.
- بقي `main` المحلي عند `a263b733053124c29af8abc2d94887aa40702601` دون تعديل أو checkout.
- لا يوجد AGENTS.md في المشروع أو مساراته الأب المفحوصة، ولا أمر Lint معتمد في package.json.
- فُحص main مباشرة باستخدام Git، ثم دُمج في الطلب اللاحق بعد حفظ عمل العميل في fd2c5f4. لم تُنسخ صفحاته فوق عمل العميل. جرى تتبع `app/app.vue` و`app/layouts/customer.vue` ومكونات العميل المستعملة فعليًا؛ قوالب الزوار وبياناتهم لم تُنقل إلى العميل.
- حُفظت نسخة من التعديلات السابقة، بما فيها الملفات غير المتتبعة، خارج المشروع في مجلد مؤقت قبل التعديل. لا يوجد stash أو reset أو push. أجاز الطلب اللاحق حفظ العمل ودمج أحدث origin/main بعد الفحص.

## التصميم والهيكلية

- اعتماد السايدبار العائم الموجود في main: هامش 12px، زوايا 16px، عرض 288px في سطح المكتب الموسع و80px عند الطي، نفس الشعار والأيقونات 20px والفواصل والألوان والتوقيت الحركي.
- اعتماد تمرير المحتوى مستقلًا عن القائمة، مع هيدر ثابت داخل منطقة المحتوى وتذييل مستقل كما في main. أضيف حفظ موضع التمرير عند العودة مع الحفاظ على query.
- قصر تمرير جذر الوثيقة في بوابة العميل فقط عبر فئة مُدارة بواسطة Layout، حتى يبقى الهيدر والسايدبار ثابتين عند التركيز والتنقل. لا تُطبق هذه الفئة على قوالب الزوار.
- اختصار Ctrl+B وMeta+B للطي على الكمبيوتر، دون اعتراض الكتابة داخل الحقول. القائمة المطوية لها أسماء وصول وtooltips ظاهرة أيضًا بالتركيز.
- استخراج `CustomerSidebarLink.vue` بدل تكرار تركيب الرابط ثلاث مرات، مع إبقاء روابط العميل وفصل الأدوار.
- درج الجوال يحتفظ بالخلفية والإغلاق بالنقر وEscape والتنقل، مع احتواء Tab وعزل الخلفية بـinert واستعادة التركيز وإغلاق الدرج عند الانتقال لعرض الكمبيوتر.
- استخدام فئات main المشتركة: `solar-card` و`solar-input` و`btn-primary` و`btn-dark` والشارات، وألوان الحالة من Tailwind. بقيت عناوين الصفحات على خط النظام ومقاساته.
- نقل `app/components/customer/profile/ProfileField.vue` إلى `app/components/common/FormField.vue`. حُدثت الإعدادات وحقول كلمات المرور ونموذج الخدمة دون إبقاء نسخة مكررة.
- الهيدر يحافظ على عداد الواردة المشترك، مع وصف حالة أزرار القوائم وتحسين الإغلاق والتركيز. التذييل يحتفظ بإجراءاته التجريبية بدل إدخال روابط main غير الموجودة محليًا.
- إصلاح حفظ فلاتر الدليل في الرابط وسجل التنقل، واستعادتها في Back/Forward وحفظ المعاملات الأخرى عند فتح ملف المهندس.
- «عرض الملف الشخصي» رابط Nuxt حقيقي بوجهة مكتوبة الأنواع بدل زر تنقل، ويدعم لوحة المفاتيح وفتح تبويب جديد. اختُبر بالنقر المباشر ولوحة المفاتيح مع حفظ query.

## نتائج التحقق

- `npx nuxi typecheck`: ناجح.
- `npm run build`: ناجح؛ Nuxt 4.6.1 كما في البيئة الحالية، دون ترقية إصداره أو تحديثات واسعة للتبعيات.
- `git diff --check`: ناجح.
- Lint: لا يوجد script أو إعداد معتمد لتشغيله؛ لم يُضف فحص شكلي أو تُعطل فحوص.
- اختبارات المتصفح: لوحة التحكم، الإعدادات والتحقق والحفظ التجريبي، الدليل وفلاتره وBack/Forward، ملف المهندس والتبويبات الأربعة، نموذج الخدمة وإرساله التجريبي، تفاصيل المشروع والتراجع عن تأكيد العرض وقبوله تجريبيًا، الواردة والصادرة وحالة القراءة والعداد، الفراغ والتحميل والخطأ وإعادة المحاولة المحلية.
- اختبارات لوحة المفاتيح: Ctrl+B، أسماء القائمة المطوية والعنصر النشط، Tab وShift+Tab داخل درج الجوال، Escape واستعادة التركيز.
- RTL والتجاوب: شاشات النطاق على 390px، وصفحات أساسية على 1024px، ونموذج الخدمة على 320px؛ تطابق عرض الصفحة والمحتوى مع المساحة المتاحة دون تجاوز أفقي.
- اختبارات منطقية محلية: حفظ query والفلاتر وعدم التنقل أثناء مغادرة الدليل، تحقق المرفقات والحدود والإزالة والاحتفاظ بالمدخلات عند الفشل، وعدم تأثير الصادرة على قراءة الواردة، وأولوية التحميل والخطأ على الفراغ وعزل معاينات التطوير.
- فُتحت نسخة الإنتاج محليًا مع `notificationPreview=empty`؛ بقيت الواردة 4 وغير المقروء 3 ولم تُفعل المعاينة. لا يُدّعى الاتصال بـAPI عند إعادة المحاولة في البيانات التجريبية.
- تدقيق الاستيرادات والأصول: لا استيرادات نسبية مفقودة ولا صور محلية مفقودة. لا أصول تشغيل جديدة مستبعدة بالخطأ.
- تدقيق الملفات: لا .env أو node_modules أو ملفات بناء أو كاش أو مخلفات اختبار ضمن التغييرات؛ أدوات الاختبار والنسخة الاحتياطية خارج المشروع. لم يجد فحص أنماط المفاتيح الخاصة والتوكنات أسرارًا ظاهرة في الملفات المرشحة، بما يشمل الملفات الخاصة بـcommits الفرع.
- تغييرات الحزم المقصودة من العمل السابق: `@types/node` و`undici-types` في القفل لإصلاح تعريف process، مع استيراده من `node:process`. لا ترقيات واسعة أو audit fix قسري.

## تكامل أحدث main

نجح fetch وأحدث origin/main هو 22529e060e5c5c26c4bb49a28ff597a36965bc37. حُفظت التعديلات السابقة في fd2c5f4، ثم دُمج main دون إعادة كتابة التاريخ أو تعديل فرع main المحلي.

ظهرت أربعة تعارضات، وحُلّت بعد مراجعة المقاطع:

- .github/workflows/telegram-notify.yml: اعتماد تسمية Front_end وتصحيح نص الاختبار اليدوي من main.
- app/assets/main.css: إبقاء الأنماط المشتركة مع حصر تمرير بوابة العميل في Layout.
- CustomerSidebar.vue: إبقاء تنسيق main مع CustomerSidebarLink والوصول والقراءة والتنقل الحالي؛ احتُفظ بتحسين tooltip الخروج من main.
- app/layouts/customer.vue: إبقاء مظهر main وتحسينات درج الجوال واحتواء التركيز وحفظ التمرير والإشعارات الحالية.

احتُفظ بصفحات الزوار وأصول main الجديدة. لم يعد ProfileField القديم؛ بقي FormField المشترك. كُشفت أخطاء TypeScript في صفحات الزوار المجلوبة: أضيفت حراسة العنصر الافتراضي عند خلو مصدر البيانات، ووُسع نوع شارة المتجر بالقيم التجريبية الموجودة فعليًا، دون any أو تغيير API.

## ما بقي خارج الربط الفعلي

النماذج والإشعارات وتعميد العروض والإعدادات وقراءة الإشعارات ما زالت تجريبية كما اتُّفق سابقًا. المعاينة والتنزيل لا يُدّعيان عند غياب ملفات فعلية. قائمة الخدمات الحالية وواجهات المصادقة لم تُنفذ ضمن هذا النطاق. هذه ليست عقود API جديدة؛ الربط ينتظر API معتمدًا.

## اقتراح الحفظ والرفع بعد مراجعة الإنسان

رسالة commit مقترحة:

`feat(customer): complete workflows and align client UI with main`

Remote: `origin` → `https://github.com/MohmmedAlabsi/solarhub-frontend.git`.

بعد مراجعة الملفات وحفظها في commit محلي، أمر الرفع الأول المناسب هو:

```sh
git push --set-upstream origin client-interface-design/Ahakimi
```

لا يحتاج الأمر إلى force. حُفظ العمل وأُعيد التحقق بعد الدمج. لم يُنفذ push.

## سجل الملفات قبل حفظ العمل في fd2c5f4

القائمة أدناه تشمل عمل الجلسات السابقة والتوحيد الحالي، وهي غير staged. يُظهر Git نقل FormField كحذف وإضافة إلى أن تُضاف الملفات للفهرس ويكتشف النقل.

<!-- INVENTORY -->

| Git | الملف |
| --- | --- |
| `M` | `README.md` |
| `M` | `app/assets/main.css` |
| `M` | `app/components/common/AppToast.vue` |
| `M` | `app/components/customer/CustomerFooter.vue` |
| `M` | `app/components/customer/CustomerHeader.vue` |
| `M` | `app/components/customer/CustomerSidebar.vue` |
| `M` | `app/components/customer/dashboard/DashboardActionCard.vue` |
| `M` | `app/components/customer/dashboard/RecentActivityItem.vue` |
| `M` | `app/components/customer/engineers/EngineerCard.vue` |
| `M` | `app/components/customer/engineers/profile/EngineerProfileHeader.vue` |
| `M` | `app/components/customer/engineers/profile/EngineerProjectCard.vue` |
| `D` | `app/components/customer/profile/ProfileField.vue` |
| `M` | `app/components/customer/profile/ProfilePasswordField.vue` |
| `M` | `app/components/customer/profile/ProfileSummaryCard.vue` |
| `M` | `app/composables/useCustomerDashboard.ts` |
| `M` | `app/composables/useEngineerProfile.ts` |
| `M` | `app/composables/useEngineers.ts` |
| `M` | `app/layouts/customer.vue` |
| `M` | `app/pages/customer/engineers/[id].vue` |
| `M` | `app/pages/customer/engineers/index.vue` |
| `M` | `app/pages/customer/notifications/index.vue` |
| `M` | `app/pages/customer/settings/index.vue` |
| `M` | `nuxt.config.ts` |
| `M` | `package-lock.json` |
| `M` | `package.json` |
| `M` | `types/engineer.ts` |
| `??` | `app/components/common/FormField.vue` |
| `??` | `app/components/customer/CustomerSidebarLink.vue` |
| `??` | `app/components/customer/engineers/profile/EngineerReviews.vue` |
| `??` | `app/components/customer/notifications/NotificationEmptyState.vue` |
| `??` | `app/components/customer/notifications/NotificationItem.vue` |
| `??` | `app/components/customer/notifications/NotificationLoadState.vue` |
| `??` | `app/components/customer/notifications/NotificationOverview.vue` |
| `??` | `app/components/customer/notifications/NotificationTabs.vue` |
| `??` | `app/components/customer/services/ServiceAttachments.vue` |
| `??` | `app/components/customer/services/ServiceEngineerOffer.vue` |
| `??` | `app/components/customer/services/ServiceProjectFile.vue` |
| `??` | `app/components/customer/services/ServiceProjectSummary.vue` |
| `??` | `app/components/customer/services/ServiceRequestForm.vue` |
| `??` | `app/composables/useNotifications.ts` |
| `??` | `app/composables/useServiceProject.ts` |
| `??` | `app/composables/useServiceRequest.ts` |
| `??` | `app/pages/customer/services/[id].vue` |
| `??` | `app/pages/customer/services/new.vue` |
| `??` | `docs/client-interface-review.md` |
| `??` | `types/customer-notification.ts` |
| `??` | `types/service-request.ts` |

## تحسين طلب الخدمة

حُفظ تقسيم الصفحة والمكونات وComposable والعقود. ضُبطت أسهم القوائم وارتفاع الحقول 44px والمسافات وارتفاع معلومات الموقع وألوان التنبيه من النظام المشترك. قيود الملفات واضحة، ووصف الوصول للخطأ يظهر عند وجوده فقط. نجح typecheck والبناء وdiff check قبل الدمج، مع اختبار الحقول والإرسال التجريبي والجوال وConsole.

## التحقق بعد الدمج

نجحت نتيجة الدمج في TypeScript وبناء الإنتاج وdiff check، بالإضافة إلى اختبارات منطق النموذج والإشعارات وسجل الفلاتر. راجعت نسخة الإنتاج: النموذج والطي، والواردة والصادرة وتعليم الكل والعداد والرجوع والتقدم وحفظ query. تجاهلت نسخة الإنتاج notificationPreview=empty، ولم تسجل أخطاء Console في تبويب الاختبار الجديد. لا يوجد أمر Lint معتمد. تبقى الملفات المولدة والمرفقات التجريبية وأدوات الاختبار خارج Git. أمر الرفع المقترح أعلاه دون force، ولم يُنفذ.

## التصحيح البصري الفعلي لطلب الخدمة (المراجعة الأخيرة)

أعيد فتح الصورة المرفقة والصفحة الحالية، ولم يُعتمد تقرير المراجعة السابقة دليلًا على المطابقة. كانت الفروق الأساسية: القائمة العائمة، عرض المحتوى، ارتفاع الهيدر، مساحة العنوان والكارد، الظلال والحدود والخطوط وأبعاد منطقة المرفقات وزر النشر.

- الصفحة نفسها /customer/services/new؛ لا صفحة أو Layout أو Sidebar مكرر. هيئة flat اختيارية في Layout ومكونات Customer الحالية عبر meta وخصائص مكتوبة الأنواع؛ بقية الصفحات تحتفظ بالهيئة الافتراضية.
- على عرض 1280px: القائمة 256px بلا هامش، الهيدر 64px، المحتوى 1024px، الكارد من x=40 إلى984 وبداية y=304 ونهاية قرب1564، والتذييل قرب1588؛ كما في المرجع بعد استبعاد حافته الخارجية 8px.
- أربعة أقسام بنفس الترتيب والنصوص والحقول؛ حقول 44px، وصف126px وموقع102px، رفع188px، زر200×44px يسارًا. الألوان والحدود والوزن والمسافات متطابقة مع هيئة الصورة.
- خط IBM Plex Sans Arabic الموجود أصلًا في النظام محفوظ محليًا مع ترخيص SIL OFL لضمان التحميل. لم تتغير حزم المشروع أو العقود أو منطق الإرسال.
- حُفظت وظائف الطي ودرج الجوال ولوحة المفاتيح ومؤشر الواردة، والعدادات تعرض بياناتها الفعلية دون اصطناع رقم الصورة. تمت حراسة التمرير عند تركيز التذييل بـoverflow:clip للهيئة المختارة فقط.
- تبقى الملاحظة التجريبية الضرورية بجانب زر النشر؛ لا إرسال أو رفع إلى API. شروط الخدمة والخصوصية تربطان صفحات main الموجودة.
- اختُبر الكمبيوتر والجوال390px و320px، دون تجاوز أفقي. التحقق المطلوب والاختيارات وتعبئة النصوص والإرسال التجريبي ومنع التكرار، واختيار PDF ورفض ملف غير مدعوم وإزالة المرفق.
- ملفات الصور البصرية محفوظة خارج Git في مجلد visualizations؛ لا مخلفات اختبار ضمن المشروع.

### تكامل main والتحقق لهذه المراجعة

بعد نجاح التصميم والبناء، نُفذ git fetch origin مجددًا. بقي أحدث origin/main عند22529e060e5c5c26c4bb49a28ff597a36965bc37؛ أعاد الدمج Already up to date لأنه مدمج سابقًا في d5fcffb. لم تظهر تعارضات جديدة ولم يتغير main المحلي. أعيد تشغيل typecheck والبناء وdiff check بعد هذا التحقق. تبقى خصائص flat اختيارية وقيمها الافتراضية تحافظ على بقية واجهات Customer، واختُبر الانتقال للوحة العميل والرجوع لاختلاف الهيئة دون تغيير المسارات أو query.

نتيجة الفحوصات الأخيرة بعد جلب main: typecheck ناجح (exit0)، build ناجح (exit0)، وdiff check ناجح. فحص Console في تبويب إنتاج جديد: لا أخطاء. فُحصت الإعدادات والدليل والمشاريع والتقييمات وتفاصيل الخدمة والصادرة بعد تعديل المشترك، وكلها تحتفظ بالهيئة الافتراضية دون تجاوز أفقي. لا يوجد Lint script معتمد. لم يُنفذ push.
