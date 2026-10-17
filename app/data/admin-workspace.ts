import type { AdminUser, AdminSupplier, AdminEngineer, AdminServiceRequest, AdminReview, AdminBroadcast } from '../../types/admin'

export const adminUsers: AdminUser[] = ([
  ['USR-1','وجدان محمد','wejdan@example.com','0501234567','الرياض','عميل سكني',true,'2025-01-12'],
  ['USR-2','م. أحمد الشمري','ahmed.shammari@solarhub.sa','0559876543','الرياض','مهندس طاقة شمسية',true,'2025-02-04'],
  ['USR-3','شركة شمس الرياض للمهمات','contact@shams-riyadh.sa','0541122334','الرياض','مورد معتمد',true,'2025-01-18'],
  ['USR-4','م. سارة القحطاني','sara.qahtani@solarhub.sa','0567788990','القصيم','مهندس طاقة شمسية',true,'2025-03-02'],
  ['USR-5','فيصل العتيبي','f.otaibi@example.com','0503344556','مكة المكرمة','عميل تجاري',false,'2025-03-22'],
  ['USR-6','مؤسسة طاقة الصحراء للتوريدات','info@sahara-energy.sa','0535566778','المنطقة الشرقية','مورد معتمد',true,'2025-04-10'],
  ['USR-7','طارق العتيبي','tariq.otaibi@example.com','0588899001','جدة','عميل سكني',false,'2025-05-15'],
] satisfies Array<[string,string,string,string,string,AdminUser['role'],boolean,string]>).map(([id,name,email,phone,city,role,active,createdAt]) => ({ id, name, email, phone, city, role, active, createdAt }))

export const adminSuppliers: AdminSupplier[] = [
  { id:'SUP-2025-081',name:'مجموعة الأمانة لأنظمة الطاقة والمضخات',owner:'إبراهيم سعيد الغامدي',email:'info@amana-solar.sa',phone:'0543219876',commercialNumber:'4030287114',taxNumber:'300458921400003',city:'جدة',address:'طريق المدينة',storeType:'وكيل معتمد',approval:'approved',description:'توريد الألواح والإنفرترات والمضخات المعتمدة وحلول الطاقة للمشاريع السكنية والتجارية.',rejectionReason:'' },
  { id:'SUP-2025-082',name:'نيرات الحلول للطاقة البديلة',owner:'م. سلمان العتيبي',email:'contact@neyrat-energy.sa',phone:'0567891234',commercialNumber:'4031652289',taxNumber:'300458921400011',city:'مكة المكرمة',address:'المنطقة الصناعية',storeType:'متجر متخصص',approval:'approved',description:'حلول متكاملة للطاقة البديلة وخدمات التوريد والدعم الفني.',rejectionReason:'' },
  { id:'SUP-2025-083',name:'آفاق الطاقة والمضخات الغاطسة',owner:'عمر عبدالعزيز الشمري',email:'info@afaq-pumps.com',phone:'0534567890',commercialNumber:'1131092837',taxNumber:'300458921400020',city:'القصيم',address:'بريدة',storeType:'وكيل معتمد',approval:'approved',description:'مضخات شمسية وحلول الري للمنشآت الزراعية.',rejectionReason:'' },
  { id:'SUP-2025-085',name:'المتجر السعودي للمنظومات الذكية',owner:'فهد ناصر الدوسري',email:'smart@saudi-systems.sa',phone:'0512345678',commercialNumber:'1010992381',taxNumber:'300458921400039',city:'الرياض',address:'حي العليا',storeType:'موزع رئيسي',approval:'pending',description:'توريد حلول التحكم والمنظومات الشمسية الذكية.',rejectionReason:'' },
  { id:'SUP-2025-086',name:'تقنيات الهجين المتجددة وتخزين الليثيوم',owner:'أحمد منصور المدني',email:'hybrid@tech-solar.sa',phone:'0598765432',commercialNumber:'4650082194',taxNumber:'300458921400047',city:'المدينة المنورة',address:'طريق المطار',storeType:'متجر متخصص',approval:'pending',description:'بطاريات ليثيوم ومنظومات هجينة للمشاريع.',rejectionReason:'' },
  { id:'SUP-2025-087',name:'مؤسسة الرؤية النظيفة لمعدات الطاقة',owner:'سالم راشد الكعبي',email:'clean@vision-energy.sa',phone:'0587654321',commercialNumber:'3350029145',taxNumber:'300458921400055',city:'حائل',address:'المنطقة الصناعية',storeType:'موزع معتمد',approval:'rejected',description:'معدات طاقة متجددة وخدمات توريد.',rejectionReason:'يلزم استكمال مستند السجل التجاري.' },
  { id:'SUP-2025-084',name:'شركة شمس الرياض للمهمات الكهروضوئية',owner:'عبدالله محمد القحطاني',email:'contact@shams-riyadh.sa',phone:'0501234567',commercialNumber:'1010874521',taxNumber:'300458921400003',city:'الرياض',address:'حي الملز شارع الجامعة',storeType:'وكيل معتمد',approval:'approved',description:'شركة متخصصة في توريد وتوزيع الألواح والإنفرترات الكهروضوئية كوكيل معتمد لكبرى الماركات العالمية (Tier 1). نوفر حلول الطاقة المتجددة للمشاريع السكنية والتجارية والمزارع مع الالتزام بضمان المصنع المعتمد.',rejectionReason:'',document:{id:'sup-cr',name:'السجل_التجاري.pdf',size:'2.4 MB'} },
  { id:'SUP-2025-088',name:'مؤسسة طاقة الصحراء للتوريدات المتقدمة',owner:'سعود فهد العنزي',email:'info@sahara-energy.sa',phone:'0559876543',commercialNumber:'2050198432',taxNumber:'300458921400063',city:'الدمام',address:'طريق الملك فهد',storeType:'موزع معتمد',approval:'approved',description:'توريد المعدات الشمسية المعتمدة للمشاريع التجارية.',rejectionReason:'' },
]

