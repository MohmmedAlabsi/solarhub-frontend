import type { MaybeRefOrGetter } from 'vue'
import type { AdminDirectoryDraft, AdminDirectoryKind } from '../../types/admin'
export function useAdminDirectoryForm(kind:MaybeRefOrGetter<AdminDirectoryKind>) {
  const data=useAdminWorkspace(),{notify}=useAdminNotice()
  const draft=reactive<AdminDirectoryDraft>({name:'',email:'',phone:'',city:'',role:'عميل سكني',owner:'',commercialNumber:'',taxNumber:'',address:'',storeType:'وكيل معتمد',title:'',license:'',experience:0,specialties:''})
  const errors=reactive<Partial<Record<keyof AdminDirectoryDraft,string>>>({})
  function reset(){Object.assign(draft,{name:'',email:'',phone:'',city:'',role:'عميل سكني',owner:'',commercialNumber:'',taxNumber:'',address:'',storeType:'وكيل معتمد',title:'',license:'',experience:0,specialties:''});for(const k of Object.keys(errors) as Array<keyof AdminDirectoryDraft>)delete errors[k]}
  function submit(){
    for(const k of Object.keys(errors) as Array<keyof AdminDirectoryDraft>)delete errors[k]
    for(const k of ['name','city'] as const)if(!draft[k].trim())errors[k]='هذا الحقل مطلوب.'
    if(!validAdminEmail(draft.email))errors.email='أدخل بريدًا إلكترونيًا صحيحًا.'
    if(!validAdminPhone(draft.phone))errors.phone='أدخل رقم جوال سعوديًا صحيحًا.'
    const type=toValue(kind)
    if(type==='supplier'){
      if(!draft.owner.trim())errors.owner='اسم صاحب الحساب مطلوب.'
      if(!/^\d{10}$/.test(draft.commercialNumber))errors.commercialNumber='السجل التجاري يتكون من 10 أرقام.'
      if(!/^\d{15}$/.test(draft.taxNumber))errors.taxNumber='الرقم الضريبي يتكون من 15 رقمًا.'
      if(!draft.address.trim())errors.address='العنوان مطلوب.'
    }
    if(type==='engineer'){
      if(!draft.title.trim())errors.title='الوصف المهني مطلوب.'
      if(!/^SCE-\d{4,10}$/i.test(draft.license))errors.license='أدخل رقم الترخيص مثل SCE-489201.'
      if(!Number.isInteger(Number(draft.experience))||Number(draft.experience)<0||Number(draft.experience)>60)errors.experience='سنوات الخبرة عدد صحيح بين 0 و60.'
      if(!draft.specialties.trim())errors.specialties='أدخل تخصصًا واحدًا على الأقل.'
    }
    if(Object.keys(errors).length)return false
    const id=crypto.randomUUID(),base={id,name:draft.name.trim(),email:draft.email.trim(),phone:draft.phone.trim(),city:draft.city.trim()}
    if(type==='user')data.value.users.unshift({...base,role:draft.role,active:true,createdAt:new Date().toISOString()})
    if(type==='supplier')data.value.suppliers.unshift({...base,owner:draft.owner.trim(),commercialNumber:draft.commercialNumber,taxNumber:draft.taxNumber,address:draft.address.trim(),storeType:draft.storeType,approval:'pending',description:'',rejectionReason:''})
    if(type==='engineer')data.value.engineers.unshift({...base,title:draft.title.trim(),license:draft.license.toUpperCase(),licenseAuthority:'الهيئة السعودية للمهندسين',experience:Number(draft.experience),specialties:draft.specialties.split(/[,،]/).map(s=>s.trim()).filter(Boolean),approval:'pending',bio:'',rejectionReason:'',documents:[]})
    notify('أضيف السجل محليًا داخل الجلسة فقط؛ لم يُنشأ حساب على الخادم.')
    return true
  }
  return {draft,errors,reset,submit}
}
