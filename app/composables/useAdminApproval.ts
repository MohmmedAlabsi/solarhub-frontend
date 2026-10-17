import type { MaybeRefOrGetter } from 'vue'
import type { AdminEngineer, AdminSupplier } from '../../types/admin'
export function useAdminApproval(record:MaybeRefOrGetter<AdminEngineer|AdminSupplier|undefined>,done:()=>void) {
  const reason=ref(''),error=ref(''),{notify}=useAdminNotice()
  function reset(){reason.value=toValue(record)?.rejectionReason??'';error.value=''}
  function approve(){const item=toValue(record);if(!item)return;item.approval='approved';item.rejectionReason='';if('license' in item)item.approvedAt=new Date().toISOString();notify('تم الاعتماد محليًا داخل الجلسة؛ لم تُرسَل رسالة أو يُحدَّث خادم.');done()}
  function reject(){const item=toValue(record);if(!item)return;if(reason.value.trim().length<10||reason.value.length>1000){error.value='اكتب سبب رفض واضحًا بين 10 و1000 حرف.';return}item.approval='rejected';item.rejectionReason=reason.value.trim();if('license' in item)delete item.approvedAt;notify('حُفظ سبب الرفض وحالة السجل محليًا؛ لم تُرسَل رسالة فعلية.');done()}
  return {reason,error,reset,approve,reject}
}