const engineerRows = [
  ['ENG-2025-042','م. أحمد بن فهد الشمري','استشاري تصميم محطات الطاقة الكهروضوئية ومطابقة كود SBC','ahmed.shammari@solarhub.sa','0501234567','489201',8,'approved','محطات كهروضوئية|On-Grid'],
  ['ENG-2025-043','م. سارة بنت خالد القحطاني','استشارية طاقة متجددة','sarah.qahtani@solarhub.sa','0552345678','512044',6,'pending','ضخ مياه شمسية|Off-Grid'],
  ['ENG-2025-044','م. طارق بن عبدالمحسن العتيبي','خبير فحص وتدقيق ميداني','tariq.otaibi@solarhub.sa','0543456789','391802',10,'approved','فحص كود SBC|اختبار عزل حراري'],
  ['ENG-2025-045','م. خالد بن ناصر الدوسري','استشاري أنظمة تخزين BESS','khalid.dawsari@solarhub.sa','0564567890','623410',7,'approved','أنظمة هجينة Hybrid|بطاريات ليثيوم'],
  ['ENG-2025-046','م. فيصل بن سعد الزهراني','مهندس شبكات وربط كهربائي','faisal.zahrani@solarhub.sa','0598765432','701923',4,'pending','دراسات جدوى|ربط محولات MV'],
  ['ENG-2025-047','م. منى بنت إبراهيم الحربي','تصميم إنشائي وهياكل تثبيت','mona.harbi@solarhub.sa','0512398745','829140',5,'approved','هياكل تثبيت شمسية|حساب أحمال الرياح'],
  ['ENG-2025-048','م. منصور بن عادل الغامدي','تصميم منظومات شمسية تجارية','mansour.ghamdi@solarhub.sa','0587612345','291038',9,'rejected','محطات أسطح المصانع|PVsyst Analysis'],
  ['ENG-2025-049','م. عبدالعزيز بن صالح السبيعي','اختبارات السلامة الكهربائية','abdulaziz.subaie@solarhub.sa','0534567891','918274',3,'approved','تأريض وحماية صواعق|SEC Compliance'],
] as const
export const adminEngineers: AdminEngineer[] = engineerRows.map((r,i) => ({id:r[0],name:r[1],title:r[2],email:r[3],phone:r[4],license:`SCE-${r[5]}`,experience:r[6],approval:r[7],specialties:r[8].split('|'),city:i===1?'القصيم':'الرياض',licenseAuthority:'الهيئة السعودية للمهندسين',approvedAt:r[7]==='approved'?'2025-01-14':undefined,bio:(r[7]==='approved'?'مهندس معتمد من الهيئة السعودية للمهندسين':'مهندس متخصص في الطاقة الشمسية')+' بخبرة في دراسات الجدوى الاقتصادية والفنية وتصميم الأنظمة الكهروضوئية المتصلة بالشبكة والمستقلة والإشراف الميداني، وفق معايير شركة الكهرباء السعودية وكود البناء السعودي.',rejectionReason:r[7]==='rejected'?'يلزم تحديث الترخيص المهني.':'',documents:i===0?[{id:'sce',name:'شهادة الاعتماد المهني SCE',size:'2.4 MB'},{id:'pv',name:'شهادة تأهيل الطاقة الشمسية Solar PV Specialist',size:'1.8 MB'}]:[]}))

