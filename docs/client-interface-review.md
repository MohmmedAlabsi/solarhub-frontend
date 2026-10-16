# مراجعة توحيد واجهات العميل مع main

## المرجع وحدود العمل

- فرع العمل: `client-interface-design/Ahakimi`، وHEAD هو `f49e4ba`.
- نجح `git fetch origin`. المرجع المفحوص: `origin/main` عند `22529e060e5c5c26c4bb49a28ff597a36965bc37`.
- بقي `main` المحلي عند `a263b733053124c29af8abc2d94887aa40702601` دون تعديل أو checkout.
- لا يوجد AGENTS.md في المشروع أو مساراته الأب المفحوصة، ولا أمر Lint معتمد في package.json.
- فُحص main مباشرة باستخدام Git دون دمج أو نسخ صفحاته فوق عمل العميل. جرى تتبع `app/app.vue` و`app/layouts/customer.vue` ومكونات العميل المستعملة فعليًا؛ قوالب الزوار وبياناتهم لم تُنقل إلى العميل.
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

## علاقة الفرع مع main قبل الدمج المصرح به

الفرع متشعب عن origin/main: 4 commits خاصة بالفرع و7 commits خاصة بـmain. هذه أعداد commits ولا تشمل التعديلات غير المحفوظة في commit.

توجد ملفات تغيّرها الطرفان منذ الأصل المشترك وتحتاج مراجعة عند التكامل لاحقًا:

- `.github/workflows/telegram-notify.yml`
- `app/assets/main.css`
- `app/components/customer/CustomerSidebar.vue`
- `app/layouts/customer.vue`

هذه قائمة تداخل محتمل، وليست نتيجة دمج منفذ. لم يُدمج main ولم يُعد كتابة التاريخ. لذلك لا يُعتمد الفرع جاهزًا للدمج قبل مراجعة هذا التداخل. لا يوجد upstream حالي لهذا الفرع ولا remote branch بالاسم نفسه في المراجع المجلوبة.

## ما بقي خارج الربط الفعلي

النماذج والإشعارات وتعميد العروض والإعدادات وقراءة الإشعارات ما زالت تجريبية كما اتُّفق سابقًا. المعاينة والتنزيل لا يُدّعيان عند غياب ملفات فعلية. قائمة الخدمات الحالية وواجهات المصادقة والروابط القانونية غير المتاحة لم تُنفذ ضمن هذا النطاق. هذه ليست عقود API جديدة؛ الربط ينتظر API معتمدًا.

## اقتراح الحفظ والرفع بعد مراجعة الإنسان

رسالة commit مقترحة:

`feat(customer): complete workflows and align client UI with main`

Remote: `origin` → `https://github.com/MohmmedAlabsi/solarhub-frontend.git`.

بعد مراجعة الملفات وحفظها في commit محلي، أمر الرفع الأول المناسب هو:

```sh
git push --set-upstream origin client-interface-design/Ahakimi
```

لا يحتاج الأمر إلى force. سيُحفظ العمل قبل الدمج، ثم يعاد التحقق. لم يُنفذ push.

## ملفات العمل المرشحة للمراجعة

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
