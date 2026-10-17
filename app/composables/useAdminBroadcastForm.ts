import type { AdminAudience } from '../../types/admin'
export function useAdminBroadcastForm() {
  const data=useAdminWorkspace(),{notify}=useAdminNotice()
  const draft=reactive({title:'',content:'',audience:'all' as AdminAudience}),errors=reactive<Partial<Record<'title'|'content'|'audience',string>>>({}),sending=ref(false)
  function reset(){draft.title='';draft.content='';draft.audience='all';for(const k of ['title','content','audience'] as const)delete errors[k]}
  async function submit(){
    if(sending.value)return false
    for(const k of ['title','content','audience'] as const)delete errors[k]
    if(draft.title.trim().length<3||draft.title.length>150)errors.title='عنوان الإشعار مطلوب بين 3 و150 حرفًا.'
    if(draft.content.trim().length<10||draft.content.length>2000)errors.content='اكتب نصًا بين 10 و2000 حرف.'
    if(!Object.hasOwn(audienceLabels,draft.audience))errors.audience='اختر المستلمين المستهدفين.'
    if(Object.keys(errors).length)return false
    sending.value=true
    try{
      await new Promise<void>(resolve=>setTimeout(resolve,450))
      data.value.broadcasts.unshift({id:'NOT-DEMO-'+Date.now(),title:draft.title.trim(),content:draft.content.trim(),audience:draft.audience,readPercentage:null,createdAt:new Date().toISOString(),simulated:true})
      notify('حُفظ إشعار محاكى في القائمة المحلية فقط؛ لم يُرسل إلى المستخدمين.')
      return true
    }catch{errors.content='تعذرت المحاكاة. المدخلات محفوظة، حاول مجددًا.';return false}finally{sending.value=false}
  }
  return {draft,errors,sending,reset,submit}
}