const serviceRows = [
 ['108','أحمد بن فهد القحطاني','تصميم ومحاكاة محطات شمسية On-Grid','الرياض',50,'open'],
 ['107','سعود بن عبدالمحسن الدوسري','استشارات أنظمة تخزين وبطاريات BESS','المنطقة الشرقية',120,'awarded'],
 ['106','فاطمة ناصر الزهراني','فحص واختبار أداء كهرو ميكانيكي','مكة المكرمة',15,'executing'],
 ['105','خالد سليمان الحربي','تصميم منظومات ضخ مياه شمسية','القصيم',8.5,'completed'],
 ['104','عمر بن صالح العتيبي','تصميم ومحاكاة محطات شمسية On-Grid','الرياض',250,'open'],
 ['103','مروان أحمد الغامدي','فحص واختبار أداء كهرو ميكانيكي','عسير',30,'cancelled'],
 ['102','منى إبراهيم الشمري','تصميم منظومات ضخ مياه شمسية','القصيم',22,'awarded'],
 ['101','بدر عبدالله السبيعي','تصميم ومحاكاة محطات شمسية On-Grid','المنطقة الشرقية',80,'executing'],
] as const
export const adminServices: AdminServiceRequest[] = serviceRows.map((r,i)=>({id:`REQ-2025-${r[0]}`,client:r[1],service:r[2],city:r[3],capacity:r[4],status:r[5],location:i===0?'سطح مبنى تجاري (حي الملقا)':'موقع المشروع في '+r[3],coordinates:i===0?'24.7136° N, 46.6753° E':undefined,description:`مطلوب دراسة جدوى وتصميم هندسي متكامل لربط محطة طاقة شمسية كهروضوئية بقدرة ${r[4]} كيلوواط وفق اشتراطات كود البناء السعودي SBC ومتطلبات شركة الكهرباء السعودية، بما يشمل حسابات الفواقد والمحاكاة ببرنامج PVsyst والمخطط أحادي الخط SLD.`,documents:i===0?[{id:'client-plan',name:'مخطط_السطح_والأحمال_الكهربائية.pdf',size:'2.4 MB'}]:[],offers:i===0?[{id:'offer-1',engineerId:'ENG-2025-042',price:4500,duration:7,proposal:'دراسة أحمال ببرنامج PVsyst وتصميم كابلات وحمايات متكامل.',status:'قيد الانتظار',document:{id:'offer-file1',name:'عرض_الشمري.pdf',size:'1.8 MB'}},{id:'offer-2',engineerId:'ENG-2025-043',price:5200,duration:10,proposal:'مراجعة كود SBC وإعداد ملف الربط الكهربائي وتصميم الحمايات.',status:'قيد الانتظار',document:{id:'offer-file2',name:'عرض_القحطاني.pdf',size:'2.1 MB'}},{id:'offer-3',engineerId:'ENG-2025-044',price:4000,duration:5,proposal:'محاكاة أداء الأحمال الإنشائية للمنظومة ومخطط الإنفرترات.',status:'قيد الانتظار',document:{id:'offer-file3',name:'عرض_العتيبي.pdf',size:'1.6 MB'}}]:[]}))

