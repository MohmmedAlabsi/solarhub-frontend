import type { MaybeRefOrGetter } from 'vue'
import type { AdminApproval, AdminAudience, AdminBroadcast, AdminDisplayPreferences, AdminEngineer, AdminPlatformSettings, AdminReview, AdminServiceRequest, AdminServiceStatus, AdminSupplier, AdminUser, AdminOrder } from '../../types/admin'
import { adminBroadcasts, adminEngineerReviews, adminEngineers, adminServices, adminSupplierReviews, adminSuppliers, adminUsers } from '../data/admin-workspace'
import { adminOrderSeed } from '../data/admin-orders'

interface AdminWorkspaceData {
  users: AdminUser[]; suppliers: AdminSupplier[]; engineers: AdminEngineer[]; services: AdminServiceRequest[]
  supplierReviews: AdminReview[]; engineerReviews: AdminReview[]; broadcasts: AdminBroadcast[]
  settings: AdminPlatformSettings; preferences: AdminDisplayPreferences
}
export const approvalLabels: Record<AdminApproval,string> = {approved:'معتمد',pending:'قيد المراجعة',rejected:'مرفوض'}
export const serviceStatusLabels: Record<AdminServiceStatus,string> = {open:'مفتوح لاستقبال العروض',awarded:'تمت الترسية',executing:'قيد التنفيذ',completed:'مكتمل',cancelled:'ملغي'}
export const audienceLabels: Record<AdminAudience,string> = {all:'جميع المستخدمين',customers:'العملاء',suppliers:'الموردون والوكلاء',engineers:'المهندسون المعتمدون'}
export function useAdminWorkspace() {
  return useState<AdminWorkspaceData>('admin-workspace',()=>({
    users:structuredClone(adminUsers),suppliers:structuredClone(adminSuppliers),engineers:structuredClone(adminEngineers),services:structuredClone(adminServices),supplierReviews:structuredClone(adminSupplierReviews),engineerReviews:structuredClone(adminEngineerReviews),broadcasts:structuredClone(adminBroadcasts),
    settings:{nameAr:'منصة سولار هب (Solar Hub)',nameEn:'Solar Hub Platform',email:'support@solarhub.sa',phone:'8001234567',maintenance:false},
    preferences:{language:'ar',theme:'light',density:'comfortable'},
  }))
}
export function useAdminOrders() { return useState<AdminOrder[]>('admin-orders',()=>structuredClone(adminOrderSeed)) }
export function useAdminNotice() {
  const notice = useState('admin-workspace-notice',()=>({message:'',revision:0}))
  function notify(message:string) {
    notice.value={message,revision:notice.value.revision+1}
    const revision=notice.value.revision
    setTimeout(()=>{if(notice.value.revision===revision)notice.value.message=''},5000)
  }
  return {notice,notify}
}
export function useAdminTable<T>(source:MaybeRefOrGetter<T[]>,matches:(row:T)=>boolean,resetKeys:()=>unknown[],pageSize=8) {
  const page=ref(1)
  const filtered=computed(()=>toValue(source).filter(matches))
  const totalPages=computed(()=>Math.max(1,Math.ceil(filtered.value.length/pageSize)))
  const rows=computed(()=>filtered.value.slice((page.value-1)*pageSize,page.value*pageSize))
  watch(resetKeys,()=>{page.value=1})
  watch(totalPages,total=>{page.value=Math.min(page.value,total)})
  return {page,filtered,totalPages,rows,pageSize}
}
export function adminMatches(search:string,...values:Array<string|number>) {
  const q=search.trim().toLocaleLowerCase('ar').replace(/[أإآ]/g,'ا')
  return !q||values.join(' ').toLocaleLowerCase('ar').replace(/[أإآ]/g,'ا').includes(q)
}
export function adminInitials(name:string) { return name.replace(/^م\.\s*/,'').split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join(' ') }
export function adminDate(value:string,withTime=false) {
  if (withTime) {
    const parts=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Riyadh'}).formatToParts(new Date(value))
    const part=(name:string)=>parts.find(p=>p.type===name)?.value??''
    const time=new Intl.DateTimeFormat('ar-SA',{hour:'2-digit',minute:'2-digit',numberingSystem:'latn',timeZone:'Asia/Riyadh'}).format(new Date(value))
    return part('year')+'-'+part('month')+'-'+part('day')+' – '+time
  }
  return new Intl.DateTimeFormat('ar-SA',{calendar:'gregory',numberingSystem:'latn',year:'numeric',month:'long',day:'2-digit',...(withTime?{hour:'2-digit',minute:'2-digit'}:{}),timeZone:'Asia/Riyadh'}).format(new Date(value))
}
export function createAdminCsv(headers:string[],rows:Array<Array<string|number|boolean|null|undefined>>) {
  const cell=(value:string|number|boolean|null|undefined)=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'}
  return '\uFEFF'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')
}
export function downloadAdminCsv(name:string,headers:string[],rows:Array<Array<string|number|boolean|null|undefined>>) {
  const blob=new Blob([createAdminCsv(headers,rows)],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
export function validAdminEmail(value:string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) }
export function validAdminPhone(value:string) { return /^(?:\+966|00966|0)?5\d{8}$/.test(value.replace(/[\s-]/g,'')) }
