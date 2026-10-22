export function useAdminSettings() {
  const data=useAdminWorkspace(),{notify}=useAdminNotice()
  const draft=reactive({...data.value.settings})
  const errors=reactive<Partial<Record<keyof typeof draft,string>>>({})
  function cancel(){Object.assign(draft,data.value.settings);for(const k of Object.keys(errors) as Array<keyof typeof draft>)delete errors[k];notify('أُلغيت التعديلات غير المحفوظة.')}
  function save(){
    for(const k of Object.keys(errors) as Array<keyof typeof draft>)delete errors[k]
    if(draft.nameAr.trim().length<3||draft.nameAr.length>120)errors.nameAr='أدخل اسمًا عربيًا بين 3 و120 حرفًا.'
    if(draft.nameEn.trim().length<3||draft.nameEn.length>120)errors.nameEn='أدخل اسمًا إنجليزيًا بين 3 و120 حرفًا.'
    if(!validAdminEmail(draft.email))errors.email='أدخل بريد دعم صحيحًا.'
    if(!/^(?:\+?\d[\d\s-]{6,18})$/.test(draft.phone))errors.phone='أدخل رقم خدمة عملاء صحيحًا.'
    if(Object.keys(errors).length)return false
    data.value.settings={...draft,nameAr:draft.nameAr.trim(),nameEn:draft.nameEn.trim(),email:draft.email.trim(),phone:draft.phone.trim()}
    notify('حُفظت إعدادات المنصة داخل الجلسة فقط؛ لم يُحدَّث خادم أو وضع تشغيل فعلي.')
    return true
  }
  function setDensity(value:string){if(value!=='compact'&&value!=='comfortable')return;data.value.preferences.density=value;notify('طُبقت كثافة العرض محليًا على جداول الإدارة.')}
  function resetDefaults(){data.value.preferences={language:'ar',theme:'light',density:'comfortable'};notify('استُعيدت تفضيلات العرض الافتراضية محليًا.')}
  return {data,draft,errors,cancel,save,setDensity,resetDefaults}
}