const reviewClients=['أحمد بن فهد القحطاني','سعود بن عبدالمحسن','فاطمة ناصر العتيبي','خالد سليمان','عمر بن صالح','منى إبراهيم','خالد الشمري','محمد الشمري']
const supplierComments=['ألواح ممتازة وتغليف متين ووصلت في الموعد المحدد تمامًا','جودة تصنيع عالية ولكن الشحن تأخر يومًا واحدًا','تعامل احترافي وتقديم فواتير ضريبية وشهادات ضمان معتمدة','الإنفرتر يعمل بكفاءة عالية وتم تقديم دعم فني ممتاز للتركيب','المنتجات جيدة ولكن التغليف الخارجي كان بحاجة لمزيد من الحماية','توريد سريع ومطابق للمواصفات المعتمدة لدى هيئة تنظيم المياه والكهرباء','الالتزام دقيق بالأصناف المطلوبة، تم فحص الشحنة واستلامها بسلاسة','خدمة عملاء متجاوبة وإجابات واضحة عن فترة سريان الضمان']
const engineerComments=['دراسة جدوى عالية وحسابات دقيقة للأحمال ومطابقة ممتازة لكود البناء','فحص ميداني شامل وتقرير دقيق ساعدنا في اعتماد المحطة سريعًا','مهندس متمكن ومتعاون جدًا في الرد على الاستفسارات الفنية','التزام تام بالموعد المحدد وإرشادات واضحة لفريق التركيب الميداني','احترافية عالية في إعداد الرسوم التنفيذية ومطابقة مواصفات سيسو','تقرير تدقيق الطاقة كان مفصلًا وأنقذنا من تكاليف إضافية غير مبررة']
const supplierReviewClients=['فيصل العتيبي','نورة السبيعي','عبدالله الدوسري','سارة القحطاني','ماجد الغامدي','ريم الحربي','خالد الشمري','محمد الشمري']
const supplierReviewOrders=[401,398,395,391,388,384,380,376]
const supplierReviewTargets=[6,7,0,1,3,6,7,1]
export const adminSupplierReviews: AdminReview[] = Array.from({length:24},(_,i)=>({id:`SUP-REV-${i+1}`,orderId:`ORD-2025-${i<8?supplierReviewOrders[i]:375-i}`,client:supplierReviewClients[i%8],targetId:adminSuppliers[supplierReviewTargets[i%8]].id,score:[5,4,5,5,3,5,5,4][i%8],comment:supplierComments[i%8],approved:![2,4].includes(i%8)}))
const engineerReviewOrders=[108,107,105,104,103,101]
const engineerReviewTargets=[0,1,2,3,0,1]
export const adminEngineerReviews: AdminReview[] = Array.from({length:18},(_,i)=>({id:`ENG-REV-${i+1}`,orderId:`REQ-2025-${i<6?engineerReviewOrders[i]:100-i}`,client:reviewClients[i%6],targetId:adminEngineers[engineerReviewTargets[i%6]].id,score:i%6===3?4:5,comment:engineerComments[i%6],approved:![2,5].includes(i%6)}))
const messages=[['تحديث شروط الخدمة','تم إدراج اشتراطات الكفاءة الفنية والسلامة ضمن شروط الخدمة المعتمدة.','all',94],['إشعار صيانة دورية','نحيطكم علمًا بأنه سيتم إجراء فحص دوري لخدمات المنصة.','all',88],['إطلاق خدمة التفتيش','أصبح بإمكان المهندسين المعتمدين تقديم خدمة التفتيش الفني للمشاريع.','engineers',76],['تحديث مواصفات الألواح','يرجى من جميع الوكلاء والموردين مراجعة مواصفات الألواح الجديدة.','suppliers',0],['تسهيل طرق الدفع','تم تفعيل خيارات التقسيط بدون فوائد للطلبات المؤهلة.','customers',83],['تنبيه أمان: تحديث كلمة المرور','للحفاظ على أمان حساباتكم، ندعوكم لتحديث كلمة المرور دوريًا.','all',91]] as const
export const adminBroadcasts: AdminBroadcast[] = Array.from({length:28},(_,i)=>{const r=messages[i%6];return{id:`NOT-${1082-i}`,title:i<6?r[0]:`${r[0]} — متابعة ${Math.floor(i/6)+1}`,content:r[1],audience:r[2],readPercentage:r[3],createdAt:`2025-05-${String(18-i%17).padStart(2,'0')}T${i%2?'16:15':'10:30'}:00+03:00`}})
